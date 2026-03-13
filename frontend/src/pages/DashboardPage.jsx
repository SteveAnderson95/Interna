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

  if (loading) {
    return <p>Chargement...</p>;
  }

  if (error) {
    return (
      <div>
        <p>{error}</p>
        <button onClick={handleLogout}>Retour a la connexion</button>
      </div>
    );
  }

  return (
    <div>
      <h1>Dashboard</h1>
      <p>Bienvenue sur Interna</p>

      {user && (
        <>
          <p>Email : {user.email}</p>
          <p>Role : {user.role}</p>
        </>
      )}

      <p>
        <Link to="/profile">Mon profil</Link>
      </p>

      <p>
        <Link to="/offers">Voir les offres</Link>
      </p>

      {user?.role === "STUDENT" && (
        <p>
          <Link to="/my-applications">Voir mes candidatures</Link>
        </p>
      )}

      {user?.role === "COMPANY" && (
        <>
          <p>
            <Link to="/company/offers/create">Creer une offre</Link>
          </p>
          <p>
            <Link to="/company/applications">Voir les candidatures recues</Link>
          </p>
        </>
      )}

      <button onClick={handleLogout}>Logout</button>
    </div>
  );
}

export default DashboardPage;
