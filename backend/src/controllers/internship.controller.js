const prisma = require("../config/prisma");
const { createAttestationPdf, createEvaluationPdf } = require("../services/pdf.service");

const getMyInternship = async (req, res) => {
  try {
    const student = await prisma.student.findUnique({
      where: { userId: req.user.userId },
    });

    if (!student) {
      return res.status(404).json({
        message: "Student profile not found",
      });
    }

    const internship = await prisma.internship.findFirst({
      where: { studentId: student.id },
      include: {
        company: {
          select: {
            id: true,
            name: true,
            city: true,
          },
        },
        application: {
          include: {
            internshipOffer: true,
          },
        },
        deliverables: {
          orderBy: {
            createdAt: "desc",
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.json({ internship });
  } catch (error) {
    return res.status(500).json({
      message: "Server error",
    });
  }
};

const getCompanyInternships = async (req, res) => {
  try {
    const company = await prisma.company.findUnique({
      where: { userId: req.user.userId },
    });

    if (!company) {
      return res.status(404).json({
        message: "Company profile not found",
      });
    }

    const internships = await prisma.internship.findMany({
      where: { companyId: company.id },
      include: {
        student: true,
        deliverables: {
          orderBy: {
            createdAt: "desc",
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.json({ internships });
  } catch (error) {
    return res.status(500).json({
      message: "Server error",
    });
  }
};

const getCompanyInternshipById = async (userId, internshipId) => {
  const company = await prisma.company.findUnique({
    where: { userId },
  });

  if (!company) {
    return { error: { status: 404, message: "Company profile not found" } };
  }

  const internship = await prisma.internship.findUnique({
    where: { id: internshipId },
    include: {
      student: true,
      company: true,
    },
  });

  if (!internship) {
    return { error: { status: 404, message: "Internship not found" } };
  }

  if (internship.companyId !== company.id) {
    return { error: { status: 403, message: "Access denied" } };
  }

  return { internship };
};

const downloadAttestationPdf = async (req, res) => {
  try {
    const internshipId = Number(req.params.id);
    const result = await getCompanyInternshipById(req.user.userId, internshipId);

    if (result.error) {
      return res.status(result.error.status).json({
        message: result.error.message,
      });
    }

    const internship = result.internship;
    const studentName = `${internship.student.firstName} ${internship.student.lastName}`;
    const pdfBuffer = await createAttestationPdf({
      internship,
      studentName,
      companyName: internship.company.name,
    });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `inline; filename="attestation-stage-${internship.id}.pdf"`
    );

    return res.send(pdfBuffer);
  } catch (error) {
    return res.status(500).json({
      message: "Server error",
    });
  }
};

const downloadEvaluationPdf = async (req, res) => {
  try {
    const internshipId = Number(req.params.id);
    const result = await getCompanyInternshipById(req.user.userId, internshipId);

    if (result.error) {
      return res.status(result.error.status).json({
        message: result.error.message,
      });
    }

    const internship = result.internship;
    const studentName = `${internship.student.firstName} ${internship.student.lastName}`;
    const pdfBuffer = await createEvaluationPdf({
      internship,
      studentName,
      companyName: internship.company.name,
    });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `inline; filename="evaluation-stage-${internship.id}.pdf"`
    );

    return res.send(pdfBuffer);
  } catch (error) {
    return res.status(500).json({
      message: "Server error",
    });
  }
};

module.exports = {
  downloadAttestationPdf,
  downloadEvaluationPdf,
  getMyInternship,
  getCompanyInternships,
};
