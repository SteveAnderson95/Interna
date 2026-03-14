import { Link, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../services/api";

function OfferDetailPage() {
  const { id } = useParams();
  const [offer, setOffer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchOffer = async () => {
      try {
        const response = await api.get(`/api/offers/${id}`);
        setOffer(response.data.offer);
      } catch (requestError) {
        setError("Impossible de charger le detail de l'offre");
      } finally {
        setLoading(false);
      }
    };

    fetchOffer();
  }, [id]);

  if (loading) {
    return (
      <div className="page-shell">
        <div className="empty-state">Chargement du detail de l'offre...</div>
      </div>
    );
  }

  if (!offer || error) {
    return (
      <div className="page-shell">
        <div className="message message-error">{error || "Offre introuvable"}</div>
      </div>
    );
  }

  return (
    <div className="page-shell">
      <div className="top-bar">
        <div>
          <span className="eyebrow">Offre</span>
          <h1 className="page-title">{offer.title}</h1>
        </div>
        <div className="button-row">
          <Link className="button button-ghost" to="/offers">
            Retour aux offres
          </Link>
          {offer.company?.id && (
            <Link className="button button-secondary" to={`/company/${offer.company.id}`}>
              Voir l'entreprise
            </Link>
          )}
        </div>
      </div>

      <section className="surface-card">
        <div className="record-meta">
          <span className="pill">{offer.fieldOfStudy}</span>
          <span className="pill">{offer.studyLevel}</span>
          {offer.internshipType && <span className="pill">{offer.internshipType}</span>}
          {offer.status && <span className="pill">{offer.status}</span>}
        </div>

        <p style={{ marginTop: 16 }}>{offer.description}</p>

        <div className="form-grid" style={{ marginTop: 20 }}>
          <div className="form-field">
            <label>Entreprise</label>
            <div className="input">{offer.company?.name || "-"}</div>
          </div>
          <div className="form-field">
            <label>Ville</label>
            <div className="input">{offer.city || "-"}</div>
          </div>
          <div className="form-field">
            <label>Duree</label>
            <div className="input">{offer.duration || "-"}</div>
          </div>
          <div className="form-field">
            <label>Date limite</label>
            <div className="input">
              {offer.deadline ? new Date(offer.deadline).toLocaleDateString() : "-"}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default OfferDetailPage;
