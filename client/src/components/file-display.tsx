import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Image, Download, ExternalLink } from "lucide-react";

interface FileDisplayProps {
  files: string[];
  title?: string;
  className?: string;
}

export default function FileDisplay({ files, title = "Attached Files", className = "" }: FileDisplayProps) {
  if (!files || files.length === 0) {
    return null;
  }

  const getFileIcon = (filePath: string) => {
    const extension = filePath.split('.').pop()?.toLowerCase();
    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
    
    if (imageExtensions.includes(extension || '')) {
      return <Image className="w-5 h-5 text-blue-600" />;
    }
    return <FileText className="w-5 h-5 text-gray-600" />;
  };

  const getFileName = (filePath: string) => {
    return filePath.split('/').pop() || filePath;
  };

  const getFileType = (filePath: string) => {
    const extension = filePath.split('.').pop()?.toLowerCase();
    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
    
    if (imageExtensions.includes(extension || '')) {
      return 'Image';
    }
    if (extension === 'pdf') {
      return 'PDF';
    }
    if (['doc', 'docx'].includes(extension || '')) {
      return 'Document';
    }
    if (extension === 'txt') {
      return 'Text';
    }
    return 'File';
  };

  const isImage = (filePath: string) => {
    const extension = filePath.split('.').pop()?.toLowerCase();
    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
    return imageExtensions.includes(extension || '');
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <FileText className="w-5 h-5" />
          {title} ({files.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Image Gallery */}
          {files.some(isImage) && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-3">Images</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {files.filter(isImage).map((file, index) => (
                  <div key={index} className="group relative">
                    <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                      <img 
                        src={file} 
                        alt={getFileName(file)}
                        className="w-full h-full object-cover transition-transform group-hover:scale-105"
                        onError={(e) => {
                          // Fallback if image fails to load
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    </div>
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-opacity rounded-lg flex items-center justify-center">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                        <Button
                          size="sm"
                          variant="secondary"
                          className="h-8 w-8 p-0"
                          onClick={() => window.open(file, '_blank')}
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="secondary"
                          className="h-8 w-8 p-0"
                          onClick={() => {
                            const link = document.createElement('a');
                            link.href = file;
                            link.download = getFileName(file);
                            link.click();
                          }}
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    <p className="text-xs text-gray-600 mt-2 truncate">{getFileName(file)}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Other Files */}
          {files.some(file => !isImage(file)) && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-3">Documents</h4>
              <div className="space-y-2">
                {files.filter(file => !isImage(file)).map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border hover:bg-gray-100 transition-colors">
                    <div className="flex items-center space-x-3">
                      {getFileIcon(file)}
                      <div>
                        <p className="text-sm font-medium text-gray-900 truncate max-w-xs">
                          {getFileName(file)}
                        </p>
                        <p className="text-xs text-gray-500">
                          {getFileType(file)}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => window.open(file, '_blank')}
                      >
                        <ExternalLink className="w-4 h-4 mr-1" />
                        View
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          const link = document.createElement('a');
                          link.href = file;
                          link.download = getFileName(file);
                          link.click();
                        }}
                      >
                        <Download className="w-4 h-4 mr-1" />
                        Download
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}