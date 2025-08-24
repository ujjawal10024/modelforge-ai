import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import { ModelingObject } from "../../types/modeling";

interface ModelingState {
  objects: ModelingObject[];
  selectedObject: ModelingObject | null;
  
  // Actions
  createObject: (params: Omit<ModelingObject, 'id'>) => ModelingObject;
  updateObject: (id: string, updates: Partial<ModelingObject>) => void;
  deleteObject: (id: string) => void;
  duplicateObject: (id: string) => ModelingObject | null;
  selectObject: (id: string | null) => void;
  clearScene: () => void;
  importModel: (file: File) => Promise<ModelingObject>;
}

export const useModeling = create<ModelingState>()(
  subscribeWithSelector((set, get) => ({
    objects: [],
    selectedObject: null,

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
        scale: { x: 1, y: 1, z: 1 },
        rotation: { x: 0, y: 0, z: 0 }
      });

      return importedObject;
    }
  }))
);
