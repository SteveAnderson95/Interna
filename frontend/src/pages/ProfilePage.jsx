import { Link } from "react-router-dom";
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
      headers: { "Content-Type": "multipart/form-data" },
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
      }

      const payload = { ...studentForm, cvUrl: nextCvUrl };
      const response = profile
        ? await api.patch("/api/profile/student", payload)
        : await api.post("/api/profile/student", payload);

      setProfile(response.data.profile);
      setStudentForm((current) => ({
        ...current,
        cvUrl: response.data.profile.cvUrl || nextCvUrl,
      }));
      setCvFile(null);
      setMessage(profile ? "Profil etudiant mis a jour" : "Profil etudiant cree");
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
      setMessage(profile ? "Profil entreprise mis a jour" : "Profil entreprise cree");
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
      setMessage(profile ? "Profil ecole mis a jour" : "Profil ecole cree");
    } catch (err) {
      setError(err.response?.data?.message || "Erreur lors de l'enregistrement");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="page-shell">
        <div className="empty-state">Chargement du profil...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="page-shell">
        <div className="message message-error">Utilisateur introuvable</div>
      </div>
    );
  }

  return (
    <div className="page-shell">
      <div className="top-bar">
        <div>
          <span className="eyebrow">Profil</span>
          <h1 className="page-title">Completer les informations de compte</h1>
        </div>
        <Link className="button button-ghost" to="/dashboard">
          Retour dashboard
        </Link>
      </div>

      <section className="surface-card">
        <div className="section-header">
          <div>
            <h2 className="section-title">Role : {user.role}</h2>
            <p className="page-subtitle">
              Mets a jour uniquement les donnees utiles au flux MVP.
            </p>
          </div>
        </div>

        {message && <p className="message message-success">{message}</p>}
        {error && <p className="message message-error">{error}</p>}

        {user.role === "STUDENT" && (
          <form className="form-stack" onSubmit={handleStudentSubmit}>
            <div className="form-grid">
              <div className="form-field">
                <label htmlFor="student-first-name">Prenom</label>
                <input
                  id="student-first-name"
                  className="input"
                  type="text"
                  name="firstName"
                  value={studentForm.firstName}
                  onChange={handleStudentChange}
                />
              </div>
              <div className="form-field">
                <label htmlFor="student-last-name">Nom</label>
                <input
                  id="student-last-name"
                  className="input"
                  type="text"
                  name="lastName"
                  value={studentForm.lastName}
                  onChange={handleStudentChange}
                />
              </div>
              <div className="form-field">
                <label htmlFor="student-field">Filiere</label>
                <input
                  id="student-field"
                  className="input"
                  type="text"
                  name="fieldOfStudy"
                  value={studentForm.fieldOfStudy}
                  onChange={handleStudentChange}
                />
              </div>
              <div className="form-field">
                <label htmlFor="student-level">Niveau</label>
                <input
                  id="student-level"
                  className="input"
                  type="text"
                  name="studyLevel"
                  value={studentForm.studyLevel}
                  onChange={handleStudentChange}
                />
              </div>
              <div className="form-field">
                <label htmlFor="student-city">Ville</label>
                <input
                  id="student-city"
                  className="input"
                  type="text"
                  name="city"
                  value={studentForm.city}
                  onChange={handleStudentChange}
                />
              </div>
              <div className="form-field">
                <label htmlFor="student-cv">CV</label>
                <input
                  id="student-cv"
                  className="file-input"
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={(event) => setCvFile(event.target.files?.[0] || null)}
                />
                {studentForm.cvUrl && (
                  <a
                    className="inline-file-link"
                    href={`${baseUrl}/${studentForm.cvUrl}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Ouvrir le CV actuel
                  </a>
                )}
              </div>
            </div>

            <div className="button-row">
              <button className="button button-primary" disabled={saving || uploadingCv} type="submit">
                {saving || uploadingCv
                  ? "Enregistrement..."
                  : profile
                    ? "Mettre a jour le profil"
                    : "Creer le profil"}
              </button>
            </div>
          </form>
        )}

        {user.role === "COMPANY" && (
          <form className="form-stack" onSubmit={handleCompanySubmit}>
            <div className="form-grid">
              <div className="form-field">
                <label htmlFor="company-name">Nom de l'entreprise</label>
                <input
                  id="company-name"
                  className="input"
                  type="text"
                  name="name"
                  value={companyForm.name}
                  onChange={handleCompanyChange}
                />
              </div>
              <div className="form-field">
                <label htmlFor="company-city">Ville</label>
                <input
                  id="company-city"
                  className="input"
                  type="text"
                  name="city"
                  value={companyForm.city}
                  onChange={handleCompanyChange}
                />
              </div>
              <div className="form-field full">
                <label htmlFor="company-description">Description</label>
                <textarea
                  id="company-description"
                  className="textarea"
                  name="description"
                  value={companyForm.description}
                  onChange={handleCompanyChange}
                />
              </div>
            </div>

            <div className="button-row">
              <button className="button button-primary" disabled={saving} type="submit">
                {saving ? "Enregistrement..." : profile ? "Mettre a jour le profil" : "Creer le profil"}
              </button>
            </div>
          </form>
        )}

        {user.role === "SCHOOL" && (
          <form className="form-stack" onSubmit={handleSchoolSubmit}>
            <div className="form-grid">
              <div className="form-field">
                <label htmlFor="school-name">Nom de l'ecole</label>
                <input
                  id="school-name"
                  className="input"
                  type="text"
                  name="name"
                  value={schoolForm.name}
                  onChange={handleSchoolChange}
                />
              </div>
              <div className="form-field">
                <label htmlFor="school-city">Ville</label>
                <input
                  id="school-city"
                  className="input"
                  type="text"
                  name="city"
                  value={schoolForm.city}
                  onChange={handleSchoolChange}
                />
              </div>
            </div>

            <div className="button-row">
              <button className="button button-primary" disabled={saving} type="submit">
                {saving ? "Enregistrement..." : profile ? "Mettre a jour le profil" : "Creer le profil"}
              </button>
            </div>
          </form>
        )}
      </section>
    </div>
  );
}

export default ProfilePage;
