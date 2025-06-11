// components/TreeNode.tsx
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, ChevronRight, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { NodeDetails } from '@/types/user/roadmap/roadmap-details';

interface TreeNodeProps {
  node: NodeDetails;
  level: number;
  expandedNodes: Record<string, boolean>;
  onToggleExpand: (nodeId: string) => void;
  onNodeClick: (node: NodeDetails) => void;
}

const TreeNode: React.FC<TreeNodeProps> = ({
  node,
  level,
  expandedNodes,
  onToggleExpand,
  onNodeClick,
}) => {
  const hasChildren = node.children && node.children.length > 0;
  const isExpanded = expandedNodes[node._id] ?? false;

  return (
    <div>
      <div
        className={cn(
          'flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors',
          level > 0 && 'ml-6'
        )}
        style={{ paddingLeft: `${level * 12}px` }}
        onClick={() => onNodeClick(node)}
      >
        {hasChildren ? (
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 rounded-full"
            onClick={(e) => {
              e.stopPropagation();
              onToggleExpand(node._id);
            }}
          >
            {isExpanded ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
          </Button>
        ) : (
          <div className="w-6" />
        )}
        
        <div className="flex-1 min-w-0">
          <h3 className="font-medium truncate">{node.title}</h3>
          {node.description && (
            <p className="text-sm text-muted-foreground truncate">{node.description}</p>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          {node.estimatedDuration && (
            <Badge variant="outline" className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {node.estimatedDuration.value} {node.estimatedDuration.unit}
            </Badge>
          )}
          
          {node.difficulty && (
            <Badge variant="outline">{node.difficulty}</Badge>
          )}
          
          {node.isOptional && (
            <Badge variant="secondary">Optional</Badge>
          )}
        </div>
      </div>
      
      {isExpanded && hasChildren && (
        <div className="space-y-1">
          {node.children?.map((child) => (
            <TreeNode
              key={child._id}
              node={child}
              level={level + 1}
              expandedNodes={expandedNodes}
              onToggleExpand={onToggleExpand}
              onNodeClick={onNodeClick}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default TreeNode;