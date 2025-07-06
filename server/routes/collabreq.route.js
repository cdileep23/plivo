import express from "express"
import { requireAuth } from "../Middleware/AuthMiddlware.js";
import { getPendingAdminRequests, requestCollaboration, respondToCollabRequest } from "../controllers/collaborator.controller.js";

const RequestRouter=express.Router()

RequestRouter.route('/send-req').post(requireAuth,requestCollaboration)
RequestRouter.route('/update-status/:requestId').patch(requireAuth,respondToCollabRequest)
RequestRouter.route("/get-all-admin").get(requireAuth, getPendingAdminRequests);

export default RequestRouter