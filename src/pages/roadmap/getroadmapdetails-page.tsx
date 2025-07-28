import { useState } from "react"
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
  CheckCircle2,
  Circle,
  AlertCircle,
} from "lucide-react"

// Types (as provided)
type DurationUnit = "hours" | "days" | "weeks" | "months"
type RoadmapCategory =
  | "frontend"
  | "backend"
  | "devops"
  | "mobile"
  | "data-science"
  | "design"
  | "product-management"
  | "cyber-security"
  | "cloud"
  | "blockchain"
  | "other"
type RoadmapDifficulty = "beginner" | "intermediate" | "advanced" | "expert"
type NodeType = "topic" | "skill" | "milestone" | "project" | "checkpoint"
type ImportanceLevel = "low" | "medium" | "high" | "critical"
type NodeDifficulty = "beginner" | "intermediate" | "advanced"

interface RoadmapUser {
  _id: string
  username: string
  avatar?: string
}

interface Review {
  _id: string
  user: RoadmapUser
  rating: number
  comment?: string
  createdAt: Date
}

interface Resource {
  _id: string
  title: string
  url: string
  type: "article" | "video" | "course" | "documentation" | "other"
}

interface RoadmapStats {
  views: number
  completions: number
  averageRating: number
  ratingsCount: number
}

interface RoadmapNode {
  _id: string
  title: string
  description?: string
  depth: number
  position: number
  nodeType?: NodeType
  isOptional?: boolean
  estimatedDuration?: {
    value: number
    unit: "hours" | "days" | "weeks"
  }
  resources?: Resource[]
  dependencies?: Array<{ _id: string; title: string }>
  prerequisites?: Array<{ _id: string; title: string }>
  metadata?: {
    keywords?: string[]
    difficulty?: NodeDifficulty
    importance?: ImportanceLevel
  }
  children?: RoadmapNode[]
}

interface RoadmapDetails {
  _id: string
  title: string
  slug?: string
  description: string
  longDescription?: string
  category: RoadmapCategory
  difficulty?: RoadmapDifficulty
  estimatedDuration?: {
    value: number
    unit: DurationUnit
  }
  coverImage?: {
    public_id: string
    url: string
  }
  isFeatured?: boolean
  isCommunityContributed?: boolean
  contributor?: RoadmapUser
  tags?: string[]
  prerequisites?: Array<{ _id: string; title: string }>
  stats?: RoadmapStats
  version?: number
  isPublished?: boolean
  publishedAt?: Date
  lastUpdated?: Date
  updatedBy?: RoadmapUser
  reviews?: Review[]
}

interface RoadmapDetailsResponse {
  roadmap: RoadmapDetails
  nodes: RoadmapNode[]
}

