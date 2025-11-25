import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Star, Users, Eye, Trophy } from "lucide-react"
import { Link } from "react-router-dom"

// Dummy data
const dummyBookmarks = [
  {
    _id: "1",
    roadmap: {
      _id: "101",
      id: "101",
      title: "Node.js Backend Mastery",
      slug: "nodejs-backend-mastery",
      description: "Complete Node.js backend development roadmap",
      category: "backend",
      difficulty: "intermediate",
      isFeatured: false,
      contributor: { _id: "u1", username: "Yash Choudhary" },
      stats: { views: 120, completions: 15, averageRating: 4.5, ratingsCount: 10, ratingCount: 10 },
    },
    tags: ["nodejs", "backend", "api"],
    notes: "Very useful roadmap",
    isFavorite: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: "2",
    roadmap: {
      _id: "102",
      id: "102",
      title: "React Frontend Essentials",
      slug: "react-frontend-essentials",
      description: "Learn React from scratch to advanced",
      category: "frontend",
      difficulty: "beginner",
      isFeatured: true,
      contributor: { _id: "u2", username: "Jane Doe" },
      stats: { views: 250, completions: 40, averageRating: 4.7, ratingsCount: 20, ratingCount: 20 },
    },
    tags: ["react", "frontend"],
    notes: "Start here if you are new to React",
    isFavorite: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
]

export function BookmarkedRoadmaps() {
  const bookmarks = dummyBookmarks

  if (!bookmarks || bookmarks.length === 0) {
    return <p className="text-slate-400">No bookmarked roadmaps yet.</p>
  }

  return (
    <Card className="bg-slate-800/50 border-slate-700 p-6 space-y-6">
      <h2 className="text-xl font-semibold mb-4">Bookmarked Roadmaps</h2>

      {bookmarks.map((bookmark) => {
        const roadmap = bookmark.roadmap
        return (
          <Link
            key={bookmark._id}
            to={`/roadmaps/${roadmap.slug}`}
            className="block hover:bg-slate-700/30 rounded-lg p-4 transition-colors"
          >
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-2">
              {/* Left Section */}
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-white">{roadmap.title}</h3>
                <p className="text-sm text-slate-400">{roadmap.description}</p>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <Badge variant="secondary" className="capitalize">{roadmap.category}</Badge>
                  <Badge
                    className={`border text-xs ${
                      roadmap.difficulty === "beginner"
                        ? "bg-green-500/20 text-green-400 border-green-500/30"
                        : roadmap.difficulty === "intermediate"
                        ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
                        : roadmap.difficulty === "advanced"
                        ? "bg-orange-500/20 text-orange-400 border-orange-500/30"
                        : "bg-red-500/20 text-red-400 border-red-500/30"
                    } capitalize`}
                  >
                    {roadmap.difficulty}
                  </Badge>
                  {bookmark.isFavorite && (
                    <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30 text-xs">
                      Favorite
                    </Badge>
                  )}
                </div>
                {bookmark.notes && (
                  <p className="text-sm text-slate-400 mt-1 italic">"{bookmark.notes}"</p>
                )}
              </div>

              {/* Right Section - Stats */}
              <div className="flex gap-4 mt-2 md:mt-0">
                <div className="flex items-center gap-1 text-slate-400 text-sm">
                  <Eye className="h-4 w-4" /> {roadmap.stats.views}
                </div>
                <div className="flex items-center gap-1 text-slate-400 text-sm">
                  <Trophy className="h-4 w-4" /> {roadmap.stats.completions}
                </div>
                <div className="flex items-center gap-1 text-slate-400 text-sm">
                  <Star className="h-4 w-4" /> {roadmap.stats.averageRating.toFixed(1)}
                </div>
                <div className="flex items-center gap-1 text-slate-400 text-sm">
                  <Users className="h-4 w-4" /> {roadmap.stats.ratingsCount}
                </div>
              </div>
            </div>
          </Link>
        )
      })}
    </Card>
  )
}
