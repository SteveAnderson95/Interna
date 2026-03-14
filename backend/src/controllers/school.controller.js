const prisma = require("../config/prisma");
const { sendEmail } = require("../services/email.service");

const getSchoolProfile = async (userId) =>
  prisma.school.findUnique({
    where: { userId },
  });

const buildCompatibility = (student, offer) => {
  const fieldMatch =
    Boolean(student?.fieldOfStudy && offer?.fieldOfStudy) &&
    student.fieldOfStudy.toLowerCase() === offer.fieldOfStudy.toLowerCase();
  const levelMatch =
    Boolean(student?.studyLevel && offer?.studyLevel) &&
    student.studyLevel.toLowerCase() === offer.studyLevel.toLowerCase();

  return {
    fieldMatch,
    levelMatch,
    isCompatible: fieldMatch && levelMatch,
  };
};

const getSchoolsList = async (req, res) => {
  try {
    const schools = await prisma.school.findMany({
      select: {
        id: true,
        name: true,
        city: true,
      },
      orderBy: {
        name: "asc",
      },
    });

    return res.json({ schools });
  } catch (error) {
    return res.status(500).json({
      message: "Server error",
    });
  }
};

const getSchoolApplications = async (req, res) => {
  try {
    const school = await getSchoolProfile(req.user.userId);

    if (!school) {
      return res.status(404).json({
        message: "School profile not found",
      });
    }

    const applications = await prisma.application.findMany({
      where: {
        student: {
          schoolId: school.id,
        },
      },
      include: {
        student: {
          include: {
            user: {
              select: {
                email: true,
              },
            },
          },
        },
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

    return res.json({
      applications: applications.map((application) => ({
        ...application,
        checks: buildCompatibility(application.student, application.internshipOffer),
      })),
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server error",
    });
  }
};

const blockApplication = async (req, res) => {
  try {
    const school = await getSchoolProfile(req.user.userId);
    const applicationId = Number(req.params.id);
    const blockReason = req.body.blockReason?.trim() || null;

    if (!school) {
      return res.status(404).json({
        message: "School profile not found",
      });
    }

    const application = await prisma.application.findUnique({
      where: { id: applicationId },
      include: {
        student: {
          include: {
            user: true,
          },
        },
        internshipOffer: true,
      },
    });

    if (!application) {
      return res.status(404).json({
        message: "Application not found",
      });
    }

    if (application.student.schoolId !== school.id) {
      return res.status(403).json({
        message: "Access denied",
      });
    }

    const updatedApplication = await prisma.application.update({
      where: { id: applicationId },
      data: {
        status: "BLOQUEE",
        blockReason,
      },
    });

    if (application.student.user?.email) {
      await Promise.allSettled([
        sendEmail({
          to: application.student.user.email,
          subject: "Candidature bloquee",
          text: blockReason
            ? `Votre candidature pour "${application.internshipOffer.title}" a ete bloquee. Motif : ${blockReason}`
            : `Votre candidature pour "${application.internshipOffer.title}" a ete bloquee par l'ecole.`,
        }),
      ]);
    }

    return res.json({
      message: "Application blocked successfully",
      application: updatedApplication,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server error",
    });
  }
};

const getSchoolInternships = async (req, res) => {
  try {
    const school = await getSchoolProfile(req.user.userId);

    if (!school) {
      return res.status(404).json({
        message: "School profile not found",
      });
    }

    const internships = await prisma.internship.findMany({
      where: {
        student: {
          schoolId: school.id,
        },
      },
      include: {
        student: true,
        company: true,
        deliverables: {
          orderBy: {
            createdAt: "desc",
          },
        },
        evaluation: true,
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

const validateInternship = async (req, res) => {
  try {
    const school = await getSchoolProfile(req.user.userId);
    const internshipId = Number(req.params.id);

    if (!school) {
      return res.status(404).json({
        message: "School profile not found",
      });
    }

    const internship = await prisma.internship.findUnique({
      where: { id: internshipId },
      include: {
        student: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!internship) {
      return res.status(404).json({
        message: "Internship not found",
      });
    }

    if (internship.student.schoolId !== school.id) {
      return res.status(403).json({
        message: "Access denied",
      });
    }

    const updatedInternship = await prisma.internship.update({
      where: { id: internshipId },
      data: {
        status: "valide",
        validatedAt: new Date(),
      },
    });

    return res.json({
      message: "Internship validated successfully",
      internship: updatedInternship,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server error",
    });
  }
};

module.exports = {
  blockApplication,
  getSchoolApplications,
  getSchoolInternships,
  getSchoolsList,
  validateInternship,
};
