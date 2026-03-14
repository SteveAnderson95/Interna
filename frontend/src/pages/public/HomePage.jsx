import { Link } from "react-router-dom";
import BrandLogo from "../../components/BrandLogo";
import PublicFooter from "../../components/PublicFooter";

function HomePage() {
  return (
    <div className="public-screen">
      <main className="public-hero-shell">
        <section className="public-hero-frame">
          <header className="public-topbar">
            <BrandLogo inverse />
            <div className="button-row">
              <Link className="button button-ghost-light" to="/login">
                Login
              </Link>
            </div>
          </header>

          <section className="public-hero-grid">
            <div className="public-hero-copy">
              <span className="eyebrow public-eyebrow">Interna platform</span>
              <h1>Gestion des stages basee sur une vue claire et pro.</h1>
              <p>
                Centralise les profils, les offres, les candidatures et la supervision
                dans une interface unique pour etudiants, entreprises, ecoles et admin.
              </p>
            </div>

            <aside className="public-action-card">
              <h2>Commencer ici</h2>
              <p>Choisis une entree simple pour acceder rapidement a la plateforme.</p>
              <div className="panel-stack" style={{ marginTop: 18 }}>
                <Link className="button button-accent" to="/register">
                  Creer un compte
                </Link>
                <Link className="button button-ghost-light" to="/login">
                  Se connecter
                </Link>
              </div>
            </aside>
          </section>
        </section>
      </main>

      <PublicFooter dark />
    </div>
  );
}

export default HomePage;
