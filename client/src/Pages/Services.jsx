import React, { useEffect, useState } from "react";
import axios from "axios";
import { useSelector, useDispatch } from "react-redux";
import { BASE_URL } from "@/utls/url";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { addOrgs, resetOrgs } from "@/store/OrgsSlice";
import { Link } from "react-router-dom";
import { UsersIcon } from "lucide-react";

const Services = () => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user);
  const orgs = useSelector((state) => state.Orgs);
  console.log(orgs)
  const [open, setOpen] = useState(false);
  const [error, setError] = useState(null);
  const [orgName, setOrgName] = useState("");

  const fetchOrgs = async () => {
    try {
      setError(null);
      const url =
        user?.role === "Admin"
          ? `${BASE_URL}/org/my-admin-orgs`
          : `${BASE_URL}/org/all`;

      const res = await axios.get(url, { withCredentials: true });
      console.log(res.data);
      dispatch(addOrgs(res.data?.organizations || []));
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load organizations.");
    }
  };

  useEffect(() => {
    if (user) fetchOrgs();
   
  }, [user]);

  const handleAddOrg = async () => {
    try {
      if (!orgName.trim()) {
        return toast.error("Organization name is required");
      }

      await axios.post(
        `${BASE_URL}/org/create-org`,
        { name: orgName },
        { withCredentials: true }
      );

      toast.success("Organization created");
      setOrgName("");
      fetchOrgs();
      setOpen(false); 
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Failed to create organization."
      );
    }
  };

  const handleDelete = async (orgId) => {
    try {
      await axios.delete(`${BASE_URL}/org/delete-org/${orgId}`, {
        withCredentials: true,
      });
      toast.success("Organization deleted");
      fetchOrgs();
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Failed to delete organization."
      );
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Organizations</h1>

        {user?.role === "Admin" && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => setOpen(true)}>+ Add Organization</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Organization</DialogTitle>
              </DialogHeader>

              <div className="grid gap-4 py-4">
                <Label htmlFor="orgName">Organization Name</Label>
                <Input
                  id="orgName"
                  placeholder="Enter organization name"
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                />
              </div>

              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">Cancel</Button>
                </DialogClose>
                <Button onClick={handleAddOrg}>Create</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* UI States */}
      {orgs === null ? (
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500" />
        </div>
      ) : Array.isArray(orgs) && orgs.length === 0 ? (
        <p>No organizations found.</p>
      ) : Array.isArray(orgs) ? (
        <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {orgs.map((org) => (
            <Link key={org._id} to={`/services/${org._id}`}>
              <div className="border p-4 rounded shadow hover:shadow-md transition flex justify-between items-center">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-semibold">{org.name}</h2>
                    {org.isCollaborator && (
                      <span
                        title="Collaborator"
                        className="text-blue-600 bg-blue-100 rounded-full px-2 py-0.5 text-xs flex items-center gap-1"
                      >
                        <UsersIcon size={14} />
                        Collaborator
                      </span>
                    )}
                  </div>

                  <p className="text-sm text-gray-700">
                    Services:{" "}
                    <span className="font-medium">{org.serviceCount}</span>
                  </p>
                </div>

                {user?.role === "Admin" && (
                  <Button
                    variant="destructive"
                    onClick={(e) => {
                      e.preventDefault(); // Prevent navigation on delete
                      handleDelete(org._id);
                    }}
                  >
                    Delete
                  </Button>
                )}
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <p className="text-red-500">Invalid organization data format.</p>
      )}
    </div>
  );
};

export default Services;
