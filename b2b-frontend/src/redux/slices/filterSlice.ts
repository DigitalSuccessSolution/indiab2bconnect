import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface FilterState {
  isDrawerOpen: boolean;
  priceRange: {
    min: number;
    max: number;
  };
  sort: string;
  ratings: number[];
  verification: {
    verified: boolean;
    trustSeal: boolean;
    gst: boolean;
  };
  query: string;
  city: string;
  category: {
    id: string | null;
    name: string | null;
  };
}

const initialState: FilterState = {
  isDrawerOpen: false,
  priceRange: {
    min: 0,
    max: 100000,
  },
  sort: "Popularity",
  ratings: [],
  verification: {
    verified: false,
    trustSeal: false,
    gst: false,
  },
  query: "",
  city: "",
  category: {
    id: null,
    name: null,
  },
};

const filterSlice = createSlice({
  name: "filter",
  initialState,
  reducers: {
    toggleDrawer: (state, action: PayloadAction<boolean>) => {
      state.isDrawerOpen = action.payload;
    },
    setPriceRange: (state, action: PayloadAction<{ min: number; max: number }>) => {
      state.priceRange = action.payload;
    },
    setSort: (state, action: PayloadAction<string>) => {
      state.sort = action.payload;
    },
    toggleRating: (state, action: PayloadAction<number>) => {
      const index = state.ratings.indexOf(action.payload);
      if (index === -1) {
        state.ratings.push(action.payload);
      } else {
        state.ratings.splice(index, 1);
      }
    },
    toggleVerification: (state, action: PayloadAction<keyof FilterState["verification"]>) => {
      state.verification[action.payload] = !state.verification[action.payload];
    },
    resetFilters: (state) => {
      state.priceRange = initialState.priceRange;
      state.sort = initialState.sort;
      state.ratings = initialState.ratings;
      state.verification = initialState.verification;
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.query = action.payload;
    },
    setCity: (state, action: PayloadAction<string>) => {
      state.city = action.payload;
    },
    setCategory: (state, action: PayloadAction<{ id: string | null; name: string | null }>) => {
      state.category = action.payload;
    },
  },
});

export const {
  toggleDrawer,
  setPriceRange,
  setSort,
  toggleRating,
  toggleVerification,
  resetFilters,
  setSearchQuery,
  setCity,
  setCategory,
} = filterSlice.actions;

export default filterSlice.reducer;
