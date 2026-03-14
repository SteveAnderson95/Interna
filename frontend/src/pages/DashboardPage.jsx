import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

function DashboardPage() {
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [stats, setStats] = useState([]);
  const [highlights, setHighlights] = useState([]);
  const [activity, setActivity] = useState([]);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        if (user?.role === "STUDENT") {
          const [applicationsResponse, internshipResponse, matchesResponse] =
            await Promise.all([
              api.get("/api/applications/my"),
              api.get("/api/internships/me"),
              api.get("/api/matching/student"),
            ]);

          const applications = applicationsResponse.data.applications || [];
          const internship = internshipResponse.data.internship;
          const matches = matchesResponse.data.matches || [];

          setStats([
            {
              label: "Candidatures envoyees",
              value: applications.length,
              hint: "Total de tes demandes",
            },
            {
              label: "En attente",
              value: applications.filter((item) => item.status === "EN_ATTENTE").length,
              hint: "A suivre cette semaine",
            },
            {
              label: "Matching fort",
              value: matches.filter((item) => item.score >= 60).length,
              hint: "Offres recommandees",
            },
            {
              label: "Stage actif",
              value: internship ? "Oui" : "Non",
              hint: internship ? internship.title : "Aucun stage valide",
            },
          ]);

          setHighlights([
            {
              title: "Priorite du jour",
              text: internship
                ? "Ton stage est actif. Pense a verifier les livrables et a deposer ton rapport a temps."
                : "Complete ton profil puis cible les offres avec le meilleur score de matching.",
              actionLabel: internship ? "Voir mon stage" : "Voir mon matching",
              actionTo: internship ? "/my-internship" : "/matching",
            },
            {
              title: "CV et profil",
              text: "Un profil complet augmente tes chances d'etre retenu par les entreprises et valide par l'ecole.",
              actionLabel: "Mettre a jour mon profil",
              actionTo: "/profile",
            },
          ]);

          setActivity(
            applications.slice(0, 4).map((item) => ({
              title: item.internshipOffer.title,
              subtitle: item.internshipOffer.company?.name || "Entreprise",
              meta: `Statut : ${item.status}`,
            }))
          );
        }

        if (user?.role === "COMPANY") {
          const [offersResponse, applicationsResponse, internshipsResponse] =
            await Promise.all([
              api.get("/api/company/offers"),
              api.get("/api/applications/company"),
              api.get("/api/internships/company"),
            ]);

          const offers = offersResponse.data.offers || [];
          const applications = applicationsResponse.data.applications || [];
          const internships = internshipsResponse.data.internships || [];

          setStats([
            {
              label: "Offres publiees",
              value: offers.length,
              hint: "Catalogue entreprise",
            },
            {
              label: "Candidatures recues",
              value: applications.length,
              hint: "Toutes offres confondues",
            },
            {
              label: "A traiter",
              value: applications.filter((item) => item.status === "EN_ATTENTE").length,
              hint: "Demandes en attente",
            },
            {
              label: "Stages en cours",
              value: internships.length,
              hint: "Avec PDF disponibles",
            },
          ]);

          setHighlights([
            {
              title: "Priorite du jour",
              text: applications.some((item) => item.status === "EN_ATTENTE")
                ? "Des candidatures attendent une decision. Traite-les pour faire avancer les recrutements."
                : "Publie une nouvelle offre pour garder un pipeline actif de candidatures.",
              actionLabel: applications.some((item) => item.status === "EN_ATTENTE")
                ? "Voir les candidatures"
                : "Creer une offre",
              actionTo: applications.some((item) => item.status === "EN_ATTENTE")
                ? "/company/applications"
                : "/company/offers/create",
            },
            {
              title: "Documents officiels",
              text: "Les stages acceptes donnent acces a l'attestation et a la fiche d'evaluation PDF.",
              actionLabel: "Voir les stages",
              actionTo: "/company/internships",
            },
          ]);

          setActivity(
            applications.slice(0, 4).map((item) => ({
              title: item.internshipOffer.title,
              subtitle: `${item.student.firstName} ${item.student.lastName}`,
              meta: `Statut : ${item.status}`,
            }))
          );
        }

        if (user?.role === "SCHOOL") {
          const [applicationsResponse, internshipsResponse] = await Promise.all([
            api.get("/api/school/applications"),
            api.get("/api/school/internships"),
          ]);

          const applications = applicationsResponse.data.applications || [];
          const internships = internshipsResponse.data.internships || [];

          setStats([
            {
              label: "Candidatures suivies",
              value: applications.length,
              hint: "Etudiants rattaches",
            },
            {
              label: "Bloquees",
              value: applications.filter((item) => item.status === "BLOQUEE").length,
              hint: "Demandes non conformes",
            },
            {
              label: "Stages a valider",
              value: internships.filter((item) => item.status !== "valide").length,
              hint: "Validation ecole",
            },
            {
              label: "Livrables deposes",
              value: internships.reduce(
                (count, internship) => count + internship.deliverables.length,
                0
              ),
              hint: "Rapports et documents",
            },
          ]);

          setHighlights([
            {
              title: "Pilotage pedagogique",
              text: "Supervise les candidatures de tes etudiants, bloque les cas non conformes et valide les stages finalises.",
              actionLabel: "Ouvrir l'espace ecole",
              actionTo: "/school/dashboard",
            },
          ]);

          setActivity(
            internships.slice(0, 4).map((item) => ({
              title: item.title,
              subtitle: `${item.student.firstName} ${item.student.lastName}`,
              meta: `Livrables : ${item.deliverables.length}`,
            }))
          );
        }

        if (user?.role === "ADMIN") {
          const dashboardResponse = await api.get("/api/admin/dashboard");
          const usersResponse = await api.get("/api/admin/users");
          const offersResponse = await api.get("/api/admin/offers");
          const applicationsResponse = await api.get("/api/admin/applications");

          const statsData = dashboardResponse.data.stats;
          const users = usersResponse.data.users || [];
          const offers = offersResponse.data.offers || [];
          const applications = applicationsResponse.data.applications || [];

          setStats([
            {
              label: "Utilisateurs",
              value: statsData.users,
              hint: "Comptes enregistres",
            },
            {
              label: "Offres",
              value: statsData.offers,
              hint: "Catalogue global",
            },
            {
              label: "Candidatures",
              value: statsData.applications,
              hint: "Volume plateforme",
            },
            {
              label: "Stages",
              value: statsData.internships,
              hint: "Stages actifs",
            },
          ]);

          setHighlights([
            {
              title: "Vue de gouvernance",
              text: "Surveille les comptes, les offres et les candidatures pour garder la plateforme saine.",
              actionLabel: "Ouvrir l'administration",
              actionTo: "/admin/dashboard",
            },
          ]);

          setActivity([
            ...users.slice(0, 2).map((item) => ({
              title: item.email,
              subtitle: "Utilisateur recent",
              meta: item.role,
            })),
            ...offers.slice(0, 1).map((item) => ({
              title: item.title,
              subtitle: item.company?.name || "Entreprise",
              meta: "Offre recente",
            })),
            ...applications.slice(0, 1).map((item) => ({
              title: item.internshipOffer.title,
              subtitle: item.internshipOffer.company?.name || "Entreprise",
              meta: `Statut : ${item.status}`,
            })),
          ]);
        }
      } catch (loadError) {
        setError("Impossible de charger le contenu du dashboard");
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [user?.role]);

  const quickActions = useMemo(() => {
    const actions = {
      STUDENT: [
        { label: "Completer mon profil", to: "/profile" },
        { label: "Voir les offres", to: "/offers" },
        { label: "Ouvrir le matching", to: "/matching" },
      ],
      COMPANY: [
        { label: "Creer une offre", to: "/company/offers/create" },
        { label: "Gerer mes offres", to: "/company/offers" },
        { label: "Voir les candidatures", to: "/company/applications" },
        { label: "Voir mes stages", to: "/company/internships" },
      ],
      SCHOOL: [
        { label: "Ouvrir l'espace ecole", to: "/school/dashboard" },
        { label: "Consulter les offres", to: "/offers" },
      ],
      ADMIN: [
        { label: "Tableau admin", to: "/admin/dashboard" },
        { label: "Voir les offres", to: "/offers" },
      ],
    };

    return actions[user?.role] || [];
  }, [user?.role]);

  if (loading) {
    return (
      <div className="page-shell">
        <div className="empty-state">Chargement du contenu...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-shell">
        <div className="message message-error">{error}</div>
      </div>
    );
  }

  return (
    <div className="page-shell">
      <section className="dashboard-hero">
        <div className="surface-card hero-surface">
          <div className="section-header">
            <div>
              <span className="eyebrow">Vue generale</span>
              <h1 className="page-title">Tableau de bord</h1>
              <p className="page-subtitle">
                Une base solide pour piloter les stages, les candidatures et les validations.
              </p>
            </div>
          </div>

          <div className="hero-metrics">
            {stats.slice(0, 4).map((item) => (
              <div className="hero-metric" key={item.label}>
                <span>{item.label}</span>
                <strong>{item.value}</strong>
              </div>
            ))}
          </div>
        </div>

        <div className="hero-summary">
          <section className="surface-card">
            <span className="eyebrow">Compte</span>
            <h2 className="section-title" style={{ marginTop: 14 }}>Session active</h2>
            <div className="record-meta" style={{ marginTop: 18 }}>
              <span className="pill">{user?.role}</span>
            </div>
            <p className="page-subtitle" style={{ marginTop: 12 }}>{user?.email}</p>
            <p className="muted-text">Les modules de la navigation s'adaptent automatiquement a ton role.</p>
          </section>

          <section className="surface-card">
            <span className="eyebrow">Actions rapides</span>
            <h2 className="section-title" style={{ marginTop: 14 }}>Aller a l'essentiel</h2>
            <div className="panel-stack" style={{ marginTop: 18 }}>
              {quickActions.map((action) => (
                <Link className="button button-primary" key={action.to} to={action.to}>
                  {action.label}
                </Link>
              ))}
            </div>
          </section>
        </div>
      </section>

      <div className="dashboard-grid">
        <div className="dashboard-main">
          <section className="surface-card">
            <div className="section-header">
              <div>
                <span className="eyebrow">Indicateurs</span>
                <h2 className="section-title">Mesures a suivre</h2>
              </div>
            </div>

            <div className="stats-grid">
              {stats.map((item) => (
                <div className="stat-tile" key={item.label}>
                  <small>{item.label}</small>
                  <strong>{item.value}</strong>
                  <p className="muted-text" style={{ marginTop: 10 }}>{item.hint}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="surface-card">
            <div className="section-header">
              <div>
                <span className="eyebrow">Activite recente</span>
                <h2 className="section-title">Derniers elements utiles</h2>
              </div>
            </div>

            {activity.length === 0 ? (
              <div className="empty-state">Aucune activite recente a afficher.</div>
            ) : (
              <div className="activity-list">
                {activity.map((item, index) => (
                  <article className="activity-row" key={`${item.title}-${index}`}>
                    <div>
                      <strong>{item.title}</strong>
                      <span>{item.subtitle}</span>
                    </div>
                    <span className="pill">{item.meta}</span>
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>

        <div className="dashboard-side">
          {highlights.map((item) => (
            <section className="surface-card" key={item.title}>
              <span className="eyebrow">Focus</span>
              <h2 className="section-title" style={{ marginTop: 14 }}>{item.title}</h2>
              <p className="page-subtitle" style={{ marginTop: 10 }}>{item.text}</p>
              <div className="button-row" style={{ marginTop: 18 }}>
                <Link className="button button-secondary" to={item.actionTo}>
                  {item.actionLabel}
                </Link>
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;
