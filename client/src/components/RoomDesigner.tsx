import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Home, Plus, Sofa, Bed, UtensilsCrossed, Monitor, Shirt, BookOpen } from "lucide-react";
import { useModeling } from "../lib/stores/useModeling";
import { useAudio } from "../lib/stores/useAudio";

interface RoomDesignerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function RoomDesigner({ isOpen, onClose }: RoomDesignerProps) {
  const [selectedTab, setSelectedTab] = useState<'furniture' | 'structure'>('furniture');
  const { currentRoom, addFurniture, createObject } = useModeling();
  const { playSuccess, playPlace } = useAudio();

  const furnitureCategories = {
    bedroom: [
      { type: 'bed', label: 'Bed', icon: Bed, color: '#8B4513' },
      { type: 'nightstand', label: 'Nightstand', icon: BookOpen, color: '#654321' },
      { type: 'wardrobe', label: 'Wardrobe', icon: Shirt, color: '#696969' },
      { type: 'chair', label: 'Chair', icon: Sofa, color: '#4A4A4A' }
    ],
    living: [
      { type: 'sofa', label: 'Sofa', icon: Sofa, color: '#4A4A4A' },
      { type: 'coffee_table', label: 'Coffee Table', icon: BookOpen, color: '#D2691E' },
      { type: 'tv_stand', label: 'TV Stand', icon: BookOpen, color: '#8B7355' },
      { type: 'armchair', label: 'Armchair', icon: Sofa, color: '#654321' }
    ],
    kitchen: [
      { type: 'dining_table', label: 'Dining Table', icon: UtensilsCrossed, color: '#D2691E' },
      { type: 'chair', label: 'Dining Chair', icon: Sofa, color: '#654321' },
      { type: 'counter', label: 'Kitchen Counter', icon: BookOpen, color: '#8B7355' },
      { type: 'refrigerator', label: 'Refrigerator', icon: BookOpen, color: '#C0C0C0' }
    ],
    office: [
      { type: 'desk', label: 'Desk', icon: Monitor, color: '#8B7355' },
      { type: 'office_chair', label: 'Office Chair', icon: Sofa, color: '#4A4A4A' },
      { type: 'bookshelf', label: 'Bookshelf', icon: BookOpen, color: '#654321' },
      { type: 'filing_cabinet', label: 'Filing Cabinet', icon: BookOpen, color: '#696969' }
    ]
  };

  const structuralElements = [
    { type: 'door', label: 'Door', icon: Home, color: '#8B4513' },
    { type: 'window', label: 'Window', icon: Home, color: '#87CEEB' },
    { type: 'wall', label: 'Wall', icon: Home, color: '#F5F5F5' }
  ];

  const placeFurniture = (furnitureType: string) => {
    if (!currentRoom) return;

    // Generate random position within room bounds
    const roomWidth = currentRoom.dimensions.width;
    const roomLength = currentRoom.dimensions.length;
    
    const position = {
      x: (Math.random() - 0.5) * (roomWidth - 2),
      y: 0.5,
      z: (Math.random() - 0.5) * (roomLength - 2)
    };

    addFurniture(currentRoom.id, furnitureType, position);
    playPlace();
  };

  const placeStructural = (elementType: string) => {
    if (!currentRoom) return;

    const position = {
      x: 0,
      y: elementType === 'window' ? 1.5 : 1,
      z: currentRoom.dimensions.length / 2 - 0.1
    };

    const structuralObject = createObject({
      type: elementType as any,
      category: 'structure',
      name: elementType.charAt(0).toUpperCase() + elementType.slice(1),
      position,
      scale: elementType === 'door' 
        ? { x: 0.1, y: 2, z: 1 }
        : elementType === 'window'
        ? { x: 0.1, y: 1, z: 1.5 }
        : { x: 0.2, y: 3, z: 1 },
      rotation: { x: 0, y: 0, z: 0 },
      color: structuralElements.find(e => e.type === elementType)?.color || '#666666',
      room: currentRoom.id,
      isStructural: true
    });

    playPlace();
  };

