import { useRef, useState } from "react";
import { Text } from "@react-three/drei";
import * as THREE from "three";
import { ModelingObject } from "../../types/modeling";
import { useModeling } from "../../lib/stores/useModeling";
import { useAudio } from "../../lib/stores/useAudio";

interface SimpleModelViewerProps {
  object: ModelingObject;
}

export function SimpleModelViewer({ object }: SimpleModelViewerProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const { selectedObject, selectObject } = useModeling();
  const { playHit } = useAudio();
  
  const isSelected = selectedObject?.id === object.id;

  const handleClick = (e: any) => {
    e.stopPropagation();
    selectObject(object.id);
    playHit();
  };

  const handlePointerOver = (e: any) => {
    e.stopPropagation();
    setHovered(true);
    document.body.style.cursor = 'pointer';
  };

  const handlePointerOut = (e: any) => {
    e.stopPropagation();
    setHovered(false);
    document.body.style.cursor = 'auto';
  };

  // Create geometry based on object type
  const createGeometry = () => {
    switch (object.type) {
      case 'cube':
        return <boxGeometry args={[1, 1, 1]} />;
      case 'sphere':
        return <sphereGeometry args={[0.5, 32, 32]} />;
      case 'cylinder':
        return <cylinderGeometry args={[0.5, 0.5, 1, 32]} />;
      case 'cone':
        return <coneGeometry args={[0.5, 1, 32]} />;
      case 'torus':
        return <torusGeometry args={[0.5, 0.2, 16, 32]} />;
      case 'plane':
        return <planeGeometry args={[1, 1]} />;
      default:
        return <boxGeometry args={[1, 1, 1]} />;
    }
  };

  // Create material with object color
  const createMaterial = () => {
    const baseColor = new THREE.Color(object.color);
    
    if (isSelected) {
      baseColor.multiplyScalar(1.3);
    } else if (hovered) {
      baseColor.multiplyScalar(1.1);
    }

    return (
      <meshStandardMaterial
        color={baseColor}
        roughness={0.7}
        metalness={0.1}
        transparent={object.opacity !== undefined}
        opacity={object.opacity || 1}
      />
    );
  };

  // Handle imported models separately
  if (object.type === 'imported') {
    return (
      <group
        position={[object.position.x, object.position.y, object.position.z]}
        rotation={[object.rotation.x, object.rotation.y, object.rotation.z]}
        scale={[object.scale.x, object.scale.y, object.scale.z]}
      >
        {/* Placeholder for imported models */}
        <mesh
          ref={meshRef}
          castShadow
          receiveShadow
          onClick={handleClick}
          onPointerOver={handlePointerOver}
          onPointerOut={handlePointerOut}
        >
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial color="#4ecdc4" />
        </mesh>

        {/* Selection outline */}
        {isSelected && (
          <mesh>
            <boxGeometry args={[1.1, 1.1, 1.1]} />
            <meshBasicMaterial
              color="#00ff00"
              transparent
              opacity={0.2}
              wireframe
            />
          </mesh>
        )}

        {/* Object label */}
        {(isSelected || hovered) && (
          <Text
            position={[0, 1.2, 0]}
            fontSize={0.3}
            color="#ffffff"
            anchorX="center"
            anchorY="middle"
          >
            {object.name || `Model ${object.id.slice(-4)}`}
          </Text>
        )}
      </group>
    );
  }

  return (
    <group
      position={[object.position.x, object.position.y, object.position.z]}
      rotation={[object.rotation.x, object.rotation.y, object.rotation.z]}
      scale={[object.scale.x, object.scale.y, object.scale.z]}
    >
      <mesh
        ref={meshRef}
        castShadow
        receiveShadow
        onClick={handleClick}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
      >
        {createGeometry()}
        {createMaterial()}
      </mesh>

      {/* Selection outline */}
      {isSelected && (
        <mesh>
          {createGeometry()}
          <meshBasicMaterial
            color="#00ff00"
            transparent
            opacity={0.2}
            side={THREE.BackSide}
          />
        </mesh>
      )}

      {/* Object label */}
      {(isSelected || hovered) && (
        <Text
          position={[0, 1.2, 0]}
          fontSize={0.3}
          color="#ffffff"
          anchorX="center"
          anchorY="middle"
        >
          {object.name || `${object.type} ${object.id.slice(-4)}`}
        </Text>
      )}
    </group>
  );
}