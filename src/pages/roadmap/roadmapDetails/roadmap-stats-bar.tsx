// components/RoadmapStatsBar.tsx
import React from 'react';
import { Star, Users, Eye, Clock } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import type { RoadmapDetails } from '@/types/user/roadmap/roadmap-details';


interface RoadmapStatsBarProps {
  roadmap: RoadmapDetails;
}

const RoadmapStatsBar: React.FC<RoadmapStatsBarProps> = ({ roadmap }) => {
  return (
    <div className="bg-white border-b">
      <div className="max-w-7xl mx-auto px-6 py-3">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-yellow-500" />
              <span className="font-medium">
                {roadmap.stats?.averageRating?.toFixed(1) || '4.5'}
                <span className="text-muted-foreground text-sm ml-1">({roadmap.stats?.ratingsCount || 0} reviews)</span>
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-500" />
              <span className="font-medium">{roadmap.stats?.completions || 0} completions</span>
            </div>
            
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-purple-500" />
              <span className="font-medium">{roadmap.stats?.views || 0} views</span>
            </div>
            
            {roadmap.estimatedDuration && (
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-green-500" />
                <span className="font-medium">
                  {roadmap.estimatedDuration.value} {roadmap.estimatedDuration.unit}
                </span>
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            {roadmap.isCommunityContributed && roadmap.contributor && (
              <div className="flex items-center gap-2">
                <Avatar className="h-6 w-6">
                  <AvatarImage src={roadmap.contributor.avatar} />
                  <AvatarFallback>{roadmap.contributor.username.charAt(0)}</AvatarFallback>
                </Avatar>
                <span className="text-sm">Contributed by {roadmap.contributor.username}</span>
              </div>
            )}
            {roadmap.isFeatured && (
              <Badge variant="default" className="bg-yellow-100 text-yellow-800">
                <Star className="w-3 h-3 mr-1" /> Featured
              </Badge>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoadmapStatsBar;