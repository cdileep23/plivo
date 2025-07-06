import express from "express"
import { requireAuth } from "../Middleware/AuthMiddlware.js";
import { createService, deleteService, getServicesByOrgId, updateServiceStatus } from "../controllers/service.controller.js";

const router = express.Router();

router.route('/create-service').post(requireAuth,createService)
router.route("/:orgId").get(requireAuth,getServicesByOrgId);
router.route("/:serviceId").patch(requireAuth,updateServiceStatus)
router.route('/:serviceId').delete(requireAuth,deleteService)
export default router;