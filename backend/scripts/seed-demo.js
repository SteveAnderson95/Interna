require("dotenv").config();

const fs = require("fs");
const path = require("path");
const bcrypt = require("bcrypt");
const PDFDocument = require("pdfkit");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const ensureDir = (dirPath) => {
  fs.mkdirSync(dirPath, { recursive: true });
};

const writePdfIfMissing = (filePath, title, lines = []) =>
  new Promise((resolve, reject) => {
    if (fs.existsSync(filePath)) {
      resolve();
      return;
    }

    ensureDir(path.dirname(filePath));

    const doc = new PDFDocument({ margin: 48 });
    const stream = fs.createWriteStream(filePath);

    doc.pipe(stream);
    doc.fontSize(20).text(title, { align: "center" });
    doc.moveDown(1.5);

    lines.forEach((line) => {
      doc.fontSize(12).text(line);
      doc.moveDown(0.5);
    });

    doc.end();

    stream.on("finish", resolve);
    stream.on("error", reject);
  });

const createDemoFiles = async () => {
  const baseDir = path.join(process.cwd(), "uploads");
  const files = [
    {
      relativePath: "cvs/demo-cv.pdf",
      title: "CV de demonstration",
      lines: [
        "Nom : Youssef Bennani",
        "Profil : Etudiant en informatique",
        "Competences : React, Node.js, MySQL",
      ],
    },
    {
      relativePath: "motivation_letters/demo-letter.pdf",
      title: "Lettre de motivation",
      lines: [
        "Candidature de demonstration pour le stage Full Stack.",
        "Document genere automatiquement par le seed.",
      ],
    },
    {
      relativePath: "conventions/demo-convention.pdf",
      title: "Convention de stage",
      lines: [
        "Convention de demonstration pour les tests locaux.",
      ],
    },
    {
      relativePath: "reports/demo-report.pdf",
      title: "Rapport de stage",
      lines: [
        "Rapport de demonstration genere automatiquement.",
      ],
    },
  ];

  for (const file of files) {
    await writePdfIfMissing(path.join(baseDir, file.relativePath), file.title, file.lines);
  }
};

const upsertUser = async (email, role, password = "123456") => {
  const hashedPassword = await bcrypt.hash(password, 10);

  return prisma.user.upsert({
    where: { email },
    update: {
      password: hashedPassword,
      role,
      active: true,
    },
    create: {
      email,
      password: hashedPassword,
      role,
      active: true,
    },
  });
};

const upsertOffer = async (companyId) => {
  const existingOffer = await prisma.internshipOffer.findFirst({
    where: {
      companyId,
      title: "Stage Developpement Full Stack",
    },
  });

  const data = {
    companyId,
    title: "Stage Developpement Full Stack",
    description:
      "Participation a la conception et au developpement d'une plateforme web de gestion des stages.",
    fieldOfStudy: "Informatique",
    studyLevel: "Licence",
    duration: "2 mois",
    internshipType: "Stage d'initiation",
    city: "Agadir",
    status: "ouverte",
    deadline: new Date("2026-06-30"),
  };

  if (existingOffer) {
    return prisma.internshipOffer.update({
      where: { id: existingOffer.id },
      data,
    });
  }

  return prisma.internshipOffer.create({ data });
};

const upsertDeliverable = async (internshipId) => {
  const existingDeliverable = await prisma.deliverable.findFirst({
    where: {
      internshipId,
      title: "Rapport de stage",
    },
  });

  const data = {
    internshipId,
    title: "Rapport de stage",
    fileUrl: "uploads/reports/demo-report.pdf",
  };

  if (existingDeliverable) {
    return prisma.deliverable.update({
      where: { id: existingDeliverable.id },
      data,
    });
  }

  return prisma.deliverable.create({ data });
};

