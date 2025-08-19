import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Link, useLocation, useParams } from "wouter";
import { ArrowLeft, Save } from "lucide-react";
import AdminHeader from "@/components/admin-header";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { insertBlogPostSchema } from "@shared/schema";
import { z } from "zod";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import React from "react";

// Enhanced schema for editing
const editBlogPostSchema = insertBlogPostSchema.extend({
  title: z.string().min(1, "Title is required"),
  content: z.string().min(1, "Content is required"),
  excerpt: z.string().optional(),
  isPublished: z.boolean().default(false),
}).omit({ authorId: true });

type EditBlogPostForm = z.infer<typeof editBlogPostSchema>;

export default function AdminBlogPostEdit() {
  const params = useParams();
  const postId = params?.id;
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch existing blog post
  const { data: post, isLoading } = useQuery({
    queryKey: [`/api/admin/blog-posts/${postId}`],
    enabled: !!postId,
  });

  const form = useForm<EditBlogPostForm>({
    resolver: zodResolver(editBlogPostSchema),
    defaultValues: {
      title: "",
      slug: "",
      content: "",
      excerpt: "",
      isPublished: false,
    },
  });

  // Update form when post data loads
  React.useEffect(() => {
    if (post) {
      form.reset({
        title: post.title,
        slug: post.slug,
        content: post.content,
        excerpt: post.excerpt || "",
        isPublished: post.isPublished,
      });
    }
  }, [post, form]);

  const updateMutation = useMutation({
    mutationFn: (data: EditBlogPostForm) => {
      // Generate slug from title if changed
      const slug = data.title
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/--+/g, '-')
        .trim();

      return apiRequest(`/api/admin/blog-posts/${postId}`, { 
        method: 'PUT', 
        body: JSON.stringify({ ...data, slug }) 
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/blog-posts'] });
      queryClient.invalidateQueries({ queryKey: [`/api/admin/blog-posts/${postId}`] });
      toast({
        title: "Success",
        description: "Blog post updated successfully",
      });
      navigate("/admin/blog-posts");
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update blog post",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: EditBlogPostForm) => {
    updateMutation.mutate(data);
  };

  // Quill modules configuration
  const quillModules = {
    toolbar: [
      [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'script': 'sub'}, { 'script': 'super' }],
      [{ 'indent': '-1'}, { 'indent': '+1' }],
      [{ 'direction': 'rtl' }],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'font': [] }],
      [{ 'align': [] }],
      ['link', 'image', 'video'],
      ['clean'],
      ['blockquote', 'code-block'],
    ],
  };

  const quillFormats = [
    'header', 'bold', 'italic', 'underline', 'strike',
    'list', 'bullet', 'script', 'indent', 'direction',
    'color', 'background', 'font', 'align',
    'link', 'image', 'video', 'blockquote', 'code-block'
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AdminHeader currentPage="blog-posts" />
        <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6">
          <div className="text-center">Loading...</div>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AdminHeader currentPage="blog-posts" />
        <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6">
          <div className="text-center">Blog post not found</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader currentPage="blog-posts" />
      
      <div className="max-w-4xl mx-auto py-4 sm:py-8 px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6 sm:mb-8">
          <Link href="/admin/blog-posts">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Posts
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Edit Blog Post</h1>
            <p className="text-gray-600 mt-1">Update your blog content</p>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 sm:space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Post Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 sm:space-y-6">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Post Title</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Enter a compelling title..." 
                          {...field}
                          className="text-base sm:text-lg"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="excerpt"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Excerpt (Optional)</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Brief description or summary..."
                          className="resize-none"
                          rows={3}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="isPublished"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Publish Status</FormLabel>
                        <div className="text-sm text-muted-foreground">
                          {field.value ? "This post will be publicly visible" : "This post will remain as draft"}
                        </div>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Content</CardTitle>
              </CardHeader>
              <CardContent>
                <FormField
                  control={form.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <div className="min-h-[400px]">
                          <ReactQuill
                            theme="snow"
                            value={field.value}
                            onChange={field.onChange}
                            modules={quillModules}
                            formats={quillFormats}
                            className="bg-white"
                            style={{ height: '350px' }}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button
                type="submit"
                disabled={updateMutation.isPending}
                className="bg-finder-red hover:bg-finder-red-dark text-white flex-1 sm:flex-none"
              >
                <Save className="w-4 h-4 mr-2" />
                {updateMutation.isPending ? 'Updating...' : 'Update Post'}
              </Button>
              
              <Link href="/admin/blog-posts">
                <Button type="button" variant="outline" className="w-full sm:w-auto">
                  Cancel
                </Button>
              </Link>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}