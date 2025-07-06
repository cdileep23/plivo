import express from "express"
import { requireAuth } from "../Middleware/AuthMiddlware.js";
import { createIncident, deleteIncident, getIncidentsByService, updateIncidentMessage, updateIncidentStatus } from "../controllers/incidents.controller.js";
import { updateServiceStatus } from "../controllers/service.controller.js";


const IncidentRouter=express.Router()
IncidentRouter.route('/create').post(requireAuth,createIncident)
IncidentRouter.route("/:incidentId").patch(requireAuth,updateIncidentStatus);
IncidentRouter.route("/:serviceId").get(requireAuth,getIncidentsByService)
IncidentRouter.patch(
  "/update-message/:incidentId",
  requireAuth,
  updateIncidentMessage
);

IncidentRouter.route("/:incidentId").delete(requireAuth,deleteIncident);

export default IncidentRouter