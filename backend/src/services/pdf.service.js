const PDFDocument = require("pdfkit");

const buildPdfBuffer = (writeDocument) =>
  new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      margin: 50,
    });
    const chunks = [];

    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    writeDocument(doc);
    doc.end();
  });

const createAttestationPdf = async ({ internship, studentName, companyName }) =>
  buildPdfBuffer((doc) => {
    doc.fontSize(24).text("Attestation de stage", {
      align: "center",
    });
    doc.moveDown(2);
    doc.fontSize(12).text(
      `L'entreprise ${companyName} atteste que l'etudiant ${studentName} effectue un stage sur le sujet "${internship.title}".`
    );
    doc.moveDown();
    doc.text(`Date de debut : ${new Date(internship.startedAt).toLocaleDateString()}`);
    doc.text(`Statut du stage : ${internship.status}`);
    doc.moveDown(3);
    doc.text("Signature entreprise :", {
      align: "right",
    });
  });

const createEvaluationPdf = async ({ internship, studentName, companyName }) =>
  buildPdfBuffer((doc) => {
    doc.fontSize(24).text("Fiche d'evaluation de stage", {
      align: "center",
    });
    doc.moveDown(2);
    doc.fontSize(12).text(`Entreprise : ${companyName}`);
    doc.text(`Etudiant : ${studentName}`);
    doc.text(`Intitule du stage : ${internship.title}`);
    doc.moveDown();
    doc.text("Critere 1 : Integration dans l'equipe");
    doc.text("Critere 2 : Qualite du travail rendu");
    doc.text("Critere 3 : Respect des delais");
    doc.text("Critere 4 : Communication");
    doc.moveDown(2);
    doc.text("Appréciation generale : ______________________________");
    doc.moveDown(2);
    doc.text("Signature entreprise :", {
      align: "right",
    });
  });

module.exports = {
  createAttestationPdf,
  createEvaluationPdf,
};
