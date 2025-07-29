// types/progress.ts

export interface NodeProgress {
  node: string; // node ID
  status: "completed" | "in-progress" | "not-started";
  startedAt?: string;
  completedAt?: string;
  resources: any[];
}

export interface UserProgress {
  _id: string;
  user: string;
  roadmap: string;
  nodes: NodeProgress[];
  createdAt: string;
  updatedAt: string;
}
