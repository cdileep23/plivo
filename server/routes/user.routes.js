import express from "express"
import { getProfile, login, logout, signUp } from "../controllers/user.controller.js"

import { requireAuth } from "../Middleware/AuthMiddlware.js"

const UserRouter=express.Router()

UserRouter.route('/signup').post(signUp)
UserRouter.route('/login').post(login)
UserRouter.route('/logout').get(requireAuth,logout)
UserRouter.route('/profile').get(requireAuth,getProfile)

export default UserRouter;