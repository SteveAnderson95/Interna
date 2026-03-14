const prisma = require("../config/prisma");

const normalizeOptionalString = (value) =>
  typeof value === "string" && value.trim() ? value.trim() : null;

const buildOfferPayload = (data) => ({
  title: data.title?.trim(),
  description: data.description?.trim(),
  fieldOfStudy: data.fieldOfStudy?.trim(),
  studyLevel: data.studyLevel?.trim(),
  duration: normalizeOptionalString(data.duration),
  internshipType: normalizeOptionalString(data.internshipType),
  city: normalizeOptionalString(data.city),
  status: normalizeOptionalString(data.status) || "ouverte",
  deadline: data.deadline ? new Date(data.deadline) : null,
});

const validateOfferFields = (payload) => {
  if (!payload.title || !payload.description || !payload.fieldOfStudy || !payload.studyLevel) {
    return "Title, description, fieldOfStudy and studyLevel are required";
  }

  if (payload.deadline && Number.isNaN(payload.deadline.getTime())) {
    return "Invalid deadline";
  }

  return null;
};

const getCompanyByUserId = (userId) =>
  prisma.company.findUnique({
    where: { userId },
  });

const createOffer = async (req, res) => {
  try {
    const company = await getCompanyByUserId(req.user.userId);

    if (!company) {
      return res.status(404).json({
        message: "Company profile not found",
      });
    }

    const payload = buildOfferPayload(req.body);
    const validationError = validateOfferFields(payload);

    if (validationError) {
      return res.status(400).json({
        message: validationError,
      });
    }

    const offer = await prisma.internshipOffer.create({
      data: {
        ...payload,
        companyId: company.id,
      },
    });

    return res.status(201).json({
      message: "Offer created successfully",
      offer,
    });
  } catch (error) {
    console.error("createOffer error:", error);
    return res.status(500).json({
      message: error.message || "Server error",
    });
  }
};

const getAllOffers = async (req, res) => {
  try {
    const search = req.query.search?.trim();
    const city = req.query.city?.trim();
    const fieldOfStudy = req.query.fieldOfStudy?.trim();
    const studyLevel = req.query.studyLevel?.trim();

    const filters = [];

    if (search) {
      filters.push({
        OR: [
          { title: { contains: search } },
          { description: { contains: search } },
          { company: { is: { name: { contains: search } } } },
        ],
      });
    }

    if (city) {
      filters.push({
        city: { contains: city },
      });
    }

    if (fieldOfStudy) {
      filters.push({
        fieldOfStudy: { contains: fieldOfStudy },
      });
    }

    if (studyLevel) {
      filters.push({
        studyLevel: { contains: studyLevel },
      });
    }

    const offers = await prisma.internshipOffer.findMany({
      where: filters.length ? { AND: filters } : undefined,
      include: {
        company: {
          select: {
            id: true,
            name: true,
            city: true,
            sector: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.json({ offers });
  } catch (error) {
    console.error("getAllOffers error:", error);
    return res.status(500).json({
      message: error.message || "Server error",
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
            sector: true,
            website: true,
            photoUrl: true,
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
    console.error("getOfferById error:", error);
    return res.status(500).json({
      message: error.message || "Server error",
    });
  }
};

const updateOffer = async (req, res) => {
  try {
    const company = await getCompanyByUserId(req.user.userId);
    const offerId = Number(req.params.id);

    if (!company) {
      return res.status(404).json({
        message: "Company profile not found",
      });
    }

    const existingOffer = await prisma.internshipOffer.findUnique({
      where: { id: offerId },
    });

    if (!existingOffer) {
      return res.status(404).json({
        message: "Offer not found",
      });
    }

    if (existingOffer.companyId !== company.id) {
      return res.status(403).json({
        message: "Access denied",
      });
    }

    const payload = buildOfferPayload(req.body);
    const validationError = validateOfferFields(payload);

    if (validationError) {
      return res.status(400).json({
        message: validationError,
      });
    }

    const offer = await prisma.internshipOffer.update({
      where: { id: offerId },
      data: payload,
    });

    return res.json({
      message: "Offer updated successfully",
      offer,
    });
  } catch (error) {
    console.error("updateOffer error:", error);
    return res.status(500).json({
      message: error.message || "Server error",
    });
  }
};

const deleteOffer = async (req, res) => {
  try {
    const company = await getCompanyByUserId(req.user.userId);
    const offerId = Number(req.params.id);

    if (!company) {
      return res.status(404).json({
        message: "Company profile not found",
      });
    }

    const existingOffer = await prisma.internshipOffer.findUnique({
      where: { id: offerId },
    });

    if (!existingOffer) {
      return res.status(404).json({
        message: "Offer not found",
      });
    }

    if (existingOffer.companyId !== company.id) {
      return res.status(403).json({
        message: "Access denied",
      });
    }

    await prisma.internshipOffer.delete({
      where: { id: offerId },
    });

    return res.json({
      message: "Offer deleted successfully",
    });
  } catch (error) {
    console.error("deleteOffer error:", error);
    return res.status(500).json({
      message: error.message || "Server error",
    });
  }
};

module.exports = {
  createOffer,
  deleteOffer,
  getAllOffers,
  getOfferById,
  updateOffer,
};
