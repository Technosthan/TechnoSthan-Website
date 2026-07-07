import { prisma } from "../../config/db.js";
import { asyncHandler } from "../../shared/utils/asyncHandler.js";
import { sendSuccess } from "../../shared/utils/apiResponse.js";
import {
  activateCampaign,
  createCampaign,
  deactivateCampaign,
  deleteCampaign,
  listCampaigns,
  updateCampaign,
} from "../campaigns/campaign.service.js";
import { getProgramById } from "../programs/programs.service.js";
import { normalizeMediaUrl } from "../../shared/utils/media.js";

const prepareHeroData = (body = {}) => ({
  title: body.title || "",
  subtitle: body.subtitle || "",
  badgeText: body.badgeText || null,
  primaryCtaText: body.primaryCtaText || "Explore Programs",
  primaryCtaLink: body.primaryCtaLink || "/programs",
  secondaryCtaText: body.secondaryCtaText || "Enroll Now",
  secondaryCtaLink: body.secondaryCtaLink || "/contact",
  backgroundVideoUrl:
    normalizeMediaUrl(body.backgroundVideoUrl || body.backgroundVideo, "video") || null,
  backgroundImageUrl:
    normalizeMediaUrl(body.backgroundImageUrl || body.backgroundImage, "image") || null,
  isActive: body.isActive ?? true,
});

const saveHeroRecord = async (data, heroId = null) => {
  if (heroId) {
    const existingById = await prisma.heroContent.findUnique({ where: { id: heroId } });
    if (existingById) {
      return prisma.heroContent.update({ where: { id: heroId }, data });
    }
  }

  const latestActiveHero = await prisma.heroContent.findFirst({
    where: { isActive: true },
    orderBy: { updatedAt: "desc" },
  });

  if (latestActiveHero) {
    return prisma.heroContent.update({
      where: { id: latestActiveHero.id },
      data,
    });
  }

  return prisma.heroContent.create({
    data: {
      ...data,
      isActive: true,
    },
  });
};

export const getDashboardStatsController = asyncHandler(async (_req, res) => {
  const [users, programs, enrollments, payments, enquiries, workshops, campaigns] =
    await Promise.all([
      prisma.user.count(),
      prisma.program.count(),
      prisma.enrollment.count(),
      prisma.payment.count(),
      prisma.enquiry.count(),
      prisma.workshop.count(),
      prisma.campaign?.count ? prisma.campaign.count().catch(() => 0) : Promise.resolve(0),
    ]);

  return sendSuccess(res, 200, {
    stats: { users, programs, enrollments, payments, enquiries, workshops, campaigns },
  });
});

export const createHeroController = asyncHandler(async (req, res) => {
  const hero = await saveHeroRecord(prepareHeroData(req.body));
  return sendSuccess(res, 201, { hero }, "Hero content created");
});

export const updateHeroController = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const hero = await saveHeroRecord(prepareHeroData(req.body), id);
  return sendSuccess(res, 200, { hero }, "Hero content updated");
});

export const getAdminEnrollmentsController = asyncHandler(async (_req, res) => {
  const enrollments = await prisma.enrollment.findMany({
    include: {
      user: true,
      program: true,
      payments: true,
    },
    orderBy: { enrolledAt: "desc" },
  });

  return sendSuccess(res, 200, { enrollments });
});

export const getAdminPaymentsController = asyncHandler(async (_req, res) => {
  const payments = await prisma.payment.findMany({
    include: {
      user: true,
      program: true,
      enrollment: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return sendSuccess(res, 200, { payments });
});

export const getAdminStudentsController = asyncHandler(async (_req, res) => {
  const students = await prisma.user.findMany({
    where: { role: "STUDENT" },
    include: {
      enrollments: { include: { program: true } },
      payments: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return sendSuccess(res, 200, { students });
});

export const getAdminWorkshopsController = asyncHandler(async (_req, res) => {
  const workshops = await prisma.workshop.findMany({
    orderBy: [{ isActive: "desc" }, { date: "asc" }, { updatedAt: "desc" }],
  });

  return sendSuccess(res, 200, { workshops });
});

export const getAdminCampaignsController = asyncHandler(async (_req, res) => {
  const campaigns = await listCampaigns();
  return sendSuccess(res, 200, { campaigns });
});

export const createCampaignController = asyncHandler(async (req, res) => {
  const campaign = await createCampaign(req.body);
  return sendSuccess(res, 201, { campaign }, "Campaign created");
});

export const updateCampaignController = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const campaign = await updateCampaign(id, req.body);
  return sendSuccess(res, 200, { campaign }, "Campaign updated");
});

export const activateCampaignController = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const campaign = await activateCampaign(id);
  return sendSuccess(res, 200, { campaign }, "Campaign activated");
});

export const deactivateCampaignController = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const campaign = await deactivateCampaign(id);
  return sendSuccess(res, 200, { campaign }, "Campaign deactivated");
});

