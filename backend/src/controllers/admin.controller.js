const prisma = require("../config/prisma");

const getAdminDashboard = async (req, res) => {
  try {
    const [users, offers, applications, internships, deliverables] = await Promise.all([
      prisma.user.count(),
      prisma.internshipOffer.count(),
      prisma.application.count(),
      prisma.internship.count(),
      prisma.deliverable.count(),
    ]);

    return res.json({
      stats: {
        users,
        offers,
        applications,
        internships,
        deliverables,
      },
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server error",
    });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        email: true,
        role: true,
        active: true,
        createdAt: true,
      },
    });

    return res.json({ users });
  } catch (error) {
    return res.status(500).json({
      message: "Server error",
    });
  }
};

const updateUserStatus = async (req, res) => {
  try {
    const userId = Number(req.params.id);
    const { active } = req.body;

    if (typeof active !== "boolean") {
      return res.status(400).json({
        message: "active must be a boolean",
      });
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: { active },
      select: {
        id: true,
        email: true,
        role: true,
        active: true,
      },
    });

    return res.json({
      message: "User status updated successfully",
      user,
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

const getAllApplications = async (req, res) => {
  try {
    const applications = await prisma.application.findMany({
      include: {
        student: true,
        internshipOffer: {
          include: {
            company: true,
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

const getAllInternships = async (req, res) => {
  try {
    const internships = await prisma.internship.findMany({
      include: {
        student: true,
        company: true,
        deliverables: true,
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

const getAllDeliverables = async (req, res) => {
  try {
    const deliverables = await prisma.deliverable.findMany({
      include: {
        internship: {
          include: {
            student: true,
            company: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.json({ deliverables });
  } catch (error) {
    return res.status(500).json({
      message: "Server error",
    });
  }
};

const deleteUser = async (req, res) => {
  try {
    const userId = Number(req.params.id);

    await prisma.user.delete({
      where: { id: userId },
    });

    return res.json({
      message: "User deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server error",
    });
  }
};

const deleteOffer = async (req, res) => {
  try {
    const offerId = Number(req.params.id);

    await prisma.internshipOffer.delete({
      where: { id: offerId },
    });

    return res.json({
      message: "Offer deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server error",
    });
  }
};

module.exports = {
  deleteOffer,
  deleteUser,
  getAdminDashboard,
  getAllApplications,
  getAllDeliverables,
  getAllInternships,
  getAllOffers,
  getAllUsers,
  updateUserStatus,
};
