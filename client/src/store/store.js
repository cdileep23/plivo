import { configureStore } from "@reduxjs/toolkit";
import UserReducer from './userSlice.js'
import OrgReducer from './OrgsSlice.js'
const appStore=configureStore({
    reducer:{
        user:UserReducer,
        Orgs:OrgReducer
    }
})
export default appStore