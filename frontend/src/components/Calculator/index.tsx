import { useNavigate } from "react-router-dom";
import { useState } from "react";

import { Alert, useAlert } from "../common/Alert";
import history_icon from "../../assets/history_icon.svg";
import calculator from "../../assets/calculator.svg";
import axiosClient from "../../api/axiosClient";

import "../Calculator/style.css";


const Calculator = () => {
  type Unit = "miles" | "kilometers" | "both";

  type DistanceResponse = {
    source: string;
    destination: string;
    unit: string;
    distance_km: number;
    distance_miles: number;
  };

  const unitOptions: { label: string; value: Unit }[] = [
    { label: "Miles", value: "miles" },
    { label: "Kilometers", value: "kilometers" },
    { label: "Both", value: "both" },
  ];

  const navigate = useNavigate();
  const [source, setSource] = useState("");
  const [destination, setDestination] = useState("");
  const [unit, setUnit] = useState<Unit>("miles");
  const [distance, setDistance] = useState<DistanceResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const { alert, showAlert, closeAlert } = useAlert();

  

  const getDistance = async () => {
    if (!source || !destination) return;
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login")
      return;
    }
    try {
      setLoading(true);
      const response = await axiosClient.post(
        "/routes/distance",
        {source, destination, unit},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setDistance(response.data);

    } catch (err) {
      console.error("Failed to fetch distance", err);
      showAlert(
        "Something went wrong and the calculation failed.",
        "error",
        "Calculation failed",
      )

    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const formattedDistance = () => {
    if (!distance) return "";

    const km = `${distance.distance_km} km`;
    const mi = `${distance.distance_miles} mi`;

    if (unit === "both") return `${km} / ${mi}`;
    if (unit === "kilometers") return km;
    return mi;
  };

  const disableCondition = loading || !source || !destination;
  return (
      <div className="distance-container">
        <Alert alert={alert} onClose={closeAlert} />
        <div className="content-wrapper">
          <div className="header">
            <div>
              <div className="calculator-title">Distance Calculator</div>
              <p>
                Prototype web application for calculating the distance between
                addresses.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button className="history-btn" onClick={() => navigate("/history")}>
                View Historical Queries
                <img src={history_icon} alt="history" />
              </button>
              <button className="logout-btn" onClick={handleLogout}>
                Logout
              </button>
            </div>
          </div>

          <div className="card">
            <div className="inputs">
              <div className="field">
                <label>Source Address</label>
                <input
                  type="text"
                  placeholder="Input address"
                  value={source}
                  onChange={(e) => setSource(e.target.value)}
                />
              </div>

              <div className="field">
                <label>Destination Address</label>
                <input
                  type="text"
                  placeholder="Input address"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  className="input-field"
                />
              </div>

              <div className="field">
                <label>Unit</label>
                <div className="radio-group">
                  {unitOptions.map(({ label, value }) => (
                    <label key={value}>
                      <input
                        type="radio"
                        checked={unit === value}
                        onChange={() => setUnit(value)}
                      />
                      {label}
                    </label>
                  ))}
                </div>
              </div>

              <div className="field">
                <label>Distance</label>
                <div className="distance-value">
                  {loading ? "Calculating..." : formattedDistance()}
                </div>
              </div>
            </div>

            <button
              className="calculate-btn"
              disabled={disableCondition}
              onClick={getDistance}
            >
              {loading ? "Calculating..." : "Calculate Distance"}
              <img
                src={calculator}
                alt="calculate"
                style={{
                  opacity: !disableCondition ? 1 : 0.4,
                }}
              />
            </button>
          </div>
        </div>
      </div>
    );
};

export default Calculator;