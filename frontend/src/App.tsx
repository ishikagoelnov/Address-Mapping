import { BrowserRouter, Routes, Route } from "react-router-dom";
import LoginPage from "./pages/Login";
import SignupPage from "./pages/Signup";
import CalculatorPage from "./pages/Calculator";
import HistoryPage from "./pages/History";
import ProtectedRoute from "./routes/ProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        {/* Protected */}
        <Route path="/calculator" 
          element={
          <ProtectedRoute>
            <CalculatorPage />
          </ProtectedRoute>
          } />
        
        <Route path="/history" 
          element={
          <ProtectedRoute>
              <HistoryPage />
          </ProtectedRoute>
        } />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
