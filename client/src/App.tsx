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
import { Volume2, VolumeX } from "lucide-react";

function App() {
  const { selectedObject, objects } = useModeling();
  const { toggleMute, isMuted } = useAudio();
  const [showAI, setShowAI] = useState(false);
  const [showImporter, setShowImporter] = useState(false);

  const handleCanvasClick = useCallback((event: React.MouseEvent) => {
    // Prevent deselection when clicking on UI elements
    if ((event.target as HTMLElement).tagName === 'CANVAS') {
      // Canvas click logic will be handled in Scene component
    }
  }, []);

  return (
    <div className="w-screen h-screen bg-gray-900 relative overflow-hidden">
      {/* Main 3D Canvas */}
      <div className="absolute inset-0" onClick={handleCanvasClick}>
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
          <color attach="background" args={["#1a1a1a"]} />
          <Suspense fallback={null}>
            <Scene />
          </Suspense>
        </Canvas>
      </div>

      {/* Top Toolbar */}
      <div className="absolute top-4 left-4 right-4 z-10">
        <Card className="bg-black/70 border-gray-600 backdrop-blur-sm">
          <div className="p-3">
            <Toolbar 
              onShowAI={() => setShowAI(true)}
              onShowImporter={() => setShowImporter(true)}
            />
          </div>
        </Card>
      </div>

      {/* Command Panel */}
      <div className="absolute bottom-4 left-4 right-4 z-10">
        <CommandPanel />
      </div>

      {/* Side Panel - Object Properties */}
      {selectedObject && (
        <div className="absolute top-20 right-4 w-80 z-10">
          <Card className="bg-black/80 border-gray-600 backdrop-blur-sm">
            <div className="p-4">
              <h3 className="text-white font-semibold mb-3">Object Properties</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-gray-300">
                  <span>Type:</span>
                  <span className="capitalize">{selectedObject.type}</span>
                </div>
                <div className="flex justify-between text-gray-300">
                  <span>Position:</span>
                  <span>
                    ({selectedObject.position.x.toFixed(1)}, {selectedObject.position.y.toFixed(1)}, {selectedObject.position.z.toFixed(1)})
                  </span>
                </div>
                <div className="flex justify-between text-gray-300">
                  <span>Scale:</span>
                  <span>
                    ({selectedObject.scale.x.toFixed(1)}, {selectedObject.scale.y.toFixed(1)}, {selectedObject.scale.z.toFixed(1)})
                  </span>
                </div>
                <div className="flex justify-between text-gray-300">
                  <span>Color:</span>
                  <div 
                    className="w-6 h-6 rounded border border-gray-500"
                    style={{ backgroundColor: selectedObject.color }}
                  />
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Scene Info */}
      <div className="absolute top-20 left-4 z-10">
        <Card className="bg-black/70 border-gray-600 backdrop-blur-sm">
          <div className="p-3">
            <div className="text-white text-sm">
              <div>Objects: {objects.length}</div>
              <div>Selected: {selectedObject?.id || 'None'}</div>
            </div>
          </div>
        </Card>
      </div>

      {/* Audio Control */}
      <div className="absolute top-4 right-4 z-20">
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleMute}
          className="text-white hover:bg-white/20"
        >
          {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
        </Button>
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

      {/* Help Text */}
      <div className="absolute bottom-20 left-4 z-10">
        <Card className="bg-black/60 border-gray-600 backdrop-blur-sm">
          <div className="p-2">
            <div className="text-gray-300 text-xs space-y-1">
              <div>• Type commands like "create cube" or "add sphere red"</div>
              <div>• Click objects to select • Drag to move • Scroll to zoom</div>
              <div>• Press 'r' to rotate • Press 's' to scale</div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default App;
