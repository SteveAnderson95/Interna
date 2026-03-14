import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../services/api";

function SchoolDashboardPage() {
  const [applications, setApplications] = useState([]);
  const [internships, setInternships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [blockReasons, setBlockReasons] = useState({});
  const baseUrl = api.defaults.baseURL;

  const fetchData = async () => {
    try {
      const [applicationsResponse, internshipsResponse] = await Promise.all([
        api.get("/api/school/applications"),
        api.get("/api/school/internships"),
      ]);

      setApplications(applicationsResponse.data.applications);
      setInternships(internshipsResponse.data.internships);
    } catch (err) {
      setError(
        err.response?.data?.message || "Impossible de charger l'espace ecole"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const blockApplication = async (applicationId) => {
    try {
      setMessage("");
      setError("");
      await api.patch(`/api/school/applications/${applicationId}/block`, {
        blockReason: blockReasons[applicationId] || "",
      });
      setApplications((current) =>
        current.map((application) =>
          application.id === applicationId
            ? {
                ...application,
                status: "BLOQUEE",
                blockReason: blockReasons[applicationId] || "",
              }
            : application
        )
      );
      setMessage("Candidature bloquee");
    } catch (err) {
      setError(
        err.response?.data?.message || "Impossible de bloquer la candidature"
      );
    }
  };

  const validateInternship = async (internshipId) => {
    try {
      setMessage("");
      setError("");
      await api.patch(`/api/school/internships/${internshipId}/validate`);
      setInternships((current) =>
        current.map((internship) =>
          internship.id === internshipId
            ? { ...internship, status: "valide" }
            : internship
        )
      );
      setMessage("Stage valide");
    } catch (err) {
      setError(
        err.response?.data?.message || "Impossible de valider le stage"
      );
    }
  };

  if (loading) {
    return (
      <div className="page-shell">
        <div className="empty-state">Chargement de l'espace ecole...</div>
      </div>
    );
  }

  return (
    <div className="page-shell">
      <div className="top-bar">
        <div>
          <span className="eyebrow">Ecole</span>
          <h1 className="page-title">Supervision des stages</h1>
        </div>
        <Link className="button button-ghost" to="/dashboard">
          Retour dashboard
        </Link>
      </div>

      {message && <p className="message message-success">{message}</p>}
      {error && <p className="message message-error">{error}</p>}

      <section className="surface-card" style={{ marginBottom: 20 }}>
        <div className="section-header">
          <div>
            <span className="eyebrow">Candidatures</span>
            <h2 className="section-title">Candidatures des etudiants</h2>
          </div>
        </div>

        {applications.length === 0 ? (
          <div className="empty-state">Aucune candidature a superviser.</div>
        ) : (
          <div className="card-grid cards-tight">
            {applications.map((application) => (
              <article className="record-card" key={application.id}>
                <h3>{application.internshipOffer.title}</h3>
                <p>
                  Etudiant :
                  {" "}
                  {application.student.firstName} {application.student.lastName}
                </p>
                <p>Entreprise : {application.internshipOffer.company?.name}</p>
                <div className="record-meta">
                  <span className={`status-pill status-${application.status.toLowerCase()}`}>
                    {application.status}
                  </span>
                  <span className={`pill${application.checks?.fieldMatch ? "" : " pill-warning"}`}>
                    Filiere {application.checks?.fieldMatch ? "OK" : "a verifier"}
                  </span>
                  <span className={`pill${application.checks?.levelMatch ? "" : " pill-warning"}`}>
                    Niveau {application.checks?.levelMatch ? "OK" : "a verifier"}
                  </span>
                </div>
                {application.blockReason && <p>Motif : {application.blockReason}</p>}
                {application.status !== "BLOQUEE" && (
                  <div className="form-stack">
                    <div className="form-field">
                      <label>Motif de blocage</label>
                      <textarea
                        className="textarea"
                        value={blockReasons[application.id] || ""}
                        onChange={(event) =>
                          setBlockReasons((current) => ({
                            ...current,
                            [application.id]: event.target.value,
                          }))
                        }
                      />
                    </div>
                    <div className="button-row">
                    <button
                      className="button button-danger"
                      onClick={() => blockApplication(application.id)}
                    >
                      Bloquer
                    </button>
                  </div>
                  </div>
                )}
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="surface-card">
        <div className="section-header">
          <div>
            <span className="eyebrow">Stages</span>
            <h2 className="section-title">Stages et livrables</h2>
          </div>
        </div>

        {internships.length === 0 ? (
          <div className="empty-state">Aucun stage a valider.</div>
        ) : (
          <div className="card-grid cards-tight">
            {internships.map((internship) => (
              <article className="record-card" key={internship.id}>
                <h3>{internship.title}</h3>
                <p>
                  Etudiant :
                  {" "}
                  {internship.student.firstName} {internship.student.lastName}
                </p>
                <p>Entreprise : {internship.company.name}</p>
                <p>Livrables : {internship.deliverables.length}</p>
                <div className="record-meta">
                  <span className="pill">{internship.status}</span>
                </div>
                {internship.deliverables.length > 0 && (
                  <div className="button-row">
                    {internship.deliverables.map((deliverable) => (
                      <a
                        key={deliverable.id}
                        className="button button-ghost"
                        href={`${baseUrl}/${deliverable.fileUrl}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        {deliverable.title}
                      </a>
                    ))}
                  </div>
                )}
                {internship.status !== "valide" && (
                  <div className="button-row">
                    <button
                      className="button button-primary"
                      onClick={() => validateInternship(internship.id)}
                    >
                      Valider le stage
                    </button>
                  </div>
                )}
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default SchoolDashboardPage;
