const fs = require("fs");
const path = require("path");
const PDFDocument = require("pdfkit");

const buildPdfBuffer = (writeDocument) =>
  new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      margin: 46,
      size: "A4",
    });
    const chunks = [];

    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    writeDocument(doc);
    doc.end();
  });

const normalizeText = (value, fallback = "Non renseigne") =>
  value && String(value).trim() ? String(value).trim() : fallback;

const formatDate = (value) => {
  if (!value) {
    return "Non renseignee";
  }

  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(value));
};

const buildCompanyLogoPath = (photoUrl) => {
  if (!photoUrl) {
    return null;
  }

  const cleanPath = String(photoUrl).replace(/^\/+/, "");
  const absolutePath = path.join(process.cwd(), cleanPath);

  if (!fs.existsSync(absolutePath)) {
    return null;
  }

  return absolutePath;
};

const drawPageFrame = (doc) => {
  const margin = 28;

  doc
    .save()
    .lineWidth(1)
    .strokeColor("#d7e3f5")
    .roundedRect(
      margin,
      margin,
      doc.page.width - margin * 2,
      doc.page.height - margin * 2,
      14
    )
    .stroke()
    .restore();
};

const drawDocumentHeader = (doc, { title, subtitle, company }) => {
  drawPageFrame(doc);

  const logoPath = buildCompanyLogoPath(company.photoUrl);
  const headerTop = 52;

  doc.save();
  doc.roundedRect(46, headerTop, 504, 74, 14).fill("#f3f7fd");
  doc.restore();

  if (logoPath) {
    try {
      doc.image(logoPath, 60, headerTop + 10, {
        fit: [52, 52],
        align: "center",
        valign: "center",
      });
    } catch (error) {
      // Ignore broken images and keep the rest of the document.
    }
  } else {
    doc
      .save()
      .roundedRect(60, headerTop + 10, 52, 52, 12)
      .fill("#1d56d8")
      .fillColor("#ffffff")
      .font("Helvetica-Bold")
      .fontSize(20)
      .text(normalizeText(company.name, "I").charAt(0).toUpperCase(), 60, headerTop + 25, {
        width: 52,
        align: "center",
      })
      .restore();
  }

  doc
    .fillColor("#11223c")
    .font("Helvetica-Bold")
    .fontSize(18)
    .text(normalizeText(company.name), 128, headerTop + 12, {
      width: 260,
    });

  doc
    .font("Helvetica")
    .fontSize(9.5)
    .fillColor("#5a6e8a")
    .text(
      [
        normalizeText(company.address, null),
        normalizeText(company.city, null),
        normalizeText(company.phone, null),
        normalizeText(company.website, null),
      ]
        .filter(Boolean)
        .join("  •  "),
      128,
      headerTop + 38,
      {
        width: 290,
      }
    );

  doc
    .font("Helvetica-Bold")
    .fontSize(20)
    .fillColor("#1b3760")
    .text(title, 46, 148, {
      align: "center",
    });

  if (subtitle) {
    doc
      .moveDown(0.35)
      .font("Helvetica")
      .fontSize(10)
      .fillColor("#60758f")
      .text(subtitle, {
        align: "center",
      });
  }

  doc.moveDown(1.35);
};

const drawInfoGrid = (doc, items, options = {}) => {
  const startX = options.x ?? 46;
  let y = options.y ?? doc.y;
  const columnGap = options.columnGap ?? 16;
  const columnWidth = options.columnWidth ?? 244;
  const boxHeight = options.boxHeight ?? 54;

  for (let index = 0; index < items.length; index += 2) {
    const row = items.slice(index, index + 2);

    row.forEach((item, rowIndex) => {
      const x = startX + rowIndex * (columnWidth + columnGap);

      doc.save();
      doc.roundedRect(x, y, columnWidth, boxHeight, 10).fill("#f8fbff");
      doc.restore();
      doc
        .lineWidth(0.8)
        .strokeColor("#d6e0ee")
        .roundedRect(x, y, columnWidth, boxHeight, 10)
        .stroke();

      doc
        .font("Helvetica-Bold")
        .fontSize(9)
        .fillColor("#5d7390")
        .text(item.label, x + 12, y + 10, {
          width: columnWidth - 24,
        });

      doc
        .font("Helvetica")
        .fontSize(11)
        .fillColor("#11223c")
        .text(normalizeText(item.value), x + 12, y + 25, {
          width: columnWidth - 24,
        });
    });

    y += boxHeight + 12;
  }

  doc.y = y;
};

