import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import api from '@/lib/api';

// ===========================
// Types
// ===========================

export type GlobalFoodCategory = 'BREAKFAST' | 'LUNCH' | 'DINNER' | 'SNACK';

export interface GlobalFood {
  id: string;
  name: string;
  description?: string | null;
  category: GlobalFoodCategory;
  calories: number;
  proteinGrams: number;
  carbsGrams: number;
  fatGrams: number;
  imageUrl: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface FoodLogItem {
  id: string;
  date: string; // ISO date (yyyy-mm-dd)
  quantity: number;
  // Flattened preview fields from related food (optional for future use)
  globalFood?: GlobalFood | null;
}

interface FoodState {
  globalFoods: GlobalFood[];
  loadingGlobal: boolean;
  globalError: string | null;
}

const initialState: FoodState = {
  globalFoods: [],
  loadingGlobal: false,
  globalError: null,
};

// ===========================
// Thunks
// ===========================

// Fetch public global foods from backend: GET /api/food/global
export const fetchGlobalFoods = createAsyncThunk<
  GlobalFood[],
  void,
  { rejectValue: string }
>('food/fetchGlobalFoods', async (_arg, { rejectWithValue }) => {
  try {
    const response = await api.get('/food/global');
    // Backend shape: { success: true, data: GlobalFood[] }
    const data = response.data?.data ?? [];
    return data as GlobalFood[];
  } catch (error: any) {
    const message =
      error?.response?.data?.message ||
      error?.message ||
      'Failed to load foods';
    return rejectWithValue(message);
  }
});

// ===========================
// Slice
// ===========================

const foodSlice = createSlice({
  name: 'food',
  initialState,
  reducers: {
    setGlobalFoods: (state, action: PayloadAction<GlobalFood[]>) => {
      state.globalFoods = action.payload;
      state.globalError = null;
    },
    clearFoodErrors: (state) => {
      state.globalError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchGlobalFoods.pending, (state) => {
        state.loadingGlobal = true;
        state.globalError = null;
      })
      .addCase(fetchGlobalFoods.fulfilled, (state, action) => {
        state.loadingGlobal = false;
        state.globalFoods = action.payload;
      })
      .addCase(fetchGlobalFoods.rejected, (state, action) => {
        state.loadingGlobal = false;
        state.globalError = action.payload || 'Failed to load foods';
      });
  },
});

export const { setGlobalFoods, clearFoodErrors } = foodSlice.actions;

export default foodSlice.reducer;


