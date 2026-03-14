function PublicFooter({ compact = false, dark = false }) {
  return (
    <footer
      className={`public-footer${compact ? " public-footer-compact" : ""}${
        dark ? " public-footer-dark" : ""
      }`}
    >
      <div className="public-footer-names">
        <span>Fatima</span>
        <span className="public-footer-dot" aria-hidden="true">
          •
        </span>
        <span>Rabia</span>
        <span className="public-footer-dot" aria-hidden="true">
          •
        </span>
        <span>Abdellaoui</span>
      </div>
      <div className="public-footer-meta">
        <p className="public-footer-note">
          Interna • Plateforme web intelligente de gestion des stages
        </p>
        <p className="public-footer-copy">
          © 2026 Interna. All rights reserved.
        </p>
      </div>
    </footer>
  );
}

export default PublicFooter;
