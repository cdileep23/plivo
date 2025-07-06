import Organization from "../models/Organization.model.js";
import Service from '../models/Services.model.js'

export const CreateOrganization = async (req, res) => {
  try {
    const userData = req.user;

    // ✅ Only Admins can create
    if (userData.role !== "Admin") {
      return res.status(403).json({
        success: false,
        message: "Only Admins are allowed to create organizations",
      });
    }

    const { name } = req.body;
    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Name field is required",
      });
    }

    const OrgWithName = await Organization.findOne({ name });
    if (OrgWithName) {
      return res.status(400).json({
        success: false,
        message: "Organization with this name already exists",
      });
    }

    const newOrg = await Organization.create({
      name,
      admin: userData.id,
    });

    return res.status(201).json({
      success: true,
      message: "Organization created successfully",
      organization: newOrg,
    });
  } catch (error) {
    console.error("CreateOrganization error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const DeleteOrganization = async (req, res) => {
  try {
    const orgId = req.params.orgId;
    const userData = req.user;

    const org = await Organization.findById(orgId).populate("admin");

    if (!org) {
      return res.status(404).json({
        success: false,
        message: "Organization not found",
      });
    }

  
    if (
      userData.role !== 'Admin' ||
      org.admin._id.toString() !== userData.id
    ) {
      return res.status(403).json({
        success: false,
        message: "Only the Admin who created the organization can delete it",
      });
    }

    await Organization.findByIdAndDelete(orgId);

    return res.status(200).json({
      success: true,
      message: "Organization deleted successfully",
    });

  } catch (error) {
    console.error("DeleteOrganization error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
export const getAllOrganizationsForUser = async (req, res) => {
  try {
    const userId = req.user.id;

    // Fetch all organizations and populate admin and collaborators
    const allOrgs = await Organization.find().populate(
      "admin collaborators",
      "name email"
    );

    // Prepare final list
    const organizations = await Promise.all(
      allOrgs.map(async (org) => {
        const isAdmin = org.admin._id.toString() === userId;
        const isCollaborator = org.collaborators.some(
          (c) => c._id.toString() === userId
        );

        // Count services for this organization
        const serviceCount = await Service.countDocuments({
          organizationId: org._id,
        });

        return {
          _id: org._id,
          name: org.name,
          isAdmin,
          isCollaborator,
          createdAt: org.createdAt,
          updatedAt: org.updatedAt,
          serviceCount, // 👈 Add total services running
        };
      })
    );

    res.status(200).json({
      success: true,
      organizations,
    });
  } catch (error) {
    console.error("getAllOrganizationsForUser error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
export const getMyOrganizationsAsAdmin = async (req, res) => {
  try {
    const user = req.user;

    if (user.role !== "Admin") {
      return res.status(403).json({
        success: false,
        message: "Only Admins can view their created organizations",
      });
    }

    const myOrgs = await Organization.find({ admin: user.id });

    const organizations = await Promise.all(
      myOrgs.map(async (org) => {
        const serviceCount = await Service.countDocuments({
          organizationId: org._id,
        });

        return {
          _id: org._id,
          name: org.name,
          createdAt: org.createdAt,
          updatedAt: org.updatedAt,
          serviceCount, 
        };
      })
    );

    res.status(200).json({
      success: true,
      organizations,
    });
  } catch (error) {
    console.error("getMyOrganizationsAsAdmin error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
