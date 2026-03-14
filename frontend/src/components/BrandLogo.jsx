function BrandLogo({ compact = false, inverse = false }) {
  return (
    <div
      className={`brand-logo${compact ? " brand-logo-compact" : ""}${inverse ? " brand-logo-inverse" : ""}`}
    >
      <div className="brand-logo-mark">
        <span className="brand-logo-dot brand-logo-dot-a" />
        <span className="brand-logo-dot brand-logo-dot-b" />
        <span className="brand-logo-dot brand-logo-dot-c" />
      </div>
      <div className="brand-logo-copy">
        <strong>Interna</strong>
        <span>Gestion des stages</span>
      </div>
    </div>
  );
}

export default BrandLogo;
