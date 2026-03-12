import { useEffect, useState } from "react";
import api from "../services/api";

function ProfilePage() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    fieldOfStudy: "",
    studyLevel: "",
    city: "",
    cvUrl: "",
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get("/api/profile/me");
        const fetchedUser = response.data.user;
        const fetchedProfile = response.data.profile;

        setUser(fetchedUser);
        setProfile(fetchedProfile);

        if (fetchedProfile) {
          setFormData({
            firstName: fetchedProfile.firstName || "",
            lastName: fetchedProfile.lastName || "",
            fieldOfStudy: fetchedProfile.fieldOfStudy || "",
            studyLevel: fetchedProfile.studyLevel || "",
            city: fetchedProfile.city || "",
            cvUrl: fetchedProfile.cvUrl || "",
          });
        }
      } catch (err) {
        setError("Impossible de charger le profil");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleChange = (event) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value,
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage("");
    setError("");

    try {
      if (profile) {
        await api.patch("/api/profile/student", formData);
        setMessage("Profil mis à jour avec succès");
      } else {
        await api.post("/api/profile/student", formData);
        setMessage("Profil créé avec succès");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Erreur lors de l'enregistrement");
    }
  };

  if (loading) {
    return <p>Chargement...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  if (!user) {
    return <p>Utilisateur introuvable</p>;
  }

  if (user.role !== "STUDENT") {
    return <p>Version MVP : cette page gère seulement le profil étudiant pour le moment.</p>;
  }

  return (
    <div>
      <h1>Mon profil</h1>

      <form onSubmit={handleSubmit}>
        <div>
          <label>Prénom</label>
          <input
            type="text"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
          />
        </div>

        <div>
          <label>Nom</label>
          <input
            type="text"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
          />
        </div>

        <div>
          <label>Filière</label>
          <input
            type="text"
            name="fieldOfStudy"
            value={formData.fieldOfStudy}
            onChange={handleChange}
          />
        </div>

        <div>
          <label>Niveau</label>
          <input
            type="text"
            name="studyLevel"
            value={formData.studyLevel}
            onChange={handleChange}
          />
        </div>

        <div>
          <label>Ville</label>
          <input
            type="text"
            name="city"
            value={formData.city}
            onChange={handleChange}
          />
        </div>

        <div>
          <label>CV URL</label>
          <input
            type="text"
            name="cvUrl"
            value={formData.cvUrl}
            onChange={handleChange}
          />
        </div>

        <button type="submit">
          {profile ? "Mettre à jour" : "Créer le profil"}
        </button>
      </form>

      {message && <p>{message}</p>}
      {error && <p>{error}</p>}
    </div>
  );
}

export default ProfilePage;
