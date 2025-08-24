import { useState, useEffect } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Slider } from "./ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Badge } from "./ui/badge";
import { Trash2, Copy, RotateCw, Move3D, Palette } from "lucide-react";
import { useModeling } from "../lib/stores/useModeling";
import { useAudio } from "../lib/stores/useAudio";

export function ObjectEditor() {
  const { selectedObject, updateObject, deleteObject, duplicateObject } = useModeling();
  const { playSuccess, playHit } = useAudio();
  const [editMode, setEditMode] = useState<'transform' | 'color' | 'material'>('transform');

  if (!selectedObject) {
    return (
      <Card className="bg-gray-900/80 border-gray-700 p-4">
        <div className="text-center text-gray-400">
          <Move3D className="mx-auto mb-2" size={24} />
          <p className="text-sm">Select an object to edit</p>
        </div>
      </Card>
    );
  }

  const handlePositionChange = (axis: 'x' | 'y' | 'z', value: number) => {
    updateObject(selectedObject.id, {
      position: { ...selectedObject.position, [axis]: value }
    });
  };

  const handleScaleChange = (axis: 'x' | 'y' | 'z', value: number) => {
    updateObject(selectedObject.id, {
      scale: { ...selectedObject.scale, [axis]: value }
    });
  };

  const handleRotationChange = (axis: 'x' | 'y' | 'z', value: number) => {
    updateObject(selectedObject.id, {
      rotation: { ...selectedObject.rotation, [axis]: (value * Math.PI) / 180 }
    });
  };

  const handleColorChange = (color: string) => {
    updateObject(selectedObject.id, { color });
    playSuccess();
  };

  const handleMaterialChange = (material: 'standard' | 'basic' | 'phong' | 'lambert' | 'wood' | 'metal' | 'glass' | 'fabric' | 'leather' | 'ceramic' | 'marble' | 'granite' | 'plastic' | 'stainless_steel' | 'acrylic' | 'mirror') => {
    updateObject(selectedObject.id, { material });
    playSuccess();
  };

  const handleGradientChange = (colors: string[], direction: 'horizontal' | 'vertical' | 'radial') => {
    updateObject(selectedObject.id, {
      gradient: { colors, direction }
    });
    playSuccess();
  };

  const handleDuplicate = () => {
    const newObj = duplicateObject(selectedObject.id);
    if (newObj) {
      playSuccess();
    }
  };

  const handleDelete = () => {
    deleteObject(selectedObject.id);
    playHit();
  };

  const presetColors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
    '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9',
    '#F8C471', '#82E0AA', '#F1948A', '#85C1E9', '#D7BDE2'
  ];

  const materials = [
    { value: 'standard', label: 'Standard' },
    { value: 'wood', label: 'Wood' },
    { value: 'metal', label: 'Metal' },
    { value: 'glass', label: 'Glass' },
    { value: 'fabric', label: 'Fabric' },
    { value: 'leather', label: 'Leather' },
    { value: 'ceramic', label: 'Ceramic' },
    { value: 'marble', label: 'Marble' },
    { value: 'granite', label: 'Granite' },
    { value: 'plastic', label: 'Plastic' }
  ];

  return (
    <Card className="bg-gray-900/80 border-gray-700 p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-white font-medium">{selectedObject.name || selectedObject.type}</h3>
          <p className="text-xs text-gray-400">{selectedObject.category}</p>
        </div>
        <div className="flex gap-1">
          <Button
            size="sm"
            variant="outline"
            onClick={handleDuplicate}
            className="border-gray-600 hover:bg-gray-700"
          >
            <Copy size={14} />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={handleDelete}
            className="border-red-600 hover:bg-red-700"
          >
            <Trash2 size={14} />
          </Button>
        </div>
      </div>

      {/* Edit Mode Tabs */}
      <div className="flex gap-1">
        <Button
          size="sm"
          variant={editMode === 'transform' ? 'default' : 'outline'}
          onClick={() => setEditMode('transform')}
          className="flex-1"
        >
          <Move3D size={14} className="mr-1" />
          Transform
        </Button>
        <Button
          size="sm"
          variant={editMode === 'color' ? 'default' : 'outline'}
          onClick={() => setEditMode('color')}
          className="flex-1"
        >
          <Palette size={14} className="mr-1" />
          Color
        </Button>
        <Button
          size="sm"
          variant={editMode === 'material' ? 'default' : 'outline'}
          onClick={() => setEditMode('material')}
          className="flex-1"
        >
          <RotateCw size={14} className="mr-1" />
          Material
        </Button>
      </div>

      {/* Transform Controls */}
      {editMode === 'transform' && (
        <div className="space-y-4">
          {/* Position */}
          <div>
            <Label className="text-white text-sm">Position</Label>
            <div className="grid grid-cols-3 gap-2 mt-2">
              <div>
                <Label className="text-xs text-gray-400">X</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={selectedObject.position.x.toFixed(1)}
                  onChange={(e) => handlePositionChange('x', parseFloat(e.target.value))}
                  className="bg-gray-800 border-gray-600 text-white text-xs"
                />
              </div>
              <div>
                <Label className="text-xs text-gray-400">Y</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={selectedObject.position.y.toFixed(1)}
                  onChange={(e) => handlePositionChange('y', parseFloat(e.target.value))}
                  className="bg-gray-800 border-gray-600 text-white text-xs"
                />
              </div>
              <div>
                <Label className="text-xs text-gray-400">Z</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={selectedObject.position.z.toFixed(1)}
                  onChange={(e) => handlePositionChange('z', parseFloat(e.target.value))}
                  className="bg-gray-800 border-gray-600 text-white text-xs"
                />
              </div>
            </div>
          </div>

          {/* Scale */}
          <div>
            <Label className="text-white text-sm">Scale</Label>
            <div className="grid grid-cols-3 gap-2 mt-2">
              <div>
                <Label className="text-xs text-gray-400">X</Label>
                <Slider
                  value={[selectedObject.scale.x]}
                  onValueChange={([value]) => handleScaleChange('x', value)}
                  min={0.1}
                  max={5}
                  step={0.1}
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-xs text-gray-400">Y</Label>
                <Slider
                  value={[selectedObject.scale.y]}
                  onValueChange={([value]) => handleScaleChange('y', value)}
                  min={0.1}
                  max={5}
                  step={0.1}
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-xs text-gray-400">Z</Label>
                <Slider
                  value={[selectedObject.scale.z]}
                  onValueChange={([value]) => handleScaleChange('z', value)}
                  min={0.1}
                  max={5}
                  step={0.1}
                  className="mt-1"
                />
              </div>
            </div>
          </div>

          {/* Rotation */}
          <div>
            <Label className="text-white text-sm">Rotation (degrees)</Label>
            <div className="grid grid-cols-3 gap-2 mt-2">
              <div>
                <Label className="text-xs text-gray-400">X</Label>
                <Input
                  type="number"
                  step="15"
                  value={Math.round((selectedObject.rotation.x * 180) / Math.PI)}
                  onChange={(e) => handleRotationChange('x', parseFloat(e.target.value))}
                  className="bg-gray-800 border-gray-600 text-white text-xs"
                />
              </div>
              <div>
                <Label className="text-xs text-gray-400">Y</Label>
                <Input
                  type="number"
                  step="15"
                  value={Math.round((selectedObject.rotation.y * 180) / Math.PI)}
                  onChange={(e) => handleRotationChange('y', parseFloat(e.target.value))}
                  className="bg-gray-800 border-gray-600 text-white text-xs"
                />
              </div>
              <div>
                <Label className="text-xs text-gray-400">Z</Label>
                <Input
                  type="number"
                  step="15"
                  value={Math.round((selectedObject.rotation.z * 180) / Math.PI)}
                  onChange={(e) => handleRotationChange('z', parseFloat(e.target.value))}
                  className="bg-gray-800 border-gray-600 text-white text-xs"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Color Controls */}
      {editMode === 'color' && (
        <div className="space-y-4">
          {/* Color Picker */}
          <div>
            <Label className="text-white text-sm">Current Color</Label>
            <div className="flex items-center gap-2 mt-2">
              <Input
                type="color"
                value={selectedObject.color}
                onChange={(e) => handleColorChange(e.target.value)}
                className="w-12 h-8 bg-gray-800 border-gray-600"
              />
              <Input
                type="text"
                value={selectedObject.color}
                onChange={(e) => handleColorChange(e.target.value)}
                className="bg-gray-800 border-gray-600 text-white text-xs"
                placeholder="#FFFFFF"
              />
            </div>
          </div>

          {/* Preset Colors */}
          <div>
            <Label className="text-white text-sm">Preset Colors</Label>
            <div className="grid grid-cols-5 gap-2 mt-2">
              {presetColors.map((color, index) => (
                <Button
                  key={index}
                  size="sm"
                  onClick={() => handleColorChange(color)}
                  className="w-8 h-8 p-0 border-2"
                  style={{ 
                    backgroundColor: color,
                    borderColor: selectedObject.color === color ? '#fff' : '#374151'
                  }}
                />
              ))}
            </div>
          </div>

          {/* Gradient Options */}
          <div>
            <Label className="text-white text-sm">Gradient Effect</Label>
            <div className="mt-2 space-y-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleGradientChange([selectedObject.color, '#FFFFFF'], 'horizontal')}
                className="w-full border-gray-600 hover:bg-gray-700"
              >
                Horizontal Gradient
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleGradientChange([selectedObject.color, '#000000'], 'vertical')}
                className="w-full border-gray-600 hover:bg-gray-700"
              >
                Vertical Gradient
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleGradientChange([selectedObject.color, '#888888'], 'radial')}
                className="w-full border-gray-600 hover:bg-gray-700"
              >
                Radial Gradient
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Material Controls */}
      {editMode === 'material' && (
        <div className="space-y-4">
          <div>
            <Label className="text-white text-sm">Material Type</Label>
            <Select
              value={selectedObject.material || 'standard'}
              onValueChange={handleMaterialChange}
            >
              <SelectTrigger className="bg-gray-800 border-gray-600 text-white mt-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-600">
                {materials.map((material) => (
                  <SelectItem key={material.value} value={material.value}>
                    {material.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Material Preview */}
          <div>
            <Label className="text-white text-sm">Properties</Label>
            <div className="mt-2 flex flex-wrap gap-1">
              <Badge variant="outline" className="border-gray-600">
                {selectedObject.material || 'Standard'}
              </Badge>
              {selectedObject.gradient && (
                <Badge variant="outline" className="border-blue-600">
                  Gradient
                </Badge>
              )}
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}