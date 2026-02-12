import axios, { type AxiosInstance, type AxiosResponse, AxiosHeaders } from "axios";

// ----------------- Axios Instance -----------------
const api: AxiosInstance = axios.create({
  baseURL: "http://localhost:8000", // Your FastAPI backend
  headers: {
      "Content-Type": "application/json",
  } as unknown as AxiosHeaders,
  withCredentials: true, // enable cookies if needed
});

// ----------------- INTERCEPTORS -----------------

// Request interceptor: add token
api.interceptors.request.use(
  (config: any) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers = config.headers ?? {};
      (config.headers as AxiosHeaders).set("Authorization", `Bearer ${token}`);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: handle errors
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error) => {
    if (error.response) {
      const status = error.response.status;
      if (status === 401) console.log("Unauthorized! Please login.");
      else if (status === 403) console.log("Forbidden!");
      else if (status >= 500) console.log("Server error!");
    } else if (error.request) {
      console.log("No response from server!");
    }
    return Promise.reject(error);
  }
);

// ----------------- GENERIC CRUD METHODS -----------------
// interface Params {
//   [key: string]: any;
// }

// interface Body {
//   [key: string]: any;
// }

// const ApiService = {
//   // GET list or single resource
//   get: async <T = any>(url: string, params?: Params): Promise<T> => {
//     const response = await api.get<T>(url, { params });
//     return response.data;
//   },

//   // POST new resource
//   post: async <T = any>(url: string, body?: Body): Promise<T> => {
//     const response = await api.post<T>(url, body);
//     return response.data;
//   },

//   // PUT / PATCH update resource
//   put: async <T = any>(url: string, body?: Body): Promise<T> => {
//     const response = await api.put<T>(url, body);
//     return response.data;
//   },

//   // DELETE resource
//   delete: async <T = any>(url: string, params?: Params): Promise<T> => {
//     const response = await api.delete<T>(url, { params });
//     return response.data;
//   },
// };

// export default ApiService;
