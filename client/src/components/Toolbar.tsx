import { Button } from "./ui/button";
import { Separator } from "./ui/separator";
import { Badge } from "./ui/badge";
import { 
  Box, 
  Orbit, 
  Upload, 
  Bot, 
  RotateCcw, 
  Trash2, 
  Save, 
  FolderOpen,
  Move3D,
  RotateCw,
  Maximize2,
  Download
} from "lucide-react";
import { useModeling } from "../lib/stores/useModeling";

interface ToolbarProps {
  onShowAI: () => void;
  onShowImporter: () => void;
}

export function Toolbar({ onShowAI, onShowImporter }: ToolbarProps) {
  const { 
    createObject, 
    selectedObject, 
    objects, 
    clearScene, 
    duplicateObject,
    deleteObject 
  } = useModeling();

  const createShape = (type: string, color: string = '#666666') => {
    createObject({
      type,
      color,
      position: { x: Math.random() * 4 - 2, y: 1, z: Math.random() * 4 - 2 },
      scale: { x: 1, y: 1, z: 1 },
      rotation: { x: 0, y: 0, z: 0 }
    });
  };

  const exportScene = () => {
    const sceneData = {
      objects: objects.map(obj => ({
        ...obj,
        // Don't export object URLs for imported models
        modelPath: obj.type === 'imported' ? undefined : obj.modelPath
      })),
      timestamp: new Date().toISOString(),
      version: '1.0'
    };
    
    const blob = new Blob([JSON.stringify(sceneData, null, 2)], { 
      type: 'application/json' 
    });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `3d-scene-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {/* Quick Create Tools */}
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => createShape('cube', '#ff6b6b')}
          className="text-gray-300 hover:text-white hover:bg-gray-700"
          title="Create Cube"
        >
          <Box size={16} />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => createShape('sphere', '#4ecdc4')}
          className="text-gray-300 hover:text-white hover:bg-gray-700"
          title="Create Orbit"
        >
          <Orbit size={16} />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => createShape('cylinder', '#45b7d1')}
          className="text-gray-300 hover:text-white hover:bg-gray-700"
          title="Create Cylinder"
        >
          <div className="w-4 h-4 border-2 border-current rounded-sm" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => createShape('cone', '#f9ca24')}
          className="text-gray-300 hover:text-white hover:bg-gray-700"
          title="Create Cone"
        >
          <div className="w-0 h-0 border-l-2 border-r-2 border-b-4 border-transparent border-b-current" />
        </Button>
      </div>

      <Separator orientation="vertical" className="h-6 bg-gray-600" />

      {/* Import/Export */}
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={onShowImporter}
          className="text-gray-300 hover:text-white hover:bg-gray-700"
          title="Import 3D Models"
        >
          <Upload size={16} />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={exportScene}
          className="text-gray-300 hover:text-white hover:bg-gray-700"
          title="Export Scene"
        >
          <Download size={16} />
        </Button>
      </div>

      <Separator orientation="vertical" className="h-6 bg-gray-600" />

      {/* Object Tools */}
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => selectedObject && duplicateObject(selectedObject.id)}
          disabled={!selectedObject}
          className="text-gray-300 hover:text-white hover:bg-gray-700 disabled:opacity-50"
          title="Duplicate Selected"
        >
          <div className="relative">
            <Box size={12} />
            <Box size={12} className="absolute top-1 left-1 opacity-60" />
          </div>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => selectedObject && deleteObject(selectedObject.id)}
          disabled={!selectedObject}
          className="text-gray-300 hover:text-white hover:bg-red-700 disabled:opacity-50"
          title="Delete Selected"
        >
          <Trash2 size={16} />
        </Button>
      </div>

      <Separator orientation="vertical" className="h-6 bg-gray-600" />

      {/* Scene Tools */}
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={clearScene}
          className="text-gray-300 hover:text-white hover:bg-red-700"
          title="Clear Scene"
          disabled={objects.length === 0}
        >
          <RotateCcw size={16} />
        </Button>
      </div>

      <Separator orientation="vertical" className="h-6 bg-gray-600" />

      {/* AI Assistant */}
      <Button
        variant="ghost"
        size="sm"
        onClick={onShowAI}
        className="text-gray-300 hover:text-white hover:bg-blue-700"
        title="AI Assistant"
      >
        <Bot size={16} />
        <span className="ml-1 text-xs">AI</span>
      </Button>

      {/* Scene Stats */}
      <div className="flex items-center gap-2 ml-auto">
        <Badge variant="secondary" className="text-xs">
          {objects.length} objects
        </Badge>
        {selectedObject && (
          <Badge variant="outline" className="text-xs border-green-500 text-green-400">
            Selected: {selectedObject.type}
          </Badge>
        )}
      </div>
    </div>
  );
}
