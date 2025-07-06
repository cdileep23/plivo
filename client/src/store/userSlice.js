import { createSlice } from "@reduxjs/toolkit";

const UserSlice=createSlice({
    initialState:null,
    name:'user',
    reducers:{
        UserLoggedIn:(state,action)=>{
            return action.payload
        },
        UserLoggedOut:()=>{
            return null;
        }
    }
})

export const{UserLoggedIn,UserLoggedOut}=UserSlice.actions
export default UserSlice.reducer