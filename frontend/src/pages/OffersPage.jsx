import { useEffect, useState } from "react";
import api from "../services/api";

function OffersPage() {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [selectedOfferId, setSelectedOfferId] = useState(null);
  const [motivationLetterFile, setMotivationLetterFile] = useState(null);
  const [conventionFile, setConventionFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const storedUser = JSON.parse(localStorage.getItem("user") || "null");

  useEffect(() => {
    const fetchOffers = async () => {
      try {
        const response = await api.get("/api/offers");
        setOffers(response.data.offers);
      } catch (err) {
        setError("Impossible de charger les offres");
      } finally {
        setLoading(false);
      }
    };

    fetchOffers();
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
      setError("Ajoute la lettre de motivation et la convention avant d'envoyer");
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
    } catch (err) {
      setError(err.response?.data?.message || "Erreur lors de la candidature");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <p>Chargement des offres...</p>;
  }

  if (error && offers.length === 0) {
    return <p>{error}</p>;
  }

  return (
    <div>
      <h1>Offres de stage</h1>

      {message && <p>{message}</p>}
      {error && <p>{error}</p>}

      {offers.length === 0 ? (
        <p>Aucune offre disponible.</p>
      ) : (
        <div>
          {offers.map((offer) => (
            <div key={offer.id}>
              <h2>{offer.title}</h2>
              <p>{offer.description}</p>
              <p>Filiere : {offer.fieldOfStudy}</p>
              <p>Niveau : {offer.studyLevel}</p>
              <p>Ville : {offer.city || "Non precisee"}</p>
              <p>Entreprise : {offer.company?.name}</p>

              {storedUser?.role === "STUDENT" && (
                <div>
                  <button
                    onClick={() => {
                      setError("");
                      setMessage("");
                      setSelectedOfferId(offer.id);
                    }}
                  >
                    Postuler
                  </button>

                  {selectedOfferId === offer.id && (
                    <div>
                      <div>
                        <label>Lettre de motivation</label>
                        <input
                          type="file"
                          accept=".pdf,.doc,.docx"
                          onChange={(event) =>
                            setMotivationLetterFile(event.target.files?.[0] || null)
                          }
                        />
                      </div>

                      <div>
                        <label>Convention</label>
                        <input
                          type="file"
                          accept=".pdf,.doc,.docx"
                          onChange={(event) =>
                            setConventionFile(event.target.files?.[0] || null)
                          }
                        />
                      </div>

                      <button
                        onClick={() => handleApply(offer.id)}
                        disabled={submitting}
                      >
                        {submitting ? "Envoi..." : "Envoyer la candidature"}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default OffersPage;
