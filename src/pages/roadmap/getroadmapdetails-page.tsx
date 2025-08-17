
import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"

import {
  Star,
  Clock,
  Users,
  Eye,
  Trophy,
  BookOpen,
  Play,
  FileText,
  ExternalLink,
  ChevronRight,
  ChevronDown,
  Calendar,
  UserIcon,
  Tag,
  AlertCircle,
  Target,
  TrendingUp,
} from "lucide-react"

import { useParams } from "react-router-dom"
import { useAppDispatch, useAppSelector } from "@/hooks/useAppDispatch"
import { getRoadMapDetails } from "@/state/slices/roadmapSlice"
import { fetchUserProgress, startRoadmap } from "@/state/slices/userProgressSlice"
import { toast } from "sonner"
import type { ImportanceLevel, NodeDifficulty, Review, RoadmapDetails, RoadmapDifficulty, RoadmapNode, RoadmapStats } from "@/types/user/roadmap/roadmap-details"
import type { INodeProgressResponse, IUserProgressStatsResponse, ProgressStatus } from "@/types/user/progress/UserProgress"
import { ProgressIndicator } from "@radix-ui/react-progress"
import { ProgressSelector } from "./progress-selector"


// Helper functions
const getDifficultyColor = (difficulty?: RoadmapDifficulty | NodeDifficulty) => {
  switch (difficulty) {
    case "beginner":
      return "bg-green-500/20 text-green-400 border-green-500/30"
    case "intermediate":
      return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
    case "advanced":
      return "bg-orange-500/20 text-orange-400 border-orange-500/30"
    case "expert":
      return "bg-red-500/20 text-red-400 border-red-500/30"
    default:
      return "bg-gray-500/20 text-gray-400 border-gray-500/30"
  }
}

const getImportanceColor = (importance?: ImportanceLevel) => {
  switch (importance) {
    case "critical":
      return "text-red-400"
    case "high":
      return "text-orange-400"
    case "medium":
      return "text-yellow-400"
    case "low":
      return "text-green-400"
    default:
      return "text-gray-400"
  }
}

const getResourceIcon = (type: string) => {
  switch (type) {
    case "video":
      return <Play className="h-4 w-4" />
    case "course":
      return <BookOpen className="h-4 w-4" />
    case "article":
      return <FileText className="h-4 w-4" />
    case "documentation":
      return <FileText className="h-4 w-4" />
    default:
      return <ExternalLink className="h-4 w-4" />
  }
}

