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

export interface ScannedFood {
  id: string;
  userId: string;
  foodName: string;
  calories: number;
  proteinGrams: number;
  fatGrams: number;
  carbsGrams: number;
  notes: string | null;
  source: string;
  createdAt: string;
}

export interface FoodLogItem {
  id: string;
  userId: string;
  date: string; // ISO date (yyyy-mm-dd)
  quantity: number;
  globalFoodId: string | null;
  scannedFoodId: string | null;
  createdAt: string;
  globalFood: GlobalFood | null;
  scannedFood: ScannedFood | null;
}

export interface FoodLogTotals {
  totalCalories: number;
  totalProtein: number;
  totalFat: number;
  totalCarbs: number;
}

export interface GetFoodLogsResponse {
  foodLogs: FoodLogItem[];
  totals?: FoodLogTotals;
}

// Payloads for API calls
export interface CreateScannedFoodPayload {
  foodName: string;
  calories: number;
  proteinGrams: number;
  fatGrams: number;
  carbsGrams: number;
  notes?: string | null;
}

export interface CreateFoodLogPayload {
  date: string; // yyyy-mm-dd
  globalFoodId?: string | null;
  scannedFoodId?: string | null;
  quantity?: number;
}

export interface UpdateFoodLogPayload {
  quantity?: number;
  date?: string;
}

interface FoodState {
  globalFoods: GlobalFood[];
  loadingGlobal: boolean;
  globalError: string | null;

  foodLogs: FoodLogItem[];
  foodLogTotals: FoodLogTotals | null;
  selectedLogDate: string | null; // date for which foodLogs were fetched
  loadingLogs: boolean;
  logsError: string | null;

  scannedFoods: ScannedFood[];
  loadingScanned: boolean;
  scannedError: string | null;

  actionLoading: boolean; // create/update/delete in progress
  actionError: string | null;
}

const initialTotals: FoodLogTotals = {
  totalCalories: 0,
  totalProtein: 0,
  totalFat: 0,
  totalCarbs: 0,
};

const initialState: FoodState = {
  globalFoods: [],
  loadingGlobal: false,
  globalError: null,

  foodLogs: [],
  foodLogTotals: null,
  selectedLogDate: null,
  loadingLogs: false,
  logsError: null,

  scannedFoods: [],
  loadingScanned: false,
  scannedError: null,

  actionLoading: false,
  actionError: null,
};

// ===========================
// Thunks
// ===========================

// GET /food/global
export const fetchGlobalFoods = createAsyncThunk<
  GlobalFood[],
  void,
  { rejectValue: string }
>('food/fetchGlobalFoods', async (_arg, { rejectWithValue }) => {
  try {
    const response = await api.get('/food/global');
    const data = response.data?.data ?? [];
    return data as GlobalFood[];
  } catch (error: any) {
    const message =
      error?.response?.data?.message ||
      error?.response?.data?.error ||
      error?.message ||
      'Failed to load foods';
    return rejectWithValue(message);
  }
});

// GET /food/scanned
export const fetchScannedFoods = createAsyncThunk<
  ScannedFood[],
  void,
  { rejectValue: string }
>('food/fetchScannedFoods', async (_arg, { rejectWithValue }) => {
  try {
    const response = await api.get('/food/scanned');
    const data = response.data?.data ?? [];
    return data as ScannedFood[];
  } catch (error: any) {
    const message =
      error?.response?.data?.message ||
      error?.response?.data?.error ||
      error?.message ||
      'Failed to load scanned foods';
    return rejectWithValue(message);
  }
});

// POST /food/scanned
export const createScannedFood = createAsyncThunk<
  ScannedFood,
  CreateScannedFoodPayload,
  { rejectValue: string }
>('food/createScannedFood', async (payload, { rejectWithValue }) => {
  try {
    const response = await api.post('/food/scanned', payload);
    const data = response.data?.data;
    if (!data) throw new Error('No data returned');
    return data as ScannedFood;
  } catch (error: any) {
    const message =
      error?.response?.data?.message ||
      error?.response?.data?.error ||
      error?.message ||
      'Failed to save scanned food';
    return rejectWithValue(message);
  }
});

