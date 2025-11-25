import { useRef, useState } from "react";
import { Text, useGLTF } from "@react-three/drei";
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

  // Unified safe click handler
  const handleClick = (e?: React.MouseEvent) => {
    e?.stopPropagation(); // safe even if e is undefined
    selectObject(object.id);
    playHit();
  };

  const handlePointerOver = (e?: React.PointerEvent) => {
    e?.stopPropagation();
    setHovered(true);
    document.body.style.cursor = "pointer";
  };

  const handlePointerOut = (e?: React.PointerEvent) => {
    e?.stopPropagation();
    setHovered(false);
    document.body.style.cursor = "auto";
  };

  // Create geometry
  const createGeometry = () => {
    switch (object.type) {
      case "cube":
      case "wall":
      case "furniture":
        return <boxGeometry args={[1, 1, 1]} />;
      case "sphere":
        return <sphereGeometry args={[0.5, 32, 32]} />;
      case "cylinder":
        return <cylinderGeometry args={[0.5, 0.5, 1, 32]} />;
      case "cone":
        return <coneGeometry args={[0.5, 1, 32]} />;
      case "torus":
        return <torusGeometry args={[0.5, 0.2, 16, 32]} />;
      case "plane":
      case "floor":
      case "ceiling":
        return <planeGeometry args={[1, 1]} />;
      case "door":
        return <boxGeometry args={[0.1, 1, 0.8]} />;
      case "window":
        return <boxGeometry args={[0.1, 0.6, 0.8]} />;
      default:
        return <boxGeometry args={[1, 1, 1]} />;
    }
  };

  // Create material
  const createMaterial = () => {
    const baseColor = new THREE.Color(object.color);
    if (isSelected) baseColor.multiplyScalar(1.3);
    else if (hovered) baseColor.multiplyScalar(1.1);

    switch (object.type) {
      case "floor":
        return (
          <meshLambertMaterial
            color={baseColor}
            transparent={object.opacity !== undefined}
            opacity={object.opacity || 1}
          />
        );
      case "wall":
        return (
          <meshLambertMaterial
            color={baseColor}
            transparent={object.opacity !== undefined}
            opacity={object.opacity || 0.9}
          />
        );
      case "ceiling":
        return (
          <meshBasicMaterial
            color={baseColor}
            transparent={object.opacity !== undefined}
            opacity={object.opacity || 0.8}
          />
        );
      case "window":
        return <meshPhongMaterial color={baseColor} transparent opacity={0.3} />;
      case "door":
        return (
          <meshLambertMaterial
            color={baseColor}
            transparent={object.opacity !== undefined}
            opacity={object.opacity || 1}
          />
        );
      default:
        return (
          <meshStandardMaterial
            color={baseColor}
            roughness={0.7}
            metalness={0.1}
            transparent={object.opacity !== undefined}
            opacity={object.opacity || 1}
          />
        );
    }
  };

  // Special handling for imported GLB models
  if (object.type === "imported" && object.modelPath) {
    return (
      <ImportedGLBModel
        object={object}
        isSelected={isSelected}
        onSelect={handleClick}
        hovered={hovered}
        setHovered={setHovered}
      />
    );
  }

  const isFloor = object.type === "floor";
  const floorRotation = isFloor
    ? [-Math.PI / 2, 0, 0]
    : [object.rotation.x, object.rotation.y, object.rotation.z];

  return (
    <group
      position={[object.position.x, object.position.y, object.position.z]}
      rotation={floorRotation}
      scale={[object.scale.x, object.scale.y, object.scale.z]}
    >
      <mesh
        ref={meshRef}
        castShadow={object.type !== "floor"}
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
          <meshBasicMaterial color="#00ff00" transparent opacity={0.2} side={THREE.BackSide} />
        </mesh>
      )}

      {/* Object label */}
      {(isSelected || hovered) && (
        <Text
          position={[0, isFloor ? 0.2 : 1.2, 0]}
          fontSize={isFloor ? 0.2 : 0.3}
          color={isFloor ? "#333333" : "#ffffff"}
          anchorX="center"
          anchorY="middle"
        >
          {object.name || `${object.type} ${object.id.slice(-4)}`}
        </Text>
      )}
    </group>
  );
}

// Imported GLB component (event-safe)
function ImportedGLBModel({
  object,
  isSelected,
  onSelect,
  hovered,
  setHovered,
}: {
  object: ModelingObject;
  isSelected: boolean;
  onSelect: () => void;
  hovered: boolean;
  setHovered: (hovered: boolean) => void;
}) {
  try {
    const { scene } = useGLTF(object.modelPath!);
    if (!scene) throw new Error("Scene not loaded");

    const clonedScene = scene.clone();
    clonedScene.traverse((child: any) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
        if (child.material) child.material.needsUpdate = true;
      }
    });

    return (
      <group
        position={[object.position.x, object.position.y, object.position.z]}
        rotation={[object.rotation.x, object.rotation.y, object.rotation.z]}
        scale={[object.scale.x, object.scale.y, object.scale.z]}
      >
        <primitive
          object={clonedScene}
          onClick={(e) => {
            e.stopPropagation();
            onSelect();
          }}
          onPointerOver={(e) => {
            e.stopPropagation();
            setHovered(true);
            document.body.style.cursor = "pointer";
          }}
          onPointerOut={(e) => {
            e.stopPropagation();
            setHovered(false);
            document.body.style.cursor = "auto";
          }}
        />

        {isSelected && (
          <mesh>
            <boxGeometry args={[3, 3, 3]} />
            <meshBasicMaterial color="#00ff00" transparent opacity={0.15} wireframe />
          </mesh>
        )}

        {(isSelected || hovered) && (
          <Text position={[0, 2.5, 0]} fontSize={0.3} color="#ffffff" anchorX="center" anchorY="middle">
            {object.name || `Model ${object.id.slice(-4)}`}
          </Text>
        )}
      </group>
    );
  } catch {
    return (
      <FallbackModel
        object={object}
        isSelected={isSelected}
        onSelect={onSelect}
        hovered={hovered}
        setHovered={setHovered}
      />
    );
  }
}

// Fallback GLB loader
function FallbackModel({
  object,
  isSelected,
  onSelect,
  hovered,
  setHovered,
}: {
  object: ModelingObject;
  isSelected: boolean;
  onSelect: () => void;
  hovered: boolean;
  setHovered: (hovered: boolean) => void;
}) {
  return (
    <group
      position={[object.position.x, object.position.y, object.position.z]}
      rotation={[object.rotation.x, object.rotation.y, object.rotation.z]}
      scale={[object.scale.x, object.scale.y, object.scale.z]}
    >
      <mesh
        castShadow
        receiveShadow
        onClick={(e) => {
          e.stopPropagation();
          onSelect();
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
          document.body.style.cursor = "pointer";
        }}
        onPointerOut={(e) => {
          e.stopPropagation();
          setHovered(false);
          document.body.style.cursor = "auto";
        }}
      >
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#ff6b6b" />
      </mesh>

      <Text position={[0, 1.5, 0]} fontSize={0.2} color="#ffffff" anchorX="center" anchorY="middle">
        Model Load Failed
      </Text>
    </group>
  );
}
