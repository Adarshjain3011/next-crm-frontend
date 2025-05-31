
import { createSlice } from "@reduxjs/toolkit";


let initialState = {

    data:null,

}



const salesPersonSlice = createSlice({

    name:"salesPerson",
    initialState:initialState,
    reducers:{

        setUserData :(state,action)=>{

            state.data  = action.payload;

        },

        clearSalesPersonData :(state,action)=>{

            state.data = null;

        }

        
    }
})

export const {setUserData,clearSalesPersonData} = salesPersonSlice.actions;

export default salesPersonSlice.reducer;

