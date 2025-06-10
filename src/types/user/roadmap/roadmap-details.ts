

export interface ResourceResponse {
  _id: string;
  title: string;
  description?: string;
  url: string;
  resourceType: string;
  contentType?: string;
  difficulty?: string;
  stats?: {
    views?: number;
    clicks?: number;
    rating?: number;
  };
  thumbnail?: {
    url?: string;
  };
}

export interface NodeDetails {
  _id: string;
  title: string;
  description?: string;
  depth: number;
  position: number;
  nodeType?: string;
  isOptional?: boolean;
  estimatedDuration?: {
    value: number;
    unit: string;
  };
  resources?: ResourceResponse[];
  dependencies?: Array<{ _id: string; title: string }>;
  prerequisites?: Array<{ _id: string; title: string }>;
  metadata?: {
    difficulty?: string;
    importance?: string;
  };
  children?: NodeDetails[];
}

export interface ReviewResponse {
  _id: string;
  user: {
    _id: string;
    username: string;
    avatar?: string;
  };
  rating: number;
  title?: string;
  review: string;
  pros?: string[];
  cons?: string[];
  isVerified: boolean;
  createdAt: string;
}

export interface RoadmapDetails {
  _id: string;
  title: string;
  slug: string;
  description: string;
  longDescription?: string;
  category: string;
  difficulty?: string;
  estimatedDuration?: {
    value: number;
    unit: string;
  };
  coverImage?: {
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
  prerequisites?: Array<{
    _id: string;
    title: string;
    slug: string;
  }>;
  stats?: {
    views: number;
    completions: number;
    averageRating: number;
    ratingsCount: number;
  };
  reviews?: ReviewResponse[];
  version?: number;
  isPublished?: boolean;
  publishedAt?: string;
  createdAt?: string;
}

export interface RoadmapDetailsResponse {
  roadmap: RoadmapDetails;
  roadmapNodes: NodeDetails[];
}