const main = async () => {
  await createDemoFiles();

  const schoolUser = await upsertUser("school.demo@interna.ma", "SCHOOL");
  const companyUser = await upsertUser("company.demo@interna.ma", "COMPANY");
  const studentUser = await upsertUser("student.demo@interna.ma", "STUDENT");
  await upsertUser("admin.demo@interna.ma", "ADMIN");

  const school = await prisma.school.upsert({
    where: { userId: schoolUser.id },
    update: {
      name: "EST Dakhla",
      city: "Dakhla",
      phone: "0528937929",
      website: "https://estd.uiz.ac.ma",
      address: "Oum Labouir, Dakhla",
    },
    create: {
      userId: schoolUser.id,
      name: "EST Dakhla",
      city: "Dakhla",
      phone: "0528937929",
      website: "https://estd.uiz.ac.ma",
      address: "Oum Labouir, Dakhla",
    },
  });

  const company = await prisma.company.upsert({
    where: { userId: companyUser.id },
    update: {
      name: "Atlas Digital Solutions",
      sector: "Developpement logiciel",
      city: "Agadir",
      description:
        "Entreprise de services numeriques specialisee dans les plateformes web.",
      phone: "0528001122",
      website: "https://atlas-digital.ma",
      address: "Quartier industriel, Agadir",
      contactName: "Sara El Mansouri",
    },
    create: {
      userId: companyUser.id,
      name: "Atlas Digital Solutions",
      sector: "Developpement logiciel",
      city: "Agadir",
      description:
        "Entreprise de services numeriques specialisee dans les plateformes web.",
      phone: "0528001122",
      website: "https://atlas-digital.ma",
      address: "Quartier industriel, Agadir",
      contactName: "Sara El Mansouri",
    },
  });

  const student = await prisma.student.upsert({
    where: { userId: studentUser.id },
    update: {
      schoolId: school.id,
      firstName: "Youssef",
      lastName: "Bennani",
      fieldOfStudy: "Informatique",
      studyLevel: "Licence",
      city: "Dakhla",
      phone: "0611223344",
      bio: "Etudiant interesse par le developpement web et les applications de gestion.",
      cvUrl: "uploads/cvs/demo-cv.pdf",
    },
    create: {
      userId: studentUser.id,
      schoolId: school.id,
      firstName: "Youssef",
      lastName: "Bennani",
      fieldOfStudy: "Informatique",
      studyLevel: "Licence",
      city: "Dakhla",
      phone: "0611223344",
      bio: "Etudiant interesse par le developpement web et les applications de gestion.",
      cvUrl: "uploads/cvs/demo-cv.pdf",
    },
  });

  const offer = await upsertOffer(company.id);

  const application = await prisma.application.upsert({
    where: {
      studentId_internshipOfferId: {
        studentId: student.id,
        internshipOfferId: offer.id,
      },
    },
    update: {
      motivationLetterUrl: "uploads/motivation_letters/demo-letter.pdf",
      conventionUrl: "uploads/conventions/demo-convention.pdf",
      status: "ACCEPTEE",
      blockReason: null,
    },
    create: {
      studentId: student.id,
      internshipOfferId: offer.id,
      motivationLetterUrl: "uploads/motivation_letters/demo-letter.pdf",
      conventionUrl: "uploads/conventions/demo-convention.pdf",
      status: "ACCEPTEE",
    },
  });

  const internship = await prisma.internship.upsert({
    where: { applicationId: application.id },
    update: {
      studentId: student.id,
      companyId: company.id,
      title: offer.title,
      status: "valide",
      startedAt: new Date("2026-02-10"),
      validatedAt: new Date("2026-03-10"),
    },
    create: {
      applicationId: application.id,
      studentId: student.id,
      companyId: company.id,
      title: offer.title,
      status: "valide",
      startedAt: new Date("2026-02-10"),
      validatedAt: new Date("2026-03-10"),
    },
  });

  await upsertDeliverable(internship.id);

  await prisma.evaluation.upsert({
    where: { internshipId: internship.id },
    update: {
      notes: "Stage de demonstration cree automatiquement pour les tests locaux.",
    },
    create: {
      internshipId: internship.id,
      notes: "Stage de demonstration cree automatiquement pour les tests locaux.",
    },
  });

  console.log("Seed termine.");
  console.log("Comptes de test :");
  console.log("- student.demo@interna.ma / 123456");
  console.log("- company.demo@interna.ma / 123456");
  console.log("- school.demo@interna.ma / 123456");
  console.log("- admin.demo@interna.ma / 123456");
};

main()
  .catch((error) => {
    console.error("Erreur pendant le seed :", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
