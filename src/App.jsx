import React, { useEffect } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useNavigate,
  useLocation,
} from "react-router-dom";

import { AuthProvider } from "./context/AuthContext";
import { useAuth } from "./context/AuthContext";
import ProtectedRoute from "./route/ProtectedRoute";
import RoleProtectedRoute from "./route/RoleProtectedRoute";

import Login from "./pages/Login/Login";
import Dashboard from "./pages/Dashboard/Dashboard";
import Emergency from "./components/Emergency/Emergency";
import DashboardLayout from "./components/layout/DashboardLayout";

import Fire from "./pages/Department/Fire/Fire";
import Incident from "./pages/incident/Incident";
import Task from "./pages/task/Task";
import Resources from "./pages/resources/Resources";
import Training from "./pages/Training Module/Training";
import Report from "./pages/Report/Report";
import Electricity from "./pages/Department/Electricity/Electricity";
import Food from "./pages/Department/Food/Food";
import Law from "./pages/Department/Law/Law";
import Ambulance from "./pages/Department/Health/Ambulance/Ambulance";
import PrimaryHealthCare from "./pages/Department/Health/PrimaryHealthCare/PrimaryHealthCare";
import Admin from "./pages/role/Admin/Admin";
import District from "./pages/role/District/District";
import SubDivison from "./pages/role/Subdivision/SubDivison";
import Block from "./pages/role/Block/Block";
import SuperAdmin from "./pages/role/superAdmin/SuperAdmin";
import StockOverview from "./pages/Inventory/StockOverview/StockOverview";
import StockHistory from "./pages/Inventory/StockHistory/StockHistory";
import IssueStock from "./pages/Inventory/IssueStock/IssueStock";
import AddStock from "./pages/Inventory/AddStock/AddStock";
import Equipment from "./pages/Inventory/Equipment/Equipment";
import CategoryDetail from "./pages/Inventory/CategoryDetail/CategoryDetail";
import ERSS from "./pages/DisasterManagement/ERSS/ERSS";
import CCTNS from "./pages/DisasterManagement/CCTNS/CCTNS";
import PreAlert from "./pages/Alert/PreAlert";
import Volunteers from "./pages/Volunteers/Volunteers";
import Ngo from "./pages/NGO/Ngo";
import DistrictLocation from "./pages/location/DistrictLocation";
import SubdivisionLocation from "./pages/location/SubdivisionLocation";
import BlockLocation from "./pages/location/BlockLocation";

const TASK_ONLY_ROLES = new Set(["volunteer", "ngo_contact", "ngo"]);

function CatchAll() {
  const { user } = useAuth();
  const to = user && TASK_ONLY_ROLES.has(user.role) ? "/task" : "/dashboard";
  return <Navigate to={to} replace />;
}