const drawParagraphBlock = (doc, title, lines) => {
  doc
    .font("Helvetica-Bold")
    .fontSize(11)
    .fillColor("#1b3760")
    .text(title);

  doc.moveDown(0.35);

  lines.forEach((line) => {
    doc
      .font("Helvetica")
      .fontSize(11)
      .fillColor("#25364f")
      .text(line, {
        align: "justify",
        lineGap: 2,
      });
    doc.moveDown(0.18);
  });

  doc.moveDown(0.8);
};

const drawSignatureArea = (doc, { company, signedAtLabel }) => {
  const signatureY = Math.max(doc.y + 6, 690);

  doc
    .font("Helvetica")
    .fontSize(10.5)
    .fillColor("#25364f")
    .text(
      `${normalizeText(company.city, "Fait a")} , le ${signedAtLabel}`,
      46,
      signatureY
    );

  doc
    .font("Helvetica-Bold")
    .fontSize(11)
    .text("Signature et cachet de l'entreprise", 340, signatureY, {
      width: 180,
      align: "center",
    });

  doc
    .moveTo(360, signatureY + 65)
    .lineTo(520, signatureY + 65)
    .lineWidth(0.8)
    .strokeColor("#90a4c0")
    .stroke();
};

const drawEvaluationTable = (doc, rows) => {
  const startX = 46;
  let y = doc.y;
  const descriptionWidth = 232;
  const ratingWidth = 38;
  const columns = ["T.B", "B", "A.B", "P", "INS"];
  const observationsWidth = 88;
  const rowHeight = 42;

  const drawCell = (x, top, width, height, label, options = {}) => {
    doc
      .lineWidth(0.8)
      .strokeColor("#cfd9e8")
      .rect(x, top, width, height)
      .stroke();

    if (label) {
      doc
        .font(options.bold ? "Helvetica-Bold" : "Helvetica")
        .fontSize(options.fontSize ?? 9.5)
        .fillColor("#11223c")
        .text(label, x + 6, top + 8, {
          width: width - 12,
          align: options.align ?? "center",
        });
    }
  };

  drawCell(startX, y, descriptionWidth, rowHeight, "CRITERES D'APPRECIATION", {
    bold: true,
    align: "left",
    fontSize: 9,
  });

  columns.forEach((column, index) => {
    drawCell(
      startX + descriptionWidth + index * ratingWidth,
      y,
      ratingWidth,
      rowHeight,
      column,
      { bold: true, fontSize: 9 }
    );
  });

  drawCell(
    startX + descriptionWidth + columns.length * ratingWidth,
    y,
    observationsWidth,
    rowHeight,
    "OBSERVATIONS",
    { bold: true, fontSize: 9 }
  );

  y += rowHeight;

  rows.forEach((row) => {
    drawCell(startX, y, descriptionWidth, rowHeight, row, {
      align: "left",
      fontSize: 9.3,
    });

    columns.forEach((_, index) => {
      drawCell(startX + descriptionWidth + index * ratingWidth, y, ratingWidth, rowHeight, "");
    });

    drawCell(
      startX + descriptionWidth + columns.length * ratingWidth,
      y,
      observationsWidth,
      rowHeight,
      ""
    );

    y += rowHeight;
  });

  doc.y = y + 8;
};

