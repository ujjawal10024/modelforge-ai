export interface Vector3 {
  x: number;
  y: number;
  z: number;
}

export interface ModelingObject {
  id: string;
  type: 'cube' | 'sphere' | 'cylinder' | 'cone' | 'torus' | 'plane' | 'imported';
  name?: string;
  position: Vector3;
  rotation: Vector3;
  scale: Vector3;
  color: string;
  opacity?: number;
  modelPath?: string; // For imported models
  material?: 'standard' | 'basic' | 'phong' | 'lambert';
  wireframe?: boolean;
  visible?: boolean;
}

export interface SceneState {
  objects: ModelingObject[];
  selectedObjectId: string | null;
  cameraPosition: Vector3;
  cameraTarget: Vector3;
}

export interface Command {
  id: string;
  text: string;
  timestamp: Date;
  success: boolean;
  result?: string;
}

export interface AIContext {
  objects: ModelingObject[];
  selectedObject: ModelingObject | null;
  sceneInfo: {
    objectCount: number;
    selectedObjectInfo: any;
  };
}
