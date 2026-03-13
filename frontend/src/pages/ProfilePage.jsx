import { useEffect, useState } from "react";
import api from "../services/api";

const initialStudentForm = {
  firstName: "",
  lastName: "",
  fieldOfStudy: "",
  studyLevel: "",
  city: "",
  cvUrl: "",
};

const initialCompanyForm = {
  name: "",
  city: "",
  description: "",
};

const initialSchoolForm = {
  name: "",
  city: "",
};

function ProfilePage() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingCv, setUploadingCv] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [studentForm, setStudentForm] = useState(initialStudentForm);
  const [companyForm, setCompanyForm] = useState(initialCompanyForm);
  const [schoolForm, setSchoolForm] = useState(initialSchoolForm);
  const [cvFile, setCvFile] = useState(null);

  const baseUrl = api.defaults.baseURL;

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get("/api/profile/me");
        const fetchedUser = response.data.user;
        const fetchedProfile = response.data.profile;

        setUser(fetchedUser);
        setProfile(fetchedProfile);

        if (fetchedUser?.role === "STUDENT" && fetchedProfile) {
          setStudentForm({
            firstName: fetchedProfile.firstName || "",
            lastName: fetchedProfile.lastName || "",
            fieldOfStudy: fetchedProfile.fieldOfStudy || "",
            studyLevel: fetchedProfile.studyLevel || "",
            city: fetchedProfile.city || "",
            cvUrl: fetchedProfile.cvUrl || "",
          });
        }

        if (fetchedUser?.role === "COMPANY" && fetchedProfile) {
          setCompanyForm({
            name: fetchedProfile.name || "",
            city: fetchedProfile.city || "",
            description: fetchedProfile.description || "",
          });
        }

        if (fetchedUser?.role === "SCHOOL" && fetchedProfile) {
          setSchoolForm({
            name: fetchedProfile.name || "",
            city: fetchedProfile.city || "",
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

  const uploadFile = async (endpoint, file) => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await api.post(endpoint, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data.filePath;
  };

  const handleStudentChange = (event) => {
    setStudentForm((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  };

  const handleCompanyChange = (event) => {
    setCompanyForm((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  };

  const handleSchoolChange = (event) => {
    setSchoolForm((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  };

  const handleStudentSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");
    setSaving(true);

    try {
      let nextCvUrl = studentForm.cvUrl;

      if (cvFile) {
        setUploadingCv(true);
        nextCvUrl = await uploadFile("/api/upload/cv", cvFile);
        setUploadingCv(false);
      }

      const payload = {
        ...studentForm,
        cvUrl: nextCvUrl,
      };

      const response = profile
        ? await api.patch("/api/profile/student", payload)
        : await api.post("/api/profile/student", payload);

      setProfile(response.data.profile);
      setStudentForm((current) => ({
        ...current,
        cvUrl: response.data.profile.cvUrl || nextCvUrl,
      }));
      setCvFile(null);
      setMessage(profile ? "Profil étudiant mis à jour" : "Profil étudiant créé");
    } catch (err) {
      setError(err.response?.data?.message || "Erreur lors de l'enregistrement");
    } finally {
      setUploadingCv(false);
      setSaving(false);
    }
  };

  const handleCompanySubmit = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");
    setSaving(true);

    try {
      const response = profile
        ? await api.patch("/api/profile/company", companyForm)
        : await api.post("/api/profile/company", companyForm);

      setProfile(response.data.profile);
      setMessage(profile ? "Profil entreprise mis à jour" : "Profil entreprise créé");
    } catch (err) {
      setError(err.response?.data?.message || "Erreur lors de l'enregistrement");
    } finally {
      setSaving(false);
    }
  };

  const handleSchoolSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");
    setSaving(true);

    try {
      const response = profile
        ? await api.patch("/api/profile/school", schoolForm)
        : await api.post("/api/profile/school", schoolForm);

      setProfile(response.data.profile);
      setMessage(profile ? "Profil école mis à jour" : "Profil école créé");
    } catch (err) {
      setError(err.response?.data?.message || "Erreur lors de l'enregistrement");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <p>Chargement...</p>;
  }

  if (!user) {
    return <p>Utilisateur introuvable</p>;
  }

  return (
    <div>
      <h1>Mon profil</h1>
      <p>Role : {user.role}</p>

      {message && <p>{message}</p>}
      {error && <p>{error}</p>}

      {user.role === "STUDENT" && (
        <form onSubmit={handleStudentSubmit}>
          <div>
            <label>Prenom</label>
            <input
              type="text"
              name="firstName"
              value={studentForm.firstName}
              onChange={handleStudentChange}
            />
          </div>

          <div>
            <label>Nom</label>
            <input
              type="text"
              name="lastName"
              value={studentForm.lastName}
              onChange={handleStudentChange}
            />
          </div>

          <div>
            <label>Filiere</label>
            <input
              type="text"
              name="fieldOfStudy"
              value={studentForm.fieldOfStudy}
              onChange={handleStudentChange}
            />
          </div>

          <div>
            <label>Niveau</label>
            <input
              type="text"
              name="studyLevel"
              value={studentForm.studyLevel}
              onChange={handleStudentChange}
            />
          </div>

          <div>
            <label>Ville</label>
            <input
              type="text"
              name="city"
              value={studentForm.city}
              onChange={handleStudentChange}
            />
          </div>

          <div>
            <label>CV</label>
            <input
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={(event) => setCvFile(event.target.files?.[0] || null)}
            />
          </div>

          {studentForm.cvUrl && (
            <p>
              CV actuel :
              {" "}
              <a href={`${baseUrl}/${studentForm.cvUrl}`} target="_blank" rel="noreferrer">
                Ouvrir le fichier
              </a>
            </p>
          )}

          <button type="submit" disabled={saving || uploadingCv}>
            {saving || uploadingCv
              ? "Enregistrement..."
              : profile
                ? "Mettre a jour le profil"
                : "Creer le profil"}
          </button>
        </form>
      )}

      {user.role === "COMPANY" && (
        <form onSubmit={handleCompanySubmit}>
          <div>
            <label>Nom de l'entreprise</label>
            <input
              type="text"
              name="name"
              value={companyForm.name}
              onChange={handleCompanyChange}
            />
          </div>

          <div>
            <label>Ville</label>
            <input
              type="text"
              name="city"
              value={companyForm.city}
              onChange={handleCompanyChange}
            />
          </div>

          <div>
            <label>Description</label>
            <textarea
              name="description"
              value={companyForm.description}
              onChange={handleCompanyChange}
            />
          </div>

          <button type="submit" disabled={saving}>
            {saving ? "Enregistrement..." : profile ? "Mettre a jour le profil" : "Creer le profil"}
          </button>
        </form>
      )}

      {user.role === "SCHOOL" && (
        <form onSubmit={handleSchoolSubmit}>
          <div>
            <label>Nom de l'ecole</label>
            <input
              type="text"
              name="name"
              value={schoolForm.name}
              onChange={handleSchoolChange}
            />
          </div>

          <div>
            <label>Ville</label>
            <input
              type="text"
              name="city"
              value={schoolForm.city}
              onChange={handleSchoolChange}
            />
          </div>

          <button type="submit" disabled={saving}>
            {saving ? "Enregistrement..." : profile ? "Mettre a jour le profil" : "Creer le profil"}
          </button>
        </form>
      )}
    </div>
  );
}

export default ProfilePage;