  if (!currentRoom) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-md bg-gray-900 border-blue-500/30 text-white">
          <DialogHeader>
            <DialogTitle>No Room Selected</DialogTitle>
          </DialogHeader>
          <div className="text-center py-8">
            <Home size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-400 mb-4">
              Please create a room first using the Blueprint Importer or room templates.
            </p>
            <Button onClick={onClose} variant="outline">
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] bg-gray-900 border-blue-500/30 text-white overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-500 rounded flex items-center justify-center">
              <Home size={16} className="text-white" />
            </div>
            Room Designer - {currentRoom.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Room Info */}
          <Card className="bg-black/50 border-blue-500/30 p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-white font-semibold">{currentRoom.name}</h3>
                <p className="text-gray-400 text-sm">
                  {currentRoom.dimensions.width}m × {currentRoom.dimensions.length}m × {currentRoom.dimensions.height}m
                </p>
              </div>
              <Badge variant="outline" className="border-blue-500/30 text-blue-400">
                {currentRoom.type.replace('_', ' ')}
              </Badge>
            </div>
          </Card>

          {/* Tabs */}
          <div className="flex space-x-2">
            <Button
              variant={selectedTab === 'furniture' ? 'default' : 'outline'}
              onClick={() => setSelectedTab('furniture')}
              className={selectedTab === 'furniture' 
                ? 'bg-blue-600 text-white' 
                : 'border-gray-600 text-gray-300 hover:border-blue-500'
              }
            >
              <Sofa className="mr-2" size={16} />
              Furniture
            </Button>
            <Button
              variant={selectedTab === 'structure' ? 'default' : 'outline'}
              onClick={() => setSelectedTab('structure')}
              className={selectedTab === 'structure' 
                ? 'bg-blue-600 text-white' 
                : 'border-gray-600 text-gray-300 hover:border-blue-500'
              }
            >
              <Home className="mr-2" size={16} />
              Structure
            </Button>
          </div>

          {/* Furniture Tab */}
          {selectedTab === 'furniture' && (
            <div className="space-y-6">
              {Object.entries(furnitureCategories).map(([category, items]) => (
                <Card key={category} className="bg-black/50 border-blue-500/30 p-6">
                  <h3 className="text-white font-semibold mb-4 capitalize flex items-center">
                    <Plus className="mr-2" size={20} />
                    {category} Furniture
                  </h3>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {items.map((item) => {
                      const IconComponent = item.icon;
                      return (
                        <Button
                          key={item.type}
                          variant="outline"
                          onClick={() => placeFurniture(item.type)}
                          className="h-24 border-gray-600 hover:border-blue-500 hover:bg-blue-500/10 flex flex-col items-center gap-2"
                        >
                          <div 
                            className="w-8 h-8 rounded flex items-center justify-center"
                            style={{ backgroundColor: `${item.color}40` }}
                          >
                            <IconComponent size={20} style={{ color: item.color }} />
                          </div>
                          <span className="text-sm text-white">{item.label}</span>
                        </Button>
                      );
                    })}
                  </div>
                </Card>
              ))}
            </div>
          )}

          {/* Structure Tab */}
          {selectedTab === 'structure' && (
            <Card className="bg-black/50 border-blue-500/30 p-6">
              <h3 className="text-white font-semibold mb-4 flex items-center">
                <Plus className="mr-2" size={20} />
                Structural Elements
              </h3>
              
              <div className="grid grid-cols-3 gap-4">
                {structuralElements.map((element) => {
                  const IconComponent = element.icon;
                  return (
                    <Button
                      key={element.type}
                      variant="outline"
                      onClick={() => placeStructural(element.type)}
                      className="h-24 border-gray-600 hover:border-blue-500 hover:bg-blue-500/10 flex flex-col items-center gap-2"
                    >
                      <div 
                        className="w-8 h-8 rounded flex items-center justify-center"
                        style={{ backgroundColor: `${element.color}40` }}
                      >
                        <IconComponent size={20} style={{ color: element.color }} />
                      </div>
                      <span className="text-sm text-white">{element.label}</span>
                    </Button>
                  );
                })}
              </div>

              <div className="mt-6 p-4 bg-blue-900/30 rounded-lg">
                <p className="text-blue-300 text-sm">
                  💡 <strong>Tip:</strong> Click on structural elements to place them in your room. 
                  You can move and adjust them after placement using the object properties panel.
                </p>
              </div>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}