import { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF, Text } from "@react-three/drei";
import * as THREE from "three";
import { ModelingObject } from "../../types/modeling";

// Preload common models to avoid loading errors
useGLTF.preload('/models/fallback.glb');

interface ModelViewerProps {
  object: ModelingObject;
  isSelected: boolean;
  onSelect: () => void;
}

export function ModelViewer({ object, isSelected, onSelect }: ModelViewerProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

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
      // Highlight selected objects
      baseColor.multiplyScalar(1.3);
    } else if (hovered) {
      // Slightly brighten hovered objects
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

  // Handle imported models (GLTF/GLB) with robust error handling
  if (object.type === 'imported' && object.modelPath) {
    return <ImportedModel object={object} isSelected={isSelected} onSelect={onSelect} hovered={hovered} setHovered={setHovered} meshRef={meshRef} />;
  }

  return (
    <group
      position={[object.position.x, object.position.y, object.position.z]}
      rotation={[object.rotation.x, object.rotation.y, object.rotation.z]}
      scale={[object.scale.x, object.scale.y, object.scale.z]}
      data-object-id={object.id}
    >
      <mesh
        ref={meshRef}
        castShadow
        receiveShadow
        onClick={(e) => {
          e.stopPropagation();
          onSelect();
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={(e) => {
          e.stopPropagation();
          setHovered(false);
          document.body.style.cursor = 'auto';
        }}
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

// Separate component for imported models to handle errors better
function ImportedModel({ object, isSelected, onSelect, hovered, setHovered, meshRef }: {
  object: ModelingObject;
  isSelected: boolean;
  onSelect: () => void;
  hovered: boolean;
  setHovered: (hovered: boolean) => void;
  meshRef: React.RefObject<THREE.Mesh>;
}) {
  try {
    const gltf = useGLTF(object.modelPath!);
    
    if (!gltf?.scene) {
      throw new Error('Invalid GLTF model');
    }
    
    const clonedScene = gltf.scene.clone();
    
    // Set up shadows and materials
    clonedScene.traverse((child: any) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
        if (child.material) {
          child.material.needsUpdate = true;
        }
      }
    });

    return (
      <group
        position={[object.position.x, object.position.y, object.position.z]}
        rotation={[object.rotation.x, object.rotation.y, object.rotation.z]}
        scale={[object.scale.x, object.scale.y, object.scale.z]}
        data-object-id={object.id}
      >
        <primitive
          object={clonedScene}
          onClick={(e: any) => {
            e.stopPropagation();
            onSelect();
          }}
          onPointerOver={(e: any) => {
            e.stopPropagation();
            setHovered(true);
            document.body.style.cursor = 'pointer';
          }}
          onPointerOut={(e: any) => {
            e.stopPropagation();
            setHovered(false);
            document.body.style.cursor = 'auto';
          }}
        />
        
        {/* Selection outline */}
        {isSelected && (
          <mesh>
            <boxGeometry args={[3, 3, 3]} />
            <meshBasicMaterial
              color="#00ff00"
              transparent
              opacity={0.15}
              wireframe
            />
          </mesh>
        )}

        {/* Object label */}
        {(isSelected || hovered) && (
          <Text
            position={[0, 2.5, 0]}
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
  } catch (error) {
    console.error('Model loading failed:', error);
    
    // Fallback display for failed imports
    return (
      <group
        position={[object.position.x, object.position.y, object.position.z]}
        rotation={[object.rotation.x, object.rotation.y, object.rotation.z]}
        scale={[object.scale.x, object.scale.y, object.scale.z]}
        data-object-id={object.id}
      >
        <mesh
          onClick={(e: any) => {
            e.stopPropagation();
            onSelect();
          }}
          onPointerOver={(e: any) => {
            e.stopPropagation();
            setHovered(true);
            document.body.style.cursor = 'pointer';
          }}
          onPointerOut={(e: any) => {
            e.stopPropagation();
            setHovered(false);
            document.body.style.cursor = 'auto';
          }}
        >
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial color="#ff6b6b" />
        </mesh>
        
        <Text
          position={[0, 1.5, 0]}
          fontSize={0.2}
          color="#ffffff"
          anchorX="center"
          anchorY="middle"
        >
          Model Load Failed
        </Text>
      </group>
    );
  }
}
