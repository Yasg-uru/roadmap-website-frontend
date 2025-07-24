export interface Bookmark {
      _id: string; 
      user: string; 
      roadmap: string; 
      tags?: string[]; 
      notes?: string;  
      isFavorite: boolean; 
      createdAt: string; 
      updatedAt: string; 
}



