import { useRef, useEffect, useState } from "react";
import { useModeling } from "../../lib/stores/useModeling";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { ZoomIn, ZoomOut, RotateCcw, Grid3X3, Ruler } from "lucide-react";

export function FloorPlanView() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [showGrid, setShowGrid] = useState(true);
  const [showMeasurements, setShowMeasurements] = useState(true);
  
  const { objects, currentRoom, selectedObject, selectObject } = useModeling();

  useEffect(() => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = canvas.offsetWidth * window.devicePixelRatio;
    canvas.height = canvas.offsetHeight * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    // Clear canvas
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);

    // Apply transformations
    ctx.save();
    ctx.translate(canvas.offsetWidth / 2 + pan.x, canvas.offsetHeight / 2 + pan.y);
    ctx.scale(zoom, zoom);

    // Draw grid
    if (showGrid) {
      drawGrid(ctx, canvas.offsetWidth, canvas.offsetHeight);
    }

    // Draw room if exists
    if (currentRoom) {
      drawRoom(ctx, currentRoom);
    }

    // Draw objects from top-down view
    objects.forEach(obj => {
      drawObject2D(ctx, obj, obj.id === selectedObject?.id);
    });

    ctx.restore();
  }, [objects, currentRoom, selectedObject, zoom, pan, showGrid, showMeasurements]);

  const drawGrid = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    const gridSize = 20; // 1 meter = 20 pixels
    
    ctx.strokeStyle = '#2a2a3e';
    ctx.lineWidth = 0.5;
    
    const startX = -width;
    const endX = width;
    const startY = -height;
    const endY = height;
    
    // Vertical lines
    for (let x = startX; x <= endX; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, startY);
      ctx.lineTo(x, endY);
      ctx.stroke();
    }
    
    // Horizontal lines
    for (let y = startY; y <= endY; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(startX, y);
      ctx.lineTo(endX, y);
      ctx.stroke();
    }
  };

  const drawRoom = (ctx: CanvasRenderingContext2D, room: any) => {
    const scale = 20; // 1 meter = 20 pixels
    const width = room.dimensions.width * scale;
    const length = room.dimensions.length * scale;
    
    // Draw floor
    ctx.fillStyle = '#3a3a4e';
    ctx.fillRect(-width/2, -length/2, width, length);
    
    // Draw walls outline
    ctx.strokeStyle = '#8B7355';
    ctx.lineWidth = 4;
    ctx.strokeRect(-width/2, -length/2, width, length);
    
    // Draw room label
    ctx.fillStyle = '#ffffff';
    ctx.font = '12px Inter';
    ctx.textAlign = 'center';
    ctx.fillText(room.name, 0, -length/2 - 10);
    
    if (showMeasurements) {
      // Draw dimensions
      ctx.fillStyle = '#60a5fa';
      ctx.font = '10px Inter';
      ctx.fillText(`${room.dimensions.width}m`, 0, length/2 + 20);
      
      ctx.save();
      ctx.translate(-width/2 - 20, 0);
      ctx.rotate(-Math.PI/2);
      ctx.fillText(`${room.dimensions.length}m`, 0, 0);
      ctx.restore();
    }
  };

  const drawObject2D = (ctx: CanvasRenderingContext2D, obj: any, isSelected: boolean) => {
    const scale = 20; // 1 meter = 20 pixels
    const x = obj.position.x * scale;
    const z = obj.position.z * scale; // Z becomes Y in 2D
    const width = obj.scale.x * scale;
    const depth = obj.scale.z * scale;
    
    ctx.save();
    ctx.translate(x, z);
    
    // Different shapes for different object types
    switch (obj.type) {
      case 'wall':
        ctx.fillStyle = isSelected ? '#f5f5f5' : '#d1d5db';
        ctx.fillRect(-width/2, -depth/2, width, depth);
        break;
      case 'floor':
        // Don't draw floor in 2D view - room handles this
        break;
      case 'furniture':
        ctx.fillStyle = isSelected ? obj.color : obj.color + 'cc';
        if (obj.subtype === 'bed') {
          ctx.fillRect(-width/2, -depth/2, width, depth);
          // Draw pillow area
          ctx.fillStyle = isSelected ? '#ffffff' : '#f0f0f0';
          ctx.fillRect(-width/2, -depth/2, width, depth/3);
        } else if (obj.subtype === 'sofa') {
          ctx.fillRect(-width/2, -depth/2, width, depth);
          // Draw back cushions
          ctx.fillStyle = isSelected ? '#ffffff' : '#f0f0f0';
          ctx.fillRect(-width/2, depth/2 - 4, width, 4);
        } else {
          ctx.fillRect(-width/2, -depth/2, width, depth);
        }
        break;
      case 'door':
        ctx.strokeStyle = isSelected ? '#fbbf24' : '#f59e0b';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(0, -depth/2, width/2, 0, Math.PI);
        ctx.stroke();
        break;
      case 'window':
        ctx.strokeStyle = isSelected ? '#60a5fa' : '#3b82f6';
        ctx.lineWidth = 2;
        ctx.strokeRect(-width/2, -depth/2, width, depth);
        break;
      default:
        ctx.fillStyle = isSelected ? obj.color : obj.color + 'aa';
        ctx.fillRect(-width/2, -depth/2, width, depth);
        break;
    }
    
    // Draw object label
    if (isSelected || obj.name) {
      ctx.fillStyle = '#ffffff';
      ctx.font = '8px Inter';
      ctx.textAlign = 'center';
      ctx.fillText(obj.name || obj.type, 0, depth/2 + 12);
    }
    
    // Selection indicator
    if (isSelected) {
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 2;
      ctx.strokeRect(-width/2 - 2, -depth/2 - 2, width + 4, depth + 4);
    }
    
    ctx.restore();
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left - canvas.offsetWidth / 2 - pan.x;
    const y = e.clientY - rect.top - canvas.offsetHeight / 2 - pan.y;
    
    const scale = 20;
    const worldX = x / (zoom * scale);
    const worldZ = y / (zoom * scale);
    
    // Find clicked object
    let clickedObject = null;
    for (const obj of objects) {
      const objX = obj.position.x;
      const objZ = obj.position.z;
      const halfWidth = obj.scale.x / 2;
      const halfDepth = obj.scale.z / 2;
      
      if (worldX >= objX - halfWidth && worldX <= objX + halfWidth &&
          worldZ >= objZ - halfDepth && worldZ <= objZ + halfDepth) {
        clickedObject = obj;
        break;
      }
    }
    
    selectObject(clickedObject ? clickedObject.id : null);
  };

  const resetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  return (
    <div className="w-full h-full relative bg-gray-900">
      {/* 2D Canvas */}
      <canvas
        ref={canvasRef}
        className="w-full h-full cursor-crosshair"
        onClick={handleCanvasClick}
        style={{ width: '100%', height: '100%' }}
      />
      
      {/* 2D View Controls */}
      <div className="absolute top-4 right-4 z-10">
        <Card className="bg-black/80 border-blue-500/30 backdrop-blur-sm">
          <div className="p-3">
            <h3 className="text-white font-semibold mb-3 text-sm">2D View Controls</h3>
            <div className="space-y-2">
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setZoom(prev => Math.min(prev * 1.2, 3))}
                  className="border-gray-600 text-gray-300 hover:border-blue-500"
                >
                  <ZoomIn size={14} />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setZoom(prev => Math.max(prev / 1.2, 0.3))}
                  className="border-gray-600 text-gray-300 hover:border-blue-500"
                >
                  <ZoomOut size={14} />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={resetView}
                  className="border-gray-600 text-gray-300 hover:border-blue-500"
                >
                  <RotateCcw size={14} />
                </Button>
              </div>
              
              <div className="flex gap-2">
                <Button
                  variant={showGrid ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setShowGrid(!showGrid)}
                  className={showGrid 
                    ? 'bg-blue-600 text-white' 
                    : 'border-gray-600 text-gray-300 hover:border-blue-500'
                  }
                >
                  <Grid3X3 size={14} />
                </Button>
                <Button
                  variant={showMeasurements ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setShowMeasurements(!showMeasurements)}
                  className={showMeasurements 
                    ? 'bg-blue-600 text-white' 
                    : 'border-gray-600 text-gray-300 hover:border-blue-500'
                  }
                >
                  <Ruler size={14} />
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </div>
      
      {/* 2D Legend */}
      <div className="absolute bottom-4 right-4 z-10">
        <Card className="bg-black/80 border-blue-500/30 backdrop-blur-sm">
          <div className="p-3">
            <h4 className="text-white font-semibold mb-2 text-sm">Legend</h4>
            <div className="space-y-1 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-gray-400 rounded-sm"></div>
                <span className="text-gray-300">Walls</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-amber-600 rounded-sm"></div>
                <span className="text-gray-300">Furniture</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-1 border border-yellow-500 rounded-sm"></div>
                <span className="text-gray-300">Doors</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-1 border border-blue-500 rounded-sm"></div>
                <span className="text-gray-300">Windows</span>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}