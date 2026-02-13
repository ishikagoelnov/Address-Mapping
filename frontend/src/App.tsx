import { BrowserRouter, Routes, Route } from "react-router-dom";
import LoginPage from "./pages/Login";
import SignupPage from "./pages/Signup";
import CalculatorPage from "./pages/Calculator";
import HistoryPage from "./pages/History";
import ProtectedRoute from "./routes/ProtectedRoute";
import GuestOnlyRoute from "./routes/GuestOnlyRoutes";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Guest only routes */}
        <Route path="/"
          element={
            <GuestOnlyRoute>
              <LoginPage />
            </GuestOnlyRoute>
          }
        />

        <Route path="/login"
          element={
            <GuestOnlyRoute>
              <LoginPage />
            </GuestOnlyRoute>
          }
        />

        <Route path="/signup"
          element={
            <GuestOnlyRoute>
              <SignupPage />
            </GuestOnlyRoute>
          }
        />

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
