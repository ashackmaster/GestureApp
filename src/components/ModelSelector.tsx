import { Button } from '@/components/ui/button';
import { Circle, Box, Triangle } from 'lucide-react';

interface ModelSelectorProps {
  modelType: 'torus' | 'sphere' | 'cube' | 'icosahedron';
  onModelChange: (type: 'torus' | 'sphere' | 'cube' | 'icosahedron') => void;
}

const ModelSelector = ({ modelType, onModelChange }: ModelSelectorProps) => {
  const models = [
    { type: 'torus' as const, icon: Circle, label: 'T' },
    { type: 'sphere' as const, icon: Circle, label: 'S' },
    { type: 'cube' as const, icon: Box, label: 'C' },
    { type: 'icosahedron' as const, icon: Triangle, label: 'I' },
  ];

  return (
    <div className="absolute bottom-4 right-4 z-20">
      <div className="flex gap-2 p-2 rounded-full bg-background/30 backdrop-blur-sm border border-border/30">
        {models.map(({ type, icon: Icon }) => (
          <Button
            key={type}
            variant="ghost"
            size="icon"
            className={`w-9 h-9 rounded-full transition-all duration-300 ${
              modelType === type
                ? 'bg-primary/20 text-primary shadow-lg shadow-primary/20'
                : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
            }`}
            onClick={() => onModelChange(type)}
          >
            <Icon className="w-4 h-4" />
          </Button>
        ))}
      </div>
    </div>
  );
};

export default ModelSelector;
