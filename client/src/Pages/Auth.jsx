import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import { UserLoggedIn } from "@/store/userSlice";
import { BASE_URL } from "@/utls/url";

const Auth = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [isLoading, setLoading] = useState(false);
  const [tabValue, setTabValue] = useState("signup");

  const [loginInput, setLoginInput] = useState({ email: "", password: "" });
  const [signupInput, setSignupInput] = useState({
    name: "",
    email: "",
    password: "",
    role: "User",
  });

  const handleInputChange = (e, type) => {
    const { name, value } = e.target;
    if (type === "signup") {
      setSignupInput((prev) => ({ ...prev, [name]: value }));
    } else {
      setLoginInput((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleAuth = async (type) => {
    const inputData = type === "signup" ? signupInput : loginInput;
    const endpoint = type === "signup" ? "/user/signup" : "/user/login";

    try {
      setLoading(true);
      const response = await axios.post(`${BASE_URL}${endpoint}`, inputData, {
        withCredentials: true,
      });
      setLoading(false);

      if (response.data.success) {
        toast.success(response.data.message);

        
        dispatch(UserLoggedIn(response.data.user));
        navigate("/");
      }
    } catch (error) {
      setLoading(false);
      const errorMessage =
        error.response?.data?.message || "Something went wrong. Try again.";
      toast.error(errorMessage);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
      <Tabs
        value={tabValue}
        onValueChange={setTabValue}
        className="sm:w-[350px] md:w-[400px]"
      >
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="signup">Sign Up</TabsTrigger>
          <TabsTrigger value="login">Login</TabsTrigger>
        </TabsList>

       
        <TabsContent value="signup">
          <Card>
            <CardHeader>
              <CardTitle className="text-center">Create Account</CardTitle>
              <CardDescription className="text-center">
                Start using the platform by creating an account.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="space-y-1">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  name="name"
                  value={signupInput.name}
                  onChange={(e) => handleInputChange(e, "signup")}
                  placeholder="John Doe"
                  required
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={signupInput.email}
                  onChange={(e) => handleInputChange(e, "signup")}
                  placeholder="john@example.com"
                  required
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={signupInput.password}
                  onChange={(e) => handleInputChange(e, "signup")}
                  placeholder="********"
                  required
                />
              </div>
              <div className="space-y-1">
                <Label>Role</Label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="role"
                      value="User"
                      checked={signupInput.role === "User"}
                      onChange={(e) => handleInputChange(e, "signup")}
                    />
                    User
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="role"
                      value="Admin"
                      checked={signupInput.role === "Admin"}
                      onChange={(e) => handleInputChange(e, "signup")}
                    />
                    Admin
                  </label>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                disabled={isLoading}
                onClick={() => handleAuth("signup")}
                className="w-full"
              >
                {isLoading ? "Creating Account..." : "Sign Up"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

       
        <TabsContent value="login">
          <Card>
            <CardHeader>
              <CardTitle className="text-center">Welcome Back</CardTitle>
              <CardDescription className="text-center">
                Enter your credentials to login.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="space-y-1">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={loginInput.email}
                  onChange={(e) => handleInputChange(e, "login")}
                  placeholder="john@example.com"
                  required
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={loginInput.password}
                  onChange={(e) => handleInputChange(e, "login")}
                  placeholder="********"
                  required
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button
                disabled={isLoading}
                onClick={() => handleAuth("login")}
                className="w-full"
              >
                {isLoading ? "Logging In..." : "Login"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Auth;
