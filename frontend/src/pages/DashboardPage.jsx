function DashboardPage() {
  const user = JSON.parse(localStorage.getItem("user"));

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
    </div>
  );
}

export default DashboardPage;
