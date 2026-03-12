import { useEffect, useState } from "react";
import api from "../services/api";

function OffersPage() {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

  if (loading) {
    return <p>Chargement des offres...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  return (
    <div>
      <h1>Offres de stage</h1>

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
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default OffersPage;
