const prisma = require("../config/prisma");

const createReportDeliverable = async (req, res) => {
  try {
    const { title, fileUrl } = req.body;

    if (!title || !fileUrl) {
      return res.status(400).json({
        message: "title and fileUrl are required",
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

    const internship = await prisma.internship.findFirst({
      where: { studentId: student.id },
      orderBy: {
        createdAt: "desc",
      },
    });

    if (!internship) {
      return res.status(404).json({
        message: "No accepted internship found",
      });
    }

    const deliverable = await prisma.deliverable.create({
      data: {
        internshipId: internship.id,
        title,
        fileUrl,
      },
    });

    return res.status(201).json({
      message: "Deliverable uploaded successfully",
      deliverable,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server error",
    });
  }
};

module.exports = {
  createReportDeliverable,
};
