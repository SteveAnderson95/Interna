import { Link, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import api from "../services/api";

function getStatusClass(status) {
  return `status-pill status-${status.toLowerCase()}`;
}

function CompanyApplicationsPage() {
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [filter, setFilter] = useState("TOUTES");

  const baseUrl = api.defaults.baseURL;

  const fetchApplications = async () => {
    try {
      const response = await api.get("/api/applications/company");
      setApplications(response.data.applications);
    } catch (err) {
      setError(
        err.response?.data?.message || "Impossible de charger les candidatures"
      );
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

  const filteredApplications = useMemo(() => {
    if (filter === "TOUTES") {
      return applications;
    }

    return applications.filter((application) => application.status === filter);
  }, [applications, filter]);

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
          <h1 className="page-title">Candidatures recues</h1>
        </div>
        <Link className="button button-ghost" to="/dashboard">
          Retour dashboard
        </Link>
      </div>

      {message && <p className="message message-success">{message}</p>}
      {error && <p className="message message-error">{error}</p>}

      <section className="surface-card">
        <div className="section-header">
          <div>
            <span className="eyebrow">Filtres</span>
            <h2 className="section-title">Classement par statut</h2>
          </div>
        </div>

        <div className="filter-tabs">
          {["TOUTES", "EN_ATTENTE", "ACCEPTEE", "REFUSEE", "BLOQUEE"].map((status) => (
            <button
              key={status}
              className={`filter-tab${filter === status ? " filter-tab-active" : ""}`}
              onClick={() => setFilter(status)}
              type="button"
            >
              {status}
            </button>
          ))}
        </div>
      </section>

      {filteredApplications.length === 0 ? (
        <div className="empty-state">Aucune candidature dans cette categorie.</div>
      ) : (
        <div className="card-grid cards-tight">
          {filteredApplications.map((application) => (
            <article className="record-card" key={application.id}>
              <div className="avatar-block" style={{ marginBottom: 16 }}>
                {application.student.photoUrl ? (
                  <img
                    alt="Etudiant"
                    className="avatar-image"
                    src={`${baseUrl}/${application.student.photoUrl}`}
                  />
                ) : (
                  <div className="avatar-placeholder">
                    {(application.student.firstName?.[0] || "E") +
                      (application.student.lastName?.[0] || "T")}
                  </div>
                )}
                <div>
                  <h3 style={{ marginBottom: 4 }}>
                    {application.student.firstName} {application.student.lastName}
                  </h3>
                  <p style={{ margin: 0 }}>{application.student.user?.email}</p>
                  <p style={{ margin: 0 }}>
                    {application.student.fieldOfStudy} - {application.student.studyLevel}
                  </p>
                </div>
              </div>

              <div className="record-meta">
                <span className={getStatusClass(application.status)}>{application.status}</span>
                <span className="pill">{application.internshipOffer.title}</span>
                {application.student.school?.name && (
                  <span className="pill">{application.student.school.name}</span>
                )}
              </div>

              <p>Ville : {application.student.city || "Non precisee"}</p>
              <p>Telephone : {application.student.phone || "Non precise"}</p>
              <p>Bio : {application.student.bio || "Aucune presentation"}</p>
              {application.blockReason && <p>Motif de blocage : {application.blockReason}</p>}

              <div className="button-row" style={{ marginTop: 14 }}>
                {application.student.cvUrl && (
                  <a
                    className="button button-ghost"
                    href={`${baseUrl}/${application.student.cvUrl}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Voir le CV
                  </a>
                )}
                <a
                  className="button button-ghost"
                  href={`${baseUrl}/${application.motivationLetterUrl}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  Lettre
                </a>
                <a
                  className="button button-ghost"
                  href={`${baseUrl}/${application.conventionUrl}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  Convention
                </a>
              </div>

              <div className="card-actions" style={{ marginTop: 18 }}>
                <button
                  className="button button-primary"
                  onClick={() => updateStatus(application.id, "ACCEPTEE")}
                  disabled={application.status === "ACCEPTEE"}
                >
                  Accepter
                </button>
                <button
                  className="button button-danger"
                  onClick={() => updateStatus(application.id, "REFUSEE")}
                  disabled={application.status === "REFUSEE"}
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
