import { useNavigate } from "react-router-dom";

function DashboardPage() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <div>
      <h1>Dashboard</h1>
      <p>Bienvenue sur Interna</p>

      {user && (
        <>
          <p>Email : {user.email}</p>
          <p>Rôle : {user.role}</p>
        </>
      )}

      <button onClick={handleLogout}>Logout</button>
    </div>
  );
}

export default DashboardPage;
