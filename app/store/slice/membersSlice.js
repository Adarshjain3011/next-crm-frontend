import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    data: [],  // ✅ initialized to empty array
};

const membersSlice = createSlice({
    name: "members",
    initialState,
    reducers: {
        setAllMembersData: (state, action) => {
            state.data = action.payload;
        },

        addNewMember: (state, action) => {

            if (Array.isArray(state.data)) {

                state.data.push(action.payload);  // ✅ safe now

            }
            else {

                state.data = [action.payload];

            }
        },

        updateExistingMembersData: (state, action) => {
            const updatedData = state.data.map((val) => {
                if (val._id === action.payload.userId) {
                    return {
                        ...val,
                        [action.payload.columnToUpdate]: action.payload.value
                    };
                }
                return val; // include this to keep other data
            });

            state.data = updatedData;
        },
        deleteExistingMember: (state, action) => {
            state.data = state.data.filter((val) => val._id !== action.payload);
        },

        clearAllMembersData : (state,action)=>{

            state.data = [];

        }

    },
});

export const { setAllMembersData, addNewMember, updateExistingMembersData,clearAllMembersData,deleteExistingMember } = membersSlice.actions;

export default membersSlice.reducer;