// POST /food/log
export const createFoodLog = createAsyncThunk<
  FoodLogItem,
  CreateFoodLogPayload,
  { rejectValue: string }
>('food/createFoodLog', async (payload, { rejectWithValue }) => {
  try {
    const body: Record<string, unknown> = {
      date: payload.date,
      quantity: payload.quantity ?? 1,
    };
    if (payload.globalFoodId) body.globalFoodId = payload.globalFoodId;
    if (payload.scannedFoodId) body.scannedFoodId = payload.scannedFoodId;

    const response = await api.post('/food/log', body);
    const data = response.data?.data;
    if (!data) throw new Error('No data returned');
    return data as FoodLogItem;
  } catch (error: any) {
    const message =
      error?.response?.data?.message ||
      error?.response?.data?.error ||
      error?.message ||
      'Failed to add food to log';
    return rejectWithValue(message);
  }
});

// GET /food/log?date=yyyy-mm-dd
export const getFoodLogs = createAsyncThunk<
  GetFoodLogsResponse,
  string,
  { rejectValue: string }
>('food/getFoodLogs', async (date, { rejectWithValue }) => {
  try {
    const response = await api.get('/food/log', { params: { date } });
    const data = response.data?.data ?? response.data;
    const foodLogs = (data?.foodLogs ?? data ?? []) as FoodLogItem[];
    const totals = data?.totals ?? null;
    return { foodLogs, totals: totals as FoodLogTotals | undefined };
  } catch (error: any) {
    const message =
      error?.response?.data?.message ||
      error?.response?.data?.error ||
      error?.message ||
      'Failed to load food log';
    return rejectWithValue(message);
  }
});

// PATCH /food/log/:id
export const updateFoodLog = createAsyncThunk<
  FoodLogItem,
  { id: string; payload: UpdateFoodLogPayload },
  { rejectValue: string }
>('food/updateFoodLog', async ({ id, payload }, { rejectWithValue }) => {
  try {
    const response = await api.patch(`/food/log/${id}`, payload);
    const data = response.data?.data;
    if (!data) throw new Error('No data returned');
    return data as FoodLogItem;
  } catch (error: any) {
    const message =
      error?.response?.data?.message ||
      error?.response?.data?.error ||
      error?.message ||
      'Failed to update food log';
    return rejectWithValue(message);
  }
});

