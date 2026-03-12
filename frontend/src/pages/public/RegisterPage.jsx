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
    <div>
      <h1>Register</h1>
      <p>Créer un compte Interna</p>

      <form onSubmit={handleSubmit}>
        <div>
          <label>Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
          />
        </div>

        <div>
          <label>Mot de passe</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
          />
        </div>

        <div>
          <label>Rôle</label>
          <select
            name="role"
            value={formData.role}
            onChange={handleChange}
          >
            <option value="STUDENT">Etudiant</option>
            <option value="COMPANY">Entreprise</option>
            <option value="SCHOOL">Ecole</option>
          </select>
        </div>

        <button type="submit">Créer un compte</button>
      </form>

      {error && <p>{error}</p>}

      <p>
        Déjà un compte ? <Link to="/login">Se connecter</Link>
      </p>
    </div>
  );
}

export default RegisterPage;
