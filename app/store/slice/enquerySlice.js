import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    data: null,
}

const enquerySlice = createSlice({
    name: "enquery",
    initialState: initialState,
    reducers: {
        setEnqueryData: (state, action) => {
            state.data = action.payload;
        },
        clearEnqueryData: (state) => {
            state.data = null;
        }
    }
})

export const { setEnqueryData, clearEnqueryData } = enquerySlice.actions;

export default enquerySlice.reducer;


