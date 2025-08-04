import { useEffect } from "react"
import { useSelector, useDispatch } from "react-redux"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowRight } from "lucide-react"
import type { RootState, AppDispatch } from "@/state/store"

import {
  fetchAllAnalytics,
  fetchAnalyticsByDate,
  deleteAnalytics,
} from "@/state/slices/analyticsSlice"
import { fetchBookmarks } from "@/state/slices/bookmarkSlice"
import { fetchUserProgress } from "@/state/slices/userProgressSlice"

interface ProgressCircleProps {
  percentage: number
  current: number
  total: number
  title: string
}

function ProgressCircle({ percentage, current, total, title }: ProgressCircleProps) {
  const circumference = 2 * Math.PI * 45
  const strokeDasharray = circumference
  const strokeDashoffset = circumference - (percentage / 100) * circumference

  return (
    <Card className="bg-slate-900/50 border-slate-700/50 p-6">
      <div className="flex flex-col items-center space-y-4">
        <div className="relative w-32 h-32">
          <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="45" stroke="rgb(30 41 59)" strokeWidth="8" fill="none" />
            <circle
              cx="50"
              cy="50"
              r="45"
              stroke="rgb(6 182 212)"
              strokeWidth="8"
              fill="none"
              strokeDasharray={strokeDasharray}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="transition-all duration-300 ease-in-out"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-bold text-white">{percentage}%</span>
            <span className="text-sm text-slate-400">{current} / {total}</span>
          </div>
        </div>
        <h3 className="text-lg font-semibold text-white text-center">{title}</h3>
        <Button variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-800 bg-transparent">
          Resume
        </Button>
      </div>
    </Card>
  )
}

