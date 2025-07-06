import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";

import { toast } from "sonner";
import axios from "axios";

import { Button } from "@/components/ui/button";
import { BASE_URL } from "@/utls/url";
import { UserLoggedOut } from "@/store/userSlice";
import { resetOrgs } from "@/store/OrgsSlice";

const Navbar = () => {
  const user = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/user/logout`, {
        withCredentials: true,
      });
      dispatch(UserLoggedOut());
      dispatch(resetOrgs())
      toast.success(res.data.message);
      navigate("/auth");
    } catch (error) {
      toast.error(error.message || "Logout failed");
    }
  };

  return (
    <nav className="flex justify-between items-center px-6 py-3 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shadow-sm">
      {/* Left side */}
      <div className="flex items-center space-x-8">
        <Link
          to="/"
          className="text-gray-700 dark:text-gray-300 hover:underline"
        >
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">
            Status Page
          </h1>
        </Link>
      </div>

      {/* Right side */}
      <div className="flex items-center  space-x-2 md:space-x-8">
        <Link to="/request">
          <h1 className="font-bold hover:underline">Request</h1>
        </Link>

        {user?.name && (
          <div className="flex items-center gap-2">
            <span className="text-gray-800 dark:text-gray-200 font-medium">
              {user.name}
            </span>
            {user.role === "Admin" ? (
              <span className="px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                Admin
              </span>
            ) : (
              <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                User
              </span>
            )}
          </div>
        )}
        <Button variant="destructive" onClick={handleLogout}>
          Logout
        </Button>
      </div>
    </nav>
  );
};

export default Navbar;