// DELETE /food/log/:id
export const deleteFoodLog = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>('food/deleteFoodLog', async (id, { rejectWithValue }) => {
  try {
    await api.delete(`/food/log/${id}`);
    return id;
  } catch (error: any) {
    const message =
      error?.response?.data?.message ||
      error?.response?.data?.error ||
      error?.message ||
      'Failed to remove from log';
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
      state.logsError = null;
      state.scannedError = null;
      state.actionError = null;
    },
    setSelectedLogDate: (state, action: PayloadAction<string | null>) => {
      state.selectedLogDate = action.payload;
    },
  },
  extraReducers: (builder) => {
    // fetchGlobalFoods
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

    // fetchScannedFoods
    builder
      .addCase(fetchScannedFoods.pending, (state) => {
        state.loadingScanned = true;
        state.scannedError = null;
      })
      .addCase(fetchScannedFoods.fulfilled, (state, action) => {
        state.loadingScanned = false;
        state.scannedFoods = action.payload;
      })
      .addCase(fetchScannedFoods.rejected, (state, action) => {
        state.loadingScanned = false;
        state.scannedError = action.payload || 'Failed to load scanned foods';
      });

    // createScannedFood
    builder
      .addCase(createScannedFood.pending, (state) => {
        state.actionLoading = true;
        state.actionError = null;
      })
      .addCase(createScannedFood.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.scannedFoods = [action.payload, ...state.scannedFoods];
      })
      .addCase(createScannedFood.rejected, (state, action) => {
        state.actionLoading = false;
        state.actionError = action.payload || 'Failed to save scanned food';
      });

    // createFoodLog
    builder
      .addCase(createFoodLog.pending, (state) => {
        state.actionLoading = true;
        state.actionError = null;
      })
      .addCase(createFoodLog.fulfilled, (state, action) => {
        state.actionLoading = false;
        if (state.selectedLogDate === action.payload.date) {
          state.foodLogs = [action.payload, ...state.foodLogs];
          const food = action.payload.globalFood || action.payload.scannedFood;
          if (food && state.foodLogTotals) {
            const q = action.payload.quantity;
            state.foodLogTotals.totalCalories += food.calories * q;
            state.foodLogTotals.totalProtein += food.proteinGrams * q;
            state.foodLogTotals.totalFat += food.fatGrams * q;
            state.foodLogTotals.totalCarbs += food.carbsGrams * q;
          } else if (food) {
            const q = action.payload.quantity;
            state.foodLogTotals = {
              totalCalories: food.calories * q,
              totalProtein: food.proteinGrams * q,
              totalFat: food.fatGrams * q,
              totalCarbs: food.carbsGrams * q,
            };
          }
        }
      })
      .addCase(createFoodLog.rejected, (state, action) => {
        state.actionLoading = false;
        state.actionError = action.payload || 'Failed to add to log';
      });

    // getFoodLogs
    builder
      .addCase(getFoodLogs.pending, (state) => {
        state.loadingLogs = true;
        state.logsError = null;
      })
      .addCase(getFoodLogs.fulfilled, (state, action) => {
        state.loadingLogs = false;
        state.foodLogs = action.payload.foodLogs ?? [];
        state.foodLogTotals = action.payload.totals ?? null;
        state.selectedLogDate = action.meta.arg;
      })
      .addCase(getFoodLogs.rejected, (state, action) => {
        state.loadingLogs = false;
        state.logsError = action.payload || 'Failed to load food log';
      });

    // updateFoodLog
    builder
      .addCase(updateFoodLog.pending, (state) => {
        state.actionLoading = true;
        state.actionError = null;
      })
      .addCase(updateFoodLog.fulfilled, (state, action) => {
        state.actionLoading = false;
        const idx = state.foodLogs.findIndex((l) => l.id === action.payload.id);
        if (idx !== -1) {
          state.foodLogs[idx] = action.payload;
          if (state.foodLogTotals) {
            state.foodLogTotals = state.foodLogs.reduce(
              (acc, log) => {
                const food = log.globalFood || log.scannedFood;
                if (food) {
                  const q = log.quantity;
                  acc.totalCalories += food.calories * q;
                  acc.totalProtein += food.proteinGrams * q;
                  acc.totalFat += food.fatGrams * q;
                  acc.totalCarbs += food.carbsGrams * q;
                }
                return acc;
              },
              { ...initialTotals }
            );
          }
        }
      })
      .addCase(updateFoodLog.rejected, (state, action) => {
        state.actionLoading = false;
        state.actionError = action.payload || 'Failed to update log';
      });

    // deleteFoodLog
    builder
      .addCase(deleteFoodLog.pending, (state) => {
        state.actionLoading = true;
        state.actionError = null;
      })
      .addCase(deleteFoodLog.fulfilled, (state, action) => {
        state.actionLoading = false;
        const log = state.foodLogs.find((l) => l.id === action.payload);
        if (log) {
          state.foodLogs = state.foodLogs.filter((l) => l.id !== action.payload);
          if (state.foodLogTotals) {
            const food = log.globalFood || log.scannedFood;
            if (food) {
              const q = log.quantity;
              state.foodLogTotals.totalCalories -= food.calories * q;
              state.foodLogTotals.totalProtein -= food.proteinGrams * q;
              state.foodLogTotals.totalFat -= food.fatGrams * q;
              state.foodLogTotals.totalCarbs -= food.carbsGrams * q;
            }
          }
        }
      })
      .addCase(deleteFoodLog.rejected, (state, action) => {
        state.actionLoading = false;
        state.actionError = action.payload || 'Failed to remove from log';
      });
  },
});

export const { setGlobalFoods, clearFoodErrors, setSelectedLogDate } = foodSlice.actions;
export default foodSlice.reducer;
