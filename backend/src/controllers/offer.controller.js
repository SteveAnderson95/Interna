const prisma = require("../config/prisma");

const createOffer = async (req, res) => {
  try {
    const { title, description, fieldOfStudy, studyLevel, city } = req.body;

    if (!title || !description || !fieldOfStudy || !studyLevel) {
      return res.status(400).json({
        message: "Title, description, fieldOfStudy and studyLevel are required",
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

    const offer = await prisma.internshipOffer.create({
      data: {
        companyId: company.id,
        title,
        description,
        fieldOfStudy,
        studyLevel,
        city,
      },
    });

    return res.status(201).json({
      message: "Offer created successfully",
      offer,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server error",
    });
  }
};

const getAllOffers = async (req, res) => {
  try {
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

    return res.json({ offers });
  } catch (error) {
    return res.status(500).json({
      message: "Server error",
    });
  }
};

const getOfferById = async (req, res) => {
  try {
    const offerId = Number(req.params.id);

    const offer = await prisma.internshipOffer.findUnique({
      where: { id: offerId },
      include: {
        company: {
          select: {
            id: true,
            name: true,
            city: true,
            description: true,
          },
        },
      },
    });

    if (!offer) {
      return res.status(404).json({
        message: "Offer not found",
      });
    }

    return res.json({ offer });
  } catch (error) {
    return res.status(500).json({
      message: "Server error",
    });
  }
};

module.exports = {
  createOffer,
  getAllOffers,
  getOfferById,
};
