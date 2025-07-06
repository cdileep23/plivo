import CollabRequest from "../models/CollabRequest.model.js";
import Organization from "../models/Organization.model.js";
import User from "../models/User.model.js";


export const requestCollaboration = async (req, res) => {
  try {
    const { organizationId } = req.body;
    const userId = req.user.id;

    const org = await Organization.findById(organizationId);
    if (!org) {
      return res
        .status(404)
        .json({ success: false, message: "Organization not found" });
    }

    if (org.admin.toString() === userId) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Admins can't request collaboration",
        });
    }

  
    const alreadyCollab = org.collaborators.includes(userId);
    if (alreadyCollab) {
      return res
        .status(400)
        .json({ success: false, message: "Already a collaborator" });
    }

   
    const existingRequest = await CollabRequest.findOne({
      organizationId,
      userId,
      status: "Pending",
    });

    if (existingRequest) {
      return res
        .status(400)
        .json({ success: false, message: "Request already pending" });
    }

    const request = await CollabRequest.create({
      organizationId,
      userId,
    });

    return res.status(201).json({
      success: true,
      message: "Collaboration request sent",
      request,
    });
  } catch (error) {
    console.error("Collab Request Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};


export const respondToCollabRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { status } = req.body; 
    const adminId = req.user.id;

    const request = await CollabRequest.findById(requestId).populate(
      "organizationId"
    );
    if (!request) {
      return res
        .status(404)
        .json({ success: false, message: "Request not found" });
    }

    const org = request.organizationId;

    if (org.admin.toString() !== adminId) {
      return res
        .status(403)
        .json({
          success: false,
          message: "Only admin can respond to requests",
        });
    }

    if (!["Accepted", "Rejected"].includes(status)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid status" });
    }

    request.status = status;
    await request.save();

    if (status === "Accepted") {
   
      if (!org.collaborators.includes(request.userId.toString())) {
        org.collaborators.push(request.userId);
        await org.save();
      }
    }

    return res.status(200).json({
      success: true,
      message: `Request ${status.toLowerCase()} successfully`,
      request,
    });
  } catch (error) {
    console.error("Respond to Request Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getPendingAdminRequests = async (req, res) => {
  try {
    const userId = req.user.id;

    
    if (req.user.role !== "Admin") {
      return res.status(403).json({
        success: false,
        message: "Only admins can view these requests",
      });
    }

   
    const requests = await CollabRequest.find({
      status: "Pending",
    })
      .populate("userId", "name email")
      .populate("organizationId", "name admin"); 

    
  
    return res.status(200).json({
      success: true,
      requests,
    });
  } catch (error) {
    console.error("Get Admin Requests Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};


export const getMyRequests = async (req, res) => {
  try {
    const userId = req.user.id;
    const requests = await CollabRequest.find({ userId }).populate(
      "organizationId",
      "name"
    );

    return res.status(200).json({
      success: true,
      requests,
    });
  } catch (error) {
    console.error("Get My Requests Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
export const suspendCollaborator = async (req, res) => {
  try {
    const { orgId, userId, reqId } = req.params;
    const adminId = req.user.id;
console.log(orgId, userId, adminId);
    const org = await Organization.findById(orgId);
    if (!org) {
      return res
        .status(404)
        .json({ success: false, message: "Organization not found" });
    }

    
    if (org.admin.toString() !== adminId && req.user.role !== "Admin") {
      return res.status(403).json({
        success: false,
        message: "Only organization admin can suspend collaborators",
      });
    }

    const collabRequest=await CollabRequest.findById(reqId);
    collabRequest.status="Pending"
await collabRequest.save()
    org.collaborators = org.collaborators.filter(
      (collabId) => collabId.toString() !== userId
    );

    await org.save();

    return res.status(200).json({
      success: true,
      message: "Collaborator suspended successfully",
    });
  } catch (error) {
    console.error("Suspend Collaborator Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
export const getActiveCollaborators = async (req, res) => {
  try {
    const adminId = req.user.id;


    if (req.user.role !== "Admin") {
      return res.status(403).json({
        success: false,
        message: "Only admins can view active collaborators",
      });
    }

    
    const adminOrgs = await Organization.find({ admin: adminId });

    if (adminOrgs.length === 0) {
      return res.status(200).json({
        success: true,
        collaborators: [],
        message: "No organizations found for this admin",
      });
    }

  
    const orgIds = adminOrgs.map((org) => org._id);

   
    const activeCollaborators = await CollabRequest.find({
      organizationId: { $in: orgIds },
      status: "Accepted",
    })
      .populate("userId", "name email") 
      .populate("organizationId", "name")
      .sort({ updatedAt: -1 }); 

    return res.status(200).json({
      success: true,
      collaborators: activeCollaborators,
    });
  } catch (error) {
    console.error("Get Active Collaborators Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