// Mock data
const mockData: RoadmapDetailsResponse = {
  roadmap: {
    _id: "1",
    title: "Full Stack Web Development",
    slug: "full-stack-web-development",
    description: "Complete roadmap to become a full-stack web developer",
    longDescription:
      "This comprehensive roadmap will guide you through everything you need to know to become a proficient full-stack web developer. From frontend technologies like React and Vue.js to backend frameworks like Node.js and databases, this roadmap covers it all.",
    category: "frontend",
    difficulty: "intermediate",
    estimatedDuration: { value: 6, unit: "months" },
    coverImage: {
      public_id: "roadmap_cover",
      url: "/placeholder.svg?height=300&width=600",
    },
    isFeatured: true,
    isCommunityContributed: false,
    contributor: {
      _id: "user1",
      username: "techguru",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    tags: ["javascript", "react", "nodejs", "mongodb", "fullstack"],
    prerequisites: [
      { _id: "prereq1", title: "Basic HTML & CSS" },
      { _id: "prereq2", title: "JavaScript Fundamentals" },
    ],
    stats: {
      views: 15420,
      completions: 2340,
      averageRating: 4.7,
      ratingsCount: 892,
    },
    version: 2,
    isPublished: true,
    publishedAt: new Date("2024-01-15"),
    lastUpdated: new Date("2024-12-01"),
    reviews: [
      {
        _id: "review1",
        user: { _id: "user2", username: "devlearner", avatar: "/placeholder.svg?height=32&width=32" },
        rating: 5,
        comment: "Excellent roadmap! Very comprehensive and well-structured.",
        createdAt: new Date("2024-11-20"),
      },
      {
        _id: "review2",
        user: { _id: "user3", username: "codingpro", avatar: "/placeholder.svg?height=32&width=32" },
        rating: 4,
        comment: "Great content, helped me land my first full-stack role!",
        createdAt: new Date("2024-11-15"),
      },
    ],
  },
  nodes: [
    {
      _id: "node1",
      title: "Frontend Fundamentals",
      description: "Master the basics of frontend development",
      depth: 0,
      position: 0,
      nodeType: "milestone",
      estimatedDuration: { value: 4, unit: "weeks" },
      metadata: { difficulty: "beginner", importance: "critical" },
      resources: [
        { _id: "res1", title: "HTML & CSS Crash Course", url: "#", type: "video" },
        { _id: "res2", title: "JavaScript Fundamentals", url: "#", type: "course" },
      ],
      children: [
        {
          _id: "node1-1",
          title: "HTML & CSS Mastery",
          description: "Learn semantic HTML and modern CSS",
          depth: 1,
          position: 0,
          nodeType: "topic",
          estimatedDuration: { value: 2, unit: "weeks" },
          metadata: { difficulty: "beginner", importance: "high" },
          resources: [{ _id: "res3", title: "MDN HTML Guide", url: "#", type: "documentation" }],
        },
        {
          _id: "node1-2",
          title: "JavaScript ES6+",
          description: "Modern JavaScript features and concepts",
          depth: 1,
          position: 1,
          nodeType: "topic",
          estimatedDuration: { value: 2, unit: "weeks" },
          metadata: { difficulty: "intermediate", importance: "critical" },
        },
      ],
    },
    {
      _id: "node2",
      title: "React Development",
      description: "Build modern UIs with React",
      depth: 0,
      position: 1,
      nodeType: "skill",
      estimatedDuration: { value: 6, unit: "weeks" },
      metadata: { difficulty: "intermediate", importance: "high" },
      dependencies: [{ _id: "node1", title: "Frontend Fundamentals" }],
    },
  ],
}

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
    <div className="h-64 bg-gradient-to-r from-[#0F172A] to-[#020617] rounded-lg overflow-hidden">
      {roadmap.coverImage && (
        <img
          src={roadmap.coverImage.url || "/placeholder.svg"}
          alt={roadmap.title}
          className="w-full h-full object-cover opacity-30"
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A] via-transparent to-transparent" />
    </div>

    <div className="absolute bottom-6 left-6 right-6">
      <div className="flex items-center gap-2 mb-3">
        <Badge className="bg-[#2563EB]/20 text-[#60A5FA] border-[#2563EB]/30 capitalize">{roadmap.category}</Badge>
        {roadmap.isFeatured && (
          <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">Featured</Badge>
        )}
        <Badge className={`border ${getDifficultyColor(roadmap.difficulty)} capitalize`}>{roadmap.difficulty}</Badge>
      </div>

      <h1 className="text-4xl font-bold text-[#60A5FA] mb-2">{roadmap.title}</h1>
      <p className="text-[#E2E8F0] text-lg max-w-3xl">{roadmap.description}</p>
    </div>
  </div>
)

const StatsCard = ({ stats }: { stats: RoadmapStats }) => (
  <Card className="bg-[#1E293B] border-[#334155]">
    <CardContent className="p-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <div className="text-center">
          <div className="flex items-center justify-center mb-2">
            <Eye className="h-5 w-5 text-[#2563EB]" />
          </div>
          <div className="text-2xl font-bold text-[#60A5FA]">{stats.views.toLocaleString()}</div>
          <div className="text-sm text-[#E2E8F0]">Views</div>
        </div>

        <div className="text-center">
          <div className="flex items-center justify-center mb-2">
            <Trophy className="h-5 w-5 text-[#2563EB]" />
          </div>
          <div className="text-2xl font-bold text-[#60A5FA]">{stats.completions.toLocaleString()}</div>
          <div className="text-sm text-[#E2E8F0]">Completions</div>
        </div>

        <div className="text-center">
          <div className="flex items-center justify-center mb-2">
            <Star className="h-5 w-5 text-[#2563EB]" />
          </div>
          <div className="text-2xl font-bold text-[#60A5FA]">{stats.averageRating.toFixed(1)}</div>
          <div className="text-sm text-[#E2E8F0]">Rating</div>
        </div>

        <div className="text-center">
          <div className="flex items-center justify-center mb-2">
            <Users className="h-5 w-5 text-[#2563EB]" />
          </div>
          <div className="text-2xl font-bold text-[#60A5FA]">{stats.ratingsCount.toLocaleString()}</div>
          <div className="text-sm text-[#E2E8F0]">Reviews</div>
        </div>
      </div>
    </CardContent>
  </Card>
)

const RoadmapInfo = ({ roadmap }: { roadmap: RoadmapDetails }) => (
  <Card className="bg-[#1E293B] border-[#334155]">
    <CardHeader>
      <CardTitle className="text-[#60A5FA]">Roadmap Information</CardTitle>
    </CardHeader>
    <CardContent className="space-y-4">
      {roadmap.estimatedDuration && (
        <div className="flex items-center gap-3">
          <Clock className="h-5 w-5 text-[#2563EB]" />
          <span className="text-[#E2E8F0]">
            Estimated Duration: {roadmap.estimatedDuration.value} {roadmap.estimatedDuration.unit}
          </span>
        </div>
      )}

      {roadmap.contributor && (
        <div className="flex items-center gap-3">
          <UserIcon className="h-5 w-5 text-[#2563EB]" />
          <div className="flex items-center gap-2">
            <Avatar className="h-6 w-6">
              <AvatarImage src={roadmap.contributor.avatar || "/placeholder.svg"} />
              <AvatarFallback className="bg-[#0F172A] text-[#60A5FA]">
                {roadmap.contributor.username[0].toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span className="text-[#E2E8F0]">Created by {roadmap.contributor.username}</span>
          </div>
        </div>
      )}

      {roadmap.lastUpdated && (
        <div className="flex items-center gap-3">
          <Calendar className="h-5 w-5 text-[#2563EB]" />
          <span className="text-[#E2E8F0]">Last updated: {roadmap.lastUpdated.toLocaleDateString()}</span>
        </div>
      )}

      {roadmap.tags && roadmap.tags.length > 0 && (
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Tag className="h-5 w-5 text-[#2563EB]" />
            <span className="text-[#E2E8F0]">Tags:</span>
          </div>
          <div className="flex flex-wrap gap-2 ml-8">
            {roadmap.tags.map((tag, index) => (
              <Badge key={index} className="bg-[#0F172A] text-[#3B82F6] border-[#2563EB]/30">
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {roadmap.prerequisites && roadmap.prerequisites.length > 0 && (
        <div>
          <div className="flex items-center gap-3 mb-2">
            <AlertCircle className="h-5 w-5 text-[#2563EB]" />
            <span className="text-[#E2E8F0]">Prerequisites:</span>
          </div>
          <div className="ml-8 space-y-1">
            {roadmap.prerequisites.map((prereq) => (
              <div key={prereq._id} className="text-[#3B82F6] hover:text-[#60A5FA] cursor-pointer">
                • {prereq.title}
              </div>
            ))}
          </div>
        </div>
      )}
    </CardContent>
  </Card>
)

const NodeCard = ({ node, depth = 0 }: { node: RoadmapNode; depth?: number }) => {
  const [isExpanded, setIsExpanded] = useState(depth < 2)

  return (
    <div className={`ml-${depth * 4}`}>
      <Card className="bg-[#1E293B] border-[#334155] mb-4">
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                {node.children && node.children.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="p-1 h-6 w-6 text-[#60A5FA] hover:bg-[#0F172A]"
                  >
                    {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                  </Button>
                )}

                <h3 className="text-lg font-semibold text-[#60A5FA]">{node.title}</h3>

                {node.nodeType && (
                  <Badge className="bg-[#2563EB]/20 text-[#3B82F6] border-[#2563EB]/30 capitalize text-xs">
                    {node.nodeType}
                  </Badge>
                )}

                {node.isOptional && (
                  <Badge className="bg-gray-500/20 text-gray-400 border-gray-500/30 text-xs">Optional</Badge>
                )}
              </div>

              {node.description && <p className="text-[#E2E8F0] mb-3">{node.description}</p>}

              <div className="flex flex-wrap items-center gap-4 text-sm">
                {node.estimatedDuration && (
                  <div className="flex items-center gap-1 text-[#E2E8F0]">
                    <Clock className="h-4 w-4 text-[#2563EB]" />
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
                    <Circle className="h-3 w-3 fill-current" />
                    {node.metadata.importance} priority
                  </div>
                )}
              </div>

              {node.resources && node.resources.length > 0 && (
                <div className="mt-3">
                  <h4 className="text-sm font-medium text-[#60A5FA] mb-2">Resources:</h4>
                  <div className="space-y-1">
                    {node.resources.map((resource) => (
                      <div key={resource._id} className="flex items-center gap-2 text-sm">
                        <span className="text-[#2563EB]">{getResourceIcon(resource.type)}</span>
                        <a href={resource.url} className="text-[#3B82F6] hover:text-[#60A5FA] hover:underline">
                          {resource.title}
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {node.dependencies && node.dependencies.length > 0 && (
                <div className="mt-3">
                  <h4 className="text-sm font-medium text-[#60A5FA] mb-1">Dependencies:</h4>
                  <div className="text-sm text-[#E2E8F0]">
                    {node.dependencies.map((dep, index) => (
                      <span key={dep._id}>
                        {index > 0 && ", "}
                        <span className="text-[#3B82F6]">{dep.title}</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 ml-4">
              <Button variant="ghost" size="sm" className="text-[#3B82F6] hover:text-[#60A5FA] hover:bg-[#0F172A]">
                <CheckCircle2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {isExpanded && node.children && (
        <div className="ml-6">
          {node.children.map((child) => (
            <NodeCard key={child._id} node={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  )
}

const ReviewsSection = ({ reviews }: { reviews: Review[] }) => (
  <Card className="bg-[#1E293B] border-[#334155]">
    <CardHeader>
      <CardTitle className="text-[#60A5FA]">Reviews</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="space-y-4">
        {reviews.map((review) => (
          <div key={review._id} className="border-b border-[#334155] pb-4 last:border-b-0">
            <div className="flex items-start gap-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src={review.user.avatar || "/placeholder.svg"} />
                <AvatarFallback className="bg-[#0F172A] text-[#60A5FA]">
                  {review.user.username[0].toUpperCase()}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-[#60A5FA]">{review.user.username}</span>
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${i < review.rating ? "text-yellow-400 fill-current" : "text-gray-600"}`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-[#E2E8F0]">{review.createdAt.toLocaleDateString()}</span>
                </div>

                {review.comment && <p className="text-[#E2E8F0]">{review.comment}</p>}
              </div>
            </div>
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
)

export default function RoadmapDetailsPage() {
  const { roadmap, nodes } = mockData

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0F172A] to-[#020617]">
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
              <Card className="bg-[#1E293B] border-[#334155]">
                <CardHeader>
                  <CardTitle className="text-[#60A5FA]">About This Roadmap</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-[#E2E8F0] leading-relaxed">{roadmap.longDescription}</p>
                </CardContent>
              </Card>
            )}

            {/* Roadmap Nodes */}
            <Card className="bg-[#1E293B] border-[#334155]">
              <CardHeader>
                <CardTitle className="text-[#60A5FA]">Learning Path</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {nodes.map((node) => (
                    <NodeCard key={node._id} node={node} />
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

            {/* Action Buttons */}
            <Card className="bg-[#1E293B] border-[#334155]">
              <CardContent className="p-6 space-y-3">
                <Button className="w-full bg-[#3B82F6] hover:bg-[#2563EB] text-white">Start Learning</Button>
                <Button
                  variant="outline"
                  className="w-full border-[#334155] text-[#60A5FA] hover:bg-[#0F172A] bg-transparent"
                >
                  Save to Favorites
                </Button>
                <Button
                  variant="outline"
                  className="w-full border-[#334155] text-[#60A5FA] hover:bg-[#0F172A] bg-transparent"
                >
                  Share Roadmap
                </Button>
              </CardContent>
            </Card>

            {/* Progress Card */}
            <Card className="bg-[#1E293B] border-[#334155]">
              <CardHeader>
                <CardTitle className="text-[#60A5FA]">Your Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-[#E2E8F0]">Completed</span>
                    <span className="text-[#60A5FA]">3 of 12 topics</span>
                  </div>
                  <Progress value={25} className="h-2" />
                  <p className="text-sm text-[#E2E8F0]">25% Complete</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
