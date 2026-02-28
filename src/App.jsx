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
import HodPage from "./pages/HodPage";
import FacultyPage from "./pages/FacultyPage";
import UserManagement from "./pages/UserManagement";
import Subjects from "./pages/Subjects";
import Faculty from "./pages/Faculty";
import GlobalThemeToggle from "./components/GlobalThemeToggle";
import RoleRoute from "./routes/RoleRoute";
import { ROLES } from "./auth/roles";
import "./styles.css";

function App() {
  return (
    <ToastProvider>
      <GlobalThemeToggle />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/student"
          element={
            <RoleRoute allowedRoles={[ROLES.STUDENT]} redirectTo="/">
              <Student />
            </RoleRoute>
          }
        />
        <Route
          path="/academics"
          element={
            <RoleRoute allowedRoles={[ROLES.STUDENT]} redirectTo="/">
              <Academics />
            </RoleRoute>
          }
        />
        <Route
          path="/academics-feedback"
          element={
            <RoleRoute allowedRoles={[ROLES.STUDENT]} redirectTo="/">
              <AcademicsFeedback />
            </RoleRoute>
          }
        />
        <Route
          path="/academics-complaint"
          element={
            <RoleRoute allowedRoles={[ROLES.STUDENT]} redirectTo="/">
              <AcademicsComplaint />
            </RoleRoute>
          }
        />
        <Route
          path="/hostel"
          element={
            <RoleRoute allowedRoles={[ROLES.STUDENT]} redirectTo="/">
              <Hostel />
            </RoleRoute>
          }
        />
        <Route
          path="/hostel-feedback"
          element={
            <RoleRoute allowedRoles={[ROLES.STUDENT]} redirectTo="/">
              <HostelFeedback />
            </RoleRoute>
          }
        />
        <Route
          path="/hostel-complaint"
          element={
            <RoleRoute allowedRoles={[ROLES.STUDENT]} redirectTo="/">
              <HostelComplaint />
            </RoleRoute>
          }
        />
        <Route
          path="/sports"
          element={
            <RoleRoute allowedRoles={[ROLES.STUDENT]} redirectTo="/">
              <Sports />
            </RoleRoute>
          }
        />
        <Route
          path="/sports-feedback"
          element={
            <RoleRoute allowedRoles={[ROLES.STUDENT]} redirectTo="/">
              <SportsFeedback />
            </RoleRoute>
          }
        />
        <Route
          path="/sports-complaint"
          element={
            <RoleRoute allowedRoles={[ROLES.STUDENT]} redirectTo="/">
              <SportsComplaint />
            </RoleRoute>
          }
        />
        <Route
          path="/admin-legacy"
          element={
            <RoleRoute allowedRoles={[ROLES.ADMIN]} redirectTo="/">
              <Admin />
            </RoleRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <RoleRoute allowedRoles={[ROLES.ADMIN]} redirectTo="/">
              <AdminPage />
            </RoleRoute>
          }
        >
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="forms" element={<AdminForms />} />
          <Route path="subjects" element={<Subjects />} />
          <Route path="faculty" element={<Faculty />} />
          <Route path="users" element={<UserManagement />} />
          <Route path="responses" element={<AdminResponses />} />
          <Route path="analysis" element={<AdminAnalysis />} />
        </Route>
        <Route
          path="/hod"
          element={
            <RoleRoute allowedRoles={[ROLES.HOD]} redirectTo="/">
              <HodPage />
            </RoleRoute>
          }
        >
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="forms" element={<AdminForms />} />
          <Route path="users" element={<UserManagement />} />
          <Route path="responses" element={<AdminResponses />} />
          <Route path="analysis" element={<AdminAnalysis />} />
        </Route>
        <Route
          path="/faculty"
          element={
            <RoleRoute allowedRoles={[ROLES.FACULTY]} redirectTo="/">
              <FacultyPage />
            </RoleRoute>
          }
        >
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="forms" element={<AdminForms />} />
          <Route path="responses" element={<AdminResponses />} />
          <Route path="analysis" element={<AdminAnalysis />} />
        </Route>
      </Routes>
    </ToastProvider>
  );
}

export default App;
