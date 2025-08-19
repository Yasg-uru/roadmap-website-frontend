import { Card } from "@/components/ui/card"
import { ArrowRight } from "lucide-react"

export function RecentlyViewed() {
  return (
    <Card className="bg-slate-800/50 border-slate-700 p-6">
      <h2 className="text-xl font-semibold mb-6">Recently Viewed</h2>

      <div className="flex items-center gap-3">
        <ArrowRight className="w-4 h-4 text-cyan-400" />
        <div>
          <div className="font-medium">Supervised Learning</div>
          <div className="text-sm text-slate-400">Machine Learning</div>
        </div>
      </div>
    </Card>
  )
}
