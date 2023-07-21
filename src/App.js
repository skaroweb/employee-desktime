import RegisterPage from "./pages/RegisterPage";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/Dashboard";
import DesktimePage from "./pages/Desktime";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Projectpage from "./pages/Projects";
import Reportpage from "./pages/Reports";
import MyComponent from "./pages/test";

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/desktime" element={<DesktimePage />} />
          <Route path="/project" element={<Projectpage />} />
          <Route path="/report" element={<Reportpage />} />
          <Route path="/test" element={<MyComponent />} />
          <Route path="/" element={<h1>Home</h1>} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
