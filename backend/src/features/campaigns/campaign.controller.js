import { asyncHandler } from "../../shared/utils/asyncHandler.js";
import { sendSuccess } from "../../shared/utils/apiResponse.js";
import {
  activateCampaign,
  createCampaign,
  deactivateCampaign,
  deleteCampaign,
  getActiveCampaign,
  listCampaigns,
  updateCampaign,
} from "./campaign.service.js";

export const getActiveCampaignController = asyncHandler(async (_req, res) => {
  const campaign = await getActiveCampaign();
  return sendSuccess(res, 200, { campaign });
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
