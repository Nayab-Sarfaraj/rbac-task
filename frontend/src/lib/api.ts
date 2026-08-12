import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // Crucial to send HTTP-only refresh cookies
});

let accessToken: string | null = null;
let refreshSubscribers: ((token: string) => void)[] = [];
let isRefreshing = false;

export const setAccessToken = (token: string | null) => {
  accessToken = token;
};

export const getAccessToken = () => accessToken;

// Request Interceptor: Attach bearer token if present
api.interceptors.request.use(
  (config) => {
    if (accessToken && config.headers) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

const onRefreshed = (token: string) => {
  refreshSubscribers.map((cb) => cb(token));
  refreshSubscribers = [];
};

const addRefreshSubscriber = (cb: (token: string) => void) => {
  refreshSubscribers.push(cb);
};

// Response Interceptor: Silent refresh on 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { config, response } = error;
    const originalRequest = config;

    // If 401, not a login attempt, and hasn't been retried yet
    if (response?.status === 401 && !originalRequest._retry && !originalRequest.url?.includes("/auth/login")) {
      originalRequest._retry = true;

      if (!isRefreshing) {
        isRefreshing = true;
        try {
          const res = await axios.post(
            `${API_URL}/auth/refresh`,
            {},
            { withCredentials: true }
          );

          const newAccessToken = res.data.data.accessToken;
          setAccessToken(newAccessToken);
          isRefreshing = false;

          onRefreshed(newAccessToken);
          
          return api(originalRequest);
        } catch (refreshError) {
          isRefreshing = false;
          setAccessToken(null);
          // Redirect to login if token refresh fails
          if (typeof window !== "undefined") {
            window.dispatchEvent(new Event("auth-logout"));
          }
          return Promise.reject(refreshError);
        }
      }

      // If refresh is already in progress, wait for it to complete
      return new Promise((resolve) => {
        addRefreshSubscriber((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          resolve(api(originalRequest));
        });
      });
    }

    return Promise.reject(error);
  }
);
