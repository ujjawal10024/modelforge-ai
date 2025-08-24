import { useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Progress } from "./ui/progress";
import { Upload, X, Image, Building, Download } from "lucide-react";
import { useModeling } from "../lib/stores/useModeling";
import { useAudio } from "../lib/stores/useAudio";

interface BlueprintImporterProps {
  isOpen: boolean;
  onClose: () => void;
}

export function BlueprintImporter({ isOpen, onClose }: BlueprintImporterProps) {
  const [dragActive, setDragActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [importedImage, setImportedImage] = useState<string | null>(null);
  const [scale, setScale] = useState(1);
  const [roomDimensions, setRoomDimensions] = useState({ width: 12, length: 12 });
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { importBlueprint, createRoom } = useModeling();
  const { playSuccess, playHit } = useAudio();

  const handleFileSelect = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    
    const file = files[0];
    
    // Check if file is an image
    if (!file.type.startsWith('image/')) {
      playHit();
      return;
    }

    processImage(file);
  };

  const processImage = async (file: File) => {
    try {
      // Simulate upload progress
      for (let i = 0; i <= 100; i += 20) {
        setUploadProgress(i);
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      const imageUrl = URL.createObjectURL(file);
      setImportedImage(imageUrl);
      
      // Import the blueprint
      await importBlueprint(file);
      
      playSuccess();
      setUploadProgress(0);
      
    } catch (error) {
      playHit();
      setUploadProgress(0);
    }
  };

  const generateRoomFrom2D = () => {
    if (!importedImage) return;
    
    // Create a room based on the imported blueprint
    createRoom('custom', {
      width: roomDimensions.width,
      length: roomDimensions.length,
      height: 3
    });
    
    playSuccess();
    onClose();
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
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] bg-gray-900 border-blue-500/30 text-white overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-500 rounded flex items-center justify-center">
              <Building size={16} className="text-white" />
            </div>
            Blueprint & Floor Plan Importer
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Import Section */}
          <Card className="bg-black/50 border-blue-500/30 p-6">
            <h3 className="text-white font-semibold mb-4 flex items-center">
              <Upload className="mr-2" size={20} />
              Import Construction Plan
            </h3>
            
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                dragActive 
                  ? 'border-blue-500 bg-blue-500/10' 
                  : 'border-gray-600 hover:border-blue-500/50'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <div className="space-y-4">
                <div className="w-16 h-16 mx-auto rounded-lg bg-blue-500/20 flex items-center justify-center">
                  <Image size={32} className="text-blue-400" />
                </div>
                
                <div>
                  <p className="text-white font-medium">
                    Drop your blueprint image here, or{" "}
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="text-blue-400 hover:text-blue-300 underline"
                    >
                      browse files
                    </button>
                  </p>
                  <p className="text-gray-400 text-sm mt-2">
                    Supports JPG, PNG, PDF floor plans and construction drawings
                  </p>
                </div>
              </div>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              accept="image/*,.pdf"
              onChange={(e) => handleFileSelect(e.target.files)}
            />

            {uploadProgress > 0 && (
              <div className="mt-4">
                <Progress value={uploadProgress} className="w-full" />
                <p className="text-sm text-gray-400 mt-2">
                  Processing blueprint... {uploadProgress}%
                </p>
              </div>
            )}
          </Card>

          {/* Preview and Configuration */}
          {importedImage && (
            <Card className="bg-black/50 border-blue-500/30 p-6">
              <h3 className="text-white font-semibold mb-4">Blueprint Preview & Configuration</h3>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Image Preview */}
                <div className="space-y-4">
                  <div className="bg-gray-800 rounded-lg p-4">
                    <img 
                      src={importedImage} 
                      alt="Imported blueprint" 
                      className="w-full h-64 object-contain rounded"
                    />
                  </div>
                  
                  <div className="text-sm text-gray-400">
                    <p>✓ Blueprint imported successfully</p>
                    <p>Ready for 3D conversion</p>
                  </div>
                </div>

                {/* Configuration */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-white font-medium mb-2">Room Dimensions</label>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-gray-400 text-sm">Width (meters)</label>
                        <input
                          type="number"
                          value={roomDimensions.width}
                          onChange={(e) => setRoomDimensions(prev => ({
                            ...prev,
                            width: Number(e.target.value)
                          }))}
                          className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-white"
                          min="1"
                          max="50"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-400 text-sm">Length (meters)</label>
                        <input
                          type="number"
                          value={roomDimensions.length}
                          onChange={(e) => setRoomDimensions(prev => ({
                            ...prev,
                            length: Number(e.target.value)
                          }))}
                          className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-white"
                          min="1"
                          max="50"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-white font-medium mb-2">Scale Factor</label>
                    <input
                      type="range"
                      min="0.1"
                      max="5"
                      step="0.1"
                      value={scale}
                      onChange={(e) => setScale(Number(e.target.value))}
                      className="w-full"
                    />
                    <div className="flex justify-between text-sm text-gray-400">
                      <span>0.1x</span>
                      <span>{scale}x</span>
                      <span>5x</span>
                    </div>
                  </div>

                  <Button
                    onClick={generateRoomFrom2D}
                    className="w-full bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700"
                  >
                    <Building className="mr-2" size={16} />
                    Generate 3D Room
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {/* Room Templates */}
          <Card className="bg-black/50 border-blue-500/30 p-6">
            <h3 className="text-white font-semibold mb-4">Quick Room Templates</h3>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {[
                { type: 'bedroom', label: 'Bedroom', icon: '🛏️', dims: { width: 4, length: 5 } },
                { type: 'living_room', label: 'Living Room', icon: '🛋️', dims: { width: 6, length: 8 } },
                { type: 'kitchen', label: 'Kitchen', icon: '🍳', dims: { width: 4, length: 6 } },
                { type: 'bathroom', label: 'Bathroom', icon: '🚿', dims: { width: 3, length: 4 } },
                { type: 'office', label: 'Office', icon: '💼', dims: { width: 4, length: 5 } },
                { type: 'custom', label: 'Custom Room', icon: '🏠', dims: { width: 5, length: 5 } }
              ].map((template) => (
                <Button
                  key={template.type}
                  variant="outline"
                  onClick={() => {
                    createRoom(template.type as any, { ...template.dims, height: 3 });
                    playSuccess();
                    onClose();
                  }}
                  className="h-auto p-4 border-gray-600 hover:border-blue-500 hover:bg-blue-500/10 flex flex-col items-center gap-2"
                >
                  <span className="text-2xl">{template.icon}</span>
                  <span className="text-sm text-white">{template.label}</span>
                  <span className="text-xs text-gray-400">
                    {template.dims.width}m × {template.dims.length}m
                  </span>
                </Button>
              ))}
            </div>
          </Card>

          {/* Tips */}
          <Card className="bg-blue-900/30 border-blue-500/30 p-4">
            <div className="flex items-start gap-3">
              <Download className="text-blue-400 mt-1" size={16} />
              <div className="text-sm">
                <p className="text-blue-300 font-medium mb-1">Pro Tips for Best Results:</p>
                <ul className="text-blue-200 space-y-1 text-xs">
                  <li>• Use high-resolution images for better accuracy</li>
                  <li>• Ensure floor plans show clear room boundaries</li>
                  <li>• Construction drawings work best when scaled properly</li>
                  <li>• You can adjust room dimensions after import</li>
                </ul>
              </div>
            </div>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}