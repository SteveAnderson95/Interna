import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../services/api";

function RegisterPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    role: "STUDENT",
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
      const response = await api.post("/api/auth/register", formData);
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Erreur d'inscription");
    }
  };

  return (
    <div className="auth-shell">
      <section className="auth-panel">
        <div className="auth-brand">
          <span className="eyebrow">MVP PFE</span>
          <h1>Demarre vite, garde une structure propre.</h1>
          <p>
            Cree un compte selon ton role pour publier, postuler ou superviser
            les stages.
          </p>
        </div>

        <div className="feature-list">
          <div className="feature-item">
            <strong>Etudiant</strong>
            <span>Profil, CV, candidature et suivi des statuts.</span>
          </div>
          <div className="feature-item">
            <strong>Entreprise</strong>
            <span>Publication d'offres et traitement des candidatures.</span>
          </div>
          <div className="feature-item">
            <strong>Ecole</strong>
            <span>Base deja prete pour la supervision et la validation.</span>
          </div>
        </div>
      </section>

      <section className="auth-card">
        <span className="eyebrow">Inscription</span>
        <h2>Creer un espace</h2>
        <p>Commence avec un compte simple, puis complete ton profil apres.</p>

        <form className="form-stack" onSubmit={handleSubmit}>
          <div className="form-field">
            <label htmlFor="register-email">Email</label>
            <input
              id="register-email"
              className="input"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="contact@interna.ma"
            />
          </div>

          <div className="form-field">
            <label htmlFor="register-password">Mot de passe</label>
            <input
              id="register-password"
              className="input"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Choisis un mot de passe"
            />
          </div>

          <div className="form-field">
            <label htmlFor="register-role">Role</label>
            <select
              id="register-role"
              className="select"
              name="role"
              value={formData.role}
              onChange={handleChange}
            >
              <option value="STUDENT">Etudiant</option>
              <option value="COMPANY">Entreprise</option>
              <option value="SCHOOL">Ecole</option>
            </select>
          </div>

          {error && <p className="message message-error">{error}</p>}

          <div className="button-row">
            <button className="button button-primary" type="submit">
              Creer un compte
            </button>
          </div>
        </form>

        <p className="muted-text" style={{ marginTop: 22 }}>
          Deja inscrit ? <Link to="/login">Se connecter</Link>
        </p>
      </section>
    </div>
  );
}

export default RegisterPage;
