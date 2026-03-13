import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../services/api";

function OffersPage() {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [selectedOfferId, setSelectedOfferId] = useState(null);
  const [motivationLetterFile, setMotivationLetterFile] = useState(null);
  const [conventionFile, setConventionFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const storedUser = JSON.parse(localStorage.getItem("user") || "null");

  useEffect(() => {
    const fetchOffers = async () => {
      try {
        const response = await api.get("/api/offers");
        setOffers(response.data.offers);
      } catch (err) {
        setError("Impossible de charger les offres");
      } finally {
        setLoading(false);
      }
    };

    fetchOffers();
  }, []);

  const uploadFile = async (endpoint, file) => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await api.post(endpoint, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data.filePath;
  };

  const resetApplicationForm = () => {
    setSelectedOfferId(null);
    setMotivationLetterFile(null);
    setConventionFile(null);
  };

  const handleApply = async (offerId) => {
    setError("");
    setMessage("");

    if (!motivationLetterFile || !conventionFile) {
      setError("Ajoute la lettre de motivation et la convention avant l'envoi");
      return;
    }

    setSubmitting(true);

    try {
      const motivationLetterUrl = await uploadFile(
        "/api/upload/motivation-letter",
        motivationLetterFile
      );
      const conventionUrl = await uploadFile("/api/upload/convention", conventionFile);

      await api.post("/api/applications", {
        internshipOfferId: offerId,
        motivationLetterUrl,
        conventionUrl,
      });

      setMessage("Candidature envoyee avec succes");
      resetApplicationForm();
    } catch (err) {
      setError(err.response?.data?.message || "Erreur lors de la candidature");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="page-shell">
        <div className="empty-state">Chargement des offres...</div>
      </div>
    );
  }

  if (error && offers.length === 0) {
    return (
      <div className="page-shell">
        <div className="message message-error">{error}</div>
      </div>
    );
  }

  return (
    <div className="page-shell">
      <div className="top-bar">
        <div>
          <span className="eyebrow">Catalogue</span>
          <h1 className="page-title">Offres de stage</h1>
        </div>
        <Link className="button button-ghost" to="/dashboard">
          Retour dashboard
        </Link>
      </div>

      {message && <p className="message message-success">{message}</p>}
      {error && <p className="message message-error">{error}</p>}

      {offers.length === 0 ? (
        <div className="empty-state">Aucune offre disponible.</div>
      ) : (
        <div className="card-grid cards-tight">
          {offers.map((offer) => (
            <article className="record-card" key={offer.id}>
              <h3>{offer.title}</h3>
              <p>{offer.description}</p>

              <div className="record-meta">
                <span className="pill">{offer.fieldOfStudy}</span>
                <span className="pill">{offer.studyLevel}</span>
                <span className="pill">{offer.city || "Ville non precisee"}</span>
              </div>

              <p>Entreprise : {offer.company?.name}</p>

              {storedUser?.role === "STUDENT" && (
                <div className="card-actions" style={{ marginTop: 18 }}>
                  <button
                    className="button button-secondary"
                    onClick={() => {
                      setError("");
                      setMessage("");
                      setSelectedOfferId(offer.id);
                    }}
                  >
                    Postuler
                  </button>
                </div>
              )}

              {selectedOfferId === offer.id && storedUser?.role === "STUDENT" && (
                <div className="surface-card" style={{ marginTop: 18, padding: 18 }}>
                  <div className="form-grid single">
                    <div className="form-field">
                      <label>Lettre de motivation</label>
                      <input
                        className="file-input"
                        type="file"
                        accept=".pdf,.doc,.docx"
                        onChange={(event) =>
                          setMotivationLetterFile(event.target.files?.[0] || null)
                        }
                      />
                    </div>

                    <div className="form-field">
                      <label>Convention</label>
                      <input
                        className="file-input"
                        type="file"
                        accept=".pdf,.doc,.docx"
                        onChange={(event) =>
                          setConventionFile(event.target.files?.[0] || null)
                        }
                      />
                    </div>
                  </div>

                  <div className="button-row" style={{ marginTop: 14 }}>
                    <button
                      className="button button-primary"
                      onClick={() => handleApply(offer.id)}
                      disabled={submitting}
                    >
                      {submitting ? "Envoi..." : "Envoyer la candidature"}
                    </button>
                    <button
                      className="button button-ghost"
                      onClick={resetApplicationForm}
                      type="button"
                    >
                      Annuler
                    </button>
                  </div>
                </div>
              )}
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

export default OffersPage;
