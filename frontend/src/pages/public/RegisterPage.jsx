import { Link } from "react-router-dom";

function RegisterPage() {
  return (
    <div>
      <h1>Register</h1>
      <p>Créer un compte Interna</p>

      <form>
        <div>
          <label>Email</label>
          <input type="email" />
        </div>

        <div>
          <label>Mot de passe</label>
          <input type="password" />
        </div>

        <div>
          <label>Rôle</label>
          <select>
            <option value="STUDENT">Etudiant</option>
            <option value="COMPANY">Entreprise</option>
            <option value="SCHOOL">Ecole</option>
          </select>
        </div>

        <button type="submit">Créer un compte</button>
      </form>

      <p>
        Déjà un compte ? <Link to="/login">Se connecter</Link>
      </p>
    </div>
  );
}

export default RegisterPage;
