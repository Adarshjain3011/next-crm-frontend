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

                console.log("Adding new member:", action.payload);
                state.data.push(action.payload);  // ✅ safe now

            }
            else {

                state.data = [action.payload];

            }
        },

        updateExistingMembersData: (state, action) => {
            console.log("action payload ka data  ", action.payload);

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

        clearAllMembersData : (state,action)=>{

            state.data = [];

        }

    },
});

export const { setAllMembersData, addNewMember, updateExistingMembersData,clearAllMembersData } = membersSlice.actions;

export default membersSlice.reducer;
