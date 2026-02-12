import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./style.css";

function History() {
  const navigate = useNavigate();

  // dummy data for now
  const allHistoryData = Array.from({ length: 25 });
  const itemsPerPage = 10;
  const [currentPage, setCurrentPage] = useState(1);

  // Calculate pagination
  const totalPages = Math.ceil(allHistoryData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentPageData = allHistoryData.slice(startIndex, endIndex);

  // Handle page change
  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <div className="history-page">
      {/* Header */}
      <div className="history-header">
        <div>
          <h1>Distance Calculator</h1>
          <p className="subtitle">
            Prototype web application for calculating the distance between addresses.
          </p>
        </div>

        <button
          className="back-button"
          onClick={() => navigate("/calculator")}
        >
          Back to Calculator
        </button>
      </div>

      {/* History Section */}
      <div className="history-card">
        <h2>Historical Queries</h2>
        <p className="section-subtitle">History of the user's queries.</p>

        <table className="history-table">
          <thead>
            <tr>
              <th>Source Address</th>
              <th>Destination Address</th>
              <th>Distance in Miles</th>
              <th>Distance in Kilometers</th>
            </tr>
          </thead>
          <tbody>
            {currentPageData.map((_, index) => (
              <tr key={index}>
                <td>[Source Address]</td>
                <td>[Destination Address]</td>
                <td>[Distance Miles]</td>
                <td>[Distance Kilometers]</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="pagination">
          <button
            className="pagination-btn pagination-prev"
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage === 1}
          >
            ← Previous
          </button>

          <div className="pagination-numbers">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                className={`pagination-number ${
                  currentPage === page ? "active" : ""
                }`}
                onClick={() => goToPage(page)}
              >
                {page}
              </button>
            ))}
          </div>

          <button
            className="pagination-btn pagination-next"
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Next →
          </button>
        </div>

        {/* Page Info */}
        <div className="pagination-info">
          Showing {startIndex + 1} to {Math.min(endIndex, allHistoryData.length)} of{" "}
          {allHistoryData.length} results
        </div>
      </div>
    </div>
  );
}

export default History;