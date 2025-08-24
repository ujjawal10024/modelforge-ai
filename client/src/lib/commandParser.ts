export interface CommandAction {
  type: 'create' | 'modify' | 'select' | 'delete' | 'clear';
  shape?: string;
  color?: string;
  position?: { x: number; y: number; z: number };
  scale?: { x: number; y: number; z: number };
  rotation?: { x: number; y: number; z: number };
  property?: string;
  value?: any;
  target?: string;
}

export interface CommandResult {
  success: boolean;
  action?: CommandAction;
  error?: string;
}

// Color name mappings
const colorMap: Record<string, string> = {
  red: '#ff6b6b',
  blue: '#4ecdc4',
  green: '#51cf66',
  yellow: '#ffd93d',
  orange: '#ff8c42',
  purple: '#9c88ff',
  pink: '#ff8cc8',
  cyan: '#22d3ee',
  gray: '#666666',
  grey: '#666666',
  white: '#ffffff',
  black: '#000000',
  brown: '#8b4513',
  lime: '#32ff32',
  magenta: '#ff00ff',
  navy: '#000080',
  silver: '#c0c0c0',
  gold: '#ffd700'
};

// Shape aliases
const shapeAliases: Record<string, string> = {
  box: 'cube',
  circle: 'sphere',
  ball: 'sphere',
  tube: 'cylinder',
  pyramid: 'cone',
  ring: 'torus',
  donut: 'torus',
  rectangle: 'plane',
  square: 'plane'
};

export function parseCommand(command: string): CommandResult {
  const tokens = command.toLowerCase().trim().split(/\s+/);
  
  if (tokens.length === 0) {
    return { success: false, error: 'Empty command' };
  }

  const verb = tokens[0];
  
  try {
    switch (verb) {
      case 'create':
      case 'add':
      case 'make':
        return parseCreateCommand(tokens.slice(1));
      
      case 'move':
      case 'translate':
        return parseMoveCommand(tokens.slice(1));
      
      case 'rotate':
      case 'turn':
        return parseRotateCommand(tokens.slice(1));
      
      case 'scale':
      case 'resize':
      case 'size':
        return parseScaleCommand(tokens.slice(1));
      
      case 'color':
      case 'paint':
        return parseColorCommand(tokens.slice(1));
      
      case 'select':
      case 'choose':
        return parseSelectCommand(tokens.slice(1));
      
      case 'delete':
      case 'remove':
        return parseDeleteCommand(tokens.slice(1));
      
      case 'clear':
      case 'reset':
        return { 
          success: true, 
          action: { type: 'clear' } 
        };
      
      default:
        // Try to infer from context
        if (tokens.includes('cube') || tokens.includes('sphere') || tokens.includes('cylinder')) {
          return parseCreateCommand(tokens);
        }
        
        return { 
          success: false, 
          error: `Unknown command: ${verb}. Try 'create', 'move', 'rotate', 'scale', 'color', or 'delete'` 
        };
    }
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Command parsing failed' 
    };
  }
}

function parseCreateCommand(tokens: string[]): CommandResult {
  if (tokens.length === 0) {
    return { success: false, error: 'Missing shape type. Try: create cube, create sphere, etc.' };
  }

  let shape = tokens[0];
  
  // Check for shape aliases
  if (shapeAliases[shape]) {
    shape = shapeAliases[shape];
  }

  // Validate shape
  const validShapes = ['cube', 'sphere', 'cylinder', 'cone', 'torus', 'plane'];
  if (!validShapes.includes(shape)) {
    return { 
      success: false, 
      error: `Unknown shape: ${shape}. Valid shapes: ${validShapes.join(', ')}` 
    };
  }

  // Look for color
  let color = '#666666'; // default color
  const colorToken = tokens.find(token => colorMap[token]);
  if (colorToken) {
    color = colorMap[colorToken];
  }

  // Look for position
  let position = { x: 0, y: 1, z: 0 }; // default position
  const atIndex = tokens.indexOf('at');
  if (atIndex !== -1 && atIndex < tokens.length - 2) {
    const x = parseFloat(tokens[atIndex + 1]);
    const y = parseFloat(tokens[atIndex + 2]);
    const z = parseFloat(tokens[atIndex + 3]) || 0;
    
    if (!isNaN(x) && !isNaN(y)) {
      position = { x, y, z };
    }
  }

  // Look for scale
  let scale = { x: 1, y: 1, z: 1 };
  const sizeIndex = tokens.findIndex(token => token === 'size' || token === 'scale');
  if (sizeIndex !== -1 && sizeIndex < tokens.length - 1) {
    const scaleValue = parseFloat(tokens[sizeIndex + 1]);
    if (!isNaN(scaleValue) && scaleValue > 0) {
      scale = { x: scaleValue, y: scaleValue, z: scaleValue };
    }
  }

  return {
    success: true,
    action: {
      type: 'create',
      shape,
      color,
      position,
      scale
    }
  };
}

