import express from "express"
import { requireAuth } from "../Middleware/AuthMiddlware.js";
import { CreateOrganization, DeleteOrganization, getAllOrganizationsForUser, getMyOrganizationsAsAdmin } from "../controllers/organization.controller.js";

const OrgRouter=express.Router()

OrgRouter.route("/create-org").post(requireAuth,CreateOrganization);
OrgRouter.route("/delete-org/:orgId").delete(requireAuth,DeleteOrganization);
OrgRouter.get("/all", requireAuth, getAllOrganizationsForUser);
OrgRouter.get("/my-admin-orgs", requireAuth, getMyOrganizationsAsAdmin);

export default OrgRouter;