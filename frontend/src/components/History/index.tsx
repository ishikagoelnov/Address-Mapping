import { useNavigate } from "react-router-dom";
import "./style.css";
import { useEffect, useState } from "react";
import axiosClient from '../../api/axiosClient';
import { Alert, useAlert } from "../common/Alert";

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

function History() {
  const navigate = useNavigate();

  const [history, setHistory] = useState<any[]>([]);
  const [totalRecords, setTotalRecords] = useState(0);

  const itemsPerPage = 10;
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(totalRecords / itemsPerPage);

  const [isChatOpen, setIsChatOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const { alert, showAlert, closeAlert } = useAlert();
  const [sessionId] = useState(() => crypto.randomUUID());

  useEffect(() => {
    getHistory(currentPage);
  }, [currentPage]);

  const getHistory = async (page = 1) => {
    const token = localStorage.getItem("token");
    const offset = (page - 1) * itemsPerPage;

    try {
      const res = await axiosClient.get("/routes/history", {
        params: { offset, limit: itemsPerPage },
        headers: { Authorization: `Bearer ${token}` },
      });
      setHistory(res.data.items);
      setTotalRecords(res.data.total);

    } catch (err) {
      console.error("Failed to fetch history", err);
      showAlert(
        "Something went wrong.", "error",
        "Failed to fetch history",
      )
    }
  };

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleLogout = async() => {
    localStorage.removeItem("token");
    navigate("/login");
  };


  const toggleChat = () => {
    if (isChatOpen) {
      setMessages([]);
    }
    setIsChatOpen(prev => !prev);
  };


  const sendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputMessage,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage("");
    setIsTyping(true);

    const token = localStorage.getItem("token");

    try {
      const response = await axiosClient.post(
      "/routes/history-insights",
      {
        question: userMessage.text,
        session_id: sessionId
      },
      {
        headers: { Authorization: `Bearer ${token}` }
      }
      );
      setMessages(prev => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          text: response.data.answer,
          isUser: false,
          timestamp: new Date(),
        }
      ]);

    } catch {
      setMessages(prev => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          text: "Sorry, something went wrong while contacting the AI assistant.",
          isUser: false,
          timestamp: new Date(),
        }
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const startRecord = (currentPage - 1) * itemsPerPage + 1;
  const endRecord = Math.min(currentPage * itemsPerPage, totalRecords);

  return (
    <div className="history-page">
      <Alert alert={alert} onClose={closeAlert} />
      <div className="history-header">
        <div>
          <h1>Distance Calculator</h1>
          <p className="subtitle">
            Prototype web application for calculating the distance between addresses.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="back-button" onClick={() => navigate("/calculator")}>
            Back to Calculator
          </button>
          <button className="logout-button" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>

      <div className="history-card">
        <h2>Historical Queries</h2>
        <p className="section-subtitle">History of the user's queries.</p>

        {history.length === 0 ? (
          <div className="empty-state">
            <svg className="empty-state-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M9 11l3 3L22 4"></path>
              <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"></path>
            </svg>
            <h3 className="empty-state-title">No Distance Calculations Yet</h3>
            <p className="empty-state-description">
              Your calculation history is empty.
            </p>
            <p className="empty-state-hint">
              Get started by entering source and destination addresses in the calculator.
            </p>
          </div>
        ) : (
          <>
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
                {history.map((item, index) => (
                  <tr key={index}>
                    <td>{item.source}</td>
                    <td>{item.destination}</td>
                    <td>{item.distance_miles}</td>
                    <td>{item.distance_km}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="pagination">
              <button
                className="pagination-btn pagination-prev"
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
              >
                ← Previous
              </button>
              <div className="pagination-numbers">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  className={`pagination-number ${currentPage === page ? "active" : ""}`}
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

            <div className="pagination-info">
              Showing {startRecord} to {endRecord} of {totalRecords} results
            </div>
          </>
        )}
      </div>

      <button className="chat-button" onClick={toggleChat}>
        {isChatOpen ? "✕" : "💬"}
      </button>

      {isChatOpen && (
        <div className="chat-container">
          <div className="chat-header">
            <h3>Chat Assistant</h3>
            <button className="chat-close" onClick={toggleChat}>✕</button>
          </div>

          <div className="chat-messages">
            {messages.length === 0 && (
              <div className="chat-welcome">
                <p>Hi! I'm here to help you with the Distance Calculator app. Ask me anything!</p>
              </div>
            )}

            {messages.map((message) => (
              <div
                key={message.id}
                className={`message ${message.isUser ? 'user-message' : 'bot-message'}`}
              >
                <div className="message-content">
                  {message.text}
                </div>
                <div className="message-timestamp">
                  {message.timestamp.toLocaleTimeString()}
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="message bot-message">
                <div className="message-content typing">
                  <span>.</span><span>.</span><span>.</span>
                </div>
              </div>
            )}
          </div>

          <div className="chat-input">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              disabled={isTyping}
            />
            <button
              onClick={sendMessage}
              disabled={!inputMessage.trim() || isTyping}
              className="send-button"
            >
              ➤
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default History;
