import { useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Progress } from "./ui/progress";
import { Alert, AlertDescription } from "./ui/alert";
import { Upload, File, CheckCircle, AlertCircle, X } from "lucide-react";
import { useModeling } from "../lib/stores/useModeling";
import { useAudio } from "../lib/stores/useAudio";

interface ModelImporterProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ImportedFile {
  name: string;
  size: number;
  type: string;
  status: 'pending' | 'loading' | 'success' | 'error';
  error?: string;
  objectId?: string;
}

export function ModelImporter({ isOpen, onClose }: ModelImporterProps) {
  const [files, setFiles] = useState<ImportedFile[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { createObject } = useModeling();
  const { playSuccess, playHit } = useAudio();

  const supportedFormats = ['.gltf', '.glb', '.obj', '.fbx'];
  const maxFileSize = 50 * 1024 * 1024; // 50MB

  const handleFileSelect = (selectedFiles: FileList | null) => {
    if (!selectedFiles) return;

    const newFiles: ImportedFile[] = Array.from(selectedFiles).map(file => ({
      name: file.name,
      size: file.size,
      type: file.type,
      status: 'pending'
    }));

    // Validate files
    const validatedFiles = newFiles.map(file => {
      const extension = '.' + file.name.split('.').pop()?.toLowerCase();
      
      if (!supportedFormats.includes(extension)) {
        return {
          ...file,
          status: 'error' as const,
          error: `Unsupported format. Supported: ${supportedFormats.join(', ')}`
        };
      }
      
      if (file.size > maxFileSize) {
        return {
          ...file,
          status: 'error' as const,
          error: 'File too large. Max size: 50MB'
        };
      }
      
      return file;
    });

    setFiles(prev => [...prev, ...validatedFiles]);

    // Process valid files
    validatedFiles.forEach((file, index) => {
      if (file.status === 'pending') {
        processFile(Array.from(selectedFiles)[index], file);
      }
    });
  };

  const processFile = async (file: File, fileInfo: ImportedFile) => {
    try {
      // Update status to loading
      setFiles(prev => 
        prev.map(f => f.name === fileInfo.name ? { ...f, status: 'loading' } : f)
      );

      // Simulate upload progress
      for (let i = 0; i <= 100; i += 10) {
        setUploadProgress(i);
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      // Create object URL for the file
      const objectUrl = URL.createObjectURL(file);
      
      // Create a new 3D object in the scene
      const newObject = createObject({
        type: 'imported',
        modelPath: objectUrl,
        name: file.name.split('.')[0],
        color: '#ffffff',
        position: { x: 0, y: 1, z: 0 },
        scale: { x: 1, y: 1, z: 1 },
        rotation: { x: 0, y: 0, z: 0 }
      });

      // Update file status
      setFiles(prev =>
        prev.map(f => f.name === fileInfo.name ? {
          ...f,
          status: 'success',
          objectId: newObject.id
        } : f)
      );

      playSuccess();
      setUploadProgress(0);
      
    } catch (error) {
      console.error('File processing failed:', error);
      
      setFiles(prev =>
        prev.map(f => f.name === fileInfo.name ? {
          ...f,
          status: 'error',
          error: error instanceof Error ? error.message : 'Import failed'
        } : f)
      );
      
      playHit();
      setUploadProgress(0);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelect(e.dataTransfer.files);
    }
  };

  const removeFile = (fileName: string) => {
    setFiles(prev => prev.filter(f => f.name !== fileName));
  };

  const clearAll = () => {
    setFiles([]);
    setUploadProgress(0);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] bg-gray-900 border-gray-700 text-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="text-blue-500" size={24} />
            Import 3D Models
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Upload Area */}
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragActive 
                ? 'border-blue-500 bg-blue-500/10' 
                : 'border-gray-600 hover:border-gray-500'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <Upload className="mx-auto mb-4 text-gray-400" size={48} />
            <h3 className="text-lg font-semibold mb-2">Drop 3D models here</h3>
            <p className="text-gray-400 mb-4">
              Or click to browse files
            </p>
            
            <Button
              onClick={() => fileInputRef.current?.click()}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Browse Files
            </Button>

            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".gltf,.glb,.obj,.fbx"
              onChange={(e) => handleFileSelect(e.target.files)}
              className="hidden"
            />

            <div className="mt-4 text-sm text-gray-400">
              Supported formats: {supportedFormats.join(', ')} (Max 50MB each)
            </div>
          </div>

          {/* Upload Progress */}
          {uploadProgress > 0 && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Uploading...</span>
                <span>{uploadProgress}%</span>
              </div>
              <Progress value={uploadProgress} className="h-2" />
            </div>
          )}

          {/* File List */}
          {files.length > 0 && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-semibold">Files ({files.length})</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearAll}
                  className="text-gray-400 hover:text-white"
                >
                  Clear All
                </Button>
              </div>

              <div className="space-y-2 max-h-60 overflow-y-auto">
                {files.map((file, index) => (
                  <Card key={index} className="bg-gray-800 border-gray-600">
                    <CardContent className="p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <File className="text-blue-400 flex-shrink-0" size={20} />
                          
                          <div className="flex-1 min-w-0">
                            <div className="font-medium truncate">{file.name}</div>
                            <div className="text-sm text-gray-400">
                              {formatFileSize(file.size)}
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2 flex-shrink-0">
                            {file.status === 'pending' && (
                              <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />
                            )}
                            {file.status === 'loading' && (
                              <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                            )}
                            {file.status === 'success' && (
                              <CheckCircle className="text-green-500" size={20} />
                            )}
                            {file.status === 'error' && (
                              <AlertCircle className="text-red-500" size={20} />
                            )}
                            
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeFile(file.name)}
                              className="p-1 h-auto text-gray-400 hover:text-white"
                            >
                              <X size={16} />
                            </Button>
                          </div>
                        </div>
                      </div>
                      
                      {file.error && (
                        <Alert className="mt-2 bg-red-900/50 border-red-700">
                          <AlertCircle size={16} />
                          <AlertDescription className="text-sm">
                            {file.error}
                          </AlertDescription>
                        </Alert>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Usage Tips */}
          <Alert className="bg-blue-900/50 border-blue-700">
            <AlertCircle size={16} />
            <AlertDescription className="text-sm">
              <strong>Tips:</strong> GLTF/GLB files work best for web display. 
              Imported models will appear at the center of the scene and can be selected and manipulated like other objects.
            </AlertDescription>
          </Alert>
        </div>
      </DialogContent>
    </Dialog>
  );
}
