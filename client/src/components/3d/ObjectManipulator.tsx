import { useRef, useState, useEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { ModelingObject } from "../../types/modeling";

interface ObjectManipulatorProps {
  object: ModelingObject;
  mode: 'move' | 'rotate' | 'scale' | null;
  onUpdate: (id: string, updates: Partial<ModelingObject>) => void;
}

export function ObjectManipulator({ object, mode, onUpdate }: ObjectManipulatorProps) {
  const groupRef = useRef<THREE.Group>(null);
  const { camera, gl, raycaster } = useThree();
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<THREE.Vector3>(new THREE.Vector3());
  const [initialValues, setInitialValues] = useState<any>(null);

  // Handle mouse events for manipulation
  useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      if (!mode || event.button !== 0) return;

      const pointer = new THREE.Vector2();
      pointer.x = (event.clientX / gl.domElement.clientWidth) * 2 - 1;
      pointer.y = -(event.clientY / gl.domElement.clientHeight) * 2 + 1;

      raycaster.setFromCamera(pointer, camera);
      
      // Start dragging
      setIsDragging(true);
      setDragStart(new THREE.Vector3(event.clientX, event.clientY, 0));
      
      if (mode === 'move') {
        setInitialValues({ ...object.position });
      } else if (mode === 'rotate') {
        setInitialValues({ ...object.rotation });
      } else if (mode === 'scale') {
        setInitialValues({ ...object.scale });
      }
    };

    const handlePointerMove = (event: PointerEvent) => {
      if (!isDragging || !mode || !initialValues) return;

      const deltaX = (event.clientX - dragStart.x) * 0.01;
      const deltaY = (event.clientY - dragStart.y) * 0.01;

      if (mode === 'move') {
        // Move object in world space
        const newPosition = {
          x: initialValues.x + deltaX,
          y: initialValues.y - deltaY,
          z: initialValues.z
        };
        onUpdate(object.id, { position: newPosition });
      } else if (mode === 'rotate') {
        // Rotate object
        const newRotation = {
          x: initialValues.x,
          y: initialValues.y + deltaX,
          z: initialValues.z
        };
        onUpdate(object.id, { rotation: newRotation });
      } else if (mode === 'scale') {
        // Scale object uniformly
        const scaleFactor = 1 + deltaY;
        const newScale = {
          x: Math.max(0.1, initialValues.x * scaleFactor),
          y: Math.max(0.1, initialValues.y * scaleFactor),
          z: Math.max(0.1, initialValues.z * scaleFactor)
        };
        onUpdate(object.id, { scale: newScale });
      }
    };

    const handlePointerUp = () => {
      setIsDragging(false);
      setInitialValues(null);
    };

    if (mode) {
      gl.domElement.addEventListener('pointerdown', handlePointerDown);
      gl.domElement.addEventListener('pointermove', handlePointerMove);
      gl.domElement.addEventListener('pointerup', handlePointerUp);

      return () => {
        gl.domElement.removeEventListener('pointerdown', handlePointerDown);
        gl.domElement.removeEventListener('pointermove', handlePointerMove);
        gl.domElement.removeEventListener('pointerup', handlePointerUp);
      };
    }
  }, [mode, isDragging, dragStart, initialValues, object, onUpdate, camera, gl, raycaster]);

  if (!mode) return null;

  return (
    <group
      ref={groupRef}
      position={[object.position.x, object.position.y, object.position.z]}
    >
      {/* Move handles */}
      {mode === 'move' && (
        <>
          {/* X axis */}
          <mesh position={[1.5, 0, 0]}>
            <cylinderGeometry args={[0.05, 0.05, 0.3]} />
            <meshBasicMaterial color="#ff0000" />
          </mesh>
          <mesh position={[1.8, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
            <coneGeometry args={[0.1, 0.2]} />
            <meshBasicMaterial color="#ff0000" />
          </mesh>

          {/* Y axis */}
          <mesh position={[0, 1.5, 0]}>
            <cylinderGeometry args={[0.05, 0.05, 0.3]} />
            <meshBasicMaterial color="#00ff00" />
          </mesh>
          <mesh position={[0, 1.8, 0]}>
            <coneGeometry args={[0.1, 0.2]} />
            <meshBasicMaterial color="#00ff00" />
          </mesh>

          {/* Z axis */}
          <mesh position={[0, 0, 1.5]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.05, 0.05, 0.3]} />
            <meshBasicMaterial color="#0000ff" />
          </mesh>
          <mesh position={[0, 0, 1.8]} rotation={[Math.PI / 2, 0, 0]}>
            <coneGeometry args={[0.1, 0.2]} />
            <meshBasicMaterial color="#0000ff" />
          </mesh>
        </>
      )}

      {/* Rotation handles */}
      {mode === 'rotate' && (
        <>
          <mesh>
            <torusGeometry args={[1.2, 0.05, 8, 32]} />
            <meshBasicMaterial color="#ffff00" transparent opacity={0.7} />
          </mesh>
        </>
      )}

      {/* Scale handles */}
      {mode === 'scale' && (
        <>
          {/* Corner cubes for uniform scaling */}
          {[
            [1, 1, 1], [-1, 1, 1], [1, -1, 1], [-1, -1, 1],
            [1, 1, -1], [-1, 1, -1], [1, -1, -1], [-1, -1, -1]
          ].map((pos, i) => (
            <mesh key={i} position={pos as [number, number, number]}>
              <boxGeometry args={[0.2, 0.2, 0.2]} />
              <meshBasicMaterial color="#ffffff" />
            </mesh>
          ))}
        </>
      )}
    </group>
  );
}
