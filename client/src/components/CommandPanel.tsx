import { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "./ui/card";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { ScrollArea } from "./ui/scroll-area";
import { parseCommand } from "../lib/commandParser";
import { useModeling } from "../lib/stores/useModeling";
import { useAudio } from "../lib/stores/useAudio";
import { Send, History, Lightbulb } from "lucide-react";

export function CommandPanel() {
  const [command, setCommand] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { createObject, selectedObject, updateObject } = useModeling();
  const { playSuccess, playHit } = useAudio();

  // Command suggestions
  const commandSuggestions = [
    "create cube red",
    "create sphere blue",
    "create cylinder green",
    "add cone yellow",
    "make torus purple",
    "create plane gray",
    "move object up",
    "scale object 2",
    "rotate object 90",
    "color object orange",
    "delete object",
    "clear scene"
  ];

  // Update suggestions based on input
  useEffect(() => {
    if (command.trim()) {
      const filtered = commandSuggestions.filter(suggestion =>
        suggestion.toLowerCase().includes(command.toLowerCase())
      );
      setSuggestions(filtered.slice(0, 5));
    } else {
      setSuggestions([]);
    }
  }, [command]);

  // Focus input on component mount
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const executeCommand = async () => {
    if (!command.trim()) return;

    try {
      const result = parseCommand(command.trim());
      
      if (result.success && result.action) {
        switch (result.action.type) {
          case 'create':
            const newObject = createObject({
              type: result.action.shape as any,
              color: result.action.color || '#666666',
              position: result.action.position || { x: 0, y: 1, z: 0 },
              scale: result.action.scale || { x: 1, y: 1, z: 1 },
              rotation: { x: 0, y: 0, z: 0 }
            });
            playSuccess();
            console.log('Created object:', newObject);
            break;

          case 'modify':
            if (selectedObject && result.action.property) {
              const updates: any = {};
              
              if (result.action.property === 'color' && result.action.color) {
                updates.color = result.action.color;
              } else if (result.action.property === 'scale' && result.action.scale) {
                updates.scale = result.action.scale;
              } else if (result.action.property === 'position' && result.action.position) {
                updates.position = result.action.position;
              } else if (result.action.property === 'rotation' && result.action.rotation) {
                updates.rotation = result.action.rotation;
              }

              updateObject(selectedObject.id, updates);
              playSuccess();
              console.log('Modified object:', updates);
            } else {
              throw new Error('No object selected or invalid property');
            }
            break;

          case 'select':
            // TODO: Implement object selection by name/id
            break;

          case 'delete':
            // TODO: Implement object deletion
            break;

          case 'clear':
            // TODO: Implement scene clearing
            break;

          default:
            throw new Error('Unknown action type');
        }

        // Add to history
        setHistory(prev => [command, ...prev].slice(0, 20));
        setCommand("");
        setSuggestions([]);
      } else {
        throw new Error(result.error || 'Invalid command');
      }
    } catch (error) {
      console.error('Command execution failed:', error);
      playHit(); // Error sound
      
      // Show error feedback
      const errorMessage = error instanceof Error ? error.message : 'Command failed';
      // You could show a toast or notification here
      console.log('Command error:', errorMessage);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      executeCommand();
    } else if (e.key === 'ArrowUp' && history.length > 0) {
      e.preventDefault();
      setCommand(history[0]);
    } else if (e.key === 'Escape') {
      setCommand("");
      setSuggestions([]);
    }
  };

  const useSuggestion = (suggestion: string) => {
    setCommand(suggestion);
    setSuggestions([]);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const useHistoryCommand = (cmd: string) => {
    setCommand(cmd);
    setShowHistory(false);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  return (
    <Card className="bg-black/80 border-gray-600 backdrop-blur-sm">
      <CardContent className="p-4">
        {/* Suggestions */}
        {suggestions.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-1">
            <Lightbulb className="text-yellow-500 mt-1" size={16} />
            {suggestions.map((suggestion, index) => (
              <Badge
                key={index}
                variant="secondary"
                className="cursor-pointer hover:bg-gray-600 text-xs"
                onClick={() => useSuggestion(suggestion)}
              >
                {suggestion}
              </Badge>
            ))}
          </div>
        )}

        {/* Command Input */}
        <div className="flex gap-2 mb-2">
          <Input
            ref={inputRef}
            value={command}
            onChange={(e) => setCommand(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Type a command... (e.g., 'create cube red', 'scale object 2')"
            className="flex-1 bg-gray-800 border-gray-600 text-white placeholder-gray-400"
          />
          <Button
            onClick={executeCommand}
            disabled={!command.trim()}
            size="sm"
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Send size={16} />
          </Button>
          <Button
            onClick={() => setShowHistory(!showHistory)}
            variant="outline"
            size="sm"
            className="border-gray-600 text-gray-300 hover:bg-gray-700"
          >
            <History size={16} />
          </Button>
        </div>

        {/* Command History */}
        {showHistory && history.length > 0 && (
          <Card className="bg-gray-800 border-gray-600">
            <CardContent className="p-2">
              <div className="text-white text-sm mb-2 font-semibold">Command History</div>
              <ScrollArea className="h-24">
                <div className="space-y-1">
                  {history.map((cmd, index) => (
                    <div
                      key={index}
                      className="text-gray-300 text-xs cursor-pointer hover:bg-gray-700 p-1 rounded"
                      onClick={() => useHistoryCommand(cmd)}
                    >
                      {cmd}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        )}

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-1 mt-2">
          {['create cube', 'create sphere', 'create cylinder', 'clear scene'].map((quickCmd) => (
            <Badge
              key={quickCmd}
              variant="outline"
              className="cursor-pointer hover:bg-gray-700 text-xs border-gray-600 text-gray-300"
              onClick={() => setCommand(quickCmd)}
            >
              {quickCmd}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
