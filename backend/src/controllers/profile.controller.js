const prisma = require("../config/prisma");

const createStudentProfile = async (req, res) => {
  try {
    const { firstName, lastName, fieldOfStudy, studyLevel, city, schoolId } = req.body;

    const existingProfile = await prisma.student.findUnique({
      where: { userId: req.user.userId },
    });

    if (existingProfile) {
      return res.status(400).json({ message: "Student profile already exists" });
    }

    const profile = await prisma.student.create({
      data: {
        userId: req.user.userId,
        firstName,
        lastName,
        fieldOfStudy,
        studyLevel,
        city,
        schoolId,
      },
    });

    return res.status(201).json({
      message: "Student profile created",
      profile,
    });
  } catch (error) {
    return res.status(500).json({ message: "Server error" });
  }
};

const createCompanyProfile = async (req, res) => {
  try {
    const { name, city, description } = req.body;

    const existingProfile = await prisma.company.findUnique({
      where: { userId: req.user.userId },
    });

    if (existingProfile) {
      return res.status(400).json({ message: "Company profile already exists" });
    }

    const profile = await prisma.company.create({
      data: {
        userId: req.user.userId,
        name,
        city,
        description,
      },
    });

    return res.status(201).json({
      message: "Company profile created",
      profile,
    });
  } catch (error) {
    return res.status(500).json({ message: "Server error" });
  }
};

const createSchoolProfile = async (req, res) => {
  try {
    const { name, city } = req.body;

    const existingProfile = await prisma.school.findUnique({
      where: { userId: req.user.userId },
    });

    if (existingProfile) {
      return res.status(400).json({ message: "School profile already exists" });
    }

    const profile = await prisma.school.create({
      data: {
        userId: req.user.userId,
        name,
        city,
      },
    });

    return res.status(201).json({
      message: "School profile created",
      profile,
    });
  } catch (error) {
    return res.status(500).json({ message: "Server error" });
  }
};

const getMyProfile = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      include: {
        student: true,
        company: true,
        school: true,
      },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.json({
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      profile: user.student || user.company || user.school || null,
    });
  } catch (error) {
    return res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  createStudentProfile,
  createCompanyProfile,
  createSchoolProfile,
  getMyProfile,
};