function parseMoveCommand(tokens: string[]): CommandResult {
  if (tokens.length === 0) {
    return { success: false, error: 'Missing movement direction or coordinates' };
  }

  const target = tokens.includes('object') || tokens.includes('selected') ? 'selected' : undefined;
  
  // Handle directional movement
  if (tokens.includes('up')) {
    return {
      success: true,
      action: {
        type: 'modify',
        property: 'position',
        position: { x: 0, y: 1, z: 0 }, // relative movement
        target
      }
    };
  }
  
  if (tokens.includes('down')) {
    return {
      success: true,
      action: {
        type: 'modify',
        property: 'position',
        position: { x: 0, y: -1, z: 0 },
        target
      }
    };
  }

  // Handle coordinate-based movement
  const toIndex = tokens.indexOf('to');
  if (toIndex !== -1 && toIndex < tokens.length - 2) {
    const x = parseFloat(tokens[toIndex + 1]);
    const y = parseFloat(tokens[toIndex + 2]);
    const z = parseFloat(tokens[toIndex + 3]) || 0;
    
    if (!isNaN(x) && !isNaN(y)) {
      return {
        success: true,
        action: {
          type: 'modify',
          property: 'position',
          position: { x, y, z },
          target
        }
      };
    }
  }

  return { success: false, error: 'Invalid move command. Try: move up, move down, move to x y z' };
}

function parseRotateCommand(tokens: string[]): CommandResult {
  const target = tokens.includes('object') || tokens.includes('selected') ? 'selected' : undefined;
  
  // Look for angle
  const angleToken = tokens.find(token => !isNaN(parseFloat(token)));
  const angle = angleToken ? parseFloat(angleToken) * (Math.PI / 180) : Math.PI / 4; // Default 45 degrees

  return {
    success: true,
    action: {
      type: 'modify',
      property: 'rotation',
      rotation: { x: 0, y: angle, z: 0 }, // Default Y-axis rotation
      target
    }
  };
}

function parseScaleCommand(tokens: string[]): CommandResult {
  if (tokens.length === 0) {
    return { success: false, error: 'Missing scale factor' };
  }

  const target = tokens.includes('object') || tokens.includes('selected') ? 'selected' : undefined;
  
  const scaleToken = tokens.find(token => !isNaN(parseFloat(token)));
  if (!scaleToken) {
    return { success: false, error: 'Invalid scale value. Use a number like: scale 2' };
  }

  const scaleValue = parseFloat(scaleToken);
  if (scaleValue <= 0) {
    return { success: false, error: 'Scale value must be positive' };
  }

  return {
    success: true,
    action: {
      type: 'modify',
      property: 'scale',
      scale: { x: scaleValue, y: scaleValue, z: scaleValue },
      target
    }
  };
}

function parseColorCommand(tokens: string[]): CommandResult {
  if (tokens.length === 0) {
    return { success: false, error: 'Missing color name' };
  }

  const target = tokens.includes('object') || tokens.includes('selected') ? 'selected' : undefined;
  
  const colorToken = tokens.find(token => colorMap[token]);
  if (!colorToken) {
    const availableColors = Object.keys(colorMap).join(', ');
    return { 
      success: false, 
      error: `Unknown color. Available colors: ${availableColors}` 
    };
  }

  return {
    success: true,
    action: {
      type: 'modify',
      property: 'color',
      color: colorMap[colorToken],
      target
    }
  };
}

function parseSelectCommand(tokens: string[]): CommandResult {
  // This would need more complex implementation for real object selection
  return {
    success: true,
    action: {
      type: 'select',
      target: tokens.join(' ')
    }
  };
}

function parseDeleteCommand(tokens: string[]): CommandResult {
  const target = tokens.includes('object') || tokens.includes('selected') || tokens.length === 0 ? 'selected' : tokens.join(' ');
  
  return {
    success: true,
    action: {
      type: 'delete',
      target
    }
  };
}
