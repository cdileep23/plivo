import { io } from "socket.io-client";

export const createSocketConnection = () => {
  const isLocalhost = location.hostname === "localhost";

  return io(
    isLocalhost ? "http://localhost:4545" : "https://plivo-gm7c.onrender.com",
    {
      withCredentials: true,
    
    }
  );
};
