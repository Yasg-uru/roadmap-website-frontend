import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CircularProgress } from "./components/circular-progress"
import { BookmarkedResources } from "./components/bookmarked-resources"
import { CompletedSteps } from "./components/completed-steps"
import { RecentlyViewed } from "./components/recently-viewd"


export default function Dashboard() {
  return (
    <div className="min-h-screen bg-slate-900 text-white p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Progress Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-slate-800/50 border-slate-700 p-6 text-center">
            <CircularProgress percentage={45} current={18} total={40} />
            <h3 className="text-xl font-semibold mt-4 mb-4">Frontend Development</h3>
            <Button
              variant="outline"
              className="border-cyan-400 text-cyan-400 hover:bg-cyan-400 hover:text-slate-900 bg-transparent"
            >
              Resume
            </Button>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700 p-6 text-center">
            <CircularProgress percentage={75} current={30} total={40} />
            <h3 className="text-xl font-semibold mt-4 mb-4 text-white">Generative AI</h3>
            <Button
              variant="outline"
              className="border-cyan-400 text-cyan-400 hover:bg-cyan-400 hover:text-slate-900 bg-transparent"
            >
              Resume
            </Button>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700 p-6 text-center">
            <CircularProgress percentage={25} current={5} total={20} />
            <h3 className="text-xl font-semibold mt-4 mb-4">Web Development</h3>
            <Button
              variant="outline"
              className="border-cyan-400 text-cyan-400 hover:bg-cyan-400 hover:text-slate-900 bg-transparent"
            >
              Resume
            </Button>
          </Card>
        </div>

        {/* Bottom Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Bookmarked Resources */}
          <div className="lg:col-span-2">
            <BookmarkedResources />
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            <CompletedSteps />
            <RecentlyViewed />
          </div>
        </div>
      </div>
    </div>
  )
}
