import { useEffect, useState } from "react";
import api from "../services/api";

function MyApplicationsPage() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const response = await api.get("/api/applications/my");
        setApplications(response.data.applications);
      } catch (err) {
        setError("Impossible de charger les candidatures");
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, []);

  if (loading) {
    return <p>Chargement des candidatures...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  return (
    <div>
      <h1>Mes candidatures</h1>

      {applications.length === 0 ? (
        <p>Aucune candidature envoyée.</p>
      ) : (
        <div>
          {applications.map((application) => (
            <div key={application.id}>
              <h2>{application.internshipOffer.title}</h2>
              <p>Entreprise : {application.internshipOffer.company?.name}</p>
              <p>Ville : {application.internshipOffer.city || "Non précisée"}</p>
              <p>Statut : {application.status}</p>
              <p>Envoyée le : {new Date(application.createdAt).toLocaleDateString()}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default MyApplicationsPage;
