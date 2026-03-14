import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../services/api";

function AdminDashboardPage() {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [offers, setOffers] = useState([]);
  const [applications, setApplications] = useState([]);
  const [internships, setInternships] = useState([]);
  const [deliverables, setDeliverables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const fetchData = async () => {
    try {
      const [
        statsResponse,
        usersResponse,
        offersResponse,
        applicationsResponse,
        internshipsResponse,
        deliverablesResponse,
      ] = await Promise.all([
        api.get("/api/admin/dashboard"),
        api.get("/api/admin/users"),
        api.get("/api/admin/offers"),
        api.get("/api/admin/applications"),
        api.get("/api/admin/internships"),
        api.get("/api/admin/deliverables"),
      ]);

      setStats(statsResponse.data.stats);
      setUsers(usersResponse.data.users);
      setOffers(offersResponse.data.offers);
      setApplications(applicationsResponse.data.applications);
      setInternships(internshipsResponse.data.internships);
      setDeliverables(deliverablesResponse.data.deliverables);
    } catch (requestError) {
      setError("Impossible de charger l'espace admin");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const updateUserStatus = async (userId, active) => {
    try {
      setMessage("");
      setError("");
      const response = await api.patch(`/api/admin/users/${userId}/status`, { active });
      setUsers((current) =>
        current.map((user) => (user.id === userId ? { ...user, ...response.data.user } : user))
      );
      setMessage(active ? "Compte active" : "Compte desactive");
    } catch (requestError) {
      setError("Impossible de mettre a jour le statut du compte");
    }
  };

  const deleteUser = async (userId) => {
    try {
      setMessage("");
      setError("");
      await api.delete(`/api/admin/users/${userId}`);
      setUsers((current) => current.filter((user) => user.id !== userId));
      setMessage("Utilisateur supprime");
    } catch (requestError) {
      setError("Impossible de supprimer l'utilisateur");
    }
  };

  const deleteOffer = async (offerId) => {
    try {
      setMessage("");
      setError("");
      await api.delete(`/api/admin/offers/${offerId}`);
      setOffers((current) => current.filter((offer) => offer.id !== offerId));
      setMessage("Offre supprimee");
    } catch (requestError) {
      setError("Impossible de supprimer l'offre");
    }
  };

  if (loading) {
    return (
      <div className="page-shell">
        <div className="empty-state">Chargement de l'espace admin...</div>
      </div>
    );
  }

  return (
    <div className="page-shell">
      <div className="top-bar">
        <div>
          <span className="eyebrow">Administration</span>
          <h1 className="page-title">Pilotage global de la plateforme</h1>
        </div>
        <Link className="button button-ghost" to="/dashboard">
          Retour dashboard
        </Link>
      </div>

      {message && <p className="message message-success">{message}</p>}
      {error && <p className="message message-error">{error}</p>}

      {stats && (
        <section className="surface-card">
          <div className="stats-grid">
            <div className="stat-tile"><small>Utilisateurs</small><strong>{stats.users}</strong></div>
            <div className="stat-tile"><small>Offres</small><strong>{stats.offers}</strong></div>
            <div className="stat-tile"><small>Candidatures</small><strong>{stats.applications}</strong></div>
            <div className="stat-tile"><small>Stages</small><strong>{stats.internships}</strong></div>
            <div className="stat-tile"><small>Livrables</small><strong>{stats.deliverables}</strong></div>
          </div>
        </section>
      )}

      <section className="surface-card">
        <div className="section-header">
          <div>
            <span className="eyebrow">Comptes</span>
            <h2 className="section-title">Gestion des utilisateurs</h2>
          </div>
        </div>
        <div className="card-grid cards-tight">
          {users.map((user) => (
            <article className="record-card" key={user.id}>
              <h3>{user.email}</h3>
              <p>Role : {user.role}</p>
              <p>Etat : {user.active ? "Actif" : "Desactive"}</p>
              <p>Cree le : {new Date(user.createdAt).toLocaleDateString()}</p>
              <div className="button-row">
                <button
                  className="button button-secondary"
                  onClick={() => updateUserStatus(user.id, !user.active)}
                >
                  {user.active ? "Desactiver" : "Activer"}
                </button>
                <button className="button button-danger" onClick={() => deleteUser(user.id)}>
                  Supprimer
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="surface-card">
        <div className="section-header">
          <div>
            <span className="eyebrow">Offres</span>
            <h2 className="section-title">Supervision des offres</h2>
          </div>
        </div>
        <div className="card-grid cards-tight">
          {offers.map((offer) => (
            <article className="record-card" key={offer.id}>
              <h3>{offer.title}</h3>
              <p>Entreprise : {offer.company?.name}</p>
              <p>Ville : {offer.city || "Non precisee"}</p>
              <div className="button-row">
                <button className="button button-danger" onClick={() => deleteOffer(offer.id)}>
                  Supprimer
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="surface-card">
        <div className="section-header">
          <div>
            <span className="eyebrow">Candidatures</span>
            <h2 className="section-title">Vue globale des candidatures</h2>
          </div>
        </div>
        <div className="card-grid cards-tight">
          {applications.map((application) => (
            <article className="record-card" key={application.id}>
              <h3>{application.internshipOffer.title}</h3>
              <p>Entreprise : {application.internshipOffer.company?.name}</p>
              <p>Statut : {application.status}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="surface-card">
        <div className="section-header">
          <div>
            <span className="eyebrow">Stages</span>
            <h2 className="section-title">Stages de la plateforme</h2>
          </div>
        </div>
        <div className="card-grid cards-tight">
          {internships.map((internship) => (
            <article className="record-card" key={internship.id}>
              <h3>{internship.title}</h3>
              <p>
                {internship.student.firstName} {internship.student.lastName}
              </p>
              <p>Entreprise : {internship.company.name}</p>
              <p>Statut : {internship.status}</p>
              <p>Livrables : {internship.deliverables.length}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="surface-card">
        <div className="section-header">
          <div>
            <span className="eyebrow">Documents</span>
            <h2 className="section-title">Livrables deposes</h2>
          </div>
        </div>
        <div className="card-grid cards-tight">
          {deliverables.map((deliverable) => (
            <article className="record-card" key={deliverable.id}>
              <h3>{deliverable.title}</h3>
              <p>
                {deliverable.internship.student.firstName} {deliverable.internship.student.lastName}
              </p>
              <p>Entreprise : {deliverable.internship.company.name}</p>
              <p>Depose le : {new Date(deliverable.createdAt).toLocaleDateString()}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

export default AdminDashboardPage;
