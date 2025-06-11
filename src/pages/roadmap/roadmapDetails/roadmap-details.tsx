// components/RoadmapDetails.tsx
import React, { useEffect, useCallback, useState } from 'react';
import { useParams } from 'react-router-dom';
import ReactFlow, {
  Background,
  Controls,
  Panel,
  useNodesState,
  useEdgesState,
  MarkerType,
  addEdge,
  ReactFlowProvider,
  useReactFlow,
} from 'reactflow';
import type { Connection, Node, Edge } from 'reactflow';
import 'reactflow/dist/style.css';
import { motion } from 'framer-motion';

import { getRoadMapDetails } from '@/state/slices/roadmapSlice';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  GanttChart,
  BarChart2,
  List,
  LayoutGrid,
  BookOpen,
  Star,
  Layers,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Lock,
  ChevronRight,
  Clock,
  Target,
  Trophy,
  Flag,
  MapPin,
  ExternalLink,
  Eye,
} from 'lucide-react';
import { toast } from 'sonner';
import { useAppDispatch, useAppSelector } from '@/hooks/useAppDispatch';

import type { NodeDetails } from '@/types/user/roadmap/roadmap-details';
import RoadmapHeader from './roadmap-header';
import RoadmapStatsBar from './roadmap-stats-bar';
import TreeNode from './listview';
import { Badge } from '@/components/ui/badge';
import NodeDetailsDialog from './node-details-dialog';
import RoadmapNode from './roadmapNode';

const nodeTypes = {
  roadmapNode: RoadmapNode,
};

