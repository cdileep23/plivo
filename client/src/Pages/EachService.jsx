import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { useSelector } from "react-redux";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { BASE_URL } from "@/utls/url";
import ServiceCard from "./ServiceCard";
import { io } from "socket.io-client";
import { Badge } from "lucide-react";

const STATUS_OPTIONS = [
  "Operational",
  "Degraded Performance",
  "Partial Outage",
  "Major Outage",
];

const EachService = () => {
  const { orgId } = useParams();
  const user = useSelector((state) => state.user);

  const [services, setServices] = useState([]);
  const [isCollaborator, setIsCollaborator] = useState(false);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [serviceName, setServiceName] = useState("");
  const [serviceStatus, setServiceStatus] = useState("Operational");
  const [socket, setSocket] = useState(null);
  const[collabrequest,setCollabRequest]=useState(false)

  const fetchServices = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${BASE_URL}/service/${orgId}`, {
        withCredentials: true,
      });
      setServices(res.data.services);
      setIsCollaborator(res.data.isCollaborator);
    } catch (err) {
      toast.error("Failed to load services");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user || !orgId) return;

    const newSocket = io("http://localhost:4545", {
     
      withCredentials: true,
    });

    newSocket.on("connect", () => {
      console.log("Connected to socket:", newSocket.id);
      newSocket.emit("join-org-room", orgId);
    });

    
    newSocket.on("update-services", (data) => {
      console.log("Received update:", data);
      console.log("dddddddddd",data)
      setServices(data.services); 
      setIsCollaborator(data.isCollaborator || isCollaborator); 
    });

    newSocket.on("error", (error) => {
      console.error("Socket error:", error);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
      console.log("Socket disconnected");
    };
  }, [user, orgId]);

  const handleAddService = async () => {
    try {
      await axios.post(
        `${BASE_URL}/service/create-service`,
        {
          name: serviceName,
          status: serviceStatus,
          organizationId: orgId,
        },
        { withCredentials: true }
      );
      toast.success("Service added");
      setServiceName("");
      setServiceStatus("Operational");
      setOpen(false);
     
    } catch (err) {
      toast.error("Failed to add service");
      console.error(err);
    }
  };

  useEffect(() => {
    fetchServices();
  }, [orgId]);
 const SendRequestCollab = async () => {
  try {
    

    const response = await axios.post(
      `${BASE_URL}/request/send-req`,
      { organizationId: orgId }, 
      { withCredentials: true }
    );

    if (response.data.success) {
      toast.success("Collaboration request sent successfully");
    
    
    } else {
     
      toast.error(response.data.message || "Failed to send request");
 
    }
    setCollabRequest(true);
  } catch (err) {
    console.error("Request Collaboration Error:", err);
    toast.error(
      err.response?.data?.message || "Error sending collaboration request"
    );
    return false;
  }
};

  return (
    <div className="max-w-6xl mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Organization Services</h1>
        <div className="gap-2 ">
          {user?.role === "Admin" && (
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => setOpen(true)}>+ Add Service</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create Service</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div>
                    <Label htmlFor="serviceName">Service Name</Label>
                    <Input
                      id="serviceName"
                      placeholder="Enter service name"
                      value={serviceName}
                      onChange={(e) => setServiceName(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="serviceStatus">Initial Status</Label>
                    <select
                      id="serviceStatus"
                      value={serviceStatus}
                      onChange={(e) => setServiceStatus(e.target.value)}
                      className="w-full p-2 border rounded"
                    >
                      {STATUS_OPTIONS.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  </div>
                  <Button onClick={handleAddService}>Create</Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
          {!isCollaborator && user?.role !== "Admin" ? (
            <Button disabled={collabrequest} onClick={SendRequestCollab}>Request for Collab</Button>
          ) : isCollaborator ? (
            <span>
              <Badge />
              Collaborator
            </span>
          ) : null}
        </div>
      </div>

      {loading ? (
        <p>Loading services...</p>
      ) : (
        <div className="space-y-4">
          {services.map((service) => (
            <ServiceCard
              key={service._id}
              service={service}
              isCollaborator={isCollaborator}
              userRole={user?.role}
              onServiceUpdate={fetchServices}
              statusOptions={STATUS_OPTIONS}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default EachService;
