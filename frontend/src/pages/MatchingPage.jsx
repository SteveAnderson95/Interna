import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../services/api";

function MatchingPage() {
  const navigate = useNavigate();
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const response = await api.get("/api/matching/student");
        setMatches(response.data.matches);
      } catch (err) {
        setError(
          err.response?.data?.message || "Impossible de charger les recommandations"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchMatches();
  }, []);

  if (loading) {
    return (
      <div className="page-shell">
        <div className="empty-state">Chargement du matching...</div>
      </div>
    );
  }

  return (
    <div className="page-shell">
      <div className="top-bar">
        <div>
          <span className="eyebrow">Matching</span>
          <h1 className="page-title">Offres recommandees</h1>
        </div>
        <Link className="button button-ghost" to="/dashboard">
          Retour dashboard
        </Link>
      </div>

      {error && <p className="message message-error">{error}</p>}

      {error === "Student profile not found" && (
        <div className="button-row">
          <button className="button button-primary" onClick={() => navigate("/profile")}>
            Completer mon profil
          </button>
        </div>
      )}

      {matches.length === 0 ? (
        <div className="empty-state">Aucune recommandation disponible.</div>
      ) : (
        <div className="card-grid cards-tight">
          {matches.map((match) => (
            <article className="record-card" key={match.offer.id}>
              <h3>{match.offer.title}</h3>
              <div className="record-meta">
                <span className="pill">Score : {match.score}/100</span>
                <span className="pill">{match.offer.company?.name}</span>
              </div>
              <p>{match.offer.description}</p>
              <p>Ville : {match.offer.city || "Non precisee"}</p>
              <p>Filiere : {match.offer.fieldOfStudy}</p>
              <p>Niveau : {match.offer.studyLevel}</p>
              <div className="record-meta">
                {match.reasons.map((reason) => (
                  <span className="pill" key={reason}>
                    {reason}
                  </span>
                ))}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

export default MatchingPage;
