import { useEffect } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { useWorkspaceStore } from "./store/useWorkspaceStore";
import { useUIStore } from "./store/useUIStore";
import LandingPage from "./pages/LandingPage";
import CompanyGeneratorPage from "./pages/CompanyGeneratorPage";
import DashboardLayout from "./pages/DashboardLayout";
import OverviewPage from "./pages/OverviewPage";
import CompanyPage from "./pages/CompanyPage";
import TasksPage from "./pages/TasksPage";
import ApprovalsPage from "./pages/ApprovalsPage";
import ActivityPage from "./pages/ActivityPage";
import GoalsPage from "./pages/GoalsPage";
import SitePage from "./pages/SitePage";
import AnalyticsPage from "./pages/AnalyticsPage";
import KnowledgePage from "./pages/KnowledgePage";
import SettingsPage from "./pages/SettingsPage";

function RequireCompany({ children }: { children: React.ReactNode }) {
  const company = useWorkspaceStore((s) => s.company);
  if (!company) return <Navigate to="/create" replace />;
  return <>{children}</>;
}

export default function App() {
  const theme = useUIStore((s) => s.theme);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/create" element={<CompanyGeneratorPage />} />
      <Route
        path="/app"
        element={
          <RequireCompany>
            <DashboardLayout />
          </RequireCompany>
        }
      >
        <Route index element={<OverviewPage />} />
        <Route path="company" element={<CompanyPage />} />
        <Route path="tasks" element={<TasksPage />} />
        <Route path="approvals" element={<ApprovalsPage />} />
        <Route path="activity" element={<ActivityPage />} />
        <Route path="goals" element={<GoalsPage />} />
        <Route path="site" element={<SitePage />} />
        <Route path="analytics" element={<AnalyticsPage />} />
        <Route path="knowledge" element={<KnowledgePage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
