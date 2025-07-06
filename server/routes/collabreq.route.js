import express from "express";
import { requireAuth } from "../Middleware/AuthMiddlware.js";
import { getActiveCollaborators, getMyRequests, getPendingAdminRequests, requestCollaboration, respondToCollabRequest, suspendCollaborator } from "../controllers/collaborator.controller.js";


const router = express.Router();

router.post("/send-req", requireAuth, requestCollaboration);
router.put("/respond/:requestId", requireAuth, respondToCollabRequest);
router.get("/admin-requests", requireAuth, getPendingAdminRequests);
router.get("/my-requests", requireAuth, getMyRequests);
router.patch(
  "/organizations/:orgId/suspend/:reqId/:userId",
  requireAuth,
  suspendCollaborator
);
router.get("/active-collaborators", requireAuth, getActiveCollaborators);

export default router;
