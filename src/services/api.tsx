import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8000",
});

export const getDistance = (source: string, dest: string) =>
  api.get("/nominatim/distance", {
    params: { source, dest },
  });