export default function CombinedAnalytics() {
  const dispatch = useDispatch<AppDispatch>()

  const { analyticsList, selectedAnalytics, isLoading, error } = useSelector((state: RootState) => state.analytics)
  const bookmarkedResources = useSelector((state: RootState) => state.bookmark.bookmarks)
  const currentUser = useSelector((state: RootState) => state.auth.user)
  const { progress, loading: progressLoading, error: progressError } = useSelector((state: RootState) => state.userProgress)

  // Initial data fetch
  useEffect(() => {
    dispatch(fetchAllAnalytics())
    if (currentUser?._id) {
      dispatch(fetchBookmarks(currentUser._id))
    }
  }, [dispatch, currentUser?._id])

  // Fetch user progress based on top viewed roadmap
  useEffect(() => {
    if (!currentUser?._id) return

    const roadmapId =
      selectedAnalytics?.roadmaps?.topViewed?.[0]?.roadmap ||
      analyticsList?.[0]?.roadmaps?.topViewed?.[0]?.roadmap

    if (roadmapId) {
      dispatch(fetchUserProgress({ userId: currentUser._id, roadmapId }))
    }
  }, [dispatch, currentUser?._id, selectedAnalytics, analyticsList])

  const handleFetchByDate = (date: string) => dispatch(fetchAnalyticsByDate(date))
  const handleDelete = (date: string) => dispatch(deleteAnalytics(date))

 
   const filteredAnalytics = [...analyticsList].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
   )


  const progressData = progress
    ? [
        {
          title: "Roadmap Progress",
          current: progress.nodes.filter((n) => n.status === "completed").length,
          total: progress.nodes.length,
          percentage:
            progress.nodes.length > 0
              ? Math.round(
                  (progress.nodes.filter((n) => n.status === "completed").length / progress.nodes.length) *
                    100
                )
              : 0,
        },
      ]
    : []

  return (
    <div className="min-h-screen bg-slate-950 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Progress Circles */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {progressLoading && <p className="text-white">Loading progress...</p>}
          {progressError && <p className="text-red-500">Error loading progress: {progressError}</p>}
          {progressData.length === 0 && !progressLoading && (
            <p className="text-slate-400">No progress data available.</p>
          )}
          {progressData.map((data, idx) => <ProgressCircle key={idx} {...data} />)}
        </div>

        {/* Bookmarked Roadmaps */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 bg-slate-900/50 border-slate-700/50">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-white">Bookmarked Roadmaps</CardTitle>
            </CardHeader>
            <CardContent>
              {bookmarkedResources.length === 0 ? (
                <p className="text-slate-400 text-sm">No bookmarks found.</p>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-4 gap-4 text-sm font-medium text-slate-400 border-b border-slate-700 pb-2">
                    <span>Favorite</span>
                    <span>Roadmap</span>
                    <span>Tags</span>
                    <span>Note</span>
                  </div>
                  {bookmarkedResources.map((bookmark: any, idx: number) => (
                    <div key={idx} className="grid grid-cols-4 gap-4 items-center py-2">
                      <Badge
                        className={`w-fit ${bookmark.isFavorite ? "bg-yellow-500 text-black" : "bg-slate-700 text-white"}`}
                      >
                        {bookmark.isFavorite ? "★" : "–"}
                      </Badge>
                      <div className="text-white font-medium">
                        {/* {bookmark.roadmap?.title || "Roadmap not found"} */}
                         {bookmark.roadmap ? typeof bookmark.roadmap === "string" ? bookmark.roadmap : bookmark.roadmap.title || "roadmap unknown" : "roadmap unknown"}
                        
                         </div>
                      <div className="text-slate-300 text-sm">{(bookmark.tags || []).join(", ") || "—"}</div>
                      <div className="text-slate-400 text-sm italic truncate">{bookmark.notes || "No notes"}</div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recently Viewed Placeholder */}
          <div className="space-y-6">
            <Card className="bg-slate-900/50 border-slate-700/50">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-white">Recently Viewed</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-3">
                  <ArrowRight className="text-cyan-400 w-5 h-5" />
                  <div>
                    <div className="text-white font-medium">Supervised Learning</div>
                    <div className="text-slate-400 text-sm">Machine Learning</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Analytics Records */}
        <Card className="bg-slate-900/50 border-slate-700/50">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-white">Analytics Records</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading && <p className="text-slate-400">Loading analytics...</p>}
            {error && <p className="text-red-500">Error: {error}</p>}
            {filteredAnalytics.length === 0 && <p className="text-slate-400">No analytics data found.</p>}
            <div className="space-y-4">
              {filteredAnalytics.map((item: any) => (
                <div key={item.date} className="border border-slate-700 p-4 rounded-md">
                  <p className="text-white"><strong>Date:</strong> {item.date}</p>
                  <p className="text-slate-400">Users: {item.users.total}</p>
                  <p className="text-slate-400">Roadmaps Views: {item.roadmaps.views}</p>
                  <p className="text-slate-400">Resource Clicks: {item.resources.clicks}</p>
                  <div className="space-x-2 mt-2">
                    <Button onClick={() => handleFetchByDate(item.date)}>View Details</Button>
                    <Button variant="destructive" onClick={() => handleDelete(item.date)}>Delete</Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Selected Analytics */}
        {selectedAnalytics && (
          <Card className="bg-slate-900/50 border-slate-700/50">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-white">Selected Analytics: {selectedAnalytics.date}</CardTitle>
            </CardHeader>
            <CardContent className="text-slate-300 space-y-4 text-sm">
              {/* Users */}
              <div>
                <h3 className="text-white font-semibold">👥 Users</h3>
                <ul>
                  <li>Total: {selectedAnalytics.users.total}</li>
                  <li>New: {selectedAnalytics.users.new}</li>
                  <li>Active: {selectedAnalytics.users.active}</li>
                </ul>
              </div>
              {/* Roadmaps */}
              <div>
                <h3 className="text-white font-semibold">📈 Roadmaps</h3>
                <ul>
                  {selectedAnalytics.roadmaps.topViewed.map((r: any) => (
                    <li key={r.roadmap}>{r.roadmap} – {r.views} views</li>
                  ))}
                  {selectedAnalytics.roadmaps.topCompleted.map((r: any) => (
                    <li key={r.roadmap}>{r.roadmap} – {r.completions} completions</li>
                  ))}
                </ul>
              </div>
              {/* Resources */}
              <div>
                <h3 className="text-white font-semibold">📚 Resources</h3>
                <ul>
                  {selectedAnalytics.resources.topClicked.map((r: any) => (
                    <li key={r.resource}>{r.resource} – {r.clicks} clicks</li>
                  ))}
                </ul>
              </div>
              {/* Devices */}
              <div>
                <h3 className="text-white font-semibold">💻 Devices</h3>
                <ul>
                  <li>Desktop: {selectedAnalytics.devices.desktop}%</li>
                  <li>Mobile: {selectedAnalytics.devices.mobile}%</li>
                  <li>Tablet: {selectedAnalytics.devices.tablet}%</li>
                </ul>
              </div>
              {/* Locations */}
              <div>
                <h3 className="text-white font-semibold">🌍 Locations</h3>
                <ul>
                  {(selectedAnalytics.locations || []).map((loc: any, i: number) => (
                    <li key={i}>{loc.country || "Unknown"} – {loc.users} users</li>
                  ))}
                </ul>
              </div>
              {/* Referrers */}
              <div>
                <h3 className="text-white font-semibold">🔗 Referrers</h3>
                <ul>
                  {(selectedAnalytics.referrers || []).map((ref: any, i: number) => (
                    <li key={i}>{ref.source || "Direct"} – {ref.count}</li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}





