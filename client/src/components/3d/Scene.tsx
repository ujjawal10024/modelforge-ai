import { useRef, useState, useEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Grid, Environment } from "@react-three/drei";
import * as THREE from "three";
import { ModelViewer } from "./ModelViewer";
import { ObjectManipulator } from "./ObjectManipulator";
import { useModeling } from "../../lib/stores/useModeling";
import { useAudio } from "../../lib/stores/useAudio";

export function Scene() {
  const { objects, selectedObject, selectObject, updateObject } = useModeling();
  const { playHit } = useAudio();
  const controlsRef = useRef<any>();
  const { camera, raycaster, gl } = useThree();
  const [dragMode, setDragMode] = useState<'move' | 'rotate' | 'scale' | null>(null);
  
  // Handle keyboard controls for object manipulation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!selectedObject) return;
      
      switch (event.key.toLowerCase()) {
        case 'r':
          setDragMode(dragMode === 'rotate' ? null : 'rotate');
          break;
        case 's':
          setDragMode(dragMode === 'scale' ? null : 'scale');
          break;
        case 'escape':
          setDragMode(null);
          selectObject(null);
          break;
        case 'delete':
        case 'backspace':
          // TODO: Implement object deletion
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedObject, dragMode, selectObject]);

  // Handle mouse/touch interactions - simplified for better performance
  const handlePointerDown = (event: any) => {
    // Object selection is now handled directly in ModelViewer components
    // This prevents conflicts and improves performance
  };

  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.4} />
      <directionalLight
        position={[10, 10, 5]}
        intensity={1}
        castShadow
        shadow-mapSize={[2048, 2048]}
      />
      <pointLight position={[-10, -10, -10]} intensity={0.3} />

      {/* Environment */}
      <Environment preset="warehouse" />
      
      {/* Grid Helper */}
      <Grid 
        args={[50, 50]} 
        cellSize={1} 
        cellThickness={0.5} 
        cellColor="#444444" 
        sectionSize={5} 
        sectionThickness={1} 
        sectionColor="#666666"
        fadeDistance={25}
        fadeStrength={1}
        followCamera={false}
        infiniteGrid={true}
      />

      {/* Ground Plane */}
      <mesh 
        receiveShadow 
        rotation={[-Math.PI / 2, 0, 0]} 
        position={[0, -0.01, 0]}
      >
        <planeGeometry args={[100, 100]} />
        <meshLambertMaterial color="#2a2a2a" transparent opacity={0.8} />
      </mesh>

      {/* Render all 3D objects */}
      {objects.map((object) => (
        <ModelViewer
          key={object.id}
          object={object}
          isSelected={selectedObject?.id === object.id}
          onSelect={() => selectObject(object.id)}
        />
      ))}

      {/* Object Manipulation Handles */}
      {selectedObject && (
        <ObjectManipulator
          object={selectedObject}
          mode={dragMode}
          onUpdate={updateObject}
        />
      )}

      {/* Camera Controls */}
      <OrbitControls
        ref={controlsRef}
        makeDefault
        enableDamping
        dampingFactor={0.05}
        minDistance={2}
        maxDistance={50}
        maxPolarAngle={Math.PI / 2}
        target={[0, 0, 0]}
      />
      
      {/* Canvas pointer events handled by individual objects */}
    </>
  );
}
