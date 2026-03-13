import { Link } from "react-router-dom";
import { useState } from "react";
import api from "../services/api";

function CreateOfferPage() {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    fieldOfStudy: "",
    studyLevel: "",
    city: "",
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleChange = (event) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value,
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage("");
    setError("");

    try {
      await api.post("/api/offers", formData);
      setMessage("Offre creee avec succes");
      setFormData({
        title: "",
        description: "",
        fieldOfStudy: "",
        studyLevel: "",
        city: "",
      });
    } catch (err) {
      setError(err.response?.data?.message || "Erreur lors de la creation de l'offre");
    }
  };

  return (
    <div className="page-shell">
      <div className="top-bar">
        <div>
          <span className="eyebrow">Entreprise</span>
          <h1 className="page-title">Publier une nouvelle offre</h1>
        </div>
        <Link className="button button-ghost" to="/dashboard">
          Retour dashboard
        </Link>
      </div>

      <section className="surface-card">
        <p className="page-subtitle">
          Remplis uniquement les informations essentielles pour rendre l'offre
          visible immediatement dans le MVP.
        </p>

        <form className="form-stack" onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-field full">
              <label htmlFor="offer-title">Titre</label>
              <input
                id="offer-title"
                className="input"
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Stage developpement web"
              />
            </div>

            <div className="form-field full">
              <label htmlFor="offer-description">Description</label>
              <textarea
                id="offer-description"
                className="textarea"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Mission, stack, duree, cadre du stage..."
              />
            </div>

            <div className="form-field">
              <label htmlFor="offer-field">Filiere</label>
              <input
                id="offer-field"
                className="input"
                type="text"
                name="fieldOfStudy"
                value={formData.fieldOfStudy}
                onChange={handleChange}
                placeholder="Informatique"
              />
            </div>

            <div className="form-field">
              <label htmlFor="offer-level">Niveau</label>
              <input
                id="offer-level"
                className="input"
                type="text"
                name="studyLevel"
                value={formData.studyLevel}
                onChange={handleChange}
                placeholder="Licence ou Master"
              />
            </div>

            <div className="form-field full">
              <label htmlFor="offer-city">Ville</label>
              <input
                id="offer-city"
                className="input"
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                placeholder="Casablanca"
              />
            </div>
          </div>

          {message && <p className="message message-success">{message}</p>}
          {error && <p className="message message-error">{error}</p>}

          <div className="button-row">
            <button className="button button-primary" type="submit">
              Publier l'offre
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

export default CreateOfferPage;