const RoadmapDetailsInner = () => {
  const dispatch = useAppDispatch();
  const { isLoading } = useAppSelector((state) => state.roadmap);
  const Roadmap = useAppSelector(state => state.roadmap.roadmap);
  const roadmap = Roadmap?.roadmap;
  const roadmapNodes = Roadmap?.roadmapNodes;
  const { roadmapId } = useParams<{ roadmapId: string }>();
  const reactFlowInstance = useReactFlow();
  const [activeTab, setActiveTab] = useState('roadmap');
  const [viewMode, setViewMode] = useState<'graph' | 'list'>('graph');
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({});
  const [selectedNode, setSelectedNode] = useState<NodeDetails | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  // Convert roadmap nodes to ReactFlow nodes and edges
  const convertNodesToFlowElements = useCallback((nodes: NodeDetails[], parentId: string | null = null, xPos = 0, yPos = 0) => {
    const flowNodes: Node[] = [];
    const flowEdges: Edge[] = [];
    let currentY = yPos;

    nodes.forEach((node, index) => {
      const nodeId = node._id;
      const isExpanded = expandedNodes[nodeId] ?? false;

      // Create flow node
      flowNodes.push({
        id: nodeId,
        type: 'roadmapNode',
        position: { x: xPos, y: currentY },
        data: {
          ...node,
          isExpanded,
          onExpandToggle: () => {
            setExpandedNodes(prev => ({
              ...prev,
              [nodeId]: !prev[nodeId]
            }));
          },
          onNodeClick: () => {
            setSelectedNode(node);
            setDialogOpen(true);
          }
        },
      });

      // Create edge from parent if exists
      if (parentId) {
        flowEdges.push({
          id: `e${parentId}-${nodeId}`,
          source: parentId,
          target: nodeId,
          markerEnd: {
            type: MarkerType.ArrowClosed,
          },
          style: {
            strokeWidth: 2,
          },
        });
      }

      // Add dependencies as edges
      if (node.dependencies && node.dependencies.length > 0) {
        node.dependencies.forEach(dep => {
          flowEdges.push({
            id: `e${dep._id}-${nodeId}`,
            source: dep._id,
            target: nodeId,
            markerEnd: {
              type: MarkerType.ArrowClosed,
            },
            style: {
              stroke: '#94a3b8',
              strokeDasharray: '5,5',
              strokeWidth: 2,
            },
            animated: true,
          });
        });
      }

      // Add prerequisites as edges
      if (node.prerequisites && node.prerequisites.length > 0) {
        node.prerequisites.forEach(prereq => {
          flowEdges.push({
            id: `e${prereq._id}-${nodeId}`,
            source: prereq._id,
            target: nodeId,
            markerEnd: {
              type: MarkerType.ArrowClosed,
            },
            style: {
              stroke: '#cbd5e1',
              strokeWidth: 2,
            },
          });
        });
      }

      // Add children recursively if expanded
      if (isExpanded && node.children && node.children.length > 0) {
        const childLevel = convertNodesToFlowElements(node.children, nodeId, xPos + 250, currentY);
        flowNodes.push(...childLevel.nodes);
        flowEdges.push(...childLevel.edges);
        currentY += Math.max(150, childLevel.height);
      } else {
        currentY += 120;
      }
    });

    return { nodes: flowNodes, edges: flowEdges, height: currentY - yPos };
  }, [expandedNodes]);

  // Initialize nodes and edges
  const [rfNodes, setRfNodes, onNodesChange] = useNodesState([]);
  const [rfEdges, setRfEdges, onEdgesChange] = useEdgesState([]);

  useEffect(() => {
    if (roadmapNodes && roadmapNodes.length > 0) {
      const { nodes, edges } = convertNodesToFlowElements(roadmapNodes);
      setRfNodes(nodes);
      setRfEdges(edges);
    }
  }, [roadmapNodes, convertNodesToFlowElements]);

  const onConnect = useCallback(
    (params: Connection) => setRfEdges((eds) => addEdge(params, eds)),
    [setRfEdges]
  );

  const onInit = useCallback(() => {
    reactFlowInstance.fitView({ padding: 0.2 });
  }, [reactFlowInstance]);

  // Fetch roadmap details
  useEffect(() => {
    if (!roadmapId) return;

    dispatch(getRoadMapDetails(roadmapId))
      .unwrap().then(() => {
        toast.success("Roadmap details fetched successfully");
      })
      .catch((error) => {
        toast.error(error);
        console.error('Failed to fetch roadmap details:', error);
      });
  }, [roadmapId, dispatch]);

  // Zoom handlers
  const zoomIn = useCallback(() => {
    reactFlowInstance.zoomIn();
  }, [reactFlowInstance]);

  const zoomOut = useCallback(() => {
    reactFlowInstance.zoomOut();
  }, [reactFlowInstance]);

  const zoomFit = useCallback(() => {
    reactFlowInstance.fitView({ padding: 0.2 });
  }, [reactFlowInstance]);

  // Toggle node expansion
  const toggleNodeExpansion = (nodeId: string) => {
    setExpandedNodes(prev => ({
      ...prev,
      [nodeId]: !prev[nodeId]
    }));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: 'linear' }}
          className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (!roadmap || !roadmapNodes) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Roadmap not found</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full w-full ">
      <RoadmapHeader roadmap={roadmap} />
      <RoadmapStatsBar roadmap={roadmap} />

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        <div className="max-w-7xl mx-auto h-full">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
            <TabsList className="rounded-none border-b bg-transparent p-0">
              <TabsTrigger value="roadmap" className="relative">
                <GanttChart className="w-4 h-4 mr-2" />
                Roadmap
              </TabsTrigger>
              <TabsTrigger value="details">
                <BookOpen className="w-4 h-4 mr-2" />
                Details
              </TabsTrigger>
              <TabsTrigger value="resources">
                <Layers className="w-4 h-4 mr-2" />
                Resources
              </TabsTrigger>
              <TabsTrigger value="reviews">
                <Star className="w-4 h-4 mr-2" />
                Reviews
              </TabsTrigger>
              <TabsTrigger value="stats">
                <BarChart2 className="w-4 h-4 mr-2" />
                Stats
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="roadmap" className="flex-1 overflow-hidden">
              <div className="h-full flex flex-col">
                <div className="p-4 border-b flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Button
                      variant={viewMode === 'graph' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setViewMode('graph')}
                    >
                      <LayoutGrid className="w-4 h-4 mr-2" />
                      Graph View
                    </Button>
                    <Button
                      variant={viewMode === 'list' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setViewMode('list')}
                    >
                      <List className="w-4 h-4 mr-2" />
                      List View
                    </Button>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="outline" size="sm" onClick={zoomIn}>
                            <ZoomIn className="w-4 h-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Zoom In</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="outline" size="sm" onClick={zoomOut}>
                            <ZoomOut className="w-4 h-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Zoom Out</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="outline" size="sm" onClick={zoomFit}>
                            <RotateCcw className="w-4 h-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Reset View</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </div>
                
                {/* <div className="flex-1 overflow-hidden"> */}
                  {viewMode === 'graph' ? (
                   <div className='h-[600px] w-full'>
                     <ReactFlow 
                     className='h-full w-full '
                      nodes={rfNodes}
                      edges={rfEdges}
                      onNodesChange={onNodesChange}
                      onEdgesChange={onEdgesChange}
                      onConnect={onConnect}
                      nodeTypes={nodeTypes}
                      onInit={onInit}
                      fitView
                      proOptions={{ hideAttribution: true }}
                    >
                      <Background />
                      <Controls />
                      <Panel position="top-right">
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={zoomIn}>
                            <ZoomIn className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="sm" onClick={zoomOut}>
                            <ZoomOut className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="sm" onClick={zoomFit}>
                            <RotateCcw className="w-4 h-4" />
                          </Button>
                        </div>
                      </Panel>
                    </ReactFlow>
                   </div>
                  ) : (
                    <ScrollArea className="h-full p-6">
                      <div className="space-y-4">
                        {roadmapNodes.map((node) => (
                          <TreeNode
                            key={node._id}
                            node={node}
                            level={0}
                            expandedNodes={expandedNodes}
                            onToggleExpand={toggleNodeExpansion}
                            onNodeClick={(node) => {
                              setSelectedNode(node);
                              setDialogOpen(true);
                            }}
                          />
                        ))}
                      </div>
                    </ScrollArea>
                  )}
                </div>
              {/* </div> */}
            </TabsContent>
            
            <TabsContent value="details" className="flex-1 overflow-auto p-6">
              <div className="max-w-3xl mx-auto">
                <Card>
                  <CardHeader>
                    <CardTitle>About This Roadmap</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{roadmap.longDescription || roadmap.description}</p>
                    
                    {roadmap.prerequisites && roadmap.prerequisites.length > 0 && (
                      <div className="mt-6">
                        <h3 className="font-semibold mb-2 flex items-center gap-2">
                          <Lock className="w-4 h-4" />
                          Prerequisites
                        </h3>
                        <div className="space-y-2">
                          {roadmap.prerequisites.map((prereq) => (
                            <div key={prereq._id} className="flex items-center gap-2">
                              <ChevronRight className="w-4 h-4 text-muted-foreground" />
                              <a href={`/roadmaps/${prereq.slug}`} className="text-blue-600 hover:underline">
                                {prereq.title}
                              </a>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
                
                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle>Roadmap Details</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-muted-foreground" />
                          <span>
                            <span className="font-medium">Duration:</span>{' '}
                            {roadmap.estimatedDuration
                              ? `${roadmap.estimatedDuration.value} ${roadmap.estimatedDuration.unit}`
                              : 'Self-paced'}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Target className="w-4 h-4 text-muted-foreground" />
                          <span>
                            <span className="font-medium">Difficulty:</span>{' '}
                            {roadmap.difficulty || 'Intermediate'}
                          </span>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Trophy className="w-4 h-4 text-muted-foreground" />
                          <span>
                            <span className="font-medium">Category:</span> {roadmap.category}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Flag className="w-4 h-4 text-muted-foreground" />
                          <span>
                            <span className="font-medium">Version:</span> {roadmap.version || '1.0'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="resources" className="flex-1 overflow-auto p-6">
              <div className="max-w-3xl mx-auto">
                <h2 className="text-2xl font-bold mb-6">All Resources</h2>
                
                <div className="space-y-6">
                  {roadmapNodes.map((node) => (
                    <div key={node._id}>
                      <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        {node.title}
                      </h3>
                      
                      {node.resources && node.resources.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {node.resources.map((resource) => (
                            <Card key={resource._id} className="hover:shadow-md transition-shadow">
                              <CardHeader className="pb-3">
                                <div className="flex justify-between items-start">
                                  <CardTitle className="text-base">{resource.title}</CardTitle>
                                  <Badge variant="outline">{resource.resourceType}</Badge>
                                </div>
                                {resource.difficulty && (
                                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                    <span>Difficulty:</span>
                                    <Badge variant="secondary" className="px-1.5 py-0.5">
                                      {resource.difficulty}
                                    </Badge>
                                  </div>
                                )}
                              </CardHeader>
                              <CardContent>
                                <p className="text-sm text-muted-foreground line-clamp-2">
                                  {resource.description || 'No description available'}
                                </p>
                              </CardContent>
                              <CardFooter className="flex justify-between items-center">
                                <Button variant="outline" size="sm" asChild>
                                  <a href={resource.url} target="_blank" rel="noopener noreferrer">
                                    <ExternalLink className="w-4 h-4 mr-2" />
                                    Visit Resource
                                  </a>
                                </Button>
                                {resource.stats?.views && (
                                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                                    <Eye className="w-3 h-3" />
                                    {resource.stats.views} views
                                  </span>
                                )}
                              </CardFooter>
                            </Card>
                          ))}
                        </div>
                      ) : (
                        <p className="text-muted-foreground text-sm">No resources for this node</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <NodeDetailsDialog 
        open={dialogOpen} 
        onOpenChange={setDialogOpen} 
        selectedNode={selectedNode} 
      />
    </div>
  );
};

const RoadmapDetails = () => {
  return (
    <ReactFlowProvider>
      <RoadmapDetailsInner />
    </ReactFlowProvider>
  );
};

export default RoadmapDetails;