function SessionExpiredAlert() {
  const { sessionExpired, dismissSessionExpired } = useAuth();
  const navigate = useNavigate();

  if (!sessionExpired) return null;

  const handleLoginRedirect = () => {
    dismissSessionExpired();
    navigate("/login", { replace: true });
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 p-4"
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="session-expired-title"
    >
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl">
        <h2
          id="session-expired-title"
          className="text-lg font-semibold text-slate-900"
        >
          Session expired
        </h2>
        <p className="mt-2 text-sm text-slate-600">
          Your session has expired. Please log in again to continue.
        </p>
        <div className="mt-5 flex justify-end">
          <button
            type="button"
            onClick={handleLoginRedirect}
            className="rounded-lg bg-green-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-green-700"
          >
            Go to Login
          </button>
        </div>
      </div>
    </div>
  );
}

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "instant",
    });
  }, [pathname]);

  return null;
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <ScrollToTop />
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* Protected routes — redirects to /login if no token */}
          <Route element={<ProtectedRoute />}>
            <Route element={<DashboardLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/emergency" element={<Emergency />} />

              

              {/* =========================
                Location / User Mgmt
              ========================= */}
              {/* <Route path="/location/admin"       element={<Admin />} />
              <Route path="/location/super-admin" element={<SuperAdmin />} />
              <Route path="/location/district"    element={<District />} />
              <Route path="/location/subdivision" element={<SubDivison />} />
              <Route path="/location/block"       element={<Block />} />
                <Route path="/volunteers" element={<Volunteers />} />
              <Route path="/ngo"        element={<Ngo />} /> */}

              {/* Only super_admin can access Admin */}
              <Route
                element={<RoleProtectedRoute allowedRoles={["super_admin"]} />}
              >
                <Route path="/users/admin" element={<Admin />} />
              </Route>

              {/* Super Admin page */}
              {/* <Route
                element={<RoleProtectedRoute allowedRoles={["super_admin"]} />}
              >
                <Route path="/users/super-admin" element={<SuperAdmin />} />
              </Route> */}


              <Route
                element={
                  <RoleProtectedRoute allowedRoles={["super_admin", "admin"]} />
                }
              >
                <Route path="/location/district" element={<DistrictLocation />} />
                <Route path="/location/subdivision" element={<SubdivisionLocation />} />
                <Route path="/location/block" element={<BlockLocation />} />
              </Route>

              {/* Admin and above can access District */}
              <Route
                element={
                  <RoleProtectedRoute allowedRoles={["super_admin", "admin"]} />
                }
              >
                <Route path="/users/district" element={<District />} />
              </Route>

              {/* District and above can access Subdivision */}
              <Route
                element={
                  <RoleProtectedRoute
                    allowedRoles={["super_admin", "admin", "district"]}
                  />
                }
              >
                <Route path="/users/subdivision" element={<SubDivison />} />
              </Route>

              {/* Subdivision and above can access Block */}
              <Route
                element={
                  <RoleProtectedRoute
                    allowedRoles={[
                      "super_admin",
                      "admin",
                      "district",
                      "subdivision",
                    ]}
                  />
                }
              >
                <Route path="/users/block" element={<Block />} />
              </Route>

              {/* Volunteers */}
              <Route
                element={
                  <RoleProtectedRoute
                    allowedRoles={[
                      "super_admin",
                      "admin",
                      "district",
                      "subdivision",
                    ]}
                  />
                }
              >
                <Route path="/volunteers" element={<Volunteers />} />
              </Route>

              {/* NGO */}
              <Route
                element={
                  <RoleProtectedRoute
                    allowedRoles={[
                      "super_admin",
                      "admin",
                      "district",
                      "subdivision",
                    ]}
                  />
                }
              >
                <Route path="/ngo" element={<Ngo />} />
              </Route>

              {/* =========================
                Departments
              ========================= */}
              <Route path="/department/electricity" element={<Electricity />} />
              <Route path="/department/fire" element={<Fire />} />
              <Route
                path="/department/health/ambulance"
                element={<Ambulance />}
              />
              <Route
                path="/department/health/primary-health-care"
                element={<PrimaryHealthCare />}
              />
              <Route path="/department/food" element={<Food />} />
              <Route path="/department/law&order" element={<Law />} />

              {/* =========================
                Inventory / Stock
              ========================= */}
              <Route path="/inventory/overview" element={<StockOverview />} />
              <Route path="/inventory/history" element={<StockHistory />} />
              <Route path="/inventory/issue" element={<IssueStock />} />
              <Route path="/inventory/add" element={<AddStock />} />
              <Route path="/inventory/equipment" element={<Equipment />} />
              <Route path="/inventory/category/:id" element={<CategoryDetail />} />

              {/* =========================
                Disaster Management
              ========================= */}
              <Route path="/disaster/erss" element={<ERSS />} />
              <Route path="/disaster/cctns" element={<CCTNS />} />
              <Route path="/incident" element={<Incident />} />
              <Route path="/task" element={<Task />} />
              <Route path="/resources" element={<Resources />} />
              <Route path="/training" element={<Training />} />
              <Route path="/reports" element={<Report />} />
              <Route path="/alerts/pre-alerts" element={<PreAlert />} />
            </Route>
          </Route>

          {/* Catch-all — task-only roles land on /task, everyone else on /dashboard */}
          <Route path="*" element={<CatchAll />} />
        </Routes>
        <SessionExpiredAlert />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
