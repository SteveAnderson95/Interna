import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../services/api";

const emptyForm = {
  title: "",
  description: "",
  fieldOfStudy: "",
  studyLevel: "",
  duration: "",
  internshipType: "",
  city: "",
  status: "ouverte",
  deadline: "",
};

function CompanyOffersPage() {
  const [offers, setOffers] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const fetchOffers = async () => {
    try {
      const response = await api.get("/api/company/offers");
      setOffers(response.data.offers || []);
    } catch (requestError) {
      setError("Impossible de charger vos offres");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOffers();
  }, []);

  const startEditing = (offer) => {
    setEditingId(offer.id);
    setFormData({
      title: offer.title || "",
      description: offer.description || "",
      fieldOfStudy: offer.fieldOfStudy || "",
      studyLevel: offer.studyLevel || "",
      duration: offer.duration || "",
      internshipType: offer.internshipType || "",
      city: offer.city || "",
      status: offer.status || "ouverte",
      deadline: offer.deadline ? offer.deadline.slice(0, 10) : "",
    });
    setMessage("");
    setError("");
  };

  const handleUpdate = async (event) => {
    event.preventDefault();
    setMessage("");
    setError("");

    try {
      const response = await api.patch(`/api/offers/${editingId}`, formData);
      setOffers((current) =>
        current.map((offer) => (offer.id === editingId ? response.data.offer : offer))
      );
      setEditingId(null);
      setFormData(emptyForm);
      setMessage("Offre mise a jour");
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Impossible de mettre a jour l'offre");
    }
  };

  const handleDelete = async (offerId) => {
    setMessage("");
    setError("");

    try {
      await api.delete(`/api/offers/${offerId}`);
      setOffers((current) => current.filter((offer) => offer.id !== offerId));
      if (editingId === offerId) {
        setEditingId(null);
        setFormData(emptyForm);
      }
      setMessage("Offre supprimee");
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Impossible de supprimer l'offre");
    }
  };

  if (loading) {
    return (
      <div className="page-shell">
        <div className="empty-state">Chargement des offres entreprise...</div>
      </div>
    );
  }

  return (
    <div className="page-shell">
      <div className="top-bar">
        <div>
          <span className="eyebrow">Entreprise</span>
          <h1 className="page-title">Mes offres</h1>
        </div>
        <div className="button-row">
          <Link className="button button-ghost" to="/dashboard">
            Retour dashboard
          </Link>
          <Link className="button button-primary" to="/company/offers/create">
            Nouvelle offre
          </Link>
        </div>
      </div>

      {message && <p className="message message-success">{message}</p>}
      {error && <p className="message message-error">{error}</p>}

      {editingId && (
        <section className="surface-card">
          <div className="section-header">
            <div>
              <span className="eyebrow">Edition</span>
              <h2 className="section-title">Modifier l'offre</h2>
            </div>
          </div>

          <form className="form-stack" onSubmit={handleUpdate}>
            <div className="form-grid">
              <div className="form-field full">
                <label>Titre</label>
                <input className="input" name="title" value={formData.title} onChange={(event) => setFormData({ ...formData, [event.target.name]: event.target.value })} />
              </div>
              <div className="form-field full">
                <label>Description</label>
                <textarea className="textarea" name="description" value={formData.description} onChange={(event) => setFormData({ ...formData, [event.target.name]: event.target.value })} />
              </div>
              <div className="form-field">
                <label>Filiere</label>
                <input className="input" name="fieldOfStudy" value={formData.fieldOfStudy} onChange={(event) => setFormData({ ...formData, [event.target.name]: event.target.value })} />
              </div>
              <div className="form-field">
                <label>Niveau</label>
                <input className="input" name="studyLevel" value={formData.studyLevel} onChange={(event) => setFormData({ ...formData, [event.target.name]: event.target.value })} />
              </div>
              <div className="form-field">
                <label>Duree</label>
                <input className="input" name="duration" value={formData.duration} onChange={(event) => setFormData({ ...formData, [event.target.name]: event.target.value })} />
              </div>
              <div className="form-field">
                <label>Type</label>
                <input className="input" name="internshipType" value={formData.internshipType} onChange={(event) => setFormData({ ...formData, [event.target.name]: event.target.value })} />
              </div>
              <div className="form-field">
                <label>Ville</label>
                <input className="input" name="city" value={formData.city} onChange={(event) => setFormData({ ...formData, [event.target.name]: event.target.value })} />
              </div>
              <div className="form-field">
                <label>Date limite</label>
                <input className="input" type="date" name="deadline" value={formData.deadline} onChange={(event) => setFormData({ ...formData, [event.target.name]: event.target.value })} />
              </div>
            </div>

            <div className="button-row">
              <button className="button button-primary" type="submit">Enregistrer</button>
              <button className="button button-ghost" onClick={() => setEditingId(null)} type="button">
                Annuler
              </button>
            </div>
          </form>
        </section>
      )}

      {offers.length === 0 ? (
        <div className="empty-state">Aucune offre publiee pour le moment.</div>
      ) : (
        <div className="card-grid cards-tight">
          {offers.map((offer) => (
            <article className="record-card" key={offer.id}>
              <h3>{offer.title}</h3>
              <div className="record-meta">
                <span className="pill">{offer.fieldOfStudy}</span>
                <span className="pill">{offer.studyLevel}</span>
                {offer.status && <span className="pill">{offer.status}</span>}
              </div>
              <p>{offer.description}</p>
              <p>Ville : {offer.city || "Non precisee"}</p>
              <p>Duree : {offer.duration || "Non precisee"}</p>
              <p>Type : {offer.internshipType || "Non precise"}</p>
              {offer.deadline && (
                <p>Date limite : {new Date(offer.deadline).toLocaleDateString()}</p>
              )}
              <div className="button-row">
                <button className="button button-secondary" onClick={() => startEditing(offer)}>
                  Modifier
                </button>
                <button className="button button-danger" onClick={() => handleDelete(offer.id)}>
                  Supprimer
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

export default CompanyOffersPage;
