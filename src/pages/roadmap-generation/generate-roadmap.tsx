
import type React from "react"
import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import {
  Sparkles,
  Clock,
  Users,
  Star,
  Eye,
  CheckCircle,
  Loader2,
  Zap,
  Target,
  BookOpen,
  Award,
  TrendingUp,
  Calendar,
  User,
} from "lucide-react"
import { socket, registerUserSocket, connectSocket } from "@/helper/useSocket"
import { useAppDispatch } from "@/hooks/useAppDispatch"
import type { RootState } from "@/state/store"
import { useSelector } from "react-redux"
import { generateRoadmap } from "@/state/slices/roadmapSlice"
import type { IRoadmap } from "@/types/user/roadmap/roadmap.types"
import { toast } from "sonner"
import { useNavigate, useLocation } from "react-router-dom"
import { useAuth } from "@/contexts/authContext"

interface ProgressType {
  step: string
  progress: number
  error?: string
}

const progressSteps = [
  { key: "searching", label: "Searching existing roadmaps", icon: Target },
  { key: "analyzing", label: "Analyzing prompt", icon: Target },
  { key: "researching", label: "Researching content", icon: BookOpen },
  { key: "structuring", label: "Structuring roadmap", icon: TrendingUp },
  { key: "generating", label: "Generating details", icon: Sparkles },
  { key: "finalizing", label: "Finalizing roadmap", icon: CheckCircle },
  { key: "complete", label: "Complete", icon: CheckCircle },
]

const categoryColors: Record<string, string> = {
  frontend: "bg-blue-500",
  backend: "bg-green-500",
  devops: "bg-orange-500",
  mobile: "bg-purple-500",
  "data-science": "bg-pink-500",
  design: "bg-indigo-500",
  "product-management": "bg-yellow-500",
  cybersecurity: "bg-red-500",
  "cyber-security": "bg-red-500",
  cloud: "bg-cyan-500",
  blockchain: "bg-emerald-500",
  other: "bg-gray-500",
}

const difficultyColors = {
  beginner: "bg-green-500",
  intermediate: "bg-yellow-500",
  advanced: "bg-orange-500",
  expert: "bg-red-500",
}

