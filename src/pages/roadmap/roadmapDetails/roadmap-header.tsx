// components/RoadmapHeader.tsx
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Bookmark, Share2 } from 'lucide-react';
import type { RoadmapDetails } from '@/types/user/roadmap/roadmap-details';


interface RoadmapHeaderProps {
  roadmap: RoadmapDetails;
}

const RoadmapHeader: React.FC<RoadmapHeaderProps> = ({ roadmap }) => {
  return (
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
  );
};

export default RoadmapHeader;