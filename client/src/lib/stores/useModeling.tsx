import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import { ModelingObject, Room, FloorPlan } from "../../types/modeling";

interface ModelingState {
  objects: ModelingObject[];
  selectedObject: ModelingObject | null;
  currentRoom: Room | null;
  floorPlan: FloorPlan | null;
  viewMode: '2d' | '3d';
  
  // Actions
  createObject: (params: Omit<ModelingObject, 'id'>) => ModelingObject;
  updateObject: (id: string, updates: Partial<ModelingObject>) => void;
  deleteObject: (id: string) => void;
  duplicateObject: (id: string) => ModelingObject | null;
  selectObject: (id: string | null) => void;
  clearScene: () => void;
  importModel: (file: File) => Promise<ModelingObject>;
  
  // Room Actions
  createRoom: (type: Room['type'], dimensions: Room['dimensions']) => Room;
  updateRoom: (roomId: string, updates: Partial<Room>) => void;
  selectRoom: (roomId: string | null) => void;
  addFurniture: (roomId: string, furnitureType: string, position: any) => ModelingObject;
  
  // View Actions
  setViewMode: (mode: '2d' | '3d') => void;
  
  // Blueprint Actions
  importBlueprint: (file: File) => Promise<FloorPlan>;
}

export const useModeling = create<ModelingState>()(
  subscribeWithSelector((set, get) => ({
    objects: [],
    selectedObject: null,
    currentRoom: null,
    floorPlan: null,
    viewMode: '3d',

    createObject: (params) => {
      const newObject: ModelingObject = {
        ...params,
        id: `obj_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      };

      set(state => ({
        objects: [...state.objects, newObject],
        selectedObject: newObject
      }));

      return newObject;
    },

    updateObject: (id, updates) => {
      set(state => ({
        objects: state.objects.map(obj =>
          obj.id === id ? { ...obj, ...updates } : obj
        ),
        selectedObject: state.selectedObject?.id === id
          ? { ...state.selectedObject, ...updates }
          : state.selectedObject
      }));
    },

    deleteObject: (id) => {
      set(state => ({
        objects: state.objects.filter(obj => obj.id !== id),
        selectedObject: state.selectedObject?.id === id ? null : state.selectedObject
      }));
    },

    duplicateObject: (id) => {
      const { objects, createObject } = get();
      const originalObject = objects.find(obj => obj.id === id);
      
      if (!originalObject) return null;

      const duplicate = createObject({
        ...originalObject,
        name: originalObject.name ? `${originalObject.name} Copy` : undefined,
        position: {
          x: originalObject.position.x + 1,
          y: originalObject.position.y,
          z: originalObject.position.z + 1
        }
      });

      return duplicate;
    },

    selectObject: (id) => {
      const { objects } = get();
      const objectToSelect = id ? objects.find(obj => obj.id === id) : null;
      
      set({
        selectedObject: objectToSelect
      });
    },

    clearScene: () => {
      set({
        objects: [],
        selectedObject: null
      });
    },

    importModel: async (file) => {
      // Create object URL for the file
      const objectUrl = URL.createObjectURL(file);
      
      const { createObject } = get();
      const importedObject = createObject({
        type: 'imported',
        modelPath: objectUrl,
        name: file.name.split('.')[0],
        color: '#ffffff',
        position: { x: 0, y: 1, z: 0 },
        scale: { x: 2.5, y: 2.5, z: 2.5 },
        rotation: { x: 0, y: 0, z: 0 }
      });

      return importedObject;
    },

    // Room Actions
    createRoom: (type, dimensions) => {
      const roomId = `room_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Create floor
      const floor = get().createObject({
        type: 'floor',
        category: 'room',
        name: `${type} Floor`,
        position: { x: 0, y: 0, z: 0 },
        scale: { x: dimensions.width, y: 0.1, z: dimensions.length },
        rotation: { x: 0, y: 0, z: 0 },
        color: '#8B7355',
        room: roomId,
        isStructural: true
      });

      // Create walls
      const walls = [
        // North wall
        get().createObject({
          type: 'wall',
          category: 'room',
          name: 'North Wall',
          position: { x: 0, y: dimensions.height / 2, z: dimensions.length / 2 },
          scale: { x: dimensions.width, y: dimensions.height, z: 0.2 },
          rotation: { x: 0, y: 0, z: 0 },
          color: '#F5F5F5',
          room: roomId,
          isStructural: true
        }),
        // South wall
        get().createObject({
          type: 'wall',
          category: 'room',
          name: 'South Wall',
          position: { x: 0, y: dimensions.height / 2, z: -dimensions.length / 2 },
          scale: { x: dimensions.width, y: dimensions.height, z: 0.2 },
          rotation: { x: 0, y: 0, z: 0 },
          color: '#F5F5F5',
          room: roomId,
          isStructural: true
        }),
        // East wall
        get().createObject({
          type: 'wall',
          category: 'room',
          name: 'East Wall',
          position: { x: dimensions.width / 2, y: dimensions.height / 2, z: 0 },
          scale: { x: 0.2, y: dimensions.height, z: dimensions.length },
          rotation: { x: 0, y: 0, z: 0 },
          color: '#F5F5F5',
          room: roomId,
          isStructural: true
        }),
        // West wall
        get().createObject({
          type: 'wall',
          category: 'room',
          name: 'West Wall',
          position: { x: -dimensions.width / 2, y: dimensions.height / 2, z: 0 },
          scale: { x: 0.2, y: dimensions.height, z: dimensions.length },
          rotation: { x: 0, y: 0, z: 0 },
          color: '#F5F5F5',
          room: roomId,
          isStructural: true
        })
      ];

      const room: Room = {
        id: roomId,
        name: type.replace('_', ' ').toUpperCase(),
        type,
        dimensions,
        walls,
        floor,
        furniture: [],
        doors: [],
        windows: []
      };

      set(state => ({
        currentRoom: room
      }));

      return room;
    },

    updateRoom: (roomId, updates) => {
      set(state => ({
        currentRoom: state.currentRoom?.id === roomId 
          ? { ...state.currentRoom, ...updates }
          : state.currentRoom
      }));
    },

    selectRoom: (roomId) => {
      // Implementation for room selection
      set({ selectedObject: null });
    },

    addFurniture: (roomId, furnitureType, position) => {
      const furnitureColors: Record<string, string> = {
        bed: '#8B4513',
        chair: '#654321',
        table: '#D2691E',
        dining_table: '#CD853F',
        sofa: '#4A4A4A',
        desk: '#8B7355',
        wardrobe: '#696969',
        tv_stand: '#2F4F4F',
        counter: '#8B7355',
        refrigerator: '#C0C0C0',
        toilet: '#FFFFFF',
        sink: '#F5F5F5',
        bathtub: '#FFFFFF',
        nightstand: '#654321',
        bookshelf: '#8B4513'
      };

      const furnitureScales: Record<string, { x: number; y: number; z: number }> = {
        bed: { x: 2, y: 0.5, z: 1 },
        chair: { x: 0.5, y: 1, z: 0.5 },
        table: { x: 1.5, y: 0.8, z: 0.8 },
        dining_table: { x: 2, y: 0.8, z: 1.2 },
        sofa: { x: 2, y: 0.8, z: 0.8 },
        desk: { x: 1.2, y: 0.8, z: 0.6 },
        wardrobe: { x: 1, y: 2, z: 0.6 },
        tv_stand: { x: 1.5, y: 0.6, z: 0.4 },
        counter: { x: 2, y: 0.8, z: 0.6 },
        refrigerator: { x: 0.6, y: 2, z: 0.6 },
        toilet: { x: 0.6, y: 0.8, z: 0.8 },
        sink: { x: 0.6, y: 0.8, z: 0.4 },
        bathtub: { x: 1.5, y: 0.6, z: 0.8 },
        nightstand: { x: 0.5, y: 0.6, z: 0.4 },
        bookshelf: { x: 0.4, y: 2, z: 1.5 }
      };

      return get().createObject({
        type: 'furniture',
        category: 'furniture',
        subtype: furnitureType,
        name: furnitureType.charAt(0).toUpperCase() + furnitureType.slice(1),
        position: position || { x: 0, y: 0.5, z: 0 },
        scale: furnitureScales[furnitureType] || { x: 1, y: 1, z: 1 },
        rotation: { x: 0, y: 0, z: 0 },
        color: furnitureColors[furnitureType] || '#8B4513',
        room: roomId
      });
    },

    setViewMode: (mode) => {
      set({ viewMode: mode });
    },

    importBlueprint: async (file) => {
      const imageUrl = URL.createObjectURL(file);
      
      const floorPlan: FloorPlan = {
        id: `plan_${Date.now()}`,
        name: file.name.split('.')[0],
        rooms: [],
        scale: 1,
        imageUrl,
        dimensions: { width: 20, length: 20 }
      };

      set({ floorPlan });
      return floorPlan;
    }
  }))
);