const GenerateRoadmap: React.FC = () => {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const {user}= useAuth()
  const [prompt, setPrompt] = useState<string>("")
  const [isGenerating, setIsGenerating] = useState<boolean>(false)
  const [currentProgress, setCurrentProgress] = useState<ProgressType | null>(null)
  const [generatedRoadmap, setGeneratedRoadmap] = useState<IRoadmap | null>(null)
  const [currentStep, setCurrentStep] = useState<number>(0)

  useEffect(() => {
    // Connect socket when component mounts
    connectSocket()

    // Register user with socket if authenticated
    if (user?._id) {
      registerUserSocket(user._id)
    }

    // Listen for progress updates
    socket.on("roadmap-progress", ({ step, progress, error }: ProgressType) => {
      console.log('Progress update:', { step, progress, error })
      setCurrentProgress({ step, progress, error })

      const stepIndex = progressSteps.findIndex((s) => s.key === step)
      if (stepIndex !== -1) {
        setCurrentStep(stepIndex)
      }

      if (error && !error.includes('Searching') && !error.includes('Checking')) {
        toast.error(`Error: ${error}`)
        setIsGenerating(false)
      }
      
      // Handle completion
      if (step === 'complete' || progress === 100) {
        setTimeout(() => {
          setIsGenerating(false)
        }, 1000)
      }
    })

    return () => {
      socket.off("roadmap-progress")
    }
  }, [user])

  const handleSubmit = async () => {
    if (prompt.trim() === "") {
      toast.error("Please enter a description of what you want to learn")
      return
    }

    if (!user) {
      toast.error("Please login to generate roadmaps")
      navigate("/login", { state: { from: location } })
      return
    }

    setIsGenerating(true)
    setCurrentProgress(null)
    setGeneratedRoadmap(null)
    setCurrentStep(0)

    try {
      const data = await dispatch(
        generateRoadmap({ 
          prompt, 
          isCommunityContributed: false 
        })
      ).unwrap()
      
      setGeneratedRoadmap(data)
      toast.success("Roadmap generated successfully!")
      
      // Navigate to the generated roadmap after a short delay
      setTimeout(() => {
        if (data._id) {
          navigate(`/details/${data._id}`)
        }
      }, 2000)
    } catch (error) {
      console.error('Generation error:', error)
      toast.error(typeof error === "string" ? error : "Failed to generate roadmap")
      setIsGenerating(false)
    }
  }

  const formatDuration = (duration?: { value: number; unit: string }) => {
    if (!duration) return "Not specified"
    return `${duration.value} ${duration.unit}`
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0F172A] to-[#020617] p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-[#60A5FA] flex items-center justify-center gap-3">
            <Sparkles className="w-8 h-8" />
            AI Roadmap Generator
          </h1>
          <p className="text-[#E2E8F0] text-lg">Generate personalized learning roadmaps with AI assistance</p>
        </motion.div>

        {/* Input Form */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="bg-[#1E293B] border-[#0F172A] shadow-2xl">
            <CardHeader>
              <CardTitle className="text-[#60A5FA] flex items-center gap-2">
                <Zap className="w-5 h-5" />
                Describe Your Learning Goal
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="prompt" className="text-[#E2E8F0]">
                  What would you like to learn?
                </Label>
                <Textarea
                  id="prompt"
                  placeholder="e.g., I want to become a full-stack developer with React and Node.js..."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="bg-[#0F172A] border-[#374151] text-[#E2E8F0] placeholder:text-[#9CA3AF] min-h-[120px] resize-none"
                  disabled={isGenerating}
                />
              </div>
              <Button
                onClick={handleSubmit}
                disabled={isGenerating || !prompt.trim()}
                className="w-full bg-[#3B82F6] hover:bg-[#2563EB] text-white font-semibold py-3 transition-all duration-200"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating Roadmap...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Generate Roadmap
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Progress Section */}
        <AnimatePresence>
          {isGenerating && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="space-y-6"
            >
              <Card className="bg-[#1E293B] border-[#0F172A] shadow-2xl">
                <CardHeader>
                  <CardTitle className="text-[#60A5FA] flex items-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Generating Your Roadmap
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Overall Progress */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-[#E2E8F0]">Overall Progress</span>
                      <span className="text-[#60A5FA] font-medium">{currentProgress?.progress || 0}%</span>
                    </div>
                    <Progress value={currentProgress?.progress || 0} className="h-2 bg-[#0F172A]" />
                  </div>

                  {/* Step Progress */}
                  <div className="space-y-4">
                    {progressSteps.map((step, index) => {
                      const Icon = step.icon
                      const isActive = index === currentStep
                      const isCompleted = index < currentStep

                      return (
                        <motion.div
                          key={step.key}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-300 ${
                            isActive
                              ? "bg-[#0F172A] border border-[#3B82F6]"
                              : isCompleted
                                ? "bg-[#0F172A] opacity-75"
                                : "opacity-50"
                          }`}
                        >
                          <div
                            className={`p-2 rounded-full transition-all duration-300 ${
                              isActive
                                ? "bg-[#3B82F6] text-white"
                                : isCompleted
                                  ? "bg-green-500 text-white"
                                  : "bg-[#374151] text-[#9CA3AF]"
                            }`}
                          >
                            {isCompleted ? (
                              <CheckCircle className="w-4 h-4" />
                            ) : (
                              <Icon className={`w-4 h-4 ${isActive ? "animate-pulse" : ""}`} />
                            )}
                          </div>
                          <span className={`font-medium ${isActive ? "text-[#60A5FA]" : "text-[#E2E8F0]"}`}>
                            {step.label}
                          </span>
                          {isActive && (
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                              className="ml-auto"
                            >
                              <Loader2 className="w-4 h-4 text-[#3B82F6]" />
                            </motion.div>
                          )}
                        </motion.div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Generated Roadmap */}
        <AnimatePresence>
          {generatedRoadmap && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-6"
            >
              {/* Roadmap Header */}
              <Card className="bg-[#1E293B] border-[#0F172A] shadow-2xl overflow-hidden">
                <div className="relative">
                  {generatedRoadmap.coverImage && (
                    <div className="h-48 bg-gradient-to-r from-[#3B82F6] to-[#2563EB] relative">
                      <div className="absolute inset-0 bg-black/20" />
                    </div>
                  )}
                  <CardContent className="p-6 space-y-4">
                    <div className="flex flex-wrap gap-2 mb-4">
                      <Badge className={`${categoryColors[generatedRoadmap.category]} text-white`}>
                        {generatedRoadmap.category}
                      </Badge>
                      {generatedRoadmap.difficulty && (
                        <Badge className={`${difficultyColors[generatedRoadmap.difficulty]} text-white`}>
                          {generatedRoadmap.difficulty}
                        </Badge>
                      )}
                      {generatedRoadmap.isFeatured && (
                        <Badge className="bg-yellow-500 text-white">
                          <Star className="w-3 h-3 mr-1" />
                          Featured
                        </Badge>
                      )}
                    </div>

                    <h2 className="text-3xl font-bold text-[#60A5FA] mb-2">{generatedRoadmap.title}</h2>

                    <p className="text-[#E2E8F0] text-lg leading-relaxed">{generatedRoadmap.description}</p>

                    {generatedRoadmap.longDescription && (
                      <p className="text-[#9CA3AF] leading-relaxed">{generatedRoadmap.longDescription}</p>
                    )}

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                      <div className="bg-[#0F172A] p-4 rounded-lg text-center">
                        <Clock className="w-6 h-6 text-[#3B82F6] mx-auto mb-2" />
                        <div className="text-[#60A5FA] font-semibold">
                          {formatDuration(generatedRoadmap.estimatedDuration)}
                        </div>
                        <div className="text-[#9CA3AF] text-sm">Duration</div>
                      </div>

                      {generatedRoadmap.stats && (
                        <>
                          <div className="bg-[#0F172A] p-4 rounded-lg text-center">
                            <Eye className="w-6 h-6 text-[#3B82F6] mx-auto mb-2" />
                            <div className="text-[#60A5FA] font-semibold">
                              {generatedRoadmap.stats.views.toLocaleString()}
                            </div>
                            <div className="text-[#9CA3AF] text-sm">Views</div>
                          </div>

                          <div className="bg-[#0F172A] p-4 rounded-lg text-center">
                            <Users className="w-6 h-6 text-[#3B82F6] mx-auto mb-2" />
                            <div className="text-[#60A5FA] font-semibold">
                              {generatedRoadmap.stats.completions.toLocaleString()}
                            </div>
                            <div className="text-[#9CA3AF] text-sm">Completions</div>
                          </div>

                          <div className="bg-[#0F172A] p-4 rounded-lg text-center">
                            <Star className="w-6 h-6 text-[#3B82F6] mx-auto mb-2" />
                            <div className="text-[#60A5FA] font-semibold">
                              {generatedRoadmap.stats.averageRating.toFixed(1)}
                            </div>
                            <div className="text-[#9CA3AF] text-sm">Rating</div>
                          </div>
                        </>
                      )}
                    </div>

                    {/* Tags */}
                    {generatedRoadmap.tags && generatedRoadmap.tags.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="text-[#60A5FA] font-semibold">Tags</h4>
                        <div className="flex flex-wrap gap-2">
                          {generatedRoadmap.tags.map((tag, index) => (
                            <Badge key={index} variant="outline" className="border-[#374151] text-[#E2E8F0]">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Prerequisites */}
                    {generatedRoadmap.prerequisites && generatedRoadmap.prerequisites.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="text-[#60A5FA] font-semibold flex items-center gap-2">
                          <BookOpen className="w-4 h-4" />
                          Prerequisites
                        </h4>
                        <div className="space-y-1">
                          {generatedRoadmap.prerequisites.map((prereq, index) => (
                            <div key={index} className="text-[#E2E8F0] text-sm">
                              • {prereq}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Contributor */}
                    {generatedRoadmap.contributor && (
                      <div className="flex items-center gap-3 pt-4 border-t border-[#374151]">
                        <div className="w-10 h-10 bg-[#3B82F6] rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <div className="text-[#E2E8F0] font-medium">{generatedRoadmap.contributor.username}</div>
                          <div className="text-[#9CA3AF] text-sm">Contributor</div>
                        </div>
                      </div>
                    )}

                    {/* Metadata */}
                    <div className="flex flex-wrap gap-4 pt-4 border-t border-[#374151] text-sm text-[#9CA3AF]">
                      {generatedRoadmap.publishedAt && (
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          Published: {new Date(generatedRoadmap.publishedAt).toLocaleDateString()}
                        </div>
                      )}
                      {generatedRoadmap.version && (
                        <div className="flex items-center gap-1">
                          <Award className="w-4 h-4" />
                          Version: {generatedRoadmap.version}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </div>
              </Card>

              {/* Action Buttons */}
              <div className="flex gap-4 justify-center">
                <Button className="bg-[#3B82F6] hover:bg-[#2563EB] text-white">
                  <BookOpen className="w-4 h-4 mr-2" />
                  Start Learning
                </Button>
                <Button variant="outline" className="border-[#374151] text-[#E2E8F0] hover:bg-[#1E293B]">
                  <Star className="w-4 h-4 mr-2" />
                  Save Roadmap
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

export default GenerateRoadmap
