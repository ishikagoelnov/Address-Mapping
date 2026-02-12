import axios from "axios";
import { useState } from "react";
import type { DistanceResponse, Unit } from "./types";

export const useCalculator = () => {
  const [source, setSource] = useState("");
  const [destination, setDestination] = useState("");
  const [unit, setUnit] = useState<Unit>("miles");
  const [distance, setDistance] = useState<DistanceResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const getDistance = async () => {
    if (!source || !destination) return;

    try {
      setLoading(true);
      const response = await axios.post(
        "http://localhost:8000/nominatim/distance",
        {source, destination, unit}
      );
      setDistance(response.data);
    } catch (err) {
      console.error("Failed to fetch distance", err);
    } finally {
      setLoading(false);
    }
  };

  const formattedDistance = () => {
    if (!distance) return "";

    const km = `${distance.distance_km} km`;
    const mi = `${distance.distance_miles} mi`;

    if (unit === "both") return `${km} / ${mi}`;
    if (unit === "kilometers") return km;
    return mi;
  };

  return {
    source,
    setSource,
    destination,
    setDestination,
    unit,
    setUnit,
    loading,
    getDistance,
    formattedDistance,
  };
};
