"use client"

import type React from "react"
import { useEffect, useState, useRef } from "react"
import { motion } from "framer-motion"
import { useParams } from "react-router-dom"
import { useAppDispatch, useAppSelector } from "@/hooks/useAppDispatch"
import { getRoadMapDetails } from "@/state/slices/roadmapSlice"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Clock,
  Star,
  Users,
  Eye,
  CheckCircle,
  PlayCircle,
  BookOpen,
  LinkIcon,
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
} from "lucide-react"

// Types
interface ResourceResponse {
  _id: string
  title: string
  description?: string
  url: string
  resourceType: string
  contentType?: string
  difficulty?: string
  stats?: {
    views?: number
    clicks?: number
    rating?: number
  }
  thumbnail?: {
    url?: string
  }
}

interface NodeDetails {
  _id: string
  title: string
  description?: string
  depth: number
  position: number
  nodeType?: string
  isOptional?: boolean
  estimatedDuration?: {
    value: number
    unit: string
  }
  resources?: ResourceResponse[]
  dependencies?: Array<{ _id: string; title: string }>
  prerequisites?: Array<{ _id: string; title: string }>
  metadata?: {
    difficulty?: string
    importance?: string
  }
  children?: NodeDetails[]
}

interface ReviewResponse {
  _id: string
  user: {
    _id: string
    username: string
    avatar?: string
  }
  rating: number
  title?: string
  review: string
  pros?: string[]
  cons?: string[]
  isVerified: boolean
  createdAt: string
}

interface RoadmapDetails {
  _id: string
  title: string
  slug: string
  description: string
  longDescription?: string
  category: string
  difficulty?: string
  estimatedDuration?: {
    value: number
    unit: string
  }
  coverImage?: {
    url: string
  }
  isFeatured?: boolean
  isCommunityContributed?: boolean
  contributor?: {
    _id: string
    username: string
    avatar?: string
  }
  tags?: string[]
  prerequisites?: Array<{
    _id: string
    title: string
    slug: string
  }>
  stats?: {
    views: number
    completions: number
    averageRating: number
    ratingsCount: number
  }
  reviews?: ReviewResponse[]
  version?: number
  isPublished?: boolean
  publishedAt?: string
  createdAt?: string
}

interface RoadmapDetailsResponse {
  roadmap: RoadmapDetails
  nodes: NodeDetails[]
}

interface GraphNode {
  id: string
  x: number
  y: number
  node: NodeDetails
  connections: string[]
}

// Utility functions
const getDifficultyColor = (difficulty?: string) => {
  switch (difficulty?.toLowerCase()) {
    case "beginner":
      return "bg-green-500"
    case "intermediate":
      return "bg-yellow-500"
    case "advanced":
      return "bg-red-500"
    default:
      return "bg-gray-500"
  }
}

const getResourceIcon = (type: string) => {
  switch (type.toLowerCase()) {
    case "video":
      return <PlayCircle className="w-4 h-4" />
    case "article":
      return <BookOpen className="w-4 h-4" />
    case "course":
      return <Trophy className="w-4 h-4" />
    default:
      return <LinkIcon className="w-4 h-4" />
  }
}

// Graph layout algorithm
const calculateNodePositions = (nodes: NodeDetails[]): GraphNode[] => {
  const graphNodes: GraphNode[] = []
  const nodeMap = new Map<string, NodeDetails>()

  // Create node map
  nodes.forEach((node) => {
    nodeMap.set(node._id, node)
  })

  // Sort nodes by depth and position
  const sortedNodes = [...nodes].sort((a, b) => {
    if (a.depth !== b.depth) return a.depth - b.depth
    return a.position - b.position
  })

  // Calculate positions
  const depthGroups = new Map<number, NodeDetails[]>()
  sortedNodes.forEach((node) => {
    if (!depthGroups.has(node.depth)) {
      depthGroups.set(node.depth, [])
    }
    depthGroups.get(node.depth)!.push(node)
  })

  const canvasWidth = 1200
  const canvasHeight = 800
  const verticalSpacing = canvasHeight / (depthGroups.size + 1)

  depthGroups.forEach((nodesAtDepth, depth) => {
    const horizontalSpacing = canvasWidth / (nodesAtDepth.length + 1)

    nodesAtDepth.forEach((node, index) => {
      const x = horizontalSpacing * (index + 1)
      const y = verticalSpacing * (depth + 1)

      // Find connections based on dependencies
      const connections: string[] = []
      if (node.dependencies) {
        node.dependencies.forEach((dep) => {
          if (nodeMap.has(dep._id)) {
            connections.push(dep._id)
          }
        })
      }

      // Also connect to children
      if (node.children) {
        node.children.forEach((child) => {
          connections.push(child._id)
        })
      }

      graphNodes.push({
        id: node._id,
        x,
        y,
        node,
        connections,
      })
    })
  })

  return graphNodes
}

