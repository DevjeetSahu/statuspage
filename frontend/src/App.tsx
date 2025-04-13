import { Routes, Route, Navigate } from "react-router-dom"
import Navbar from "@/components/Navbar"
import ServiceManager from "@/components/ServiceManager"
import ServiceStatusPage from "@/components/ServiceStatusPage"
import LoginPage from "@/pages/LoginPage"
import SignupPage from "@/pages/SignupPage"
import { getAuthToken } from "@/lib/auth"
import { JSX } from "react"
import IncidentManager from "@/pages/IncidentManager";


const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const token = getAuthToken()
  return token ? children : <Navigate to="/login" />
}

export default function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<ServiceStatusPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <ServiceManager />
            </ProtectedRoute>
          }
        />
        <Route
          path="/incidents"
          element={
            <ProtectedRoute>
              <IncidentManager />
            </ProtectedRoute>
          }
        />
      </Routes>
    </>
  );
}
