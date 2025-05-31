import type { RoadmapDetailsResponse } from "./roadmap-details";
import type { IRoadmap } from "./roadmap.types";
export interface IPaginationMeta {
  page: number;
  totalPages: number;
  totalItems: number;
}
export interface roadmapState{
    isLoading : boolean;
    roadmaps:IRoadmap[];
    roadmap:RoadmapDetailsResponse | null;
    paginationMeta : IPaginationMeta | null;

}