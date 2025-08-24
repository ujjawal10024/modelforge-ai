import { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { ScrollArea } from "./ui/scroll-area";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Send, Bot, User, Lightbulb } from "lucide-react";
import { generateAIResponse } from "../lib/aiAssistant";
import { parseCommand } from "../lib/commandParser";
import { useModeling } from "../lib/stores/useModeling";
import { useAudio } from "../lib/stores/useAudio";

interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
  suggestions?: string[];
}

interface AIAssistantProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AIAssistant({ isOpen, onClose }: AIAssistantProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { createObject, objects, selectedObject, updateObject } = useModeling();
  const { playSuccess } = useAudio();

  // Initial welcome message
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const welcomeMessage: Message = {
        id: '1',
        type: 'ai',
        content: "Hi! I'm your 3D modeling assistant. I can help you create and modify 3D objects using natural language commands. Try saying something like 'Create a red cube' or 'Make the selected object bigger'.",
        timestamp: new Date(),
        suggestions: [
          "Create a red cube",
          "Add a blue sphere",
          "Make it bigger",
          "Change color to green",
          "Create a house",
          "Show me what you can do"
        ]
      };
      setMessages([welcomeMessage]);
    }
  }, [isOpen, messages.length]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: input.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = input.trim();
    setInput("");
    setIsTyping(true);

    try {
      // Generate AI response
      const aiResponse = await generateAIResponse(currentInput, {
        objects,
        selectedObject,
        sceneInfo: {
          objectCount: objects.length,
          selectedObjectInfo: selectedObject ? {
            type: selectedObject.type,
            color: selectedObject.color,
            position: selectedObject.position
          } : null
        }
      });

      // Try to execute any commands suggested by the AI
      if (aiResponse.command) {
        try {
          const commandResult = parseCommand(aiResponse.command);
          
          if (commandResult.success && commandResult.action) {
            switch (commandResult.action.type) {
              case 'create':
                const newObj = createObject({
                  type: commandResult.action.shape,
                  color: commandResult.action.color || '#666666',
                  position: commandResult.action.position || { x: 0, y: 1, z: 0 },
                  scale: commandResult.action.scale || { x: 1, y: 1, z: 1 },
                  rotation: { x: 0, y: 0, z: 0 }
                });
                playSuccess();
                break;

              case 'modify':
                if (selectedObject && commandResult.action.property) {
                  const updates: any = {};
                  
                  if (commandResult.action.property === 'color' && commandResult.action.color) {
                    updates.color = commandResult.action.color;
                  } else if (commandResult.action.property === 'scale' && commandResult.action.scale) {
                    updates.scale = commandResult.action.scale;
                  }

                  updateObject(selectedObject.id, updates);
                  playSuccess();
                }
                break;
            }
          }
        } catch (error) {
          console.log('AI command execution failed:', error);
        }
      }

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: aiResponse.message,
        timestamp: new Date(),
        suggestions: aiResponse.suggestions
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: "Sorry, I encountered an error processing your request. Please try again.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const useSuggestion = (suggestion: string) => {
    setInput(suggestion);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] bg-gray-900 border-gray-700 text-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bot className="text-blue-500" size={24} />
            AI 3D Modeling Assistant
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col h-[500px]">
          {/* Messages */}
          <ScrollArea className="flex-1 mb-4" ref={scrollRef}>
            <div className="space-y-4 p-2">
              {messages.map((message) => (
                <div key={message.id} className="flex gap-3">
                  <div className="flex-shrink-0">
                    {message.type === 'user' ? (
                      <User className="text-green-500 mt-1" size={20} />
                    ) : (
                      <Bot className="text-blue-500 mt-1" size={20} />
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <Card className={`p-3 ${
                      message.type === 'user' 
                        ? 'bg-green-900/50 border-green-700' 
                        : 'bg-blue-900/50 border-blue-700'
                    }`}>
                      <p className="text-sm leading-relaxed">{message.content}</p>
                      
                      {message.suggestions && (
                        <div className="mt-3 space-y-2">
                          <div className="flex items-center gap-1 text-xs text-gray-400">
                            <Lightbulb size={14} />
                            Suggestions:
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {message.suggestions.map((suggestion, index) => (
                              <Badge
                                key={index}
                                variant="outline"
                                className="cursor-pointer hover:bg-gray-700 text-xs border-gray-600"
                                onClick={() => useSuggestion(suggestion)}
                              >
                                {suggestion}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </Card>
                    
                    <div className="text-xs text-gray-400 mt-1">
                      {message.timestamp.toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              ))}

              {/* Typing indicator */}
              {isTyping && (
                <div className="flex gap-3">
                  <Bot className="text-blue-500 mt-1" size={20} />
                  <Card className="p-3 bg-blue-900/50 border-blue-700">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </Card>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Input */}
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Ask me to create or modify 3D objects..."
              className="flex-1 bg-gray-800 border-gray-600 text-white placeholder-gray-400"
              disabled={isTyping}
            />
            <Button
              onClick={sendMessage}
              disabled={!input.trim() || isTyping}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Send size={16} />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
