const prisma = require("../config/prisma");

const computeOfferScore = (student, offer) => {
  let score = 0;
  const reasons = [];

  if (
    student.fieldOfStudy &&
    offer.fieldOfStudy &&
    student.fieldOfStudy.toLowerCase() === offer.fieldOfStudy.toLowerCase()
  ) {
    score += 40;
    reasons.push("Filiere correspondante");
  }

  if (
    student.studyLevel &&
    offer.studyLevel &&
    student.studyLevel.toLowerCase() === offer.studyLevel.toLowerCase()
  ) {
    score += 25;
    reasons.push("Niveau compatible");
  }

  if (
    student.city &&
    offer.city &&
    student.city.toLowerCase() === offer.city.toLowerCase()
  ) {
    score += 20;
    reasons.push("Meme ville");
  }

  if (student.schoolId) {
    score += 15;
    reasons.push("Profil scolaire complet");
  }

  return { score, reasons };
};

const getStudentMatches = async (req, res) => {
  try {
    const student = await prisma.student.findUnique({
      where: { userId: req.user.userId },
    });

    if (!student) {
      return res.status(404).json({
        message: "Student profile not found",
      });
    }

    const offers = await prisma.internshipOffer.findMany({
      include: {
        company: {
          select: {
            id: true,
            name: true,
            city: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const matches = offers
      .map((offer) => {
        const { score, reasons } = computeOfferScore(student, offer);
        return {
          offer,
          score,
          reasons,
        };
      })
      .sort((a, b) => b.score - a.score);

    return res.json({ matches });
  } catch (error) {
    return res.status(500).json({
      message: "Server error",
    });
  }
};

module.exports = {
  getStudentMatches,
};
