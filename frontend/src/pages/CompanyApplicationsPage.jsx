import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../services/api";

function getStatusClass(status) {
  return `status-pill status-${status.toLowerCase()}`;
}

function CompanyApplicationsPage() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const fetchApplications = async () => {
    try {
      const response = await api.get("/api/applications/company");
      setApplications(response.data.applications);
    } catch (err) {
      setError("Impossible de charger les candidatures");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const updateStatus = async (applicationId, status) => {
    setError("");
    setMessage("");

    try {
      await api.patch(`/api/applications/${applicationId}/status`, { status });
      setMessage(`Candidature ${status.toLowerCase()} avec succes`);
      setApplications((current) =>
        current.map((application) =>
          application.id === applicationId
            ? { ...application, status }
            : application
        )
      );
    } catch (err) {
      setError("Impossible de mettre a jour le statut");
    }
  };

  if (loading) {
    return (
      <div className="page-shell">
        <div className="empty-state">Chargement des candidatures...</div>
      </div>
    );
  }

  if (error && applications.length === 0) {
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
          <span className="eyebrow">Entreprise</span>
          <h1 className="page-title">Candidatures recues</h1>
        </div>
        <Link className="button button-ghost" to="/dashboard">
          Retour dashboard
        </Link>
      </div>

      {message && <p className="message message-success">{message}</p>}
      {error && <p className="message message-error">{error}</p>}

      {applications.length === 0 ? (
        <div className="empty-state">Aucune candidature recue pour le moment.</div>
      ) : (
        <div className="card-grid cards-tight">
          {applications.map((application) => (
            <article className="record-card" key={application.id}>
              <h3>{application.internshipOffer.title}</h3>
              <div className="record-meta">
                <span className={getStatusClass(application.status)}>
                  {application.status}
                </span>
                <span className="pill">Etudiant #{application.student.id}</span>
              </div>
              <p>Lettre : {application.motivationLetterUrl}</p>
              <p>Convention : {application.conventionUrl}</p>

              <div className="card-actions" style={{ marginTop: 18 }}>
                <button
                  className="button button-primary"
                  onClick={() => updateStatus(application.id, "ACCEPTEE")}
                >
                  Accepter
                </button>
                <button
                  className="button button-danger"
                  onClick={() => updateStatus(application.id, "REFUSEE")}
                >
                  Refuser
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

export default CompanyApplicationsPage;
