export const BASE_URL =
  location.hostname === "localhost"
    ? "http://localhost:4545/api/v1"
    : "https://plivo-gm7c.onrender.com/api/v1";