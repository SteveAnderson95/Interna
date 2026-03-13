const prisma = require("../config/prisma");

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

module.exports = {
  getMyInternship,
  getCompanyInternships,
};
