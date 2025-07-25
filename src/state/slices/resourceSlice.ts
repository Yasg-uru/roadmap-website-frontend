import {createSlice, createAsyncThunk} from '@reduxjs/toolkit'; 
import type { PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';
import type {Resource} from '@/types/user/Resource/Resource'; 



interface ResourceState {
      resources: Resource[];
      loading : boolean; 
      error: string | null; 
}


const initialState: ResourceState = {
      resources: [], 
      loading: false, 
      error: null, 
};


export const fetchResources = createAsyncThunk(
      'resources/fetchResources', 
       async(_ , thunkAPI) => {
          try{
              const res = await axios.get('/api/resources'); 
              return res.data as Resource[]; 
          }  catch(err: any){
              return thunkAPI.rejectWithValue(err.response?.data || 'failed to fetch resources'); 
          }
       }
); 



const resourceSlice = createSlice({
      name: 'resources', 
      initialState, 
      reducers: {}, 
      extraReducers: (builder) => {
          builder 

           .addCase(fetchResources.pending, (state) =>{
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
           }); 
      }, 
}); 


export default resourceSlice.reducer; 

