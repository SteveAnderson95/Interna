import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../services/api";

function MyInternshipPage() {
  const [internship, setInternship] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [title, setTitle] = useState("Rapport de stage");
  const [reportFile, setReportFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const baseUrl = api.defaults.baseURL;

  const fetchInternship = async () => {
    try {
      const response = await api.get("/api/internships/me");
      setInternship(response.data.internship);
    } catch (err) {
      setError(err.response?.data?.message || "Impossible de charger le stage");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInternship();
  }, []);

  const handleUploadReport = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");

    if (!reportFile) {
      setError("Ajoute un fichier de rapport avant l'envoi");
      return;
    }

    setSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("file", reportFile);

      const uploadResponse = await api.post("/api/upload/report", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      await api.post("/api/deliverables/report", {
        title,
        fileUrl: uploadResponse.data.filePath,
      });

      setMessage("Rapport depose avec succes");
      setReportFile(null);
      fetchInternship();
    } catch (err) {
      setError(err.response?.data?.message || "Erreur lors du depot du rapport");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="page-shell">
        <div className="empty-state">Chargement du stage...</div>
      </div>
    );
  }

  if (error && !internship) {
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
          <span className="eyebrow">Stage</span>
          <h1 className="page-title">Mon stage accepte</h1>
        </div>
        <Link className="button button-ghost" to="/dashboard">
          Retour dashboard
        </Link>
      </div>

      {!internship ? (
        <div className="empty-state">
          Aucun stage accepte pour le moment. Reviens apres validation d'une candidature.
        </div>
      ) : (
        <div className="section-stack">
          <section className="surface-card">
            <div className="section-header">
              <div>
                <h2 className="section-title">{internship.title}</h2>
                <p className="page-subtitle">
                  Entreprise : {internship.company?.name || "Entreprise"}
                </p>
              </div>
            </div>

            <div className="record-meta">
              <span className="pill">{internship.status}</span>
              <span className="pill">
                Debut :
                {" "}
                {new Date(internship.startedAt).toLocaleDateString()}
              </span>
            </div>

            <p>Ville entreprise : {internship.company?.city || "Non precisee"}</p>
            <p>Offre liee : {internship.application?.internshipOffer?.title}</p>
          </section>

          <section className="surface-card">
            <div className="section-header">
              <div>
                <span className="eyebrow">Livrables</span>
                <h2 className="section-title">Deposer le rapport</h2>
              </div>
            </div>

            {message && <p className="message message-success">{message}</p>}
            {error && <p className="message message-error">{error}</p>}

            <form className="form-stack" onSubmit={handleUploadReport}>
              <div className="form-grid single">
                <div className="form-field">
                  <label htmlFor="deliverable-title">Titre du livrable</label>
                  <input
                    id="deliverable-title"
                    className="input"
                    type="text"
                    value={title}
                    onChange={(event) => setTitle(event.target.value)}
                  />
                </div>
                <div className="form-field">
                  <label htmlFor="deliverable-report">Fichier rapport</label>
                  <input
                    id="deliverable-report"
                    className="file-input"
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={(event) => setReportFile(event.target.files?.[0] || null)}
                  />
                </div>
              </div>

              <div className="button-row">
                <button className="button button-primary" type="submit" disabled={submitting}>
                  {submitting ? "Depot..." : "Deposer le rapport"}
                </button>
              </div>
            </form>

            <div style={{ marginTop: 24 }}>
              <h3 style={{ marginBottom: 12 }}>Historique des livrables</h3>
              {internship.deliverables?.length ? (
                <div className="card-grid cards-tight">
                  {internship.deliverables.map((deliverable) => (
                    <article className="record-card" key={deliverable.id}>
                      <h3>{deliverable.title}</h3>
                      <p>
                        Depose le :
                        {" "}
                        {new Date(deliverable.createdAt).toLocaleDateString()}
                      </p>
                      <a
                        className="inline-file-link"
                        href={`${baseUrl}/${deliverable.fileUrl}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Ouvrir le fichier
                      </a>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="empty-state">Aucun livrable depose.</div>
              )}
            </div>
          </section>
        </div>
      )}
    </div>
  );
}

export default MyInternshipPage;
