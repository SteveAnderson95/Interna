import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../services/api";

const initialStudentForm = {
  firstName: "",
  lastName: "",
  schoolId: "",
  fieldOfStudy: "",
  studyLevel: "",
  city: "",
  phone: "",
  bio: "",
  cvUrl: "",
  photoUrl: "",
};

const initialCompanyForm = {
  name: "",
  sector: "",
  city: "",
  description: "",
  phone: "",
  website: "",
  address: "",
  contactName: "",
  photoUrl: "",
  galleryUrls: [],
};

const initialSchoolForm = {
  name: "",
  city: "",
  phone: "",
  website: "",
  address: "",
  photoUrl: "",
};

function ProfilePage() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [studentForm, setStudentForm] = useState(initialStudentForm);
  const [companyForm, setCompanyForm] = useState(initialCompanyForm);
  const [schoolForm, setSchoolForm] = useState(initialSchoolForm);
  const [schoolOptions, setSchoolOptions] = useState([]);
  const [cvFile, setCvFile] = useState(null);
  const [photoFile, setPhotoFile] = useState(null);
  const [galleryFiles, setGalleryFiles] = useState([]);

  const baseUrl = api.defaults.baseURL;

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const [profileResponse, schoolsResponse] = await Promise.all([
          api.get("/api/profile/me"),
          api.get("/api/school/list"),
        ]);
        const fetchedUser = profileResponse.data.user;
        const fetchedProfile = profileResponse.data.profile;

        setUser(fetchedUser);
        setProfile(fetchedProfile);
        setSchoolOptions(schoolsResponse.data.schools || []);

        if (fetchedUser?.role === "STUDENT" && fetchedProfile) {
          setStudentForm({
            firstName: fetchedProfile.firstName || "",
            lastName: fetchedProfile.lastName || "",
            schoolId: fetchedProfile.schoolId ? String(fetchedProfile.schoolId) : "",
            fieldOfStudy: fetchedProfile.fieldOfStudy || "",
            studyLevel: fetchedProfile.studyLevel || "",
            city: fetchedProfile.city || "",
            phone: fetchedProfile.phone || "",
            bio: fetchedProfile.bio || "",
            cvUrl: fetchedProfile.cvUrl || "",
            photoUrl: fetchedProfile.photoUrl || "",
          });
        }

        if (fetchedUser?.role === "COMPANY" && fetchedProfile) {
          setCompanyForm({
            name: fetchedProfile.name || "",
            sector: fetchedProfile.sector || "",
            city: fetchedProfile.city || "",
            description: fetchedProfile.description || "",
            phone: fetchedProfile.phone || "",
            website: fetchedProfile.website || "",
            address: fetchedProfile.address || "",
            contactName: fetchedProfile.contactName || "",
            photoUrl: fetchedProfile.photoUrl || "",
            galleryUrls: fetchedProfile.galleryUrls || [],
          });
        }

        if (fetchedUser?.role === "SCHOOL" && fetchedProfile) {
          setSchoolForm({
            name: fetchedProfile.name || "",
            city: fetchedProfile.city || "",
            phone: fetchedProfile.phone || "",
            website: fetchedProfile.website || "",
            address: fetchedProfile.address || "",
            photoUrl: fetchedProfile.photoUrl || "",
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

  const resolveFileUrl = (filePath) => `${baseUrl}/${filePath}`;

  const renderAvatar = (photoUrl, fallback) =>
    photoUrl ? (
      <img alt="profile" className="avatar-image" src={resolveFileUrl(photoUrl)} />
    ) : (
      <div className="avatar-placeholder">{fallback}</div>
    );

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

  const saveStudentProfile = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");
    setSaving(true);

    try {
      let nextCvUrl = studentForm.cvUrl;
      let nextPhotoUrl = studentForm.photoUrl;

      if (cvFile) {
        setUploading(true);
        nextCvUrl = await uploadFile("/api/upload/cv", cvFile);
      }

      if (photoFile) {
        setUploading(true);
        nextPhotoUrl = await uploadFile("/api/upload/profile-photo", photoFile);
      }

      const payload = {
        ...studentForm,
        schoolId: studentForm.schoolId ? Number(studentForm.schoolId) : null,
        cvUrl: nextCvUrl,
        photoUrl: nextPhotoUrl,
      };

      const response = profile
        ? await api.patch("/api/profile/student", payload)
        : await api.post("/api/profile/student", payload);

      setProfile(response.data.profile);
      setStudentForm((current) => ({
        ...current,
        cvUrl: response.data.profile.cvUrl || nextCvUrl,
        photoUrl: response.data.profile.photoUrl || nextPhotoUrl,
      }));
      setCvFile(null);
      setPhotoFile(null);
      setMessage(profile ? "Profil etudiant mis a jour" : "Profil etudiant cree");
    } catch (err) {
      setError(err.response?.data?.message || "Erreur lors de l'enregistrement");
    } finally {
      setUploading(false);
      setSaving(false);
    }
  };

  const saveCompanyProfile = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");
    setSaving(true);

    try {
      let nextPhotoUrl = companyForm.photoUrl;
      let nextGalleryUrls = [...(companyForm.galleryUrls || [])];

      if (photoFile) {
        setUploading(true);
        nextPhotoUrl = await uploadFile("/api/upload/profile-photo", photoFile);
      }

      if (galleryFiles.length > 0) {
        setUploading(true);
        const uploadedGalleryUrls = [];

        for (const file of galleryFiles) {
          const filePath = await uploadFile("/api/upload/profile-photo", file);
          uploadedGalleryUrls.push(filePath);
        }

        nextGalleryUrls = [...nextGalleryUrls, ...uploadedGalleryUrls];
      }

      const payload = {
        ...companyForm,
        photoUrl: nextPhotoUrl,
        galleryUrls: nextGalleryUrls,
      };

      const response = profile
        ? await api.patch("/api/profile/company", payload)
        : await api.post("/api/profile/company", payload);

      setProfile(response.data.profile);
      setCompanyForm((current) => ({
        ...current,
        photoUrl: response.data.profile.photoUrl || nextPhotoUrl,
        galleryUrls: response.data.profile.galleryUrls || nextGalleryUrls,
      }));
      setPhotoFile(null);
      setGalleryFiles([]);
      setMessage(profile ? "Profil entreprise mis a jour" : "Profil entreprise cree");
    } catch (err) {
      setError(err.response?.data?.message || "Erreur lors de l'enregistrement");
    } finally {
      setUploading(false);
      setSaving(false);
    }
  };

  const saveSchoolProfile = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");
    setSaving(true);

    try {
      let nextPhotoUrl = schoolForm.photoUrl;

      if (photoFile) {
        setUploading(true);
        nextPhotoUrl = await uploadFile("/api/upload/profile-photo", photoFile);
      }

      const payload = {
        ...schoolForm,
        photoUrl: nextPhotoUrl,
      };

      const response = profile
        ? await api.patch("/api/profile/school", payload)
        : await api.post("/api/profile/school", payload);

      setProfile(response.data.profile);
      setSchoolForm((current) => ({
        ...current,
        photoUrl: response.data.profile.photoUrl || nextPhotoUrl,
      }));
      setPhotoFile(null);
      setMessage(profile ? "Profil ecole mis a jour" : "Profil ecole cree");
    } catch (err) {
      setError(err.response?.data?.message || "Erreur lors de l'enregistrement");
    } finally {
      setUploading(false);
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

  const currentPhotoUrl =
    user.role === "STUDENT"
      ? studentForm.photoUrl
      : user.role === "COMPANY"
        ? companyForm.photoUrl
        : schoolForm.photoUrl;

  const currentName =
    user.role === "STUDENT"
      ? `${studentForm.firstName || ""} ${studentForm.lastName || ""}`.trim() || "Etudiant"
      : user.role === "COMPANY"
        ? companyForm.name || "Entreprise"
        : schoolForm.name || "Ecole";

  return (
    <div className="page-shell">
      <div className="top-bar">
        <div>
          <span className="eyebrow">Profil complet</span>
          <h1 className="page-title">Fiche utilisateur</h1>
        </div>
        <Link className="button button-ghost" to="/dashboard">
          Retour dashboard
        </Link>
      </div>

      <section className="surface-card">
        <div className="avatar-block">
          {renderAvatar(currentPhotoUrl, currentName.slice(0, 2).toUpperCase())}
          <div>
            <h2 className="section-title" style={{ marginTop: 0 }}>{currentName}</h2>
            <p className="page-subtitle">{user.email}</p>
            <p className="page-subtitle">Role : {user.role}</p>
          </div>
        </div>

        {message && <p className="message message-success" style={{ marginTop: 18 }}>{message}</p>}
        {error && <p className="message message-error" style={{ marginTop: 18 }}>{error}</p>}

        {user.role === "STUDENT" && (
          <form className="form-stack" onSubmit={saveStudentProfile}>
            <div className="form-grid">
              <div className="form-field">
                <label>Prenom</label>
                <input className="input" name="firstName" value={studentForm.firstName} onChange={handleStudentChange} />
              </div>
              <div className="form-field">
                <label>Nom</label>
                <input className="input" name="lastName" value={studentForm.lastName} onChange={handleStudentChange} />
              </div>
              <div className="form-field">
                <label>Filiere</label>
                <input className="input" name="fieldOfStudy" value={studentForm.fieldOfStudy} onChange={handleStudentChange} />
              </div>
              <div className="form-field">
                <label>Ecole</label>
                <select className="input" name="schoolId" value={studentForm.schoolId} onChange={handleStudentChange}>
                  <option value="">Selectionner une ecole</option>
                  {schoolOptions.map((school) => (
                    <option key={school.id} value={school.id}>
                      {school.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-field">
                <label>Niveau</label>
                <input className="input" name="studyLevel" value={studentForm.studyLevel} onChange={handleStudentChange} />
              </div>
              <div className="form-field">
                <label>Ville</label>
                <input className="input" name="city" value={studentForm.city} onChange={handleStudentChange} />
              </div>
              <div className="form-field">
                <label>Telephone</label>
                <input className="input" name="phone" value={studentForm.phone} onChange={handleStudentChange} />
              </div>
              <div className="form-field full">
                <label>Presentation</label>
                <textarea className="textarea" name="bio" value={studentForm.bio} onChange={handleStudentChange} />
              </div>
              <div className="form-field">
                <label>Photo de profil</label>
                <input className="file-input" type="file" accept=".png,.jpg,.jpeg,.webp" onChange={(e) => setPhotoFile(e.target.files?.[0] || null)} />
              </div>
              <div className="form-field">
                <label>CV</label>
                <input className="file-input" type="file" accept=".pdf,.doc,.docx" onChange={(e) => setCvFile(e.target.files?.[0] || null)} />
                {studentForm.cvUrl && (
                  <a className="inline-file-link" href={resolveFileUrl(studentForm.cvUrl)} target="_blank" rel="noreferrer">
                    Ouvrir le CV actuel
                  </a>
                )}
              </div>
            </div>

            <div className="button-row">
              <button className="button button-primary" type="submit" disabled={saving || uploading}>
                {saving || uploading ? "Enregistrement..." : profile ? "Mettre a jour le profil" : "Creer le profil"}
              </button>
            </div>
          </form>
        )}

        {user.role === "COMPANY" && (
          <form className="form-stack" onSubmit={saveCompanyProfile}>
            <div className="form-grid">
              <div className="form-field">
                <label>Nom de l'entreprise</label>
                <input className="input" name="name" value={companyForm.name} onChange={handleCompanyChange} />
              </div>
              <div className="form-field">
                <label>Responsable contact</label>
                <input className="input" name="contactName" value={companyForm.contactName} onChange={handleCompanyChange} />
              </div>
              <div className="form-field">
                <label>Secteur</label>
                <input className="input" name="sector" value={companyForm.sector} onChange={handleCompanyChange} />
              </div>
              <div className="form-field">
                <label>Ville</label>
                <input className="input" name="city" value={companyForm.city} onChange={handleCompanyChange} />
              </div>
              <div className="form-field">
                <label>Telephone</label>
                <input className="input" name="phone" value={companyForm.phone} onChange={handleCompanyChange} />
              </div>
              <div className="form-field">
                <label>Site web</label>
                <input className="input" name="website" value={companyForm.website} onChange={handleCompanyChange} />
              </div>
              <div className="form-field">
                <label>Adresse</label>
                <input className="input" name="address" value={companyForm.address} onChange={handleCompanyChange} />
              </div>
              <div className="form-field full">
                <label>Description</label>
                <textarea className="textarea" name="description" value={companyForm.description} onChange={handleCompanyChange} />
              </div>
              <div className="form-field full">
                <label>Logo ou photo</label>
                <input className="file-input" type="file" accept=".png,.jpg,.jpeg,.webp" onChange={(e) => setPhotoFile(e.target.files?.[0] || null)} />
              </div>
              <div className="form-field full">
                <label>Images de l'entreprise</label>
                <input
                  className="file-input"
                  type="file"
                  accept=".png,.jpg,.jpeg,.webp"
                  multiple
                  onChange={(e) => setGalleryFiles(Array.from(e.target.files || []))}
                />
              </div>
            </div>

            {companyForm.galleryUrls?.length > 0 && (
              <div className="gallery-grid">
                {companyForm.galleryUrls.map((imagePath, index) => (
                  <img
                    key={`${imagePath}-${index}`}
                    alt="Entreprise"
                    className="gallery-image"
                    src={resolveFileUrl(imagePath)}
                  />
                ))}
              </div>
            )}

            <div className="button-row">
              <button className="button button-primary" type="submit" disabled={saving || uploading}>
                {saving || uploading ? "Enregistrement..." : profile ? "Mettre a jour le profil" : "Creer le profil"}
              </button>
            </div>
          </form>
        )}

        {user.role === "SCHOOL" && (
          <form className="form-stack" onSubmit={saveSchoolProfile}>
            <div className="form-grid">
              <div className="form-field">
                <label>Nom de l'ecole</label>
                <input className="input" name="name" value={schoolForm.name} onChange={handleSchoolChange} />
              </div>
              <div className="form-field">
                <label>Ville</label>
                <input className="input" name="city" value={schoolForm.city} onChange={handleSchoolChange} />
              </div>
              <div className="form-field">
                <label>Telephone</label>
                <input className="input" name="phone" value={schoolForm.phone} onChange={handleSchoolChange} />
              </div>
              <div className="form-field">
                <label>Site web</label>
                <input className="input" name="website" value={schoolForm.website} onChange={handleSchoolChange} />
              </div>
              <div className="form-field full">
                <label>Adresse</label>
                <input className="input" name="address" value={schoolForm.address} onChange={handleSchoolChange} />
              </div>
              <div className="form-field full">
                <label>Photo / logo</label>
                <input className="file-input" type="file" accept=".png,.jpg,.jpeg,.webp" onChange={(e) => setPhotoFile(e.target.files?.[0] || null)} />
              </div>
            </div>

            <div className="button-row">
              <button className="button button-primary" type="submit" disabled={saving || uploading}>
                {saving || uploading ? "Enregistrement..." : profile ? "Mettre a jour le profil" : "Creer le profil"}
              </button>
            </div>
          </form>
        )}
      </section>
    </div>
  );
}

export default ProfilePage;
