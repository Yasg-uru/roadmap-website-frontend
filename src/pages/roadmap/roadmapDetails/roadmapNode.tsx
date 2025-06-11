// components/RoadmapNode.tsx
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, ChevronRight, ChevronDown } from 'lucide-react';
import type { NodeDetails } from '@/types/user/roadmap/roadmap-details';

interface RoadmapNodeProps {
  data: {
    title: string;
    description?: string;
    nodeType?: string;
    difficulty?: string;
    isOptional?: boolean;
    estimatedDuration?: {
      value: number;
      unit: string;
    };
    isExpanded: boolean;
    onExpandToggle: () => void;
    onNodeClick: () => void;
  };
}

const RoadmapNode: React.FC<RoadmapNodeProps> = ({ data }) => {
  const hasChildren = data.nodeType === 'group';

  return (
    <div 
      className="p-3 border rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow w-64"
      onClick={data.onNodeClick}
    >
      <div className="flex items-start gap-2">
        {hasChildren && (
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 rounded-full mt-0.5"
            onClick={(e) => {
              e.stopPropagation();
              data.onExpandToggle();
            }}
          >
            {data.isExpanded ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
          </Button>
        )}
        
        <div className="flex-1">
          <h3 className="font-medium">{data.title}</h3>
          {data.description && (
            <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
              {data.description}
            </p>
          )}
          
          <div className="flex flex-wrap gap-2 mt-3">
            {data.estimatedDuration && (
              <Badge variant="outline" className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {data.estimatedDuration.value} {data.estimatedDuration.unit}
              </Badge>
            )}
            
            {data.difficulty && (
              <Badge variant="outline">{data.difficulty}</Badge>
            )}
            
            {data.isOptional && (
              <Badge variant="secondary">Optional</Badge>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoadmapNode;