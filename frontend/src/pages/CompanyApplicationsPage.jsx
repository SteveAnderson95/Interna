import { useEffect, useState } from "react";
import api from "../services/api";

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

      setMessage(`Candidature ${status.toLowerCase()} avec succès`);

      setApplications((prevApplications) =>
        prevApplications.map((application) =>
          application.id === applicationId
            ? { ...application, status }
            : application
        )
      );
    } catch (err) {
      setError("Impossible de mettre à jour le statut");
    }
  };

  if (loading) {
    return <p>Chargement des candidatures...</p>;
  }

  if (error && applications.length === 0) {
    return <p>{error}</p>;
  }

  return (
    <div>
      <h1>Candidatures reçues</h1>

      {message && <p>{message}</p>}
      {error && <p>{error}</p>}

      {applications.length === 0 ? (
        <p>Aucune candidature reçue.</p>
      ) : (
        <div>
          {applications.map((application) => (
            <div key={application.id}>
              <h2>{application.internshipOffer.title}</h2>
              <p>Etudiant ID : {application.student.id}</p>
              <p>Statut : {application.status}</p>
              <p>Lettre : {application.motivationLetterUrl}</p>
              <p>Convention : {application.conventionUrl}</p>

              <button onClick={() => updateStatus(application.id, "ACCEPTEE")}>
                Accepter
              </button>

              <button onClick={() => updateStatus(application.id, "REFUSEE")}>
                Refuser
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default CompanyApplicationsPage;
