const test = require("node:test");
const assert = require("node:assert/strict");

const {
  findBestMatchingCampaign,
  normalizeCampaignRoute,
  normalizePathname,
} = require("../utils/campaignRoutes");

test("normalizeCampaignRoute trims trailing slash and keeps root stable", () => {
  assert.equal(normalizeCampaignRoute("/about/"), "/about");
  assert.equal(normalizeCampaignRoute("about"), "/about");
  assert.equal(normalizeCampaignRoute("/"), "/");
});

test("normalizePathname ignores query strings and hashes", () => {
  assert.equal(normalizePathname("/contact?utm=1#team"), "/contact");
  assert.equal(normalizePathname("programs/full-stack/"), "/programs/full-stack");
});

test("findBestMatchingCampaign prefers exact routes over parameterized routes", () => {
  const now = new Date("2026-07-14T10:00:00.000Z");
  const campaigns = [
    {
      _id: "param",
      displayRoute: "/programs/:slug",
      isActive: true,
      startAt: "2026-07-14T00:00:00.000Z",
      expiresAt: "2026-07-15T00:00:00.000Z",
      createdAt: "2026-07-14T00:00:00.000Z",
    },
    {
      _id: "exact",
      displayRoute: "/programs/full-stack-development",
      isActive: true,
      startAt: "2026-07-14T00:00:00.000Z",
      expiresAt: "2026-07-15T00:00:00.000Z",
      createdAt: "2026-07-14T01:00:00.000Z",
    },
  ];

  const match = findBestMatchingCampaign(
    campaigns,
    "/programs/full-stack-development?ref=nav",
    now,
  );

  assert.equal(match._id, "exact");
});

test("findBestMatchingCampaign matches parameterized routes and filters inactive or expired campaigns", () => {
  const now = new Date("2026-07-14T10:00:00.000Z");
  const campaigns = [
    {
      _id: "inactive",
      displayRoute: "/contact",
      isActive: false,
      startAt: "2026-07-14T00:00:00.000Z",
      expiresAt: "2026-07-15T00:00:00.000Z",
      createdAt: "2026-07-14T00:00:00.000Z",
    },
    {
      _id: "future",
      displayRoute: "/contact",
      isActive: true,
      startAt: "2026-07-15T00:00:00.000Z",
      expiresAt: "2026-07-16T00:00:00.000Z",
      createdAt: "2026-07-14T00:00:00.000Z",
    },
    {
      _id: "match",
      displayRoute: "/programs/:slug",
      isActive: true,
      startAt: "2026-07-14T00:00:00.000Z",
      expiresAt: "2026-07-15T00:00:00.000Z",
      createdAt: "2026-07-14T00:00:00.000Z",
    },
  ];

  const match = findBestMatchingCampaign(campaigns, "/programs/full-stack", now);

  assert.equal(match._id, "match");
});

test("findBestMatchingCampaign returns null when no valid route exists", () => {
  const now = new Date("2026-07-14T10:00:00.000Z");
  const campaigns = [
    {
      _id: "home",
      displayRoute: "/",
      isActive: true,
      startAt: "2026-07-15T00:00:00.000Z",
      expiresAt: "2026-07-16T00:00:00.000Z",
      createdAt: "2026-07-14T00:00:00.000Z",
    },
  ];

  const match = findBestMatchingCampaign(campaigns, "/contact", now);
  assert.equal(match, null);
});
