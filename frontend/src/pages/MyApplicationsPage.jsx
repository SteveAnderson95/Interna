import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../services/api";

function getStatusClass(status) {
  return `status-pill status-${status.toLowerCase()}`;
}

function MyApplicationsPage() {
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const response = await api.get("/api/applications/my");
        setApplications(response.data.applications);
      } catch (err) {
        setError(
          err.response?.data?.message || "Impossible de charger les candidatures"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, []);

  if (loading) {
    return (
      <div className="page-shell">
        <div className="empty-state">Chargement des candidatures...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-shell">
        <div className="message message-error">{error}</div>
        {error === "Student profile not found" && (
          <div className="button-row">
            <button className="button button-primary" onClick={() => navigate("/profile")}>
              Completer mon profil
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
          <span className="eyebrow">Etudiant</span>
          <h1 className="page-title">Mes candidatures</h1>
        </div>
        <Link className="button button-ghost" to="/dashboard">
          Retour dashboard
        </Link>
      </div>

      {applications.length === 0 ? (
        <div className="empty-state">
          Aucune candidature envoyee pour le moment.
        </div>
      ) : (
        <div className="card-grid cards-tight">
          {applications.map((application) => (
            <article className="record-card" key={application.id}>
              <h3>{application.internshipOffer.title}</h3>
              <div className="record-meta">
                <span className={getStatusClass(application.status)}>
                  {application.status}
                </span>
                <span className="pill">
                  {application.internshipOffer.company?.name || "Entreprise"}
                </span>
              </div>
              <p>Ville : {application.internshipOffer.city || "Non precisee"}</p>
              <p>
                Envoyee le :
                {" "}
                {new Date(application.createdAt).toLocaleDateString()}
              </p>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

export default MyApplicationsPage;
