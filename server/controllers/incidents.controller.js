import Incident from "../models/Incident.model.js";
import Organization from "../models/Organization.model.js";
import Service from "../models/Services.model.js";

export const createIncident = async (req, res) => {
  try {
    const { serviceId, name, issueMessage } = req.body;
    const userId = req.user.id;
    const io = req.app.get("io");

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
        message: "Only Admins or Collaborators can create incidents",
      });
    }

    const newIncident = await Incident.create({
      serviceId,
      name,
      status: "open",
      issueMessage,
    });

    service.status = "Degraded Performance";
    await service.save();

    // Broadcast update to all clients in this organization
    const updatedServices = await getServicesWithIncidents(
      service.organizationId
    );
    io.to(service.organizationId.toString()).emit("update-services", {
      services: updatedServices,
    });

    res.status(201).json({
      success: true,
      message: "Incident created and service status updated",
      incident: newIncident,
    });
  } catch (error) {
    console.error("Create Incident Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const updateIncidentStatus = async (req, res) => {
  try {
    const { incidentId } = req.params;
    const { status } = req.body;
    const userId = req.user.id;
    const io = req.app.get("io");

    if (!["resolved"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status value",
      });
    }

    const incident = await Incident.findById(incidentId);
    if (!incident) {
      return res.status(404).json({
        success: false,
        message: "Incident not found",
      });
    }

    const service = await Service.findById(incident.serviceId);
    const org = await Organization.findById(service.organizationId);

    const isAdmin = org.admin.toString() === userId;
    const isCollaborator = org.collaborators.some(
      (id) => id.toString() === userId
    );

    if (!isAdmin && !isCollaborator) {
      return res.status(403).json({
        success: false,
        message: "Only Admins or Collaborators can update incidents",
      });
    }

    incident.status = status;
    await incident.save();

    if (status === "resolved") {
      const openIncidents = await Incident.find({
        serviceId: service._id,
        status: "open",
      });

      if (openIncidents.length === 0) {
        service.status = "Operational";
        await service.save();
      }
    } else {
      service.status = "Degraded Performance";
      await service.save();
    }

    // Broadcast update to all clients in this organization
    const updatedServices = await getServicesWithIncidents(
      service.organizationId
    );
    io.to(service.organizationId.toString()).emit("update-services", {
      services: updatedServices,
    });

    res.status(200).json({
      success: true,
      message: "Incident status updated and service status synced",
      incident,
    });
  } catch (error) {
    console.error("Update Incident Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const updateIncidentMessage = async (req, res) => {
  try {
    const { incidentId } = req.params;
    const { issueMessage } = req.body;
    const userId = req.user.id;
    const io = req.app.get("io");

    if (!issueMessage || typeof issueMessage !== "string") {
      return res.status(400).json({
        success: false,
        message: "Invalid or missing issue message",
      });
    }

    const incident = await Incident.findById(incidentId);
    if (!incident) {
      return res.status(404).json({
        success: false,
        message: "Incident not found",
      });
    }

    const service = await Service.findById(incident.serviceId);
    const org = await Organization.findById(service.organizationId);

    const isAdmin = org.admin.toString() === userId;
    const isCollaborator = org.collaborators.some(
      (id) => id.toString() === userId
    );

    if (!isAdmin && !isCollaborator) {
      return res.status(403).json({
        success: false,
        message: "Only Admins or Collaborators can update incidents",
      });
    }

    incident.issueMessage = issueMessage;
    await incident.save();

    // Broadcast update to all clients in this organization
    const updatedServices = await getServicesWithIncidents(
      service.organizationId
    );
    io.to(service.organizationId.toString()).emit("update-services", {
      services: updatedServices,
    });

    res.status(200).json({
      success: true,
      message: "Incident message updated successfully",
      incident,
    });
  } catch (error) {
    console.error("Update Incident Message Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getIncidentsByService = async (req, res) => {
  try {
    const { serviceId } = req.params;
    const incidents = await Incident.find({ serviceId }).sort({
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      incidents,
    });
  } catch (error) {
    console.error("Get Incidents Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const deleteIncident = async (req, res) => {
  try {
    const { incidentId } = req.params;
    const userId = req.user.id;
    const io = req.app.get("io");

    const incident = await Incident.findById(incidentId);
    if (!incident) {
      return res
        .status(404)
        .json({ success: false, message: "Incident not found" });
    }

    const service = await Service.findById(incident.serviceId);
    const org = await Organization.findById(service.organizationId);

    const isAdmin = org.admin.toString() === userId;

    if (!isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Only Admins can delete incidents",
      });
    }

    await incident.deleteOne();

    // Recalculate service status
    const remainingOpenIncidents = await Incident.find({
      serviceId: service._id,
      status: "open",
    });

    if (remainingOpenIncidents.length === 0) {
      service.status = "Operational";
      await service.save();
    }

    // Broadcast update to all clients in this organization
    const updatedServices = await getServicesWithIncidents(
      service.organizationId
    );
    io.to(service.organizationId.toString()).emit("update-services", {
      services: updatedServices,
    });

    res.status(200).json({
      success: true,
      message: "Incident deleted and service status updated",
    });
  } catch (error) {
    console.error("Delete Incident Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};


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
