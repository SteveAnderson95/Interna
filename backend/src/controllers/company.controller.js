const prisma = require("../config/prisma");

const getMyCompanyOffers = async (req, res) => {
  try {
    const company = await prisma.company.findUnique({
      where: { userId: req.user.userId },
    });

    if (!company) {
      return res.status(404).json({
        message: "Company profile not found",
      });
    }

    const offers = await prisma.internshipOffer.findMany({
      where: { companyId: company.id },
      orderBy: { createdAt: "desc" },
    });

    return res.json({ offers });
  } catch (error) {
    return res.status(500).json({
      message: "Server error",
    });
  }
};

module.exports = {
  getMyCompanyOffers,
};
