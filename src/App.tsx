import { Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import AccountDashboard from "./pages/AccountDashboard";
import Playground from "./pages/Playground";
import AdminDashboard from "./pages/AdminDashboard";

import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";
import CourseAccessRoute from "./components/CourseAccessRoute";
import CourseDetails from "./pages/CourseDetails";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />

      <Route path="/login" element={<Login />} />

      <Route path="/register" element={<Register />} />
      <Route path="/courses/:slug" element={<CourseDetails />} />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <AccountDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/learning"
        element={
          <ProtectedRoute>
            <CourseAccessRoute>
              <Dashboard />
            </CourseAccessRoute>
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/playground"
        element={
          <ProtectedRoute>
            <CourseAccessRoute>
              <Playground />
            </CourseAccessRoute>
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin"
        element={
          <AdminRoute>
            <AdminDashboard />
          </AdminRoute>
        }
      />
    </Routes>
  );
}
