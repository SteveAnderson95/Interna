import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../services/api";

const initialFilters = {
  search: "",
  city: "",
  fieldOfStudy: "",
  studyLevel: "",
};

function OffersPage() {
  const navigate = useNavigate();
  const [offers, setOffers] = useState([]);
  const [filters, setFilters] = useState(initialFilters);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [selectedOfferId, setSelectedOfferId] = useState(null);
  const [motivationLetterFile, setMotivationLetterFile] = useState(null);
  const [conventionFile, setConventionFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const storedUser = JSON.parse(localStorage.getItem("user") || "null");

  const fetchOffers = async (queryFilters = filters) => {
    try {
      const response = await api.get("/api/offers", {
        params: queryFilters,
      });
      setOffers(response.data.offers);
    } catch (requestError) {
      setError(
        requestError.response?.data?.message || "Impossible de charger les offres"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOffers(initialFilters);
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
    } catch (requestError) {
      setError(
        requestError.response?.data?.message || "Erreur lors de la candidature"
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleFilterChange = (event) => {
    setFilters((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  };

  const handleFilterSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    await fetchOffers(filters);
  };

  if (loading) {
    return (
      <div className="page-shell">
        <div className="empty-state">Chargement des offres...</div>
      </div>
    );
  }

  return (
    <div className="page-shell page-shell-wide">
      <div className="top-bar">
        <div>
          <span className="eyebrow">Job board</span>
          <h1 className="page-title">Offres de stage disponibles</h1>
        </div>
        <Link className="button button-ghost" to="/dashboard">
          Retour dashboard
        </Link>
      </div>

      <section className="surface-card">
        <form className="form-grid" onSubmit={handleFilterSubmit}>
          <div className="form-field">
            <label>Recherche</label>
            <input className="input" name="search" value={filters.search} onChange={handleFilterChange} placeholder="Titre, entreprise, mot-cle..." />
          </div>
          <div className="form-field">
            <label>Ville</label>
            <input className="input" name="city" value={filters.city} onChange={handleFilterChange} placeholder="Ville" />
          </div>
          <div className="form-field">
            <label>Filiere</label>
            <input className="input" name="fieldOfStudy" value={filters.fieldOfStudy} onChange={handleFilterChange} placeholder="Informatique" />
          </div>
          <div className="form-field">
            <label>Niveau</label>
            <input className="input" name="studyLevel" value={filters.studyLevel} onChange={handleFilterChange} placeholder="Licence, Master..." />
          </div>
          <div className="button-row">
            <button className="button button-primary" type="submit">Filtrer</button>
          </div>
        </form>
      </section>

      {message && <p className="message message-success">{message}</p>}
      {error && <p className="message message-error">{error}</p>}
      {(error === "Student profile not found" || error === "CV is required before applying") && (
        <div className="button-row">
          <button className="button button-primary" onClick={() => navigate("/profile")}>
            Completer mon profil
          </button>
        </div>
      )}

      <div className="job-board-layout">
        <section className="job-feed">
          {offers.length === 0 ? (
            <div className="empty-state">Aucune offre disponible pour les filtres actuels.</div>
          ) : (
            offers.map((offer) => (
              <article className="job-card" key={offer.id}>
                <h3>{offer.title}</h3>
                <p>
                  <strong>
                    <Link to={`/company/${offer.company?.id}`}>{offer.company?.name}</Link>
                  </strong>
                  {" - "}
                  {offer.city || "Ville non precisee"}
                </p>
                <div className="record-meta">
                  <span className="pill">{offer.fieldOfStudy}</span>
                  <span className="pill">{offer.studyLevel}</span>
                  {offer.internshipType && <span className="pill">{offer.internshipType}</span>}
                </div>
                <p>{offer.description}</p>
                <p>Duree : {offer.duration || "Non precisee"}</p>
                {offer.deadline && (
                  <p>Date limite : {new Date(offer.deadline).toLocaleDateString()}</p>
                )}

                <div className="button-row" style={{ marginTop: 14 }}>
                  <Link className="button button-ghost" to={`/offers/${offer.id}`}>
                    Voir le detail
                  </Link>
                  {storedUser?.role === "STUDENT" && (
                    <button
                      className="button button-primary"
                      onClick={() => {
                        setError("");
                        setMessage("");
                        setSelectedOfferId(offer.id);
                      }}
                    >
                      Postuler
                    </button>
                  )}
                </div>

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
            ))
          )}
        </section>

        <aside className="job-sidebar">
          <div className="surface-card">
            <span className="eyebrow">Vue rapide</span>
            <h2 className="section-title">Apercu du catalogue</h2>
            <p className="page-subtitle">
              {offers.length} offre{offers.length > 1 ? "s" : ""} visible
              {filters.search || filters.city || filters.fieldOfStudy || filters.studyLevel
                ? "s avec les filtres actifs."
                : "s sur la plateforme."}
            </p>
          </div>

          <div className="surface-card">
            <span className="eyebrow">Conseils</span>
            <h2 className="section-title">Pour postuler efficacement</h2>
            <p className="page-subtitle">
              Renseigne ton profil, ajoute un CV propre et prepare une convention
              avant d'envoyer ta candidature.
            </p>
            {storedUser?.role === "STUDENT" && (
              <div className="button-row" style={{ marginTop: 16 }}>
                <Link className="button button-secondary" to="/profile">
                  Completer mon profil
                </Link>
                <Link className="button button-ghost" to="/matching">
                  Voir mon matching
                </Link>
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}

export default OffersPage;
