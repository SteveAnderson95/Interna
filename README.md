# Interna

Plateforme web de gestion des stages.

## Prerequis

Installez d'abord :

- Git
- Node.js LTS
- MySQL
- VS Code

Verifiez dans le terminal :

```powershell
git --version
node -v
npm -v
mysql --version
```

## 1. Recuperer le projet

```powershell
git clone https://github.com/SteveAnderson95/Interna.git
cd Interna
```

## 2. Installer les dependances

### Backend

```powershell
cd backend
npm install
```

### Frontend

Dans un autre terminal :

```powershell
cd frontend
npm install
```

## 3. Creer la base MySQL

Creez une base nommee :

```sql
CREATE DATABASE interna_db;
```

## 4. Configurer le backend

Creez un fichier dans le dossier backend :

```text
backend/.env
```

Avec ce contenu : 

```env
DATABASE_URL="mysql://root:motdepasse@localhost:3306/interna_db"
JWT_SECRET="123456"
PORT=5000
```
(remplacez motdepasse par votre vrai mot de passe de MySQL, s'il n y en a pas, faites juste : DATABASE_URL="mysql://root:@localhost:3306/interna_db")

Notes simples :

- `JWT_SECRET` peut etre n'importe quel texte en local
- il n'est pas necessaire d'ajouter SMTP pour faire tourner l'application
- si vous utilisez le meme utilisateur que sur ma machine locale, vous pouvez mettre :

```env
DATABASE_URL="mysql://interna_user:interna123@localhost:3306/interna_db"
JWT_SECRET="123456"
PORT=5000
```

## 5. Initialiser Prisma

Dans `backend/` :

```powershell
npx prisma generate
npx prisma db push
```

## 6. Lancer le projet

Ouvrez 2 terminaux :

### Terminal 1 : backend

```powershell
cd backend
npm run dev
```

### Terminal 2 : frontend

```powershell
cd frontend
npm run dev
```

## 7. Ouvrir le projet

Frontend :

```text
http://localhost:5173
```

Backend :

```text
http://localhost:5000
```

## 8. Comptes de test

Vous pouvez utiliser directement ces comptes :

### Etudiant

- email : `student.demo@interna.ma`
- mot de passe : `123456`

### Entreprise

- email : `company.demo@interna.ma`
- mot de passe : `123456`

### Ecole

- email : `school.demo@interna.ma`
- mot de passe : `123456`

### Admin

- email : `admin.demo@interna.ma`
- mot de passe : `123456`

Ces comptes ont deja des donnees de demonstration :

- profils complets
- une offre de stage
- une candidature
- un stage valide
- un livrable

## 9. Si quelque chose ne marche pas

Verifier simplement :

- MySQL est bien lance
- la base `interna_db` existe
- le fichier `backend/.env` existe
- `npx prisma db push` a bien ete execute
- le backend tourne bien sur le port `5000`
- le frontend tourne bien sur le port `5173`

## Auteur

### Steve Anderson H.