const createAttestationPdf = async ({ internship, student, company }) =>
  buildPdfBuffer((doc) => {
    const studentName = `${normalizeText(student.firstName, "").trim()} ${normalizeText(
      student.lastName,
      ""
    ).trim()}`.trim();
    const internshipTitle = internship.application?.internshipOffer?.title || internship.title;
    const startedAt = formatDate(internship.startedAt);
    const endedAt = internship.validatedAt ? formatDate(internship.validatedAt) : "en cours";

    drawDocumentHeader(doc, {
      title: "ATTESTATION DE STAGE",
      subtitle: "Document etabli a la demande de l'etudiant",
      company,
    });

    drawParagraphBlock(doc, "Objet", [
      `Je soussigne(e), ${normalizeText(company.contactName, "le representant de l'entreprise")} , certifie que l'entreprise ${normalizeText(
        company.name
      )} a accueilli l'etudiant(e) ${studentName} dans le cadre d'un stage intitule "${normalizeText(
        internshipTitle
      )}".`,
      `Ce stage s'inscrit dans le parcours ${normalizeText(student.fieldOfStudy)} niveau ${normalizeText(
        student.studyLevel
      )}${student.school?.name ? ` de ${student.school.name}` : ""}.`,
    ]);

    drawInfoGrid(doc, [
      { label: "Entreprise", value: company.name },
      { label: "Secteur", value: company.sector || "Non precise" },
      { label: "Stagiaire", value: studentName },
      { label: "Ville", value: company.city || "Non precisee" },
      { label: "Intitule du stage", value: internshipTitle },
      { label: "Telephone", value: company.phone || "Non renseigne" },
      { label: "Date de debut", value: startedAt },
      { label: "Statut / fin", value: `${normalizeText(internship.status)} / ${endedAt}` },
    ]);

    drawParagraphBlock(doc, "Declaration", [
      "La presente attestation est delivree pour servir et valoir ce que de droit.",
      `L'entreprise confirme que le stage s'est deroule dans ses locaux${company.address ? ` situes a ${company.address}` : ""} et que l'etudiant(e) a ete encadre(e) conformement aux objectifs definis.`,
    ]);

    drawSignatureArea(doc, {
      company,
      signedAtLabel: formatDate(new Date()),
    });
  });

const createEvaluationPdf = async ({ internship, student, company }) =>
  buildPdfBuffer((doc) => {
    const studentName = `${normalizeText(student.firstName, "").trim()} ${normalizeText(
      student.lastName,
      ""
    ).trim()}`.trim();
    const internshipTitle = internship.application?.internshipOffer?.title || internship.title;

    drawDocumentHeader(doc, {
      title: "FICHE D'EVALUATION DU STAGIAIRE",
      subtitle: "A remplir par le responsable de l'entreprise",
      company,
    });

    drawInfoGrid(doc, [
      { label: "Raison sociale", value: company.name },
      { label: "Telephone", value: company.phone || "Non renseigne" },
      {
        label: "Responsable du stage",
        value: company.contactName || "Responsable non renseigne",
      },
      { label: "Fonction / Secteur", value: company.sector || "Non precise" },
      { label: "Nom du stagiaire", value: studentName },
      {
        label: "Specialite / Niveau",
        value: `${normalizeText(student.fieldOfStudy)} - ${normalizeText(student.studyLevel)}`,
      },
      { label: "Periode du stage", value: `Du ${formatDate(internship.startedAt)}` },
      {
        label: "Lieu",
        value: [company.address, company.city].filter(Boolean).join(", ") || "Non renseigne",
      },
    ]);

    drawEvaluationTable(doc, [
      "Ponctualite - assiduite",
      "Initiative",
      "Connaissances professionnelles",
      "Qualite des travaux realises",
      "Rapidite d'execution",
      "Ordre - methode - proprete",
      "Capacite d'adaptation",
    ]);

    doc
      .font("Helvetica-Bold")
      .fontSize(10.5)
      .fillColor("#1b3760")
      .text("Appreciation generale sur le stagiaire");

    doc.moveDown(0.4);

    for (let index = 0; index < 4; index += 1) {
      const y = doc.y + index * 18;
      doc
        .moveTo(46, y)
        .lineTo(548, y)
        .lineWidth(0.8)
        .strokeColor("#cfd9e8")
        .stroke();
    }

    doc.y += 78;

    doc
      .font("Helvetica")
      .fontSize(9)
      .fillColor("#61758f")
      .text("TB : Tres bien    B : Bien    AB : Assez bien    P : Passable    INS : Insuffisant");

    drawSignatureArea(doc, {
      company,
      signedAtLabel: formatDate(new Date()),
    });
  });

module.exports = {
  createAttestationPdf,
  createEvaluationPdf,
};
