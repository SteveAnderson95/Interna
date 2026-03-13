import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import "./App.css";
import LoginPage from "./pages/public/LoginPage";
import RegisterPage from "./pages/public/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import ProtectedRoute from "./components/ProtectedRoute";
import PublicRoute from "./components/PublicRoute";
import ProfilePage from "./pages/ProfilePage";
import OffersPage from "./pages/OffersPage";
import MyApplicationsPage from "./pages/MyApplicationsPage";
import CompanyApplicationsPage from "./pages/CompanyApplicationsPage";
import CreateOfferPage from "./pages/CreateOfferPage";
import MyInternshipPage from "./pages/MyInternshipPage";
import CompanyInternshipsPage from "./pages/CompanyInternshipsPage";


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/company/offers/create"
          element={
            <ProtectedRoute>
              <CreateOfferPage />
            </ProtectedRoute>
          }
        />


        <Route
          path="/company/applications"
          element={
            <ProtectedRoute>
              <CompanyApplicationsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/company/internships"
          element={
            <ProtectedRoute>
              <CompanyInternshipsPage />
            </ProtectedRoute>
          }
        />


        <Route
          path="/my-applications"
          element={
            <ProtectedRoute>
              <MyApplicationsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/my-internship"
          element={
            <ProtectedRoute>
              <MyInternshipPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/offers"
          element={
            <ProtectedRoute>
              <OffersPage />
            </ProtectedRoute>
          }
        />


        <Route
          path="/login"
          element={
            <PublicRoute>
              <LoginPage />
            </PublicRoute>
          }
        />

        <Route
          path="/register"
          element={
            <PublicRoute>
              <RegisterPage />
            </PublicRoute>
          }
        />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
