import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import Login from "./pages/Login";
import Home from "./pages/Home";
import Evaluations from "./pages/Evaluations";
import EvaluationForm from "./pages/EvaluationForm";
import Profile from "./pages/Profile";
import Fun from "./pages/Fun";
import EditProfile from "./pages/EditProfile";
import ChangePassword from "./pages/ChangePassword";
import AdminHome from "./pages/admin/AdminHome";
import AdminCycleDetail from "./pages/admin/AdminCycleDetail";
import AdminPersonReport from "./pages/admin/AdminPersonReport";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminOrgChart from "./pages/admin/AdminOrgChart";
import MyResults from "./pages/MyResults";

function Protected({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="app-shell" />;
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function ManagerOnly({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="app-shell" />;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== "MANAGER") return <Navigate to="/profile" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<Protected><Home /></Protected>} />
      <Route path="/evaluations" element={<Protected><Evaluations /></Protected>} />
      <Route path="/evaluations/:id" element={<Protected><EvaluationForm /></Protected>} />
      <Route path="/profile" element={<Protected><Profile /></Protected>} />
      <Route path="/profile/edit" element={<Protected><EditProfile /></Protected>} />
      <Route path="/profile/password" element={<Protected><ChangePassword /></Protected>} />
      <Route path="/fun" element={<Protected><Fun /></Protected>} />
      <Route path="/my-results" element={<Protected><MyResults /></Protected>} />
      <Route path="/admin" element={<ManagerOnly><AdminHome /></ManagerOnly>} />
      <Route path="/admin/users" element={<ManagerOnly><AdminUsers /></ManagerOnly>} />
      <Route path="/admin/org-chart" element={<ManagerOnly><AdminOrgChart /></ManagerOnly>} />
      <Route path="/admin/cycles/:id" element={<ManagerOnly><AdminCycleDetail /></ManagerOnly>} />
      <Route path="/admin/cycles/:id/report/:userId" element={<ManagerOnly><AdminPersonReport /></ManagerOnly>} />
    </Routes>
  );
}
