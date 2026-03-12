import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { Link } from "react-router-dom";


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
      } catch (err) {
        setError("Impossible de récupérer l'utilisateur");
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
        <button onClick={handleLogout}>Retour à la connexion</button>
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
          <p>Rôle : {user.role}</p>
        </>
      )}

      <button onClick={handleLogout}>Logout</button>
      <p>
        <Link to="/offers">Voir les offres</Link>
        </p>
        <p>
            <Link to="/profile">Aller à mon profil</Link>
        </p>

    </div>
  );
}

export default DashboardPage;
