import { Canvas } from "@react-three/fiber";
import { Suspense, useState, useCallback } from "react";
import "@fontsource/inter";
import { Scene } from "./components/3d/Scene";
import { CommandPanel } from "./components/CommandPanel";
import { AIAssistant } from "./components/AIAssistant";
import { ModelImporter } from "./components/ModelImporter";
import { Toolbar } from "./components/Toolbar";
import { useModeling } from "./lib/stores/useModeling";
import { useAudio } from "./lib/stores/useAudio";
import { Button } from "./components/ui/button";
import { Card } from "./components/ui/card";
import { Volume2, VolumeX, Box, Orbit, Upload, Bot } from "lucide-react";

function App() {
  const { 
    selectedObject, 
    objects, 
    createObject, 
    clearScene, 
    duplicateObject, 
    deleteObject 
  } = useModeling();
  const { toggleMute, isMuted } = useAudio();
  const [showAI, setShowAI] = useState(false);
  const [showImporter, setShowImporter] = useState(false);

  const handleCanvasClick = useCallback((event: React.MouseEvent) => {
    // Prevent deselection when clicking on UI elements
    if ((event.target as HTMLElement).tagName === 'CANVAS') {
      // Canvas click logic will be handled in Scene component
    }
  }, []);

  const createShape = (type: string, color: string = '#666666') => {
    createObject({
      type: type as any,
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
    a.download = `precision-build-ai-scene-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-screen h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 relative overflow-hidden">
      {/* Header with Branding */}
      <div className="absolute top-0 left-0 right-0 z-20 bg-black/80 backdrop-blur-md border-b border-blue-500/30">
        <div className="flex items-center justify-between px-6 py-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">P</span>
            </div>
            <div>
              <h1 className="text-white font-bold text-lg">Precision Build AI</h1>
              <p className="text-gray-400 text-xs">3D Modeling Platform</p>
            </div>
          </div>
          
          {/* Quick Stats */}
          <div className="flex items-center gap-4 text-sm">
            <div className="text-gray-300">
              <span className="text-blue-400">{objects.length}</span> Objects
            </div>
            {selectedObject && (
              <div className="text-gray-300">
                Selected: <span className="text-green-400 capitalize">{selectedObject.type}</span>
              </div>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleMute}
              className="text-white hover:bg-white/20"
            >
              {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
            </Button>
          </div>
        </div>
      </div>

      {/* Main 3D Canvas */}
      <div className="absolute inset-0 pt-16" onClick={handleCanvasClick}>
        <Canvas
          shadows
          camera={{
            position: [10, 10, 10],
            fov: 50,
            near: 0.1,
            far: 1000
          }}
          gl={{
            antialias: true,
            powerPreference: "high-performance"
          }}
        >
          <color attach="background" args={["#0f0f23"]} />
          <Suspense fallback={null}>
            <Scene />
          </Suspense>
        </Canvas>
      </div>

      {/* Left Sidebar - Tools */}
      <div className="absolute top-20 left-4 z-10 space-y-3">
        <Card className="bg-black/80 border-blue-500/30 backdrop-blur-sm">
          <div className="p-3">
            <h3 className="text-white font-semibold mb-3 text-sm">Create Objects</h3>
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => createShape('cube', '#ff6b6b')}
                className="text-gray-300 hover:text-white hover:bg-red-600/20 border border-red-600/30"
                title="Create Cube"
              >
                <Box size={16} className="mr-1" />
                Cube
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => createShape('sphere', '#4ecdc4')}
                className="text-gray-300 hover:text-white hover:bg-teal-600/20 border border-teal-600/30"
                title="Create Sphere"
              >
                <Orbit size={16} className="mr-1" />
                Sphere
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => createShape('cylinder', '#45b7d1')}
                className="text-gray-300 hover:text-white hover:bg-blue-600/20 border border-blue-600/30"
                title="Create Cylinder"
              >
                <div className="w-4 h-4 border-2 border-current rounded-sm mr-1" />
                Cylinder
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => createShape('cone', '#f9ca24')}
                className="text-gray-300 hover:text-white hover:bg-yellow-600/20 border border-yellow-600/30"
                title="Create Cone"
              >
                <div className="w-0 h-0 border-l-2 border-r-2 border-b-4 border-transparent border-b-current mr-1" />
                Cone
              </Button>
            </div>
          </div>
        </Card>

        <Card className="bg-black/80 border-blue-500/30 backdrop-blur-sm">
          <div className="p-3">
            <h3 className="text-white font-semibold mb-3 text-sm">AI & Import</h3>
            <div className="space-y-2">
              <Button
                onClick={() => setShowAI(true)}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                size="sm"
              >
                <Bot size={16} className="mr-2" />
                AI Assistant
              </Button>
              <Button
                onClick={() => setShowImporter(true)}
                className="w-full bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white"
                size="sm"
              >
                <Upload size={16} className="mr-2" />
                Import 3D Models
              </Button>
            </div>
          </div>
        </Card>
      </div>

      {/* Command Panel - Enhanced */}
      <div className="absolute bottom-4 left-4 right-4 z-10">
        <Card className="bg-black/90 border-blue-500/30 backdrop-blur-md shadow-2xl">
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-white font-semibold text-sm">Command Center</h3>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-green-400 text-xs">Live</span>
              </div>
            </div>
            <CommandPanel />
          </div>
        </Card>
      </div>

      {/* Right Panel - Object Properties & Tools */}
      <div className="absolute top-20 right-4 w-80 z-10 space-y-3">
        {selectedObject && (
          <Card className="bg-black/80 border-blue-500/30 backdrop-blur-sm">
            <div className="p-4">
              <h3 className="text-white font-semibold mb-3 flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                Selected Object
              </h3>
              <div className="space-y-3 text-sm">
                <div className="bg-gray-800/50 rounded-lg p-3">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-400">Type:</span>
                    <span className="text-white capitalize font-medium">{selectedObject.type}</span>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-400">Name:</span>
                    <span className="text-white">{selectedObject.name || 'Unnamed'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Color:</span>
                    <div 
                      className="w-6 h-6 rounded border-2 border-white/20"
                      style={{ backgroundColor: selectedObject.color }}
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div className="bg-blue-900/30 rounded p-2 text-center">
                    <div className="text-blue-400">Position</div>
                    <div className="text-white">
                      X: {selectedObject.position.x.toFixed(1)}<br/>
                      Y: {selectedObject.position.y.toFixed(1)}<br/>
                      Z: {selectedObject.position.z.toFixed(1)}
                    </div>
                  </div>
                  <div className="bg-green-900/30 rounded p-2 text-center">
                    <div className="text-green-400">Scale</div>
                    <div className="text-white">
                      X: {selectedObject.scale.x.toFixed(1)}<br/>
                      Y: {selectedObject.scale.y.toFixed(1)}<br/>
                      Z: {selectedObject.scale.z.toFixed(1)}
                    </div>
                  </div>
                  <div className="bg-purple-900/30 rounded p-2 text-center">
                    <div className="text-purple-400">Rotation</div>
                    <div className="text-white">
                      X: {(selectedObject.rotation.x * 180/Math.PI).toFixed(0)}°<br/>
                      Y: {(selectedObject.rotation.y * 180/Math.PI).toFixed(0)}°<br/>
                      Z: {(selectedObject.rotation.z * 180/Math.PI).toFixed(0)}°
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => duplicateObject(selectedObject.id)}
                    className="flex-1 border-blue-500/30 text-blue-400 hover:bg-blue-500/20"
                  >
                    Duplicate
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => deleteObject(selectedObject.id)}
                    className="flex-1 border-red-500/30 text-red-400 hover:bg-red-500/20"
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        )}

        <Card className="bg-black/80 border-blue-500/30 backdrop-blur-sm">
          <div className="p-4">
            <h3 className="text-white font-semibold mb-3 text-sm">Scene Tools</h3>
            <div className="space-y-2">
              <Button
                variant="outline"
                size="sm"
                onClick={exportScene}
                className="w-full border-green-500/30 text-green-400 hover:bg-green-500/20"
              >
                Export Scene
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={clearScene}
                disabled={objects.length === 0}
                className="w-full border-red-500/30 text-red-400 hover:bg-red-500/20 disabled:opacity-50"
              >
                Clear All
              </Button>
            </div>
          </div>
        </Card>
      </div>

      {/* AI Assistant Modal */}
      {showAI && (
        <AIAssistant 
          isOpen={showAI}
          onClose={() => setShowAI(false)}
        />
      )}

      {/* Model Importer Modal */}
      {showImporter && (
        <ModelImporter
          isOpen={showImporter}
          onClose={() => setShowImporter(false)}
        />
      )}

      {/* Interactive Help Panel */}
      <div className="absolute bottom-20 left-4 z-10">
        <Card className="bg-black/80 border-blue-500/30 backdrop-blur-sm">
          <div className="p-3">
            <h4 className="text-white font-semibold text-sm mb-2 flex items-center">
              <div className="w-2 h-2 bg-blue-500 rounded-full mr-2 animate-pulse"></div>
              Quick Guide
            </h4>
            <div className="text-gray-300 text-xs space-y-1">
              <div>💬 <strong>Commands:</strong> "create cube red", "make it bigger"</div>
              <div>🖱️ <strong>Controls:</strong> Click to select, drag to orbit, scroll to zoom</div>
              <div>⌨️ <strong>Shortcuts:</strong> R = rotate mode, S = scale mode, Esc = deselect</div>
              <div>🤖 <strong>AI:</strong> Use natural language with the AI assistant</div>
              <div>📁 <strong>Import:</strong> Drag & drop GLB/GLTF files from Sketchfab</div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default App;
