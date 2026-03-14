import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import "./App.css";
import HomePage from "./pages/public/HomePage";
import LoginPage from "./pages/public/LoginPage";
import RegisterPage from "./pages/public/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import ProtectedRoute from "./components/ProtectedRoute";
import PublicRoute from "./components/PublicRoute";
import AppLayout from "./components/AppLayout";
import ProfilePage from "./pages/ProfilePage";
import OffersPage from "./pages/OffersPage";
import MyApplicationsPage from "./pages/MyApplicationsPage";
import CompanyApplicationsPage from "./pages/CompanyApplicationsPage";
import CreateOfferPage from "./pages/CreateOfferPage";
import MyInternshipPage from "./pages/MyInternshipPage";
import CompanyInternshipsPage from "./pages/CompanyInternshipsPage";
import SchoolDashboardPage from "./pages/SchoolDashboardPage";
import AdminDashboardPage from "./pages/AdminDashboardPage";
import MatchingPage from "./pages/MatchingPage";
import CompanyProfilePage from "./pages/CompanyProfilePage";
import CompanyOffersPage from "./pages/CompanyOffersPage";
import OfferDetailPage from "./pages/OfferDetailPage";


function App() {
  const withLayout = (element) => (
    <ProtectedRoute>
      <AppLayout>{element}</AppLayout>
    </ProtectedRoute>
  );

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />

        <Route
          path="/profile"
          element={withLayout(<ProfilePage />)}
        />

        <Route
          path="/company/offers/create"
          element={withLayout(<CreateOfferPage />)}
        />

        <Route
          path="/company/offers"
          element={withLayout(<CompanyOffersPage />)}
        />


        <Route
          path="/company/applications"
          element={withLayout(<CompanyApplicationsPage />)}
        />

        <Route
          path="/company/internships"
          element={withLayout(<CompanyInternshipsPage />)}
        />

        <Route
          path="/school/dashboard"
          element={withLayout(<SchoolDashboardPage />)}
        />

        <Route
          path="/admin/dashboard"
          element={withLayout(<AdminDashboardPage />)}
        />


        <Route
          path="/my-applications"
          element={withLayout(<MyApplicationsPage />)}
        />

        <Route
          path="/my-internship"
          element={withLayout(<MyInternshipPage />)}
        />

        <Route
          path="/offers"
          element={withLayout(<OffersPage />)}
        />

        <Route
          path="/offers/:id"
          element={withLayout(<OfferDetailPage />)}
        />

        <Route
          path="/matching"
          element={withLayout(<MatchingPage />)}
        />

        <Route
          path="/company/:id"
          element={withLayout(<CompanyProfilePage />)}
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
          element={withLayout(<DashboardPage />)}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
