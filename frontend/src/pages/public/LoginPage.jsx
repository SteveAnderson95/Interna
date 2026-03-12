import { Link } from "react-router-dom";

function LoginPage() {
  return (
    <div>
      <h1>Login</h1>
      <p>Connecte-toi à Interna</p>

      <form>
        <div>
          <label>Email</label>
          <input type="email" />
        </div>

        <div>
          <label>Mot de passe</label>
          <input type="password" />
        </div>

        <button type="submit">Se connecter</button>
      </form>

      <p>
        Pas de compte ? <Link to="/register">Créer un compte</Link>
      </p>
    </div>
  );
}

export default LoginPage;
