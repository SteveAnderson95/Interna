import { useEffect, useMemo, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import api from "../services/api";
import BrandLogo from "./BrandLogo";

function AppLayout({ children }) {
  const navigate = useNavigate();
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  });
  const [profilePhotoUrl, setProfilePhotoUrl] = useState("");

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await api.get("/api/profile/me");
        setUser(response.data.user);
        setProfilePhotoUrl(response.data.profile?.photoUrl || "");
        localStorage.setItem("user", JSON.stringify(response.data.user));
      } catch (error) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
      }
    };

    fetchUser();
  }, [navigate]);

  const navItems = useMemo(
    () => [
      {
        label: "Tableau de bord",
        description: "Vue generale",
        to: "/dashboard",
        roles: ["STUDENT", "COMPANY", "SCHOOL", "ADMIN"],
      },
      {
        label: "Mon profil",
        description: "Informations et fichiers",
        to: "/profile",
        roles: ["STUDENT", "COMPANY", "SCHOOL", "ADMIN"],
      },
      {
        label: "Offres",
        description: "Catalogue des stages",
        to: "/offers",
        roles: ["STUDENT", "COMPANY", "SCHOOL", "ADMIN"],
      },
      {
        label: "Matching",
        description: "Offres recommandees",
        to: "/matching",
        roles: ["STUDENT"],
      },
      {
        label: "Mes candidatures",
        description: "Suivi de mes demandes",
        to: "/my-applications",
        roles: ["STUDENT"],
      },
      {
        label: "Mon stage",
        description: "Stage accepte et rapport",
        to: "/my-internship",
        roles: ["STUDENT"],
      },
      {
        label: "Mes offres",
        description: "Edition et suppression",
        to: "/company/offers",
        roles: ["COMPANY"],
      },
      {
        label: "Publier une offre",
        description: "Creation rapide",
        to: "/company/offers/create",
        roles: ["COMPANY"],
      },
      {
        label: "Candidatures recues",
        description: "Traitement entreprise",
        to: "/company/applications",
        roles: ["COMPANY"],
      },
      {
        label: "Stages entreprise",
        description: "Attestations et evaluation",
        to: "/company/internships",
        roles: ["COMPANY"],
      },
      {
        label: "Espace ecole",
        description: "Supervision et validation",
        to: "/school/dashboard",
        roles: ["SCHOOL"],
      },
      {
        label: "Administration",
        description: "Comptes et supervision",
        to: "/admin/dashboard",
        roles: ["ADMIN"],
      },
    ],
    []
  );

  const visibleNavItems = navItems.filter((item) => item.roles.includes(user?.role));

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const initials = (user?.email || "IN").slice(0, 2).toUpperCase();
  const avatarSrc = profilePhotoUrl ? `${api.defaults.baseURL}/${profilePhotoUrl}` : "";

  return (
    <div className="app-shell">
      <aside className="app-sidebar">
        <div className="app-brand">
          <BrandLogo compact inverse />
        </div>

        <nav className="app-nav">
          {visibleNavItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `app-nav-link${isActive ? " app-nav-link-active" : ""}`
              }
            >
              <strong>{item.label}</strong>
              <span>{item.description}</span>
            </NavLink>
          ))}
        </nav>

        <button className="button button-ghost sidebar-logout" onClick={handleLogout}>
          Deconnexion
        </button>
      </aside>

      <section className="app-main">
        <header className="app-topbar">
          <div>
            <p className="topbar-kicker">Plateforme intelligente de gestion des stages</p>
            <h2 className="topbar-title">Espace de travail</h2>
          </div>

          <div className="topbar-profile">
            {avatarSrc ? (
              <img alt="Profil" className="topbar-avatar-image" src={avatarSrc} />
            ) : (
              <div className="topbar-avatar">{initials}</div>
            )}
            <div>
              <strong>{user?.email || "Chargement..."}</strong>
              <span>{user?.role || "Utilisateur"}</span>
            </div>
          </div>
        </header>

        <main className="app-content">{children}</main>
      </section>
    </div>
  );
}

export default AppLayout;
