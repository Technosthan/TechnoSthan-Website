import { asyncHandler } from "../../shared/utils/asyncHandler.js";
import { sendSuccess } from "../../shared/utils/apiResponse.js";
import {
  createSpecialisation,
  deleteSpecialisation,
  DEFAULT_SPECIALISATIONS,
  getDefaultSpecialisations,
  getSpecialisationBySlug,
  listSpecialisations,
  updateSpecialisation,
} from "./specialisations.service.js";
import { listPrograms } from "../programs/programs.service.js";

const mergeDefaults = (items = []) => {
  const list = Array.isArray(items) ? items : [];
  const existingSlugs = new Set(list.map((item) => String(item?.slug || "").trim()));
  return [...list, ...DEFAULT_SPECIALISATIONS.filter((item) => !existingSlugs.has(item.slug))];
};

export const getSpecialisationsController = asyncHandler(async (_req, res) => {
  const specialisations = mergeDefaults(await listSpecialisations());
  return sendSuccess(res, 200, { specialisations });
});

export const getAdminSpecialisationsController = asyncHandler(async (_req, res) => {
  const specialisations = mergeDefaults(await listSpecialisations({ includeInactive: true }));
  return sendSuccess(res, 200, { specialisations });
});

export const getSpecialisationController = asyncHandler(async (req, res) => {
  const { specialisationSlug } = req.params;
  const specialisation = await getSpecialisationBySlug(specialisationSlug);

  if (!specialisation) {
    const fallback = (await getDefaultSpecialisations()).find((item) => item.slug === specialisationSlug);
    if (!fallback) {
      return res.status(404).json({ message: "Specialisation not found" });
    }

    const programs = await listPrograms({ specialisationSlug });
    return sendSuccess(res, 200, { specialisation: { ...fallback, programs } });
  }

  return sendSuccess(res, 200, { specialisation });
});

export const createSpecialisationController = asyncHandler(async (req, res) => {
  const specialisation = await createSpecialisation(req.body);
  return sendSuccess(res, 201, { specialisation }, "Specialisation created");
});

export const updateSpecialisationController = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const specialisation = await updateSpecialisation(id, req.body);
  return sendSuccess(res, 200, { specialisation }, "Specialisation updated");
});

export const deleteSpecialisationController = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const specialisation = await deleteSpecialisation(id);
  return sendSuccess(res, 200, { specialisation }, "Specialisation deleted");
});
