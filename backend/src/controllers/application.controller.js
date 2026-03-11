const prisma = require("../config/prisma");

const createApplication = async (req, res) => {
  try {
    const { internshipOfferId, motivationLetterUrl, conventionUrl } = req.body;

    if (!internshipOfferId || !motivationLetterUrl || !conventionUrl) {
      return res.status(400).json({
        message: "internshipOfferId, motivationLetterUrl and conventionUrl are required",
      });
    }

    const student = await prisma.student.findUnique({
      where: { userId: req.user.userId },
    });

    if (!student) {
      return res.status(404).json({
        message: "Student profile not found",
      });
    }

    if (!student.cvUrl) {
      return res.status(400).json({
        message: "CV is required before applying",
      });
    }

    const offer = await prisma.internshipOffer.findUnique({
      where: { id: Number(internshipOfferId) },
    });

    if (!offer) {
      return res.status(404).json({
        message: "Offer not found",
      });
    }

    const existingApplication = await prisma.application.findUnique({
      where: {
        studentId_internshipOfferId: {
          studentId: student.id,
          internshipOfferId: Number(internshipOfferId),
        },
      },
    });

    if (existingApplication) {
      return res.status(400).json({
        message: "You have already applied to this offer",
      });
    }

    const application = await prisma.application.create({
      data: {
        studentId: student.id,
        internshipOfferId: Number(internshipOfferId),
        motivationLetterUrl,
        conventionUrl,
      },
    });

    return res.status(201).json({
      message: "Application created successfully",
      application,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server error",
    });
  }
};

const getMyApplications = async (req, res) => {
  try {
    const student = await prisma.student.findUnique({
      where: { userId: req.user.userId },
    });

    if (!student) {
      return res.status(404).json({
        message: "Student profile not found",
      });
    }

    const applications = await prisma.application.findMany({
      where: { studentId: student.id },
      include: {
        internshipOffer: {
          include: {
            company: {
              select: {
                id: true,
                name: true,
                city: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.json({ applications });
  } catch (error) {
    return res.status(500).json({
      message: "Server error",
    });
  }
};

const getCompanyApplications = async (req, res) => {
  try {
    const company = await prisma.company.findUnique({
      where: { userId: req.user.userId },
    });

    if (!company) {
      return res.status(404).json({
        message: "Company profile not found",
      });
    }

    const applications = await prisma.application.findMany({
      where: {
        internshipOffer: {
          companyId: company.id,
        },
      },
      include: {
        student: true,
        internshipOffer: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.json({ applications });
  } catch (error) {
    return res.status(500).json({
      message: "Server error",
    });
  }
};

const updateApplicationStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const applicationId = Number(req.params.id);

    const allowedStatuses = ["ACCEPTEE", "REFUSEE"];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        message: "Invalid status",
      });
    }

    const company = await prisma.company.findUnique({
      where: { userId: req.user.userId },
    });

    if (!company) {
      return res.status(404).json({
        message: "Company profile not found",
      });
    }

    const application = await prisma.application.findUnique({
      where: { id: applicationId },
      include: {
        internshipOffer: true,
      },
    });

    if (!application) {
      return res.status(404).json({
        message: "Application not found",
      });
    }

    if (application.internshipOffer.companyId !== company.id) {
      return res.status(403).json({
        message: "Access denied",
      });
    }

    const updatedApplication = await prisma.application.update({
      where: { id: applicationId },
      data: { status },
    });

    return res.json({
      message: "Application status updated",
      application: updatedApplication,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server error",
    });
  }
};

module.exports = {
  createApplication,
  getMyApplications,
  getCompanyApplications,
  updateApplicationStatus,
};