export const deleteCampaignController = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const campaign = await deleteCampaign(id);
  return sendSuccess(res, 200, { campaign }, "Campaign deleted");
});

export const getAdminEnquiriesController = asyncHandler(async (_req, res) => {
  const enquiries = await prisma.enquiry.findMany({
    orderBy: { createdAt: "desc" },
  });

  return sendSuccess(res, 200, { enquiries });
});

export const updateEnquiryStatusController = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const enquiry = await prisma.enquiry.update({
    where: { id },
    data: { status },
  });

  return sendSuccess(res, 200, { enquiry }, "Enquiry status updated");
});

export const createCurriculumModuleController = asyncHandler(async (req, res) => {
  const module = await prisma.curriculumModule.create({
    data: {
      programId: req.body.programId,
      title: req.body.title,
      description: req.body.description || null,
      order: Number(req.body.order || 0),
    },
  });

  return sendSuccess(res, 201, { module }, "Module created");
});

export const updateCurriculumModuleController = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const module = await prisma.curriculumModule.update({
    where: { id },
    data: {
      title: req.body.title,
      description: req.body.description || null,
      order: req.body.order !== undefined ? Number(req.body.order) : undefined,
    },
  });

  return sendSuccess(res, 200, { module }, "Module updated");
});

export const deleteCurriculumModuleController = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const module = await prisma.curriculumModule.delete({ where: { id } });
  return sendSuccess(res, 200, { module }, "Module deleted");
});

export const createLessonController = asyncHandler(async (req, res) => {
  const lesson = await prisma.lesson.create({
    data: {
      moduleId: req.body.moduleId,
      title: req.body.title,
      duration: req.body.duration || null,
      order: Number(req.body.order || 0),
      isPreview: Boolean(req.body.isPreview),
    },
  });

  return sendSuccess(res, 201, { lesson }, "Lesson created");
});

export const updateLessonController = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const lesson = await prisma.lesson.update({
    where: { id },
    data: {
      title: req.body.title,
      duration: req.body.duration || null,
      order: req.body.order !== undefined ? Number(req.body.order) : undefined,
      isPreview: req.body.isPreview,
    },
  });

  return sendSuccess(res, 200, { lesson }, "Lesson updated");
});

export const deleteLessonController = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const lesson = await prisma.lesson.delete({ where: { id } });
  return sendSuccess(res, 200, { lesson }, "Lesson deleted");
});

export const getTestimonialsController = asyncHandler(async (_req, res) => {
  const testimonials = await prisma.testimonial.findMany({
    orderBy: { createdAt: "desc" },
  });

  return sendSuccess(res, 200, { testimonials });
});

export const createTestimonialController = asyncHandler(async (req, res) => {
  const testimonial = await prisma.testimonial.create({ data: req.body });
  return sendSuccess(res, 201, { testimonial }, "Testimonial created");
});

export const updateTestimonialController = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const testimonial = await prisma.testimonial.update({
    where: { id },
    data: req.body,
  });

  return sendSuccess(res, 200, { testimonial }, "Testimonial updated");
});

export const deleteTestimonialController = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const testimonial = await prisma.testimonial.delete({ where: { id } });
  return sendSuccess(res, 200, { testimonial }, "Testimonial deleted");
});

export const getSettingsController = asyncHandler(async (_req, res) => {
  const hero = await prisma.heroContent.findFirst({
    where: { isActive: true },
    orderBy: { updatedAt: "desc" },
  });

  return sendSuccess(res, 200, {
    settings: {
      hero: hero
        ? {
          ...hero,
          backgroundVideo: hero.backgroundVideoUrl,
          backgroundImage: hero.backgroundImageUrl,
          primaryCtaLink: hero.primaryCtaLink || "/programs",
          secondaryCtaLink: hero.secondaryCtaLink || "/contact",
        }
        : null,
    },
  });
});

export const getAdminProgramController = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const program = await getProgramById(id);

  if (!program) {
    return res.status(404).json({ message: "Program not found" });
  }

  return sendSuccess(res, 200, { program });
});
