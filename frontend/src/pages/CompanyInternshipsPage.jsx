import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../services/api";

function CompanyInternshipsPage() {
  const navigate = useNavigate();
  const [internships, setInternships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const baseUrl = api.defaults.baseURL;
  const [downloadingId, setDownloadingId] = useState(null);

  useEffect(() => {
    const fetchInternships = async () => {
      try {
        const response = await api.get("/api/internships/company");
        setInternships(response.data.internships);
      } catch (err) {
        setError(err.response?.data?.message || "Impossible de charger les stages");
      } finally {
        setLoading(false);
      }
    };

    fetchInternships();
  }, []);

  const openProtectedPdf = async (internshipId, type) => {
    const token = localStorage.getItem("token");

    if (!token) {
      setError("Session expiree. Reconnecte-toi.");
      return;
    }

    try {
      setDownloadingId(internshipId);
      const response = await fetch(
        `${baseUrl}/api/internships/company/${internshipId}/${type}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("PDF non disponible");
      }

      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      window.open(blobUrl, "_blank", "noopener,noreferrer");
      window.setTimeout(() => window.URL.revokeObjectURL(blobUrl), 1000);
    } catch (downloadError) {
      setError(downloadError.message || "Impossible d'ouvrir le PDF");
    } finally {
      setDownloadingId(null);
    }
  };

  if (loading) {
    return (
      <div className="page-shell">
        <div className="empty-state">Chargement des stages...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-shell">
        <div className="message message-error">{error}</div>
        {error === "Company profile not found" && (
          <div className="button-row">
            <button className="button button-primary" onClick={() => navigate("/profile")}>
              Completer le profil entreprise
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="page-shell">
      <div className="top-bar">
        <div>
          <span className="eyebrow">Entreprise</span>
          <h1 className="page-title">Stages en cours</h1>
        </div>
        <Link className="button button-ghost" to="/dashboard">
          Retour dashboard
        </Link>
      </div>

      {internships.length === 0 ? (
        <div className="empty-state">Aucun stage actif pour le moment.</div>
      ) : (
        <div className="card-grid cards-tight">
          {internships.map((internship) => (
            <article className="record-card" key={internship.id}>
              <h3>{internship.title}</h3>
              <div className="record-meta">
                <span className="pill">{internship.status}</span>
                <span className="pill">
                  Etudiant #{internship.student.id}
                </span>
              </div>
              <p>
                Nom :
                {" "}
                {internship.student.firstName} {internship.student.lastName}
              </p>
              <p>
                Debut :
                {" "}
                {new Date(internship.startedAt).toLocaleDateString()}
              </p>
              <div className="button-row" style={{ marginTop: 18 }}>
                <button
                  className="button button-primary"
                  onClick={() => openProtectedPdf(internship.id, "attestation")}
                  disabled={downloadingId === internship.id}
                >
                  Attestation PDF
                </button>
                <button
                  className="button button-secondary"
                  onClick={() => openProtectedPdf(internship.id, "evaluation")}
                  disabled={downloadingId === internship.id}
                >
                  Fiche d'evaluation
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

export default CompanyInternshipsPage;
