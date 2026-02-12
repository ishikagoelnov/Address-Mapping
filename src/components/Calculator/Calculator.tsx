import { useNavigate } from "react-router-dom";
import { useCalculator } from "./useCalculator";
import { Alert, useAlert } from "../common/Alert";
import "../Calculator/style.css";
import { unitOptions } from "./types";
import history_icon from "../../assets/history_icon.svg";
import calculator from "../../assets/calculator.svg";

const Calculator = () => {
  const navigate = useNavigate();
  const { alert, showAlert, closeAlert } = useAlert();

  const {
    source,
    setSource,
    destination,
    setDestination,
    unit,
    setUnit,
    loading,
    getDistance,
    formattedDistance,
  } = useCalculator();

  const disableCondition = loading || !source || !destination;

  return (
    <div className="distance-container">
      <Alert alert={alert} onClose={closeAlert} />
      <button
        onClick={() =>
          showAlert(
            "Something went wrong and the calculation failed.",
            "error",
            "Calculation failed",
          )
        }
      >
        Show Alert
      </button>
      <div className="content-wrapper">
        <div className="header">
          <div>
            <div className="calculator-title">Distance Calculator</div>
            <p>
              Prototype web application for calculating the distance between
              addresses.
            </p>
          </div>

          <button className="history-btn" onClick={() => navigate("/history")}>
            View Historical Queries
            <img src={history_icon} alt="history" />
          </button>
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
