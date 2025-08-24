export interface AIResponse {
  message: string;
  command?: string;
  suggestions?: string[];
}

export interface SceneContext {
  objects: any[];
  selectedObject: any;
  sceneInfo: {
    objectCount: number;
    selectedObjectInfo: any;
  };
}

const responses = {
  greetings: [
    "Hi! I'm here to help you create amazing 3D models. What would you like to build?",
    "Hello! Ready to create some 3D magic? Just tell me what you'd like to make!",
    "Hey there! I can help you create and modify 3D objects. What's your vision?"
  ],
  
  help: [
    "I can help you create 3D objects, modify them, and manage your scene. Try commands like 'create a red cube' or 'make it bigger'.",
    "Here's what I can do: create shapes (cube, sphere, cylinder, etc.), change colors, resize objects, move things around, and more!",
    "I understand natural language commands for 3D modeling. You can ask me to create objects, change their properties, or help with scene management."
  ],

  createSuccess: [
    "Perfect! I've created that for you. You can click on it to select and modify it.",
    "Done! Your new object is ready. Try selecting it to see more options.",
    "Great choice! The object has been added to your scene."
  ],

  modifySuccess: [
    "Nice! I've updated the selected object for you.",
    "Changes applied! Your object should look different now.",
    "Perfect! The modifications have been made to your object."
  ],

  errors: [
    "I had trouble with that command. Could you try rephrasing it?",
    "Hmm, I didn't quite understand. Can you be more specific?",
    "Sorry, that didn't work. Try commands like 'create cube' or 'make it red'."
  ],

  noSelection: [
    "You'll need to select an object first before I can modify it. Click on any object in the scene!",
    "No object is currently selected. Please click on an object to select it, then try again.",
    "I need an object to be selected to make changes. Click on something in your scene first!"
  ]
};

const createCommands = [
  'create cube red',
  'add sphere blue', 
  'make cylinder green',
  'create cone yellow',
  'add torus purple',
  'make plane gray'
];

const modifyCommands = [
  'make it bigger',
  'scale it 2',
  'color it red',
  'move it up',
  'rotate it 90',
  'make it smaller'
];

const sceneCommands = [
  'show me everything',
  'clear the scene',
  'list all objects',
  'select the cube'
];

function getRandomItem<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function detectIntent(message: string): string {
  const lower = message.toLowerCase();
  
  if (lower.includes('hello') || lower.includes('hi') || lower.includes('hey')) {
    return 'greeting';
  }
  
  if (lower.includes('help') || lower.includes('what can you do') || lower.includes('how')) {
    return 'help';
  }
  
  if (lower.includes('create') || lower.includes('add') || lower.includes('make')) {
    return 'create';
  }
  
  if (lower.includes('bigger') || lower.includes('smaller') || lower.includes('scale') || 
      lower.includes('resize') || lower.includes('color') || lower.includes('move') || 
      lower.includes('rotate')) {
    return 'modify';
  }
  
  if (lower.includes('clear') || lower.includes('delete') || lower.includes('remove')) {
    return 'scene';
  }
  
  return 'general';
}

function generateCreateResponse(message: string): AIResponse {
  // Extract shape and color from message
  const shapes = ['cube', 'sphere', 'cylinder', 'cone', 'torus', 'plane'];
  const colors = ['red', 'blue', 'green', 'yellow', 'orange', 'purple', 'pink', 'cyan'];
  
  let detectedShape = shapes.find(shape => message.toLowerCase().includes(shape)) || 'cube';
  let detectedColor = colors.find(color => message.toLowerCase().includes(color)) || 'gray';
  
  // Handle house/building requests
  if (message.toLowerCase().includes('house') || message.toLowerCase().includes('building')) {
    return {
      message: "I'll create a simple house structure for you using basic shapes. Let me start with the main building block!",
      command: `create cube brown`,
      suggestions: [
        'add cylinder red', // chimney
        'create cone red',   // roof
        'add plane green',   // ground
        'make it bigger'
      ]
    };
  }

  // Handle complex objects
  if (message.toLowerCase().includes('car') || message.toLowerCase().includes('vehicle')) {
    return {
      message: "Let me create a simple car shape using basic geometry. I'll start with the main body!",
      command: `create cube blue`,
      suggestions: [
        'add sphere black', // wheels
        'create cylinder gray', // axle
        'make it bigger'
      ]
    };
  }

  return {
    message: getRandomItem(responses.createSuccess),
    command: `create ${detectedShape} ${detectedColor}`,
    suggestions: createCommands
  };
}

function generateModifyResponse(message: string, context: SceneContext): AIResponse {
  if (!context.selectedObject) {
    return {
      message: getRandomItem(responses.noSelection),
      suggestions: ['create cube red', 'add sphere blue', 'select an object first']
    };
  }

  const lower = message.toLowerCase();
  let command = '';
  
  if (lower.includes('bigger') || lower.includes('larger')) {
    command = 'scale object 1.5';
  } else if (lower.includes('smaller') || lower.includes('tiny')) {
    command = 'scale object 0.7';
  } else if (lower.includes('color') || lower.includes('paint')) {
    const colors = ['red', 'blue', 'green', 'yellow', 'orange', 'purple'];
    const detectedColor = colors.find(color => lower.includes(color)) || 'blue';
    command = `color object ${detectedColor}`;
  } else if (lower.includes('move') || lower.includes('up') || lower.includes('down')) {
    command = 'move object up';
  } else if (lower.includes('rotate') || lower.includes('turn')) {
    command = 'rotate object 45';
  } else {
    // Default modification
    command = 'scale object 1.2';
  }

  return {
    message: getRandomItem(responses.modifySuccess),
    command,
    suggestions: modifyCommands
  };
}

export async function generateAIResponse(message: string, context: SceneContext): Promise<AIResponse> {
  // Simulate AI processing delay
  await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));
  
  const intent = detectIntent(message);
  
  switch (intent) {
    case 'greeting':
      return {
        message: getRandomItem(responses.greetings),
        suggestions: createCommands.slice(0, 3)
      };
      
    case 'help':
      return {
        message: getRandomItem(responses.help),
        suggestions: [
          'create cube red',
          'make it bigger', 
          'change color to blue',
          'show me examples'
        ]
      };
      
    case 'create':
      return generateCreateResponse(message);
      
    case 'modify':
      return generateModifyResponse(message, context);
      
    case 'scene':
      if (message.toLowerCase().includes('clear')) {
        return {
          message: "I can help you clear the scene, but you'll need to use the clear button or command panel for now. Scene management features are coming soon!",
          suggestions: [
            'create something new',
            'add a cube',
            'help me build something'
          ]
        };
      }
      
      return {
        message: `You currently have ${context.sceneInfo.objectCount} objects in your scene. ${
          context.selectedObject 
            ? `The selected object is a ${context.selectedObject.type}.` 
            : 'No object is currently selected.'
        }`,
        suggestions: sceneCommands
      };
      
    default:
      // Try to be helpful with general queries
      if (message.toLowerCase().includes('what') || message.toLowerCase().includes('how')) {
        return {
          message: "I can create 3D shapes, modify objects, and help you build scenes! Try asking me to create something specific like 'create a red cube' or modify existing objects with commands like 'make it bigger'.",
          suggestions: createCommands.slice(0, 4)
        };
      }
      
      return {
        message: getRandomItem(responses.errors),
        suggestions: [
          'create cube',
          'add sphere blue',
          'help me',
          'what can you do?'
        ]
      };
  }
}
