import { OrbitControls, Grid, Environment } from "@react-three/drei";
import { useModeling } from "../../lib/stores/useModeling";
import { useAudio } from "../../lib/stores/useAudio";
import { SimpleModelViewer } from "./SimpleModelViewer";

export function SimpleScene() {
  const { objects } = useModeling();

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
        <SimpleModelViewer
          key={object.id}
          object={object}
        />
      ))}

      {/* Camera Controls */}
      <OrbitControls
        makeDefault
        enableDamping
        dampingFactor={0.05}
        minDistance={2}
        maxDistance={50}
        maxPolarAngle={Math.PI / 2}
        target={[0, 0, 0]}
      />
    </>
  );
}