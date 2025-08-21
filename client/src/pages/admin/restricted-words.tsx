import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import AdminHeader from "@/components/admin-header";
import { 
  Shield, 
  Plus, 
  Trash2, 
  Search, 
  AlertTriangle,
  Eye,
  ShieldAlert
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import type { RestrictedWord } from "@shared/schema";

export default function AdminRestrictedWords() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [newWord, setNewWord] = useState("");
  const [newCategory, setNewCategory] = useState("general");
  const [newSeverity, setNewSeverity] = useState("flag");
  const [searchTerm, setSearchTerm] = useState("");

  const { data: restrictedWords = [], isLoading } = useQuery<RestrictedWord[]>({
    queryKey: ['/api/admin/restricted-words'],
    enabled: !!user && user.role === 'admin'
  });

  const addWordMutation = useMutation({
    mutationFn: async (data: { word: string; category: string; severity: string }) => {
      console.log('Adding restricted word:', data);
      return await apiRequest('/api/admin/restricted-words', {
        method: 'POST',
        body: JSON.stringify(data)
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/restricted-words'] });
      setNewWord("");
      setNewCategory("general");
      setNewSeverity("flag");
      toast({
        title: "Success",
        description: "Restricted word added successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const removeWordMutation = useMutation({
    mutationFn: async (wordId: string) => {
      return await apiRequest(`/api/admin/restricted-words/${wordId}`, {
        method: 'DELETE'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/restricted-words'] });
      toast({
        title: "Success",
        description: "Restricted word removed successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleAddWord = () => {
    if (!newWord.trim()) {
      toast({
        title: "Error",
        description: "Please enter a word to restrict",
        variant: "destructive",
      });
      return;
    }

    addWordMutation.mutate({
      word: newWord.trim(),
      category: newCategory,
      severity: newSeverity
    });
  };

  const handleRemoveWord = (wordId: string) => {
    removeWordMutation.mutate(wordId);
  };

  const filteredWords = restrictedWords.filter(word => 
    word.word.toLowerCase().includes(searchTerm.toLowerCase()) ||
    word.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'block': return 'bg-red-100 text-red-800 border-red-200';
      case 'review': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'flag': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'block': return <ShieldAlert className="w-3 h-3" />;
      case 'review': return <Eye className="w-3 h-3" />;
      case 'flag': return <AlertTriangle className="w-3 h-3" />;
      default: return <Shield className="w-3 h-3" />;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/20">
        <AdminHeader currentPage="restricted-words" />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="text-gray-600 mt-4 font-medium">Loading restricted words...</p>
          </div>
        </div>
      </div>
    );
  }

  const stats = {
    total: restrictedWords.length,
    flagWords: restrictedWords.filter(w => w.severity === 'flag').length,
    reviewWords: restrictedWords.filter(w => w.severity === 'review').length,
    blockWords: restrictedWords.filter(w => w.severity === 'block').length,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/20 dark:from-gray-900 dark:via-blue-900/10 dark:to-indigo-900/10">
      <AdminHeader currentPage="restricted-words" />
      
      {/* Header Section */}
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-gray-200/50 dark:border-gray-700/50">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-orange-600 rounded-2xl blur opacity-60"></div>
                <div className="relative p-4 bg-gradient-to-r from-red-500 to-orange-500 rounded-2xl">
                  <Shield className="w-7 h-7 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                  Restricted Words
                </h1>
                <p className="text-gray-500 dark:text-gray-400 font-medium">Manage content filtering and moderation</p>
              </div>
            </div>
            
            {/* Search Bar */}
            <div className="relative max-w-md w-full">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                placeholder="Search restricted words..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 h-12 bg-white/80 dark:bg-gray-800/80 border-gray-200/50 dark:border-gray-700/50 rounded-xl"
              />
            </div>
          </div>
          
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm p-4 rounded-xl border border-gray-200/50 dark:border-gray-700/50">
              <div className="flex items-center gap-3">
                <Shield className="w-4 h-4 text-blue-600" />
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Total Words</p>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">{stats.total}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm p-4 rounded-xl border border-gray-200/50 dark:border-gray-700/50">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-4 h-4 text-yellow-600" />
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Flag Words</p>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">{stats.flagWords}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm p-4 rounded-xl border border-gray-200/50 dark:border-gray-700/50">
              <div className="flex items-center gap-3">
                <Eye className="w-4 h-4 text-orange-600" />
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Review Words</p>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">{stats.reviewWords}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm p-4 rounded-xl border border-gray-200/50 dark:border-gray-700/50">
              <div className="flex items-center gap-3">
                <ShieldAlert className="w-4 h-4 text-red-600" />
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Block Words</p>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">{stats.blockWords}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Add Word Form */}
        <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-0 shadow-lg mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Add Restricted Word
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="word">Word</Label>
                <Input
                  id="word"
                  placeholder="Enter word to restrict"
                  value={newWord}
                  onChange={(e) => setNewWord(e.target.value)}
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="category">Category</Label>
                <Select value={newCategory} onValueChange={setNewCategory}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">General</SelectItem>
                    <SelectItem value="profanity">Profanity</SelectItem>
                    <SelectItem value="spam">Spam</SelectItem>
                    <SelectItem value="inappropriate">Inappropriate</SelectItem>
                    <SelectItem value="illegal">Illegal Content</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="severity">Action</Label>
                <Select value={newSeverity} onValueChange={setNewSeverity}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="flag">Flag for Review</SelectItem>
                    <SelectItem value="review">Auto Review</SelectItem>
                    <SelectItem value="block">Block Content</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-end">
                <Button 
                  onClick={handleAddWord}
                  disabled={addWordMutation.isPending}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  {addWordMutation.isPending ? "Adding..." : "Add Word"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Words List */}
        <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Restricted Words Directory</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {filteredWords.length === 0 ? (
                <div className="text-center py-12">
                  <Shield className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {searchTerm ? 'No matching words found' : 'No restricted words'}
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    {searchTerm ? 'Try adjusting your search terms' : 'Start by adding words to restrict'}
                  </p>
                </div>
              ) : (
                filteredWords.map((word) => (
                  <div key={word.id} className="flex items-center justify-between p-4 bg-gray-50/50 dark:bg-gray-700/50 rounded-lg border border-gray-200/50 dark:border-gray-600/50">
                    <div className="flex items-center gap-3">
                      <div className="font-mono text-lg font-semibold text-gray-900 dark:text-white bg-white dark:bg-gray-800 px-3 py-1 rounded border">
                        {word.word}
                      </div>
                      <Badge className={`px-3 py-1 rounded-full text-xs font-medium ${getSeverityColor(word.severity)}`}>
                        <div className="flex items-center gap-1">
                          {getSeverityIcon(word.severity)}
                          {word.severity}
                        </div>
                      </Badge>
                      <span className="text-sm text-gray-500 dark:text-gray-400 capitalize">
                        {word.category}
                      </span>
                    </div>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRemoveWord(word.id)}
                      disabled={removeWordMutation.isPending}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}