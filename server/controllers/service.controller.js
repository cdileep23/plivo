import mongoose from "mongoose";
import Service from "../models/Services.model.js";
import Organization from "../models/Organization.model.js";
import Incident from "../models/Incident.model.js";

const VALID_STATUSES = [
  "Operational",
  "Degraded Performance",
  "Partial Outage",
  "Major Outage",
];

// Helper function to get services with incidents
async function getServicesWithIncidents(orgId) {
  const services = await Service.find({ organizationId: orgId });
  const serviceIds = services.map((s) => s._id);

  const activeIncidents = await Incident.find({
    serviceId: { $in: serviceIds },
    status: "open",
  });

  return services.map((service) => ({
    ...service.toObject(),
    incidents: activeIncidents.filter(
      (incident) => incident.serviceId.toString() === service._id.toString()
    ),
  }));
}

export const createService = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, status, organizationId } = req.body;
    const io = req.app.get("io");

    if (req.user.role !== "Admin") {
      return res.status(403).json({
        success: false,
        message: "Only Admins can create services",
      });
    }

    if (!VALID_STATUSES.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status value",
      });
    }

    const org = await Organization.findById(organizationId);
    if (!org) {
      return res.status(404).json({
        success: false,
        message: "Organization not found",
      });
    }

    if (org.admin.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "Only the organization's Admin can add services",
      });
    }

    const existing = await Service.findOne({ name, organizationId });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: "Service with this name already exists in the organization",
      });
    }

    const newService = await Service.create({ name, status, organizationId });

    // Broadcast update to all clients in this organization
    const updatedServices = await getServicesWithIncidents(organizationId);
    console.log(organizationId)
    io.to(organizationId).emit("update-services", {
      services: updatedServices,
    });

    res.status(201).json({
      success: true,
      message: "Service created successfully",
      service: newService,
    });
  } catch (error) {
    console.error("Create Service Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getServicesByOrgId = async (req, res) => {
  try {
    const { orgId } = req.params;
    const userId = req.user.id;

    const organization = await Organization.findById(orgId).populate(
      "collaborators"
    );
    if (!organization) {
      return res
        .status(404)
        .json({ success: false, message: "Organization not found" });
    }

    const isCollaborator = organization.collaborators.some(
      (collab) => collab._id.toString() === userId.toString()
    );

    const servicesWithIncidents = await getServicesWithIncidents(orgId);

    return res.status(200).json({
      success: true,
      isCollaborator,
      services: servicesWithIncidents,
    });
  } catch (error) {
    console.error("Get Services Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const updateServiceStatus = async (req, res) => {
  try {
    const { serviceId } = req.params;
    const { status } = req.body;
    const userId = req.user.id;
    const io = req.app.get("io");

    if (!VALID_STATUSES.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status value",
      });
    }

    const service = await Service.findById(serviceId);
    if (!service) {
      return res
        .status(404)
        .json({ success: false, message: "Service not found" });
    }

    const org = await Organization.findById(service.organizationId);
    const isAdmin = org.admin.toString() === userId;
    const isCollaborator = org.collaborators.some(
      (id) => id.toString() === userId
    );

    if (!isAdmin && !isCollaborator) {
      return res.status(403).json({
        success: false,
        message: "Only Admins or Collaborators can update services",
      });
    }

    // Save the previous status for reference
    const prevStatus = service.status;
    service.status = status;
    await service.save();

    // Handle incidents based on the new status
    if (status === "Operational") {
      // Resolve all open incidents for this service
      await Incident.updateMany(
        { serviceId, status: "open" },
        { $set: { status: "resolved" } }
      );
    } else if (prevStatus === "Operational") {
      // Only create new incident if service was previously operational
      // Check if there are already open incidents
      const existingOpen = await Incident.findOne({
        serviceId,
        status: "open",
      });

      if (!existingOpen) {
        await Incident.create({
          serviceId,
          name: `Auto Incident - ${status}`,
          status: "open",
          issueMessage: `Auto-generated incident due to status change from Operational to ${status}`,
        });
      }
    }

  
    const updatedServicesData = await getServicesWithIncidents(
      service.organizationId
    );

    
    console.log("Updated service status:", status);
    console.log("Organization ID:", service.organizationId);
    console.log("Services to emit:", updatedServicesData);

   
    io.to(service.organizationId.toString()).emit("update-services", {
      services: updatedServicesData,
    });

    res.status(200).json({
      success: true,
      message: "Service status updated and incident status synced",
      service,
    });
  } catch (error) {
    console.error("Update Service Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
export const deleteService = async (req, res) => {
  try {
    const { serviceId } = req.params;
    const userId = req.user.id;
    const io = req.app.get("io");

    const service = await Service.findById(serviceId);
    if (!service) {
      return res
        .status(404)
        .json({ success: false, message: "Service not found" });
    }

    const org = await Organization.findById(service.organizationId);
    if (!org || org.admin.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "Only the organization Admin can delete this service",
      });
    }

    await service.deleteOne();


    const updatedServices = await getServicesWithIncidents(
      service.organizationId
    );
   
    io.to(service.organizationId.toString()).emit("update-services", {
      services: updatedServices,
    });

    res.status(200).json({
      success: true,
      message: "Service deleted successfully",
    });
  } catch (error) {
    console.error("Delete Service Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