// Connection Line Component
const ConnectionLine: React.FC<{
  from: GraphNode
  to: GraphNode
  isActive: boolean
  transform: string
}> = ({ from, to, isActive, transform }) => {
  const pathData = `M ${from.x} ${from.y} Q ${(from.x + to.x) / 2} ${from.y - 50} ${to.x} ${to.y}`

  return (
    <g transform={transform}>
      <motion.path
        d={pathData}
        stroke={isActive ? "#3b82f6" : "#64748b"}
        strokeWidth={isActive ? 3 : 2}
        fill="none"
        strokeDasharray={isActive ? "0" : "5,5"}
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 1, delay: 0.5 }}
        className="transition-all duration-300"
      />
      <motion.circle
        r="4"
        fill={isActive ? "#3b82f6" : "#64748b"}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 1 }}
      >
        <animateMotion dur="3s" repeatCount="indefinite">
          <mpath href={`#path-${from.id}-${to.id}`} />
        </animateMotion>
      </motion.circle>
    </g>
  )
}

// Graph Node Component
const GraphNodeComponent: React.FC<{
  graphNode: GraphNode
  isCompleted: boolean
  isSelected: boolean
  isLocked: boolean
  onSelect: () => void
  onComplete: () => void
  transform: string
  scale: number
}> = ({ graphNode, isCompleted, isSelected, isLocked, onSelect, onComplete, transform, scale }) => {
  const { node } = graphNode

  return (
    <g transform={`${transform} translate(${graphNode.x}, ${graphNode.y})`}>
      {/* Node glow effect */}
      {isSelected && (
        <motion.circle
          r="45"
          fill="none"
          stroke="#3b82f6"
          strokeWidth="2"
          opacity="0.3"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.3 }}
        />
      )}

      {/* Main node circle */}
      <motion.circle
        r="35"
        fill={isCompleted ? "#10b981" : isLocked ? "#6b7280" : "#3b82f6"}
        stroke={isSelected ? "#1d4ed8" : "#1e293b"}
        strokeWidth="3"
        className="cursor-pointer"
        onClick={onSelect}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, delay: node.position * 0.1 }}
      />

      {/* Node icon */}
      <foreignObject x="-12" y="-12" width="24" height="24" className="pointer-events-none">
        <div className="flex items-center justify-center w-full h-full">
          {isCompleted ? (
            <CheckCircle className="w-6 h-6 text-white" />
          ) : isLocked ? (
            <Lock className="w-6 h-6 text-white" />
          ) : (
            <span className="text-white font-bold text-sm">{node.position}</span>
          )}
        </div>
      </foreignObject>

      {/* Node label */}
      <text
        x="0"
        y="55"
        textAnchor="middle"
        className="fill-slate-700 text-sm font-medium pointer-events-none"
        style={{ fontSize: `${12 / scale}px` }}
      >
        {node.title.length > 15 ? `${node.title.substring(0, 15)}...` : node.title}
      </text>

      {/* Difficulty badge */}
      {node.metadata?.difficulty && (
        <foreignObject x="-20" y="-50" width="40" height="16" className="pointer-events-none">
          <div className="flex justify-center">
            <Badge className={`text-xs px-2 py-0 ${getDifficultyColor(node.metadata.difficulty)} text-white`}>
              {node.metadata.difficulty[0].toUpperCase()}
            </Badge>
          </div>
        </foreignObject>
      )}

      {/* Optional badge */}
      {node.isOptional && (
        <foreignObject x="25" y="-25" width="20" height="20" className="pointer-events-none">
          <div className="w-5 h-5 bg-yellow-500 rounded-full flex items-center justify-center">
            <span className="text-white text-xs font-bold">?</span>
          </div>
        </foreignObject>
      )}
    </g>
  )
}

