import {createSlice, createAsyncThunk} from '@reduxjs/toolkit'; 
import type { PayloadAction } from '@reduxjs/toolkit';
import axiosInstance from '@/helper/axiosInstance';
import type {Resource} from '@/types/user/Resource/Resource'; 



interface ResourceState {
      resources: Resource[];
      resource: Resource | null;
      loading : boolean; 
      error: string | null; 
}


const initialState: ResourceState = {
      resources: [], 
      resource: null,
      loading: false, 
      error: null, 
};


export const fetchResources = createAsyncThunk(
        'resources/fetchResources', 
         async(_ , thunkAPI) => {
           try{
              const res = await axiosInstance.get('/api/resources'); 
              return res.data as Resource[]; 
           }  catch(err: any){
              return thunkAPI.rejectWithValue(err.response?.data || 'failed to fetch resources'); 
           }
         }
);
// Get single resource
export const fetchResourceById = createAsyncThunk(
   'resources/fetchResourceById',
   async (id: string, thunkAPI) => {
      try {
         const res = await axiosInstance.get(`/api/resources/${id}`);
         return res.data as Resource;
      } catch (err: any) {
         return thunkAPI.rejectWithValue(err.response?.data || 'failed to fetch resource');
      }
   }
);

// Create resource
export const createResource = createAsyncThunk(
   'resources/createResource',
   async (resource: Partial<Resource>, thunkAPI) => {
      try {
         const res = await axiosInstance.post('/api/resources', resource, { withCredentials: true });
         return res.data.data as Resource;
      } catch (err: any) {
         return thunkAPI.rejectWithValue(err.response?.data || 'failed to create resource');
      }
   }
);

// Update resource
export const updateResource = createAsyncThunk(
   'resources/updateResource',
   async ({ id, updates }: { id: string; updates: Partial<Resource> }, thunkAPI) => {
      try {
         const res = await axiosInstance.patch(`/api/resources/${id}`, updates, { withCredentials: true });
         return res.data.data as Resource;
      } catch (err: any) {
         return thunkAPI.rejectWithValue(err.response?.data || 'failed to update resource');
      }
   }
);

// Delete resource
export const deleteResource = createAsyncThunk(
   'resources/deleteResource',
   async (id: string, thunkAPI) => {
      try {
         await axiosInstance.delete(`/api/resources/${id}`, { withCredentials: true });
         return id;
      } catch (err: any) {
         return thunkAPI.rejectWithValue(err.response?.data || 'failed to delete resource');
      }
   }
);

// Upvote resource
export const upvoteResource = createAsyncThunk(
   'resources/upvoteResource',
   async ({ resourceId, userId }: { resourceId: string; userId: string }, thunkAPI) => {
      try {
         const res = await axiosInstance.patch(`/api/resources/${resourceId}/upvote`, { userId }, { withCredentials: true });
         return res.data.data as Resource;
      } catch (err: any) {
         return thunkAPI.rejectWithValue(err.response?.data || 'failed to upvote resource');
      }
   }
);

// Downvote resource
export const downvoteResource = createAsyncThunk(
   'resources/downvoteResource',
   async ({ resourceId, userId }: { resourceId: string; userId: string }, thunkAPI) => {
      try {
         const res = await axiosInstance.patch(`/api/resources/${resourceId}/downvote`, { userId }, { withCredentials: true });
         return res.data.data as Resource;
      } catch (err: any) {
         return thunkAPI.rejectWithValue(err.response?.data || 'failed to downvote resource');
      }
   }
);




const resourceSlice = createSlice({
      name: 'resources', 
      initialState, 
      reducers: {}, 
         extraReducers: (builder) => {
            builder
               // Fetch all resources
               .addCase(fetchResources.pending, (state) => {
                  state.loading = true;
                  state.error = null;
               })
               .addCase(fetchResources.fulfilled, (state, action: PayloadAction<Resource[]>) => {
                  state.loading = false;
                  state.resources = action.payload;
               })
               .addCase(fetchResources.rejected, (state, action) => {
                  state.loading = false;
                  state.error = action.payload as string;
               })

               // Fetch single resource
               .addCase(fetchResourceById.pending, (state) => {
                  state.loading = true;
                  state.error = null;
                  state.resource = null;
               })
               .addCase(fetchResourceById.fulfilled, (state, action: PayloadAction<Resource>) => {
                  state.loading = false;
                  state.resource = action.payload;
               })
               .addCase(fetchResourceById.rejected, (state, action) => {
                  state.loading = false;
                  state.error = action.payload as string;
                  state.resource = null;
               })

               // Create resource
               .addCase(createResource.pending, (state) => {
                  state.loading = true;
                  state.error = null;
               })
               .addCase(createResource.fulfilled, (state, action: PayloadAction<Resource>) => {
                  state.loading = false;
                  state.resources.push(action.payload);
               })
               .addCase(createResource.rejected, (state, action) => {
                  state.loading = false;
                  state.error = action.payload as string;
               })

               // Update resource
               .addCase(updateResource.pending, (state) => {
                  state.loading = true;
                  state.error = null;
               })
               .addCase(updateResource.fulfilled, (state, action: PayloadAction<Resource>) => {
                  state.loading = false;
                  state.resources = state.resources.map(r => r._id === action.payload._id ? action.payload : r);
               })
               .addCase(updateResource.rejected, (state, action) => {
                  state.loading = false;
                  state.error = action.payload as string;
               })

               // Delete resource
               .addCase(deleteResource.pending, (state) => {
                  state.loading = true;
                  state.error = null;
               })
               .addCase(deleteResource.fulfilled, (state, action: PayloadAction<string>) => {
                  state.loading = false;
                  state.resources = state.resources.filter(r => r._id !== action.payload);
               })
               .addCase(deleteResource.rejected, (state, action) => {
                  state.loading = false;
                  state.error = action.payload as string;
               })

               // Upvote resource
               .addCase(upvoteResource.pending, (state) => {
                  state.loading = true;
                  state.error = null;
               })
               .addCase(upvoteResource.fulfilled, (state, action: PayloadAction<Resource>) => {
                  state.loading = false;
                  state.resources = state.resources.map(r => r._id === action.payload._id ? action.payload : r);
               })
               .addCase(upvoteResource.rejected, (state, action) => {
                  state.loading = false;
                  state.error = action.payload as string;
               })

               // Downvote resource
               .addCase(downvoteResource.pending, (state) => {
                  state.loading = true;
                  state.error = null;
               })
               .addCase(downvoteResource.fulfilled, (state, action: PayloadAction<Resource>) => {
                  state.loading = false;
                  state.resources = state.resources.map(r => r._id === action.payload._id ? action.payload : r);
               })
               .addCase(downvoteResource.rejected, (state, action) => {
                  state.loading = false;
                  state.error = action.payload as string;
               });
         },
}); 


export default resourceSlice.reducer; 

