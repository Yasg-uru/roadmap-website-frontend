import { Card } from "@/components/ui/card"

const resources = [
  {
    type: "Article",
    title: "Semantic HTML",
    source: "web.dev",
    topic: "HTML",
    category: "Web dev",
    color: "bg-yellow-500",
  },
  {
    type: "Video",
    title: "Intro to Neural Networks",
    source: "youtube.com",
    topic: "Deep Learning",
    category: "deep + learning",
    color: "bg-purple-500",
  },
  {
    type: "Video",
    title: "Responsive Design",
    source: "freecodecamp.org",
    topic: "CSS",
    category: "Responsive Design",
    color: "bg-blue-500",
  },
  {
    type: "Article",
    title: "Forms",
    source: "developer.mozilla.org",
    topic: "HTML",
    category: "Forms",
    color: "bg-purple-500",
  },
]

export function BookmarkedResources() {
  return (
    <Card className="bg-slate-800/50 border-slate-700 p-6">
      <h2 className="text-xl font-semibold mb-6">Bookmarked Resources</h2>

      {/* Header */}
      <div className="grid grid-cols-12 gap-4 text-sm text-slate-400 mb-4 px-2">
        <div className="col-span-1"></div>
        <div className="col-span-5">Resource</div>
        <div className="col-span-6 text-right">Topic</div>
      </div>

      {/* Resources */}
      <div className="space-y-3">
        {resources.map((resource, index) => (
          <div key={index} className="grid grid-cols-12 gap-4 items-center py-2 hover:bg-slate-700/30 rounded-lg px-2">
            <div className="col-span-1">
              <span className={`${resource.color} text-xs px-2 py-1 rounded text-white font-medium`}>
                {resource.type}
              </span>
            </div>
            <div className="col-span-5">
              <div className="font-medium">{resource.title}</div>
              <div className="text-sm text-slate-400">{resource.source}</div>
            </div>
            <div className="col-span-6 text-right">
              <div className="font-medium">{resource.topic}</div>
              <div className="text-sm text-slate-400">{resource.category}</div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}
