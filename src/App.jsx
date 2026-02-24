import { Routes, Route, Link } from "react-router-dom";
import { ToastProvider } from "./components/Toast";
import Home from "./pages/Home";
import Register from "./pages/Register";
import Student from "./pages/Student";
import Academics from "./pages/Academics";
import AcademicsFeedback from "./pages/AcademicsFeedback";
import AcademicsComplaint from "./pages/AcademicsComplaint";
import Hostel from "./pages/Hostel";
import HostelFeedback from "./pages/HostelFeedback";
import HostelComplaint from "./pages/HostelComplaint";
import Sports from "./pages/Sports";
import SportsFeedback from "./pages/SportsFeedback";
import SportsComplaint from "./pages/SportsComplaint";
import Admin from "./pages/Admin";
import AdminPage from "./pages/AdminPage";
import AdminDashboard from "./pages/AdminDashboard";
import AdminForms from "./pages/AdminForms";
import AdminResponses from "./pages/AdminResponses";
import AdminAnalysis from "./pages/AdminAnalysis";
import Subjects from "./pages/Subjects";
import Faculty from "./pages/Faculty";
import GlobalThemeToggle from "./components/GlobalThemeToggle";
import "./styles.css";

function App() {
  return (
    <ToastProvider>
      <GlobalThemeToggle />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/student" element={<Student />} />
        <Route path="/academics" element={<Academics />} />
        <Route path="/academics-feedback" element={<AcademicsFeedback />} />
        <Route path="/academics-complaint" element={<AcademicsComplaint />} />
        <Route path="/hostel" element={<Hostel />} />
        <Route path="/hostel-feedback" element={<HostelFeedback />} />
        <Route path="/hostel-complaint" element={<HostelComplaint />} />
        <Route path="/sports" element={<Sports />} />
        <Route path="/sports-feedback" element={<SportsFeedback />} />
        <Route path="/sports-complaint" element={<SportsComplaint />} />
        <Route path="/admin-legacy" element={<Admin />} />
        <Route path="/admin" element={<AdminPage />}>
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="forms" element={<AdminForms />} />
          <Route path="subjects" element={<Subjects />} />
          <Route path="faculty" element={<Faculty />} />
          <Route path="responses" element={<AdminResponses />} />
          <Route path="analysis" element={<AdminAnalysis />} />
        </Route>
      </Routes>
    </ToastProvider>
  );
}

export default App;
