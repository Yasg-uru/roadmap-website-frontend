import React, { useEffect, useCallback, useRef, useState } from 'react';
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
import type { Connection, Node , Edge } from 'reactflow';
import 'reactflow/dist/style.css';
import { motion } from 'framer-motion';

import { getRoadMapDetails } from '@/state/slices/roadmapSlice';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  Clock,
  Star,
  Users,
  Eye,
  CheckCircle,
  PlayCircle,
  BookOpen,
  Link as LinkIcon,
  Trophy,
  Target,
  ThumbsUp,
  ThumbsDown,
  ExternalLink,
  Share2,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Lock,
  MapPin,
  Layers,
  ChevronRight,
  ChevronDown,
  GanttChart,
  BarChart2,
  List,
  LayoutGrid,
  HelpCircle,
  Bookmark,
  Flag,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { NodeDetails } from '@/types/user/roadmap/roadmap-details';
import { useAppDispatch, useAppSelector } from '@/hooks/useAppDispatch';
import RoadmapNode from "./roadmapNode"
import { toast } from 'sonner';
const nodeTypes = {
  roadmapNode: RoadmapNode,
};

const RoadmapDetailsInner = () => {
  const dispatch = useAppDispatch();
  const { isLoading} = useAppSelector((state) => state.roadmap);
  const Roadmap = useAppSelector(state=>state.roadmap.roadmap);
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
      .unwrap().then(()=>{
        toast.success("roadmap details fetched successfully")
      })
      .catch((error) => {
        toast.error(error )
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
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <Badge variant="secondary" className="mb-2">
                {roadmap.category}
              </Badge>
              <h1 className="text-3xl font-bold tracking-tight">{roadmap.title}</h1>
              <p className="mt-2 text-blue-100 max-w-3xl">{roadmap.description}</p>
              
              <div className="mt-4 flex flex-wrap gap-2">
                {roadmap.tags?.map((tag) => (
                  <Badge key={tag} variant="outline" className="bg-white/10 text-white border-white/20">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button variant="outline" className="bg-white/10 text-white hover:bg-white/20 border-white/20">
                <Bookmark className="w-4 h-4 mr-2" /> Save
              </Button>
              <Button variant="outline" className="bg-white/10 text-white hover:bg-white/20 border-white/20">
                <Share2 className="w-4 h-4 mr-2" /> Share
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-6 py-3">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-yellow-500" />
                <span className="font-medium">
                  {roadmap.stats?.averageRating?.toFixed(1) || '4.5'}
                  <span className="text-muted-foreground text-sm ml-1">({roadmap.stats?.ratingsCount || 0} reviews)</span>
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-500" />
                <span className="font-medium">{roadmap.stats?.completions || 0} completions</span>
              </div>
              
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-purple-500" />
                <span className="font-medium">{roadmap.stats?.views || 0} views</span>
              </div>
              
              {roadmap.estimatedDuration && (
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-green-500" />
                  <span className="font-medium">
                    {roadmap.estimatedDuration.value} {roadmap.estimatedDuration.unit}
                  </span>
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              {roadmap.isCommunityContributed && roadmap.contributor && (
                <div className="flex items-center gap-2">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={roadmap.contributor.avatar} />
                    <AvatarFallback>{roadmap.contributor.username.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <span className="text-sm">Contributed by {roadmap.contributor.username}</span>
                </div>
              )}
              {roadmap.isFeatured && (
                <Badge variant="default" className="bg-yellow-100 text-yellow-800">
                  <Star className="w-3 h-3 mr-1" /> Featured
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>

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
                
                <div className="flex-1 overflow-hidden">
                  {viewMode === 'graph' ? (
                    <ReactFlow
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
              </div>
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
            
            <TabsContent value="reviews" className="flex-1 overflow-auto p-6">
              <div className="max-w-3xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold">Reviews</h2>
                  <Button>Write a Review</Button>
                </div>
                
                {roadmap.reviews && roadmap.reviews.length > 0 ? (
                  <div className="space-y-6">
                    {roadmap.reviews.map((review) => (
                      <Card key={review._id}>
                        <CardHeader>
                          <div className="flex justify-between items-start">
                            <div className="flex items-center gap-3">
                              <Avatar>
                                <AvatarImage src={review.user.avatar} />
                                <AvatarFallback>{review.user.username.charAt(0)}</AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium">{review.user.username}</p>
                                <p className="text-sm text-muted-foreground">
                                  {new Date(review.createdAt).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-1">
                              <Rating value={review.rating} readOnly />
                              {review.isVerified && (
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <CheckCircle className="w-4 h-4 text-blue-500" />
                                    </TooltipTrigger>
                                    <TooltipContent>Verified Review</TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              )}
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          {review.title && <h3 className="font-semibold mb-2">{review.title}</h3>}
                          <p className="text-muted-foreground">{review.review}</p>
                          
                          {(review.pros || review.cons) && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                              {review.pros && review.pros.length > 0 && (
                                <div className="bg-green-50 p-3 rounded-lg">
                                  <h4 className="font-medium text-green-800 flex items-center gap-2 mb-2">
                                    <ThumbsUp className="w-4 h-4" />
                                    Pros
                                  </h4>
                                  <ul className="space-y-1 text-sm text-green-700">
                                    {review.pros.map((pro, i) => (
                                      <li key={i} className="flex items-start gap-2">
                                        <CheckCircle className="w-3 h-3 mt-0.5 flex-shrink-0 text-green-600" />
                                        <span>{pro}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                              
                              {review.cons && review.cons.length > 0 && (
                                <div className="bg-red-50 p-3 rounded-lg">
                                  <h4 className="font-medium text-red-800 flex items-center gap-2 mb-2">
                                    <ThumbsDown className="w-4 h-4" />
                                    Cons
                                  </h4>
                                  <ul className="space-y-1 text-sm text-red-700">
                                    {review.cons.map((con, i) => (
                                      <li key={i} className="flex items-start gap-2">
                                        <HelpCircle className="w-3 h-3 mt-0.5 flex-shrink-0 text-red-600" />
                                        <span>{con}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card>
                    <CardContent className="py-10 text-center">
                      <Star className="w-10 h-10 mx-auto text-muted-foreground mb-4" />
                      <h3 className="text-lg font-medium mb-2">No Reviews Yet</h3>
                      <p className="text-muted-foreground max-w-md mx-auto">
                        Be the first to share your experience with this roadmap.
                      </p>
                      <Button className="mt-4">Write a Review</Button>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="stats" className="flex-1 overflow-auto p-6">
              <div className="max-w-3xl mx-auto">
                <h2 className="text-2xl font-bold mb-6">Roadmap Statistics</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Engagement</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-sm font-medium">Views</span>
                            <span className="text-sm font-medium">{roadmap.stats?.views || 0}</span>
                          </div>
                          <Progress value={(roadmap.stats?.views || 0) / 1000 * 100} className="h-2" />
                        </div>
                        
                        <div>
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-sm font-medium">Completions</span>
                            <span className="text-sm font-medium">{roadmap.stats?.completions || 0}</span>
                          </div>
                          <Progress value={(roadmap.stats?.completions || 0) / 100 * 100} className="h-2" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Ratings Distribution</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {[5, 4, 3, 2, 1].map((stars) => (
                          <div key={stars} className="flex items-center gap-3">
                            <div className="flex items-center w-8">
                              <span className="text-sm text-muted-foreground">{stars}</span>
                              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                            </div>
                            <Progress value={Math.random() * 100} className="h-2 flex-1" />
                            <span className="text-sm text-muted-foreground w-8 text-right">
                              {Math.floor(Math.random() * 100)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Node Details Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
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
    </div>
  );
};

// TreeNode component for list view
const TreeNode = ({
  node,
  level,
  expandedNodes,
  onToggleExpand,
  onNodeClick,
}: {
  node: NodeDetails;
  level: number;
  expandedNodes: Record<string, boolean>;
  onToggleExpand: (nodeId: string) => void;
  onNodeClick: (node: NodeDetails) => void;
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



const RoadmapDetails = () => {
  return (
    <ReactFlowProvider>
      <RoadmapDetailsInner />
    </ReactFlowProvider>
  );
};

export default RoadmapDetails;