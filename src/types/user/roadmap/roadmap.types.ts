export interface IRoadmap {
  _id: string;
  title: string;
  slug?: string;
  description: string;
  longDescription?: string;
  category:
    | 'frontend'
    | 'backend'
    | 'devops'
    | 'mobile'
    | 'data-science'
    | 'design'
    | 'product-management'
    | 'cybersecurity'
    | 'cloud'
    | 'blockchain'
    | 'other';
  difficulty?: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  estimatedDuration?: {
    value: number;
    unit: 'hours' | 'days' | 'weeks' | 'months';
  };
  coverImage?: {
    public_id: string;
    url: string;
  };
  isFeatured?: boolean;
  isCommunityContributed?: boolean;
  contributor?: {
    _id: string;
    username: string;
    avatar?: string;
  };
  tags?: string[];
  prerequisites?: string[]; // Array of Roadmap IDs
  stats?: {
    views: number;
    completions: number;
    averageRating: number;
    ratingsCount: number;
  };
  version?: number;
  isPublished?: boolean;
  publishedAt?: string | Date;
  lastUpdated?: string | Date;
  createdAt?: string | Date;
  updatedAt?: string | Date;
  updatedBy?: string;

  // Optional virtuals
  nodes?: any[]; // optionally type this if you know the structure
  reviews?: any[];
}
