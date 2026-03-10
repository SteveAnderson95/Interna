import { useEffect, useState } from "react";
import api from "./services/api";

function App() {
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchHealth = async () => {
      try {
        const response = await api.get("/api/health");
        setMessage(response.data.message);
      } catch (error) {
        setMessage("Erreur de connexion au backend");
      }
    };

    fetchHealth();
  }, []);

  return (
    <div>
      <h1>Interna</h1>
      <p>{message}</p>
    </div>
  );
}

export default App;
