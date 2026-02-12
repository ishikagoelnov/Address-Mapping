export type Unit = "miles" | "kilometers" | "both";

export type DistanceResponse = {
  source: string;
  destination: string;
  unit: string;
  distance_km: number;
  distance_miles: number;
};

export const unitOptions: { label: string; value: Unit }[] = [
  { label: "Miles", value: "miles" },
  { label: "Kilometers", value: "kilometers" },
  { label: "Both", value: "both" },
];