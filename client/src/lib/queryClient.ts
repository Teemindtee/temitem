import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    let errorMessage = res.statusText;
    try {
      const responseText = await res.text();
      if (responseText) {
        try {
          const errorData = JSON.parse(responseText);
          errorMessage = errorData.message || responseText;
        } catch {
          errorMessage = responseText;
        }
      }
    } catch (e) {
      // Use statusText if we can't read the response
    }
    throw new Error(`${res.status}: ${errorMessage}`);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: any,
  options: {
    headers?: Record<string, string>;
  } = {}
): Promise<any> {
  const token = localStorage.getItem('findermeister_token');
  const { headers = {} } = options;
  
  const res = await fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    body: data ? JSON.stringify(data) : undefined,
  });

  await throwIfResNotOk(res);
  return res.json();
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const token = localStorage.getItem('findermeister_token');
    const res = await fetch(queryKey.join("/") as string, {
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
