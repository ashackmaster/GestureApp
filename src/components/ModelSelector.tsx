import { Button } from '@/components/ui/button';
import { Circle, Box, Triangle, Car, Armchair } from 'lucide-react';

type ModelType = 'torus' | 'sphere' | 'cube' | 'icosahedron' | 'car' | 'chair';

interface ModelSelectorProps {
  modelType: ModelType;
  onModelChange: (type: ModelType) => void;
}

const ModelSelector = ({ modelType, onModelChange }: ModelSelectorProps) => {
  const models: { type: ModelType; icon: typeof Circle; label: string }[] = [
    { type: 'torus', icon: Circle, label: 'Torus' },
    { type: 'sphere', icon: Circle, label: 'Sphere' },
    { type: 'cube', icon: Box, label: 'Cube' },
    { type: 'icosahedron', icon: Triangle, label: 'Icosahedron' },
    { type: 'car', icon: Car, label: 'Car' },
    { type: 'chair', icon: Armchair, label: 'Chair' },
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
