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

    // Check if already a collaborator
    const alreadyCollab = org.collaborators.includes(userId);
    if (alreadyCollab) {
      return res
        .status(400)
        .json({ success: false, message: "Already a collaborator" });
    }

    // Prevent duplicate pending request
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
      status: "pending", 
    })
      .populate("userId", "name email") 
      .populate("organizationId", "name admin"); 

    
    const filteredRequests = requests.filter(
      (request) => request.organizationId.admin.toString() !== userId
    );

    return res.status(200).json({
      success: true,
      requests: filteredRequests,
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
