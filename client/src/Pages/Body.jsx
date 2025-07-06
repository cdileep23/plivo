import React, { useEffect } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";

import axios from "axios";
import { useDispatch, useSelector } from "react-redux";

import { UserLoggedIn } from "@/store/userSlice";
import Navbar from "./Navbar";
import { BASE_URL } from "@/utls/url";
import Footer from "./Footer";


const Body = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const user = useSelector((store) => store.user);
  const isAuthRoute = location.pathname.startsWith("/auth");

  const fetchUser = async () => {
    if (user && user.name) return; 

    try {
      const response = await axios.get(`${BASE_URL}/user/profile`, {
        withCredentials: true,
      });

      dispatch(UserLoggedIn(response.data.user));
      if (isAuthRoute) navigate("/");
    } catch (error) {
      if (error.response?.status === 401 && !isAuthRoute) {
        navigate("/auth");
      }
    }
  };

  useEffect(() => {
    fetchUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex w-full flex-col ">
      {!isAuthRoute && <Navbar />}
      <main className={`${isAuthRoute ? "" : "pt-16 flex-grow"} min-h-screen`}>
        <div className="container mx-auto px-4">
          <Outlet />
        </div>
      </main>
      {!isAuthRoute && <Footer />}
    </div>
  );
};

export default Body;
