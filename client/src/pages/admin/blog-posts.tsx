import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { Plus, Edit, Trash2, Eye, Calendar } from "lucide-react";
import AdminHeader from "@/components/admin-header";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { BlogPost } from "@shared/schema";

export default function AdminBlogPosts() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: posts = [], isLoading } = useQuery<BlogPost[]>({
    queryKey: ['/api/admin/blog-posts']
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest(`/api/admin/blog-posts/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/blog-posts'] });
      toast({
        title: "Success",
        description: "Blog post deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete blog post",
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-finder-red mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader currentPage="blog-posts" />
      
      <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Blog Posts</h1>
            <p className="text-gray-600">Create and manage blog posts for your platform</p>
          </div>
          <Link href="/admin/blog-posts/create">
            <Button className="bg-finder-red hover:bg-finder-red-dark text-white w-full sm:w-auto">
              <Plus className="w-4 h-4 mr-2" />
              Create Post
            </Button>
          </Link>
        </div>

        {posts.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <Edit className="w-16 h-16 mx-auto" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No blog posts yet</h3>
              <p className="text-gray-600 mb-6">Start creating engaging content for your platform</p>
              <Link href="/admin/blog-posts/create">
                <Button className="bg-finder-red hover:bg-finder-red-dark text-white">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First Post
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {posts.map((post) => (
              <Card key={post.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
                        <h3 className="text-lg sm:text-xl font-semibold text-gray-900 truncate">
                          {post.title}
                        </h3>
                        <Badge variant={post.isPublished ? "default" : "secondary"} className="w-fit">
                          {post.isPublished ? "Published" : "Draft"}
                        </Badge>
                      </div>
                      
                      {post.excerpt && (
                        <p className="text-gray-600 mb-3 line-clamp-2">
                          {post.excerpt}
                        </p>
                      )}
                      
                      <div className="flex flex-col sm:flex-row sm:items-center text-sm text-gray-500 gap-2 sm:gap-4">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span className="hidden sm:inline">Created </span>
                          {new Date(post.createdAt!).toLocaleDateString()}
                        </div>
                        {post.publishedAt && (
                          <div className="flex items-center gap-1">
                            <Eye className="w-4 h-4" />
                            <span className="hidden sm:inline">Published </span>
                            {new Date(post.publishedAt).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                      
                      <div className="mt-3">
                        <span className="text-sm text-blue-600 font-medium break-all">
                          /{post.slug}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 lg:ml-4">
                      <Link href={`/admin/blog-posts/edit/${post.id}`}>
                        <Button variant="outline" size="sm" className="w-full sm:w-auto">
                          <Edit className="w-4 h-4 mr-1" />
                          <span className="hidden sm:inline">Edit</span>
                          <span className="sm:hidden">Edit Post</span>
                        </Button>
                      </Link>
                      
                      {post.isPublished && (
                        <Link href={`/blog/${post.slug}`}>
                          <Button variant="outline" size="sm" className="w-full sm:w-auto">
                            <Eye className="w-4 h-4 mr-1" />
                            <span className="hidden sm:inline">View</span>
                            <span className="sm:hidden">View Post</span>
                          </Button>
                        </Link>
                      )}
                      
                      <Button
                        variant="outline" 
                        size="sm"
                        onClick={() => deleteMutation.mutate(post.id)}
                        disabled={deleteMutation.isPending}
                        className="text-finder-red hover:text-finder-red-dark hover:bg-finder-red/10 w-full sm:w-auto"
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        <span className="hidden sm:inline">Delete</span>
                        <span className="sm:hidden">Delete Post</span>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}