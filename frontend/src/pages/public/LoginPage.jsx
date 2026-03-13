import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../services/api";

function LoginPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");

  const handleChange = (event) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value,
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    try {
      const response = await api.post("/api/auth/login", formData);
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Erreur de connexion");
    }
  };

  return (
    <div className="auth-shell">
      <section className="auth-panel">
        <div className="auth-brand">
          <span className="eyebrow">Interna platform</span>
          <h1>Stages plus clairs, suivi plus simple.</h1>
          <p>
            Connecte et pilote les flux entre etudiants, entreprises et ecoles
            sur une seule interface.
          </p>
        </div>

        <div className="feature-list">
          <div className="feature-item">
            <strong>Suivi des candidatures</strong>
            <span>Chaque statut reste visible et actionnable.</span>
          </div>
          <div className="feature-item">
            <strong>Profils centralises</strong>
            <span>CV, profils entreprise et donnees ecole au meme endroit.</span>
          </div>
          <div className="feature-item">
            <strong>MVP deja branché</strong>
            <span>Auth, offres, candidatures et uploads fonctionnels.</span>
          </div>
        </div>
      </section>

      <section className="auth-card">
        <span className="eyebrow">Connexion</span>
        <h2>Reprendre la session</h2>
        <p>Entre tes identifiants pour acceder a ton espace Interna.</p>

        <form className="form-stack" onSubmit={handleSubmit}>
          <div className="form-field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              className="input"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="exemple@interna.ma"
            />
          </div>

          <div className="form-field">
            <label htmlFor="password">Mot de passe</label>
            <input
              id="password"
              className="input"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Ton mot de passe"
            />
          </div>

          {error && <p className="message message-error">{error}</p>}

          <div className="button-row">
            <button className="button button-primary" type="submit">
              Se connecter
            </button>
          </div>
        </form>

        <p className="muted-text" style={{ marginTop: 22 }}>
          Pas encore de compte ? <Link to="/register">Creer un compte</Link>
        </p>
      </section>
    </div>
  );
}

export default LoginPage;