// Node Details Modal
const NodeDetailsModal: React.FC<{
  node: NodeDetails | null
  isOpen: boolean
  onClose: () => void
  isCompleted: boolean
  onComplete: () => void
}> = ({ node, isOpen, onClose, isCompleted, onComplete }) => {
  if (!node) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center ${
                isCompleted ? "bg-green-500" : "bg-blue-500"
              }`}
            >
              {isCompleted ? (
                <CheckCircle className="w-5 h-5 text-white" />
              ) : (
                <span className="text-white text-sm font-bold">{node.position}</span>
              )}
            </div>
            {node.title}
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh]">
          <div className="space-y-6">
            {/* Node info */}
            <div className="flex flex-wrap gap-2">
              {node.estimatedDuration && (
                <Badge variant="secondary">
                  <Clock className="w-3 h-3 mr-1" />
                  {node.estimatedDuration.value} {node.estimatedDuration.unit}
                </Badge>
              )}
              {node.metadata?.difficulty && (
                <Badge className={`text-white ${getDifficultyColor(node.metadata.difficulty)}`}>
                  {node.metadata.difficulty}
                </Badge>
              )}
              {node.isOptional && <Badge variant="outline">Optional</Badge>}
            </div>

            {/* Description */}
            {node.description && (
              <div>
                <h4 className="font-semibold mb-2">Description</h4>
                <p className="text-gray-600">{node.description}</p>
              </div>
            )}

            {/* Dependencies */}
            {node.dependencies && node.dependencies.length > 0 && (
              <div>
                <h4 className="font-semibold mb-2 flex items-center">
                  <Target className="w-4 h-4 mr-2" />
                  Dependencies
                </h4>
                <div className="flex flex-wrap gap-2">
                  {node.dependencies.map((dep) => (
                    <Badge key={dep._id} variant="outline">
                      {dep.title}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Resources */}
            {node.resources && node.resources.length > 0 && (
              <div>
                <h4 className="font-semibold mb-2 flex items-center">
                  <BookOpen className="w-4 h-4 mr-2" />
                  Resources
                </h4>
                <div className="space-y-3">
                  {node.resources.map((resource) => (
                    <div key={resource._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        {getResourceIcon(resource.resourceType)}
                        <div>
                          <p className="font-medium">{resource.title}</p>
                          {resource.description && <p className="text-sm text-gray-600">{resource.description}</p>}
                        </div>
                      </div>
                      <Button size="sm" variant="ghost" asChild>
                        <a href={resource.url} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex gap-3 pt-4 border-t">
              {!isCompleted && (
                <Button onClick={onComplete} className="bg-green-500 hover:bg-green-600">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Mark as Complete
                </Button>
              )}
              <Button variant="outline" onClick={onClose}>
                Close
              </Button>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}

// Review Component
const ReviewCard: React.FC<{ review: ReviewResponse }> = ({ review }) => {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="border rounded-lg p-4">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3">
          <Avatar>
            <AvatarImage src={review.user.avatar || "/placeholder.svg"} />
            <AvatarFallback>{review.user.username[0].toUpperCase()}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-semibold">{review.user.username}</p>
            <div className="flex items-center space-x-2">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${i < review.rating ? "text-yellow-400 fill-current" : "text-gray-300"}`}
                  />
                ))}
              </div>
              {review.isVerified && (
                <Badge variant="secondary" className="text-xs">
                  Verified
                </Badge>
              )}
            </div>
          </div>
        </div>
        <span className="text-sm text-gray-500">{new Date(review.createdAt).toLocaleDateString()}</span>
      </div>

      {review.title && <h4 className="font-semibold mb-2">{review.title}</h4>}
      <p className="text-gray-700 mb-3">{review.review}</p>

      {(review.pros || review.cons) && (
        <div className="grid md:grid-cols-2 gap-4">
          {review.pros && review.pros.length > 0 && (
            <div>
              <h5 className="font-medium text-green-600 mb-2 flex items-center">
                <ThumbsUp className="w-4 h-4 mr-1" />
                Pros
              </h5>
              <ul className="text-sm space-y-1">
                {review.pros.map((pro, index) => (
                  <li key={index} className="text-gray-600">
                    • {pro}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {review.cons && review.cons.length > 0 && (
            <div>
              <h5 className="font-medium text-red-600 mb-2 flex items-center">
                <ThumbsDown className="w-4 h-4 mr-1" />
                Cons
              </h5>
              <ul className="text-sm space-y-1">
                {review.cons.map((con, index) => (
                  <li key={index} className="text-gray-600">
                    • {con}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </motion.div>
  )
}

// Main Component
const RoadmapDetails: React.FC = () => {
  const dispatch = useAppDispatch()
  const { isLoading, roadmap } = useAppSelector((state) => state.roadmap)
  const { roadmapId } = useParams<{ roadmapId: string }>()

  const [completedNodes, setCompletedNodes] = useState<Set<string>>(new Set())
  const [selectedNode, setSelectedNode] = useState<NodeDetails | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [progress, setProgress] = useState(0)
  const [graphNodes, setGraphNodes] = useState<GraphNode[]>([])
  const [scale, setScale] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })

  const svgRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    if (!roadmapId) return

    dispatch(getRoadMapDetails(roadmapId))
      .unwrap()
      .then(() => {
        // Success
      })
      .catch((error) => {
        console.error("Failed to fetch roadmap details:", error)
      })
  }, [roadmapId, dispatch])

  useEffect(() => {
    if (roadmap?.nodes) {
      const nodes = calculateNodePositions(roadmap.nodes)
      setGraphNodes(nodes)

      const totalNodes = roadmap.nodes.length
      const completed = completedNodes.size
      setProgress((completed / totalNodes) * 100)
    }
  }, [roadmap?.nodes, completedNodes])

  const handleNodeSelect = (node: NodeDetails) => {
    setSelectedNode(node)
    setIsModalOpen(true)
  }

  const handleNodeComplete = (nodeId: string) => {
    setCompletedNodes((prev) => new Set([...prev, nodeId]))
  }

  const isNodeLocked = (node: NodeDetails) => {
    if (!node.dependencies || node.dependencies.length === 0) return false
    return !node.dependencies.every((dep) => completedNodes.has(dep._id))
  }

  const handleZoomIn = () => {
    setScale((prev) => Math.min(prev * 1.2, 3))
  }

  const handleZoomOut = () => {
    setScale((prev) => Math.max(prev / 1.2, 0.3))
  }

  const handleReset = () => {
    setScale(1)
    setPan({ x: 0, y: 0 })
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true)
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y })
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    })
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
          className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full"
        />
      </div>
    )
  }

  if (!roadmap) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Roadmap not found</p>
      </div>
    )
  }

  const transform = `translate(${pan.x}, ${pan.y}) scale(${scale})`

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden bg-gradient-to-r from-blue-600 to-indigo-700 text-white"
      >
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative max-w-7xl mx-auto px-4 py-16">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            <div>
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
                <div className="flex items-center space-x-2 mb-4">
                  <Badge className="bg-white/20 text-white">{roadmap.roadmap.category}</Badge>
                  {roadmap.roadmap.isFeatured && (
                    <Badge className="bg-yellow-500 text-white">
                      <Star className="w-3 h-3 mr-1" />
                      Featured
                    </Badge>
                  )}
                </div>

                <h1 className="text-4xl lg:text-5xl font-bold mb-4">{roadmap.roadmap.title}</h1>
                <p className="text-xl text-blue-100 mb-6">{roadmap.roadmap.description}</p>

                <div className="flex flex-wrap items-center gap-4 mb-6">
                  {roadmap.roadmap.estimatedDuration && (
                    <div className="flex items-center space-x-2">
                      <Clock className="w-5 h-5" />
                      <span>
                        {roadmap.roadmap.estimatedDuration.value} {roadmap.roadmap.estimatedDuration.unit}
                      </span>
                    </div>
                  )}

                  {roadmap.roadmap.stats && (
                    <>
                      <div className="flex items-center space-x-2">
                        <Eye className="w-5 h-5" />
                        <span>{roadmap.roadmap.stats.views.toLocaleString()} views</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Users className="w-5 h-5" />
                        <span>{roadmap.roadmap.stats.completions.toLocaleString()} completed</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Star className="w-5 h-5 fill-current" />
                        <span>
                          {roadmap.roadmap.stats.averageRating.toFixed(1)} ({roadmap.roadmap.stats.ratingsCount}{" "}
                          reviews)
                        </span>
                      </div>
                    </>
                  )}
                </div>

                <div className="flex space-x-4">
                  <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
                    <PlayCircle className="w-5 h-5 mr-2" />
                    Start Learning
                  </Button>
                  <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                    <Share2 className="w-5 h-5 mr-2" />
                    Share
                  </Button>
                </div>
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="relative"
            >
              {roadmap.roadmap.coverImage?.url && (
                <img
                  src={roadmap.roadmap.coverImage.url || "/placeholder.svg"}
                  alt={roadmap.roadmap.title}
                  className="rounded-lg shadow-2xl"
                />
              )}
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Progress Bar */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="bg-white border-b"
      >
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Progress</span>
            <span className="text-sm text-gray-600">
              {completedNodes.size} of {roadmap.nodes.length} completed
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Tabs defaultValue="roadmap" className="space-y-8">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="roadmap">Interactive Roadmap</TabsTrigger>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
          </TabsList>

          <TabsContent value="roadmap" className="space-y-6">
            {/* Graph Controls */}
            <div className="flex items-center justify-between bg-white p-4 rounded-lg shadow-sm">
              <div className="flex items-center space-x-2">
                <MapPin className="w-5 h-5 text-blue-500" />
                <span className="font-medium">Interactive Learning Path</span>
              </div>

              <div className="flex items-center space-x-2">
                <Button size="sm" variant="outline" onClick={handleZoomOut}>
                  <ZoomOut className="w-4 h-4" />
                </Button>
                <Button size="sm" variant="outline" onClick={handleZoomIn}>
                  <ZoomIn className="w-4 h-4" />
                </Button>
                <Button size="sm" variant="outline" onClick={handleReset}>
                  <RotateCcw className="w-4 h-4" />
                </Button>
                <span className="text-sm text-gray-500">{Math.round(scale * 100)}%</span>
              </div>
            </div>

            {/* Graph Visualization */}
            <Card className="overflow-hidden">
              <CardContent className="p-0">
                <div className="relative w-full h-[600px] bg-gradient-to-br from-slate-50 to-blue-50">
                  <svg
                    ref={svgRef}
                    width="100%"
                    height="100%"
                    className="cursor-move"
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                  >
                    <defs>
                      <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                        <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#e2e8f0" strokeWidth="1" opacity="0.5" />
                      </pattern>
                    </defs>

                    <rect width="100%" height="100%" fill="url(#grid)" />

                    <g transform={transform}>
                      {/* Render connections */}
                      {graphNodes.map((node) =>
                        node.connections.map((connectionId) => {
                          const targetNode = graphNodes.find((n) => n.id === connectionId)
                          if (!targetNode) return null

                          return (
                            <ConnectionLine
                              key={`${node.id}-${connectionId}`}
                              from={node}
                              to={targetNode}
                              isActive={completedNodes.has(node.id) && completedNodes.has(connectionId)}
                              transform=""
                            />
                          )
                        }),
                      )}

                      {/* Render nodes */}
                      {graphNodes.map((graphNode) => (
                        <GraphNodeComponent
                          key={graphNode.id}
                          graphNode={graphNode}
                          isCompleted={completedNodes.has(graphNode.id)}
                          isSelected={selectedNode?._id === graphNode.id}
                          isLocked={isNodeLocked(graphNode.node)}
                          onSelect={() => handleNodeSelect(graphNode.node)}
                          onComplete={() => handleNodeComplete(graphNode.id)}
                          transform=""
                          scale={scale}
                        />
                      ))}
                    </g>
                  </svg>
                </div>
              </CardContent>
            </Card>

            {/* Legend */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Layers className="w-5 h-5" />
                  Legend
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs">1</span>
                    </div>
                    <span className="text-sm">Available</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-sm">Completed</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 bg-gray-500 rounded-full flex items-center justify-center">
                      <Lock className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-sm">Locked</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs">?</span>
                    </div>
                    <span className="text-sm">Optional</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="overview" className="space-y-8">
            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>About This Roadmap</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 leading-relaxed">
                      {roadmap.roadmap.longDescription || roadmap.roadmap.description}
                    </p>
                  </CardContent>
                </Card>

                {roadmap.roadmap.tags && roadmap.roadmap.tags.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Tags</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {roadmap.roadmap.tags.map((tag) => (
                          <Badge key={tag} variant="secondary">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>

              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Quick Stats</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Difficulty</span>
                      <Badge className={getDifficultyColor(roadmap.roadmap.difficulty)}>
                        {roadmap.roadmap.difficulty}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Total Steps</span>
                      <span className="font-semibold">{roadmap.nodes.length}</span>
                    </div>
                    {roadmap.roadmap.version && (
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Version</span>
                        <span className="font-semibold">v{roadmap.roadmap.version}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {roadmap.roadmap.contributor && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Contributor</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center space-x-3">
                        <Avatar>
                          <AvatarImage src={roadmap.roadmap.contributor.avatar || "/placeholder.svg"} />
                          <AvatarFallback>{roadmap.roadmap.contributor.username[0].toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold">{roadmap.roadmap.contributor.username}</p>
                          {roadmap.roadmap.isCommunityContributed && (
                            <Badge variant="outline" className="text-xs">
                              Community Contributor
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="reviews" className="space-y-6">
            {roadmap.roadmap.reviews && roadmap.roadmap.reviews.length > 0 ? (
              <div className="space-y-6">
                {roadmap.roadmap.reviews.map((review) => (
                  <ReviewCard key={review._id} review={review} />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <p className="text-gray-500">No reviews yet. Be the first to review this roadmap!</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Node Details Modal */}
      <NodeDetailsModal
        node={selectedNode}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        isCompleted={selectedNode ? completedNodes.has(selectedNode._id) : false}
        onComplete={() => {
          if (selectedNode) {
            handleNodeComplete(selectedNode._id)
            setIsModalOpen(false)
          }
        }}
      />
    </div>
  )
}

export default RoadmapDetails
