import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BASE_URL } from "@/utls/url";

const Request = () => {
  const user = useSelector((state) => state.user);
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [collaborators, setCollaborators] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState("requests");

  useEffect(() => {
    
    if (user) {
      fetchRequests();
      if (user.role === "Admin") {
        fetchCollaborators();
      }
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const endpoint =
        user?.role === "Admin"
          ? `${BASE_URL}/request/admin-requests`
          : `${BASE_URL}/request/my-requests`;

      const res= await axios.get(endpoint, { withCredentials: true });
        console.log(res);
      setRequests(res.data.requests || []);
    
    } catch (err) {
        console.log(err)
      toast.error(err.response?.data?.message || "Failed to fetch requests");
    } finally {
      setLoading(false);
    }
  };

  const fetchCollaborators = async () => {
    try {
      const { data } = await axios.get(
        `${BASE_URL}/request/active-collaborators`,
        { withCredentials: true }
      );
      console.log(data.collaborators);
      setCollaborators(data.collaborators || []);
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Failed to fetch collaborators"
      );
    }
  };

  const handleRespond = async (requestId, action) => {
    setProcessing(true);
    try {
      const { data } = await axios.put(
        `${BASE_URL}/request/respond/${requestId}`,
        { status: action },
        { withCredentials: true }
      );

      if (data.success) {
        toast.success(`Request ${action.toLowerCase()}`);
        fetchRequests();
        if (action === "Accepted") {
          fetchCollaborators();
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to process request");
    } finally {
      setProcessing(false);
    }
  };

  const handleSuspend = async (userId,reqId,organizationId) => {
    console.log(organizationId._id)
    if (!window.confirm("Are you sure you want to suspend this user?")) return;

    setProcessing(true);
    try {
      const { data } = await axios.patch(
        `${BASE_URL}/request/organizations/${organizationId._id}/suspend/${reqId}/${userId}`,
        {},
        { withCredentials: true }
      );

      if (data.success) {
        toast.success("User suspended");
        fetchRequests();
        fetchCollaborators();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to suspend user");
    } finally {
      setProcessing(false);
    }
  };

  // Show loading state while checking user or fetching requests
  if (!user) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <p className="text-lg">Please log in to view requests</p>
          <button
            onClick={() => navigate("/login")}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Admin view with tabs
  if (user.role === "Admin") {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="requests">Collaboration Requests</TabsTrigger>
            <TabsTrigger value="collaborators">
              Active Collaborators
            </TabsTrigger>
          </TabsList>

          <TabsContent value="requests" className="mt-6">
            {requests.length === 0 ? (
              <p>No requests found</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full border">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="p-3 text-left">User</th>
                      <th className="p-3 text-left">Organization</th>
                      <th className="p-3 text-left">Status</th>
                      <th className="p-3 text-left">Date</th>
                      <th className="p-3 text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {requests.map((request) => (
                      <tr key={request._id} className="border-b">
                        <td className="p-3">
                          {request.userId?.name} ({request.userId?.email})
                        </td>
                        <td className="p-3">{request.organizationId?.name}</td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-1 rounded ${
                              request.status === "Accepted"
                                ? "bg-green-100 text-green-800"
                                : request.status === "Rejected"
                                ? "bg-red-100 text-red-800"
                                : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {request.status}
                          </span>
                        </td>
                        <td className="p-3">
                          {new Date(request.createdAt).toLocaleDateString()}
                        </td>
                        <td className="p-3">
                          {request.status === "Pending" && (
                            <>
                              <button
                                onClick={() =>
                                  handleRespond(request._id, "Accepted")
                                }
                                disabled={processing}
                                className="mr-2 text-blue-600 hover:text-blue-800 disabled:opacity-50"
                              >
                                Accept
                              </button>
                              <button
                                onClick={() =>
                                  handleRespond(request._id, "Rejected")
                                }
                                disabled={processing}
                                className="text-red-600 hover:text-red-800 disabled:opacity-50"
                              >
                                Reject
                              </button>
                            </>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </TabsContent>

          <TabsContent value="collaborators" className="mt-6">
            {collaborators.length === 0 ? (
              <p>No active collaborators found</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full border">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="p-3 text-left">User</th>
                      <th className="p-3 text-left">Organization</th>
                      <th className="p-3 text-left">Joined Date</th>
                      <th className="p-3 text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {collaborators.map((collaborator) => (
                      <tr key={collaborator._id} className="border-b">
                        <td className="p-3">
                          {collaborator.userId?.name} (
                          {collaborator.userId?.email})
                        </td>
                        <td className="p-3">
                          {collaborator.organizationId?.name}
                        </td>
                        <td className="p-3">
                          {new Date(
                            collaborator.acceptedAt || collaborator.createdAt
                          ).toLocaleDateString()}
                        </td>
                        <td className="p-3">
                          <button
                            onClick={() =>
                              handleSuspend(collaborator.userId._id,collaborator._id, collaborator.organizationId)
                            }
                            disabled={processing}
                            className="text-red-600 hover:text-red-800 disabled:opacity-50"
                          >
                            Suspend
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    );
  }

  // Regular user view
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">My Requests</h1>

      {requests.length === 0 ? (
        <p>No requests found</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-3 text-left">Organization</th>
                <th className="p-3 text-left">Status</th>
                <th className="p-3 text-left">Date</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((request) => (
                <tr key={request._id} className="border-b">
                  <td className="p-3">{request.organizationId?.name}</td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-1 rounded ${
                        request.status === "Accepted"
                          ? "bg-green-100 text-green-800"
                          : request.status === "Rejected"
                          ? "bg-red-100 text-red-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {request.status}
                    </span>
                  </td>
                  <td className="p-3">
                    {new Date(request.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Request;
