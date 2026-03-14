const prisma = require("../config/prisma");
const { sendEmail } = require("../services/email.service");

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
      include: {
        student: {
          include: {
            school: {
              include: {
                user: true,
              },
            },
            user: true,
          },
        },
      },
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

    const notifications = [];

    if (internship.student.user?.email) {
      notifications.push(
        sendEmail({
          to: internship.student.user.email,
          subject: "Livrable depose",
          text: `Votre livrable "${title}" a bien ete enregistre.`,
        })
      );
    }

    if (internship.student.school?.user?.email) {
      notifications.push(
        sendEmail({
          to: internship.student.school.user.email,
          subject: "Nouveau livrable depose",
          text: `Un nouveau livrable "${title}" a ete depose par un etudiant rattache a votre ecole.`,
        })
      );
    }

    if (notifications.length) {
      await Promise.allSettled(notifications);
    }

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
