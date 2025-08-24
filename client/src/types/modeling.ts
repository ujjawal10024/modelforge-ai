export interface Vector3 {
  x: number;
  y: number;
  z: number;
}

export interface ModelingObject {
  id: string;
  type: 'cube' | 'sphere' | 'cylinder' | 'cone' | 'torus' | 'plane' | 'imported' | 'wall' | 'floor' | 'ceiling' | 'door' | 'window' | 'furniture';
  category?: 'room' | 'furniture' | 'decoration' | 'structure';
  subtype?: string; // e.g., 'bed', 'chair', 'table', 'sofa' for furniture
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
  room?: string; // Room assignment
  isStructural?: boolean; // For walls, floors, ceilings
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

export interface Room {
  id: string;
  name: string;
  type: 'bedroom' | 'living_room' | 'kitchen' | 'bathroom' | 'office' | 'custom';
  dimensions: {
    width: number;
    length: number;
    height: number;
  };
  walls: ModelingObject[];
  floor: ModelingObject;
  ceiling?: ModelingObject;
  furniture: ModelingObject[];
  doors: ModelingObject[];
  windows: ModelingObject[];
}

export interface FloorPlan {
  id: string;
  name: string;
  rooms: Room[];
  scale: number; // units per meter
  imageUrl?: string; // Imported blueprint image
  dimensions: {
    width: number;
    length: number;
  };
}

export interface AIContext {
  objects: ModelingObject[];
  selectedObject: ModelingObject | null;
  currentRoom?: Room;
  floorPlan?: FloorPlan;
  viewMode: '2d' | '3d';
  sceneInfo: {
    objectCount: number;
    selectedObjectInfo: any;
    roomCount: number;
  };
}
