const getDefaultApiBaseUrl = () => {
  if (typeof window === "undefined") {
    return "http://localhost:8080";
  }

  const protocol = window.location.protocol || "http:";
  const hostname = window.location.hostname || "localhost";
  return `${protocol}//${hostname}:8080`;
};

export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || getDefaultApiBaseUrl()).replace(/\/$/, "");
