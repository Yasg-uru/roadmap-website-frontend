// components/NodeDetailsDialog.tsx
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronRight, ExternalLink } from 'lucide-react';
import type { NodeDetails } from '@/types/user/roadmap/roadmap-details';

interface NodeDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedNode: NodeDetails | null;
}

const NodeDetailsDialog: React.FC<NodeDetailsDialogProps> = ({
  open,
  onOpenChange,
  selectedNode,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-auto">
        {selectedNode && (
          <>
            <DialogHeader>
              <DialogTitle>{selectedNode.title}</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              {selectedNode.description && (
                <p className="text-muted-foreground">{selectedNode.description}</p>
              )}
              
              <div className="grid grid-cols-2 gap-4">
                {selectedNode.nodeType && (
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">Type</h4>
                    <p className="capitalize">{selectedNode.nodeType}</p>
                  </div>
                )}
                
                {selectedNode.difficulty && (
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">Difficulty</h4>
                    <Badge variant="outline">{selectedNode.difficulty}</Badge>
                  </div>
                )}
                
                {selectedNode.estimatedDuration && (
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">Duration</h4>
                    <p>
                      {selectedNode.estimatedDuration.value} {selectedNode.estimatedDuration.unit}
                    </p>
                  </div>
                )}
                
                {selectedNode.isOptional && (
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">Optional</h4>
                    <p>Yes</p>
                  </div>
                )}
              </div>
              
              {(selectedNode.dependencies || selectedNode.prerequisites) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedNode.dependencies && selectedNode.dependencies.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground mb-2">Dependencies</h4>
                      <div className="space-y-2">
                        {selectedNode.dependencies.map((dep) => (
                          <div key={dep._id} className="flex items-center gap-2">
                            <ChevronRight className="w-4 h-4 text-muted-foreground" />
                            <span>{dep.title}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {selectedNode.prerequisites && selectedNode.prerequisites.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground mb-2">Prerequisites</h4>
                      <div className="space-y-2">
                        {selectedNode.prerequisites.map((prereq) => (
                          <div key={prereq._id} className="flex items-center gap-2">
                            <ChevronRight className="w-4 h-4 text-muted-foreground" />
                            <span>{prereq.title}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
              
              {selectedNode.resources && selectedNode.resources.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-2">Resources</h4>
                  <div className="space-y-2">
                    {selectedNode.resources.map((resource) => (
                      <div key={resource._id} className="p-3 border rounded-lg hover:bg-muted/50">
                        <div className="flex justify-between items-start">
                          <div>
                            <h5 className="font-medium">{resource.title}</h5>
                            <p className="text-sm text-muted-foreground line-clamp-1">
                              {resource.description}
                            </p>
                          </div>
                          <Badge variant="outline">{resource.resourceType}</Badge>
                        </div>
                        <Button
                          variant="link"
                          size="sm"
                          className="mt-2 px-0 h-auto text-blue-600"
                          asChild
                        >
                          <a href={resource.url} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="w-4 h-4 mr-1" />
                            Visit Resource
                          </a>
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default NodeDetailsDialog;