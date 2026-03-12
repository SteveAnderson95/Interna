import { useEffect, useState } from "react";
import api from "../services/api";

function OffersPage() {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [selectedOfferId, setSelectedOfferId] = useState(null);

  const [applicationData, setApplicationData] = useState({
    motivationLetterUrl: "",
    conventionUrl: "",
  });

  const storedUser = JSON.parse(localStorage.getItem("user"));

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

  const handleChange = (event) => {
    setApplicationData({
      ...applicationData,
      [event.target.name]: event.target.value,
    });
  };

  const handleApply = async (offerId) => {
    setError("");
    setMessage("");

    try {
      await api.post("/api/applications", {
        internshipOfferId: offerId,
        motivationLetterUrl: applicationData.motivationLetterUrl,
        conventionUrl: applicationData.conventionUrl,
      });

      setMessage("Candidature envoyée avec succès");
      setSelectedOfferId(null);
      setApplicationData({
        motivationLetterUrl: "",
        conventionUrl: "",
      });
    } catch (err) {
      setError(err.response?.data?.message || "Erreur lors de la candidature");
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
              <p>Filière : {offer.fieldOfStudy}</p>
              <p>Niveau : {offer.studyLevel}</p>
              <p>Ville : {offer.city || "Non précisée"}</p>
              <p>Entreprise : {offer.company?.name}</p>

              {storedUser?.role === "STUDENT" && (
                <div>
                  <button onClick={() => setSelectedOfferId(offer.id)}>
                    Postuler
                  </button>

                  {selectedOfferId === offer.id && (
                    <div>
                      <input
                        type="text"
                        name="motivationLetterUrl"
                        placeholder="URL lettre de motivation"
                        value={applicationData.motivationLetterUrl}
                        onChange={handleChange}
                      />

                      <input
                        type="text"
                        name="conventionUrl"
                        placeholder="URL convention"
                        value={applicationData.conventionUrl}
                        onChange={handleChange}
                      />

                      <button onClick={() => handleApply(offer.id)}>
                        Envoyer la candidature
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
