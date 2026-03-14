import { Link, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../services/api";

function CompanyProfilePage() {
  const { id } = useParams();
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const baseUrl = api.defaults.baseURL;

  useEffect(() => {
    const fetchCompany = async () => {
      try {
        const response = await api.get(`/api/company/${id}`);
        setCompany(response.data.company);
      } catch (err) {
        setError("Impossible de charger le profil entreprise");
      } finally {
        setLoading(false);
      }
    };

    fetchCompany();
  }, [id]);

  if (loading) {
    return (
      <div className="page-shell">
        <div className="empty-state">Chargement du profil entreprise...</div>
      </div>
    );
  }

  if (error || !company) {
    return (
      <div className="page-shell">
        <div className="message message-error">{error || "Entreprise introuvable"}</div>
      </div>
    );
  }

  return (
    <div className="page-shell">
      <div className="top-bar">
        <div>
          <span className="eyebrow">Entreprise</span>
          <h1 className="page-title">{company.name}</h1>
        </div>
        <Link className="button button-ghost" to="/offers">
          Retour aux offres
        </Link>
      </div>

      <section className="surface-card">
        <div className="avatar-block">
          {company.photoUrl ? (
            <img
              alt={company.name}
              className="avatar-image"
              src={`${baseUrl}/${company.photoUrl}`}
            />
          ) : (
            <div className="avatar-placeholder">{company.name.slice(0, 2).toUpperCase()}</div>
          )}
          <div>
            <h2 className="section-title" style={{ marginTop: 0 }}>{company.name}</h2>
            <p className="page-subtitle">{company.city || "Ville non precisee"}</p>
            <p className="page-subtitle">{company.sector || "Secteur non precise"}</p>
            <p className="page-subtitle">{company.contactName || "Contact non precise"}</p>
          </div>
        </div>

        <div className="form-grid" style={{ marginTop: 20 }}>
          <div className="form-field">
            <label>Telephone</label>
            <div className="input">{company.phone || "-"}</div>
          </div>
          <div className="form-field">
            <label>Site web</label>
            <div className="input">{company.website || "-"}</div>
          </div>
          <div className="form-field full">
            <label>Adresse</label>
            <div className="input">{company.address || "-"}</div>
          </div>
          <div className="form-field full">
            <label>Description</label>
            <div className="textarea" style={{ minHeight: 0 }}>{company.description || "-"}</div>
          </div>
        </div>

        {company.galleryUrls?.length > 0 && (
          <div style={{ marginTop: 24 }}>
            <div className="section-header">
              <div>
                <span className="eyebrow">Galerie</span>
                <h2 className="section-title">Apercu de l'entreprise</h2>
              </div>
            </div>

            <div className="gallery-grid">
              {company.galleryUrls.map((imagePath, index) => (
                <img
                  key={`${imagePath}-${index}`}
                  alt={`${company.name} ${index + 1}`}
                  className="gallery-image"
                  src={`${baseUrl}/${imagePath}`}
                />
              ))}
            </div>
          </div>
        )}

        {company.offers?.length > 0 && (
          <div style={{ marginTop: 24 }}>
            <div className="section-header">
              <div>
                <span className="eyebrow">Offres</span>
                <h2 className="section-title">Offres publiees</h2>
              </div>
            </div>
            <div className="card-grid cards-tight">
              {company.offers.map((offer) => (
                <article className="record-card" key={offer.id}>
                  <h3>{offer.title}</h3>
                  <p>{offer.description}</p>
                  <div className="record-meta">
                    <span className="pill">{offer.fieldOfStudy}</span>
                    <span className="pill">{offer.studyLevel}</span>
                  </div>
                  <div className="button-row">
                    <Link className="button button-ghost" to={`/offers/${offer.id}`}>
                      Voir le detail
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

export default CompanyProfilePage;
