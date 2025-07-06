import { createSlice } from "@reduxjs/toolkit";

const OrganizationSlice=createSlice({
    name:'Organization',
    initialState:null,
    reducers:{
        addOrgs:(state,action)=>{
            return action.payload
        },
        resetOrgs:()=>{
            return null
        }
    }
})
export const {addOrgs,resetOrgs}=OrganizationSlice.actions
export default OrganizationSlice.reducer