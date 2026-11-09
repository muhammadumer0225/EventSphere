import axios from "axios";

const API_BASE_URL = "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Shared refresh request
let refreshPromise = null;

// Request Interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },

  async (error) => {
    const originalRequest = error.config;

    const publicRoutes = [
  "/auth/signin",
  "/auth/signup",
  "/auth/forgot-password",
  "/auth/reset-password",
];

const isPublicRoute = publicRoutes.some((route) =>
  originalRequest?.url?.includes(route)
);

    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !originalRequest.url?.includes("/auth/refresh") &&
      !isPublicRoute
    ) {
      originalRequest._retry = true;

      try {
        // Start a new refresh request only when none is running
        if (!refreshPromise) {
          const refreshToken = localStorage.getItem("refreshToken");

          if (!refreshToken) {
            throw new Error("Refresh token not found");
          }

          refreshPromise = axios
            .post(`${API_BASE_URL}/auth/refresh`, {
              refreshToken,
            })
            .then((response) => {
              const {
                token,
                refreshToken: newRefreshToken,
              } = response.data;

              if (!token || !newRefreshToken) {
                throw new Error("New tokens not received");
              }

              localStorage.setItem("token", token);
              localStorage.setItem("refreshToken", newRefreshToken);

              return token;
            })
            .finally(() => {
              refreshPromise = null;
            });
        }

        // All failed requests wait for the same refresh request
        const newToken = await refreshPromise;

        originalRequest.headers.Authorization = `Bearer ${newToken}`;

        // Retry original request
        return api(originalRequest);

      } catch (refreshError) {
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("user");

        window.location.href = "/login";

        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;