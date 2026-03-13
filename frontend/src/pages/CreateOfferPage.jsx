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

      setMessage("Offre créée avec succès");
      setFormData({
        title: "",
        description: "",
        fieldOfStudy: "",
        studyLevel: "",
        city: "",
      });
    } catch (err) {
      setError(err.response?.data?.message || "Erreur lors de la création de l'offre");
    }
  };

  return (
    <div>
      <h1>Créer une offre</h1>

      <form onSubmit={handleSubmit}>
        <div>
          <label>Titre</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
          />
        </div>

        <div>
          <label>Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
          />
        </div>

        <div>
          <label>Filière</label>
          <input
            type="text"
            name="fieldOfStudy"
            value={formData.fieldOfStudy}
            onChange={handleChange}
          />
        </div>

        <div>
          <label>Niveau</label>
          <input
            type="text"
            name="studyLevel"
            value={formData.studyLevel}
            onChange={handleChange}
          />
        </div>

        <div>
          <label>Ville</label>
          <input
            type="text"
            name="city"
            value={formData.city}
            onChange={handleChange}
          />
        </div>

        <button type="submit">Publier l'offre</button>
      </form>

      {message && <p>{message}</p>}
      {error && <p>{error}</p>}
    </div>
  );
}

export default CreateOfferPage;
