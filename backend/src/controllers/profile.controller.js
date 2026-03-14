const prisma = require("../config/prisma");

const createStudentProfile = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      fieldOfStudy,
      studyLevel,
      city,
      phone,
      bio,
      cvUrl,
      photoUrl,
      schoolId,
    } = req.body;

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
        phone,
        bio,
        cvUrl,
        photoUrl,
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
    const {
      name,
      sector,
      city,
      description,
      phone,
      website,
      address,
      contactName,
      photoUrl,
      galleryUrls,
    } = req.body;

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
        sector,
        city,
        description,
        phone,
        website,
        address,
        contactName,
        photoUrl,
        galleryUrls,
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
    const { name, city, phone, website, address, photoUrl } = req.body;

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
        phone,
        website,
        address,
        photoUrl,
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

const updateCompanyProfile = async (req, res) => {
  try {
    const {
      name,
      sector,
      city,
      description,
      phone,
      website,
      address,
      contactName,
      photoUrl,
      galleryUrls,
    } = req.body;

    const existingProfile = await prisma.company.findUnique({
      where: { userId: req.user.userId },
    });

    if (!existingProfile) {
      return res.status(404).json({
        message: "Company profile not found",
      });
    }

    const updatedProfile = await prisma.company.update({
      where: { userId: req.user.userId },
      data: {
        name,
        sector,
        city,
        description,
        phone,
        website,
        address,
        contactName,
        photoUrl,
        galleryUrls,
      },
    });

    return res.json({
      message: "Company profile updated",
      profile: updatedProfile,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server error",
    });
  }
};

const updateSchoolProfile = async (req, res) => {
  try {
    const { name, city, phone, website, address, photoUrl } = req.body;

    const existingProfile = await prisma.school.findUnique({
      where: { userId: req.user.userId },
    });

    if (!existingProfile) {
      return res.status(404).json({
        message: "School profile not found",
      });
    }

    const updatedProfile = await prisma.school.update({
      where: { userId: req.user.userId },
      data: {
        name,
        city,
        phone,
        website,
        address,
        photoUrl,
      },
    });

    return res.json({
      message: "School profile updated",
      profile: updatedProfile,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server error",
    });
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

const updateStudentProfile = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      fieldOfStudy,
      studyLevel,
      city,
      phone,
      bio,
      cvUrl,
      photoUrl,
      schoolId,
    } = req.body;

    const existingProfile = await prisma.student.findUnique({
      where: { userId: req.user.userId },
    });

    if (!existingProfile) {
      return res.status(404).json({
        message: "Student profile not found",
      });
    }

    const updatedProfile = await prisma.student.update({
      where: { userId: req.user.userId },
      data: {
        firstName,
        lastName,
        fieldOfStudy,
        studyLevel,
        city,
        phone,
        bio,
        cvUrl,
        photoUrl,
        schoolId,
      },
    });

    return res.json({
      message: "Student profile updated",
      profile: updatedProfile,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server error",
    });
  }
};



module.exports = {
  createStudentProfile,
  createCompanyProfile,
  createSchoolProfile,
  getMyProfile,
  updateCompanyProfile,
  updateSchoolProfile,
  updateStudentProfile,
};