// Components
const RoadmapHeader = ({ roadmap }: { roadmap: RoadmapDetails }) => (
  <div className="relative">
    <div className="h-64 bg-gradient-to-r from-blue-900 to-purple-900 rounded-lg overflow-hidden">
      {roadmap.coverImage && (
        <img
          src={roadmap.coverImage.url || "/placeholder.svg"}
          alt={roadmap.title}
          className="w-full h-full object-cover opacity-30"
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
    </div>

    <div className="absolute bottom-6 left-6 right-6">
      <div className="flex items-center gap-2 mb-3">
        <Badge variant="secondary" className="capitalize">
          {roadmap.category}
        </Badge>
        {roadmap.isFeatured && (
          <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">Featured</Badge>
        )}
        <Badge className={`border ${getDifficultyColor(roadmap.difficulty)} capitalize`}>{roadmap.difficulty}</Badge>
      </div>

      <h1 className="text-4xl font-bold text-foreground mb-2">{roadmap.title}</h1>
      <p className="text-muted-foreground text-lg max-w-3xl">{roadmap.description}</p>
    </div>
  </div>
)

const StatsCard = ({ stats }: { stats: RoadmapStats }) => (
  <Card>
    <CardContent className="p-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <div className="text-center">
          <div className="flex items-center justify-center mb-2">
            <Eye className="h-5 w-5 text-primary" />
          </div>
          <div className="text-2xl font-bold text-foreground">{stats.views.toLocaleString()}</div>
          <div className="text-sm text-muted-foreground">Views</div>
        </div>

        <div className="text-center">
          <div className="flex items-center justify-center mb-2">
            <Trophy className="h-5 w-5 text-primary" />
          </div>
          <div className="text-2xl font-bold text-foreground">{stats.completions.toLocaleString()}</div>
          <div className="text-sm text-muted-foreground">Completions</div>
        </div>

        <div className="text-center">
          <div className="flex items-center justify-center mb-2">
            <Star className="h-5 w-5 text-primary" />
          </div>
          <div className="text-2xl font-bold text-foreground">{stats.averageRating.toFixed(1)}</div>
          <div className="text-sm text-muted-foreground">Rating</div>
        </div>

        <div className="text-center">
          <div className="flex items-center justify-center mb-2">
            <Users className="h-5 w-5 text-primary" />
          </div>
          <div className="text-2xl font-bold text-foreground">{stats.ratingsCount?.toLocaleString()}</div>
          <div className="text-sm text-muted-foreground">Reviews</div>
        </div>
      </div>
    </CardContent>
  </Card>
)

const ProgressStatsCard = ({ stats }: { stats: IUserProgressStatsResponse }) => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <Target className="h-5 w-5 text-primary" />
        Your Progress
      </CardTitle>
    </CardHeader>
    <CardContent className="space-y-4">
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Nodes Completed</span>
          <span className="text-foreground font-medium">
            {stats.completedNodes} of {stats.totalNodes}
          </span>
        </div>
        <Progress value={stats.completionPercentage} className="h-2" />
        <p className="text-sm text-muted-foreground">{stats.completionPercentage}% Complete</p>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Resources Completed</span>
          <span className="text-foreground font-medium">
            {stats.completedResources} of {stats.totalResources}
          </span>
        </div>
        <Progress value={(stats.completedResources / stats.totalResources) * 100} className="h-2" />
      </div>

      <div className="pt-2 border-t border-border">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <TrendingUp className="h-4 w-4" />
          Keep up the great work!
        </div>
      </div>
    </CardContent>
  </Card>
)

const NodeCard = ({
  node,
  nodeProgress,
  onProgressUpdate,
  depth = 0,
}: {
  node: RoadmapNode
  nodeProgress?: INodeProgressResponse
  onProgressUpdate: (nodeId: string, status: ProgressStatus) => void
  depth?: number
}) => {
  const [isExpanded, setIsExpanded] = useState(depth < 2)
  const currentStatus = nodeProgress?.status || "not_started"

  const handleProgressChange = (status: ProgressStatus) => {
    onProgressUpdate(node._id, status)
  }

  return (
    <div className={`ml-${depth * 4}`}>
      <Card className="mb-4">
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <Progress value={currentStatus === "completed" ? 100 : currentStatus === "in_progress" ? 50 : 0} className="h-4 w-4" />

                {node.children && node.children.length > 0 && (
                  <Button variant="ghost" size="sm" onClick={() => setIsExpanded(!isExpanded)} className="p-1 h-6 w-6">
                    {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                  </Button>
                )}

                <h3 className="text-lg font-semibold text-foreground">{node.title}</h3>

                {node.nodeType && (
                  <Badge variant="outline" className="capitalize text-xs">
                    {node.nodeType}
                  </Badge>
                )}

                {node.isOptional && (
                  <Badge variant="secondary" className="text-xs">
                    Optional
                  </Badge>
                )}
              </div>

              {node.description && <p className="text-muted-foreground mb-3 ml-8">{node.description}</p>}

              <div className="flex flex-wrap items-center gap-4 text-sm ml-8">
                {node.estimatedDuration && (
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Clock className="h-4 w-4 text-primary" />
                    {node.estimatedDuration.value} {node.estimatedDuration.unit}
                  </div>
                )}

                {node.metadata?.difficulty && (
                  <Badge className={`border text-xs ${getDifficultyColor(node.metadata.difficulty)}`}>
                    {node.metadata.difficulty}
                  </Badge>
                )}

                {node.metadata?.importance && (
                  <div className={`flex items-center gap-1 text-xs ${getImportanceColor(node.metadata.importance)}`}>
                    <AlertCircle className="h-3 w-3" />
                    {node.metadata.importance} priority
                  </div>
                )}
              </div>

              {node.resources && node.resources.length > 0 && (
                <div className="mt-3 ml-8">
                  <h4 className="text-sm font-medium text-foreground mb-2">Resources:</h4>
                  <div className="space-y-1">
                    {node.resources.map((resource) => (
                      <div key={resource._id} className="flex items-center gap-2 text-sm">
                        <span className="text-primary">{getResourceIcon(resource.type)}</span>
                        <a
                          href={resource.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:text-primary/80 hover:underline"
                        >
                          {resource.title}
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {node.dependencies && node.dependencies.length > 0 && (
                <div className="mt-3 ml-8">
                  <h4 className="text-sm font-medium text-foreground mb-1">Dependencies:</h4>
                  <div className="text-sm text-muted-foreground">
                    {node.dependencies.map((dep, index) => (
                      <span key={dep._id}>
                        {index > 0 && ", "}
                        <span className="text-primary">{dep.title}</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {nodeProgress?.notes && (
                <div className="mt-3 ml-8">
                  <h4 className="text-sm font-medium text-foreground mb-1">Notes:</h4>
                  <p className="text-sm text-muted-foreground">{nodeProgress.notes}</p>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 ml-4">
              <ProgressSelector currentStatus={currentStatus} onStatusChange={handleProgressChange} />
            </div>
          </div>
        </CardContent>
      </Card>

      {isExpanded && node.children && (
        <div className="ml-6">
          {node.children.map((child) => (
            <NodeCard
              key={child._id}
              node={child}
              nodeProgress={nodeProgress}
              onProgressUpdate={onProgressUpdate}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  )
}

const RoadmapInfo = ({ roadmap }: { roadmap: RoadmapDetails }) => (
  <Card>
    <CardHeader>
      <CardTitle>Roadmap Information</CardTitle>
    </CardHeader>
    <CardContent className="space-y-4">
      {roadmap.estimatedDuration && (
        <div className="flex items-center gap-3">
          <Clock className="h-5 w-5 text-primary" />
          <span className="text-muted-foreground">
            Estimated Duration: {roadmap.estimatedDuration.value} {roadmap.estimatedDuration.unit}
          </span>
        </div>
      )}

      {roadmap.contributor && (
        <div className="flex items-center gap-3">
          <UserIcon className="h-5 w-5 text-primary" />
          <div className="flex items-center gap-2">
            <Avatar className="h-6 w-6">
              <AvatarImage src={roadmap.contributor.avatar || "/placeholder.svg"} />
              <AvatarFallback>{roadmap.contributor.username[0].toUpperCase()}</AvatarFallback>
            </Avatar>
            <span className="text-muted-foreground">Created by {roadmap.contributor.username}</span>
          </div>
        </div>
      )}

      {roadmap.lastUpdated && (
        <div className="flex items-center gap-3">
          <Calendar className="h-5 w-5 text-primary" />
          <span className="text-muted-foreground">
            Last updated: {new Date(roadmap.lastUpdated).toLocaleDateString()}
          </span>
        </div>
      )}

      {roadmap.tags && roadmap.tags.length > 0 && (
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Tag className="h-5 w-5 text-primary" />
            <span className="text-muted-foreground">Tags:</span>
          </div>
          <div className="flex flex-wrap gap-2 ml-8">
            {roadmap.tags.map((tag, index) => (
              <Badge key={index} variant="secondary">
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </CardContent>
  </Card>
)

const ReviewsSection = ({ reviews }: { reviews: Review[] }) => (
  <Card>
    <CardHeader>
      <CardTitle>Reviews</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="space-y-4">
        {reviews.map((review) => (
          <div key={review._id} className="border-b border-border pb-4 last:border-b-0">
            <div className="flex items-start gap-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src={review.user.avatar || "/placeholder.svg"} />
                <AvatarFallback>{review.user.username[0].toUpperCase()}</AvatarFallback>
              </Avatar>

              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-foreground">{review.user.username}</span>
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${i < review.rating ? "text-yellow-400 fill-current" : "text-gray-600"}`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-muted-foreground">{review.createdAt.toLocaleDateString()}</span>
                </div>

                {review.comment && <p className="text-muted-foreground">{review.comment}</p>}
              </div>
            </div>
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
)

export default function RoadmapDetailsPage() {
   const { roadmapId } = useParams<{ roadmapId: string }>();
  const dispatch = useAppDispatch();

 

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { roadmap: RoadmapDetails } = useAppSelector((state) => state.roadmap);
  const { progress:userProgress } = useAppSelector((state) => state.userProgress);

  useEffect(() => {
    if (!roadmapId) return;

    dispatch(getRoadMapDetails(roadmapId))
      .then(() => {
        dispatch(fetchUserProgress(roadmapId))
          .then(() => {
            toast.success("Fetched user progress successfully");
          })
          .catch(() => {
            toast.error("Failed to fetch the user progress");
          });
      })
      .catch(() => {
        toast.error("Failed to fetch roadmap details");
      });
  }, [roadmapId, dispatch]);

  if (!RoadmapDetails) {
    return null;
  }

  const startProgress = () => {
    if (!roadmapId) return;

    dispatch(startRoadmap(roadmapId))
      .unwrap()
      .then(() => {
        toast.success("Roadmap started successfully");
      })
      .catch(() => {
        toast.error("Failed to start roadmap");
      });
  };

 


  
   const nodes = RoadmapDetails.nodes || [];
  const roadmap = RoadmapDetails.roadmap || {};
  // Mock API call to update progress
  const updateNodeProgress = async (nodeId: string, status: ProgressStatus) => {
    setIsLoading(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500))

    // Update local state
    // setUserProgress((prev) => {
    //   const updatedNodes = prev.nodes.map((nodeProgress) => {
    //     if (nodeProgress.node._id === nodeId) {
    //       return {
    //         ...nodeProgress,
    //         status,
    //         ...(status === "completed" && { completedAt: new Date().toISOString() }),
    //         ...(status === "in_progress" && !nodeProgress.startedAt && { startedAt: new Date().toISOString() }),
    //       }
    //     }
    //     return nodeProgress
    //   })

    //   // If node doesn't exist in progress, add it
    //   const existingNode = prev.nodes.find((n) => n.node._id === nodeId)
    //   if (!existingNode) {
    //     const roadmapNode = roadmap.nodes?.find((n) => n._id === nodeId)
    //     if (roadmapNode) {
    //       updatedNodes.push({
    //         node: {
    //           _id: roadmapNode._id,
    //           title: roadmapNode.title,
    //           description: roadmapNode.description || "",
    //           nodeType: roadmapNode.nodeType || "concept",
    //           id: roadmapNode.id || roadmapNode._id,
    //         },
    //         status,
    //         ...(status === "completed" && { completedAt: new Date().toISOString() }),
    //         ...(status === "in_progress" && { startedAt: new Date().toISOString() }),
    //         resources: [],
    //       })
    //     }
    //   }

    //   // Recalculate stats
    //   const completedNodes = updatedNodes.filter((n) => n.status === "completed").length
    //   const totalNodes = (roadmap.nodes ?? []).length
    //   const completionPercentage = Math.round((completedNodes / totalNodes) * 100)

    //   return {
    //     ...prev,
    //     nodes: updatedNodes,
    //     stats: {
    //       ...prev.stats,
    //       completedNodes,
    //       completionPercentage,
    //     },
    //   }
    // })

    setIsLoading(false)
  }

  const getNodeProgress = (nodeId: string): INodeProgressResponse | undefined => {
    return userProgress?.nodes?.find((progress) => progress.node._id === nodeId)
  }
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <RoadmapHeader roadmap={roadmap} />

        {/* Stats */}
        <div className="mt-8">{roadmap.stats && <StatsCard stats={roadmap.stats} />}</div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-8 mt-8">
          {/* Left Column - Roadmap Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Long Description */}
            {roadmap.longDescription && (
              <Card>
                <CardHeader>
                  <CardTitle>About This Roadmap</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">{roadmap.longDescription}</p>
                </CardContent>
              </Card>
            )}

            {/* Roadmap Nodes */}
            <Card>
              <CardHeader>
                <CardTitle>Learning Path</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {nodes.map((node) => (
                    <NodeCard
                      key={node._id}
                      node={node}
                      nodeProgress={getNodeProgress(node._id)}
                      onProgressUpdate={updateNodeProgress}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Reviews */}
            {roadmap.reviews && roadmap.reviews.length > 0 && <ReviewsSection reviews={roadmap.reviews} />}
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            <RoadmapInfo roadmap={roadmap} />

            {/* Progress Stats */}
            {userProgress?.stats && <ProgressStatsCard stats={userProgress.stats} />}

            {/* Action Buttons */}
            <Card>
              <CardContent className="p-6 space-y-3">
                <Button className="w-full" onClick={startProgress} disabled={isLoading}>
                  {userProgress && userProgress.stats.completedNodes > 0 ? "Continue Learning" : "Start Learning"}
                </Button>
                <Button variant="outline" className="w-full bg-transparent">
                  Save to Favorites
                </Button>
                <Button variant="outline" className="w-full bg-transparent">
                  Share Roadmap
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
