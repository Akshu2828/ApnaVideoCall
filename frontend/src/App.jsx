import "./App.css";
import {
  Route,
  BrowserRouter as Router,
  Routes,
  useNavigate,
} from "react-router-dom";
import LoginSignPage from "./pages/LoginSignPage";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import VideoMeetComponent from "./pages/VideoMeetComponent";
import History from "./pages/History";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import { useEffect } from "react";
import LandingPage from "./pages/LandinngPage";

function App() {
  return (
    <div className="App">
      <Router>
        <AuthProvider>
          <AuthRedirect />
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<LandingPage />} />
              <Route path="/auth" element={<LoginSignPage />} />
            </Route>
            <Route path="/:url" element={<VideoMeetComponent />} />
            <Route path="/home" element={<Home />} />
            <Route path="/history" element={<History />} />
          </Routes>
        </AuthProvider>
      </Router>
    </div>
  );
}

function AuthRedirect() {
  const navigate = useNavigate();
  const { userData } = useAuth();

  useEffect(() => {
    if (userData) {
      if (
        window.location.pathname === "/" ||
        window.location.pathname === "/auth"
      ) {
        navigate("/home", { replace: true });
      }
    } else {
      if (
        window.location.pathname !== "/" &&
        window.location.pathname !== "/auth"
      ) {
        navigate("/auth", { replace: true });
      }
    }
  }, [userData, navigate]);

  return null;
}

export default App;
