import React, { useEffect, useState } from "react";
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
import axios from "axios";
import { Edit2, X, Save, Trash2, ChevronDown, ChevronUp } from "lucide-react";

const ServiceCard = ({
  service,
  isCollaborator,
  userRole,
  onServiceUpdate,
  statusOptions,
}) => {
  const [incidentDialogOpen, setIncidentDialogOpen] = useState(false);
  const [incidentName, setIncidentName] = useState("");
  const [incidentMessage, setIncidentMessage] = useState("");
  const [currentStatus, setCurrentStatus] = useState(service.status);
  const [showIncidents, setShowIncidents] = useState(false);
  const [isEditingStatus, setIsEditingStatus] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [editingIncidentId, setEditingIncidentId] = useState(null);
  const [updatedIncidentMessage, setUpdatedIncidentMessage] = useState("");

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${BASE_URL}/service/${id}`, {
        withCredentials: true,
      });
      toast.success("Service deleted");
      onServiceUpdate();
    } catch (err) {
      toast.error("Delete failed");
    }
  };

  useEffect(()=>{
if(service){
  setCurrentStatus(service.status)
}
  },[service])

  const handleStatusUpdate = async () => {
    setIsUpdatingStatus(true);
    try {
      await axios.patch(
        `${BASE_URL}/service/${service._id}`,
        { status: currentStatus },
        { withCredentials: true }
      );
      toast.success("Status updated");
      setIsEditingStatus(false);
      onServiceUpdate();
    } catch (err) {
      toast.error("Failed to update status");
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleCreateIncident = async () => {
    try {
      await axios.post(
        `${BASE_URL}/incident/create`,
        {
          serviceId: service._id,
          name: incidentName,
          status: "open",
          issueMessage: incidentMessage,
        },
        { withCredentials: true }
      );
      toast.success("Incident created");
      setIncidentDialogOpen(false);
      setIncidentName("");
      setIncidentMessage("");
      onServiceUpdate();
    } catch (err) {
      toast.error("Failed to create incident");
    }
  };

  const handleUpdateIncident = async (incidentId) => {
    try {
      await axios.patch(
        `${BASE_URL}/incident/update-message/${incidentId}`,
        { issueMessage: updatedIncidentMessage },
        { withCredentials: true }
      );
      toast.success("Incident updated");
      setEditingIncidentId(null);
      setUpdatedIncidentMessage("");
      onServiceUpdate();
    } catch (err) {
      toast.error("Failed to update incident");
    }
  };

  const handleResolveIncident = async (incidentId) => {
    try {
      await axios.patch(
        `${BASE_URL}/incident/${incidentId}`,
        { status: "resolved" },
        { withCredentials: true }
      );
      toast.success("Incident resolved");
      onServiceUpdate();
    } catch (err) {
      toast.error("Failed to resolve incident");
    }
  };

  const handleDeleteIncident = async (incidentId) => {
    try {
      await axios.delete(`${BASE_URL}/incident/${incidentId}`, {
        withCredentials: true,
      });
      toast.success("Incident deleted");
      onServiceUpdate();
    } catch (err) {
      toast.error("Failed to delete incident");
    }
  };

  const getStatusColor = () => {
    switch (currentStatus) {
      case "Operational":
        return "bg-green-100 text-green-800 border-green-200";
      case "Degraded Performance":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "Partial Outage":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "Major Outage":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <div className="p-4 border rounded shadow-sm space-y-2">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-semibold">{service.name}</h2>
          <div className="flex items-center mt-1 gap-2">
            <span className="text-sm text-gray-600">Status:</span>
            {isEditingStatus ? (
              <div className="flex items-center gap-2">
                <select
                  value={currentStatus}
                  onChange={(e) => setCurrentStatus(e.target.value)}
                  className="border px-2 py-1 rounded text-sm"
                  disabled={isUpdatingStatus}
                >
                  {statusOptions.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
                <Button
                  size="sm"
                  onClick={handleStatusUpdate}
                  disabled={isUpdatingStatus}
                >
                  {isUpdatingStatus ? "Saving..." : <Save size={16} />}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditingStatus(false)}
                >
                  <X size={16} />
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <div
                  className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor()}`}
                >
                  {currentStatus}
                </div>
                {(userRole === "Admin" || isCollaborator) && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsEditingStatus(true)}
                  >
                    <Edit2 size={16} />
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-2">
          {(userRole === "Admin" || isCollaborator) && (
            <>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleDelete(service._id)}
              >
                <Trash2 size={16} />
              </Button>
              <Button size="sm" onClick={() => setIncidentDialogOpen(true)}>
                + Incident
              </Button>
            </>
          )}
          {service.incidents?.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowIncidents((prev) => !prev)}
            >
              {showIncidents ? (
                <>
                  <ChevronUp size={16} className="mr-1" />
                  Hide Incidents
                </>
              ) : (
                <>
                  <ChevronDown size={16} className="mr-1" />
                  Show Incidents ({service.incidents.length})
                </>
              )}
            </Button>
          )}
        </div>
      </div>

      {/* Incident List */}
      {showIncidents && service.incidents?.length > 0 && (
        <div className="bg-gray-50 p-3 rounded border border-gray-200 mt-2">
          <h4 className="text-sm font-semibold text-gray-800 mb-2">
            Active Incidents:
          </h4>
          <ul className="space-y-3">
            {service.incidents.map((incident) => (
              <li
                key={incident._id}
                className="border-b border-gray-100 pb-2 last:border-0"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <strong className="text-gray-900">{incident.name}</strong>
                    {editingIncidentId === incident._id ? (
                      <div className="mt-1 flex gap-2">
                        <Input
                          value={updatedIncidentMessage}
                          onChange={(e) =>
                            setUpdatedIncidentMessage(e.target.value)
                          }
                          defaultValue={incident.issueMessage}
                          className="text-sm"
                        />
                        <Button
                          size="sm"
                          onClick={() => handleUpdateIncident(incident._id)}
                        >
                          <Save size={14} />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditingIncidentId(null)}
                        >
                          <X size={14} />
                        </Button>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-700 mt-1">
                        {incident.issueMessage}
                      </p>
                    )}
                  </div>
                  {(userRole === "Admin" || isCollaborator) && (
                    <div className="flex gap-1">
                      {editingIncidentId !== incident._id && (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setEditingIncidentId(incident._id);
                              setUpdatedIncidentMessage(incident.issueMessage);
                            }}
                          >
                            <Edit2 size={14} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleResolveIncident(incident._id)}
                          >
                            Resolve
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteIncident(incident._id)}
                          >
                            <Trash2 size={14} />
                          </Button>
                        </>
                      )}
                    </div>
                  )}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  Created: {new Date(incident.createdAt).toLocaleString()}
                  {incident.status === "resolved" && (
                    <span className="ml-2 text-green-600">• Resolved</span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Create Incident Dialog */}
      <Dialog open={incidentDialogOpen} onOpenChange={setIncidentDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Incident</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Label htmlFor="incidentName">Incident Name</Label>
            <Input
              id="incidentName"
              value={incidentName}
              onChange={(e) => setIncidentName(e.target.value)}
              placeholder="Enter incident title"
            />
            <Label htmlFor="incidentMessage">Issue Message</Label>
            <Input
              id="incidentMessage"
              value={incidentMessage}
              onChange={(e) => setIncidentMessage(e.target.value)}
              placeholder="Enter issue message"
            />
            <Button onClick={handleCreateIncident}>Create Incident</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ServiceCard;
