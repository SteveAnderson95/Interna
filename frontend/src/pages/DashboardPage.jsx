import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";

function DashboardPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await api.get("/api/auth/me");
        setUser(response.data.user);
        localStorage.setItem("user", JSON.stringify(response.data.user));
      } catch (err) {
        setError("Impossible de recuperer l'utilisateur");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  const quickLinks = [
    {
      label: "Mon profil",
      description: "Completer ou mettre a jour les informations de base.",
      to: "/profile",
      roles: ["STUDENT", "COMPANY", "SCHOOL", "ADMIN"],
    },
    {
      label: "Explorer les offres",
      description: "Voir les stages disponibles et les exigences demandees.",
      to: "/offers",
      roles: ["STUDENT", "COMPANY", "SCHOOL", "ADMIN"],
    },
    {
      label: "Mes candidatures",
      description: "Suivre les statuts de tes demandes en cours.",
      to: "/my-applications",
      roles: ["STUDENT"],
    },
    {
      label: "Mon stage",
      description: "Consulter le stage accepte et deposer le rapport.",
      to: "/my-internship",
      roles: ["STUDENT"],
    },
    {
      label: "Creer une offre",
      description: "Publier rapidement un nouveau stage.",
      to: "/company/offers/create",
      roles: ["COMPANY"],
    },
    {
      label: "Candidatures recues",
      description: "Traiter les candidatures associees a tes offres.",
      to: "/company/applications",
      roles: ["COMPANY"],
    },
  ];

  if (loading) {
    return (
      <div className="page-shell">
        <div className="empty-state">Chargement du dashboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-shell">
        <div className="surface-card">
          <p className="message message-error">{error}</p>
          <div className="button-row">
            <button className="button button-primary" onClick={handleLogout}>
              Retour a la connexion
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-shell">
      <section className="dashboard-hero">
        <div>
          <span className="eyebrow">Tableau de bord</span>
          <h1 className="page-title">Interna centralise ton MVP stage.</h1>
          <p className="page-subtitle">
            Authentification, profils, offres, candidatures et uploads sont
            maintenant relies dans la meme interface.
          </p>

          <div className="nav-actions" style={{ marginTop: 26 }}>
            <button className="button button-primary" onClick={handleLogout}>
              Se deconnecter
            </button>
            <Link className="button button-ghost" to="/offers">
              Voir les offres
            </Link>
          </div>
        </div>

        <div className="dashboard-stats">
          <div className="stat-tile">
            <small>Compte actif</small>
            <strong>{user?.email}</strong>
          </div>
          <div className="stat-tile">
            <small>Role courant</small>
            <strong>{user?.role}</strong>
          </div>
        </div>
      </section>

      <section className="section-stack">
        <div className="surface-card">
          <div className="section-header">
            <div>
              <span className="eyebrow">Navigation rapide</span>
              <h2 className="section-title">Actions utiles maintenant</h2>
            </div>
          </div>

          <div className="quick-links">
            {quickLinks
              .filter((item) => item.roles.includes(user?.role))
              .map((item) => (
                <Link key={item.to} className="quick-link" to={item.to}>
                  <strong>{item.label}</strong>
                  <span>{item.description}</span>
                </Link>
              ))}
          </div>
        </div>
      </section>
    </div>
  );
}

export default DashboardPage;
