import prisma from "../../core/database/prisma.js";
import {
  NAVBAR_ORBIT_ACTION_TYPES,
  NAVBAR_ORBIT_DEFAULT_ITEMS,
  NAVBAR_ORBIT_GROUPS,
  NAVBAR_ORBIT_VISIBILITY,
} from "./navbarOrbit.defaults.js";
import { normalizeOrbitPayload } from "./navbarOrbit.validation.js";

const toBoolean = (value, fallback = true) => {
  if (value === undefined || value === null || value === "") {
    return fallback;
  }

  if (typeof value === "boolean") {
    return value;
  }

  return ["true", "1", "yes", "on"].includes(
    String(value).toLowerCase()
  );
};

const toInt = (value, fallback = 0) => {
  const parsed = Number.parseInt(value, 10);
  return Number.isNaN(parsed) ? fallback : parsed;
};

const ensureArray = (value) => (Array.isArray(value) ? value : []);

const ensureOrbitSchema = async () => {
  await prisma.$transaction([
    prisma.$executeRawUnsafe(`
      DO $$
      BEGIN
        CREATE TYPE "NavbarOrbitGroup" AS ENUM ('social', 'theme', 'profile');
      EXCEPTION
        WHEN duplicate_object THEN NULL;
      END
      $$;
    `),
    prisma.$executeRawUnsafe(`
      DO $$
      BEGIN
        CREATE TYPE "NavbarOrbitActionType" AS ENUM ('external_url', 'internal_route', 'theme_mode', 'auth_action');
      EXCEPTION
        WHEN duplicate_object THEN NULL;
      END
      $$;
    `),
    prisma.$executeRawUnsafe(`
      DO $$
      BEGIN
        CREATE TYPE "NavbarOrbitVisibility" AS ENUM ('public', 'guest', 'authenticated', 'user', 'admin');
      EXCEPTION
        WHEN duplicate_object THEN NULL;
      END
      $$;
    `),
    prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "NavbarOrbitItem" (
        "id" TEXT NOT NULL,
        "groupKey" "NavbarOrbitGroup" NOT NULL,
        "actionType" "NavbarOrbitActionType" NOT NULL,
        "systemActionKey" TEXT,
        "label" TEXT NOT NULL,
        "iconKey" TEXT,
        "externalUrl" TEXT,
        "internalPath" TEXT,
        "openInNewTab" BOOLEAN NOT NULL DEFAULT false,
        "tooltip" TEXT,
        "visibility" "NavbarOrbitVisibility" NOT NULL DEFAULT 'public',
        "displayOrder" INTEGER NOT NULL DEFAULT 0,
        "isActive" BOOLEAN NOT NULL DEFAULT true,
        "isSystem" BOOLEAN NOT NULL DEFAULT false,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "NavbarOrbitItem_pkey" PRIMARY KEY ("id")
      );
    `),
    prisma.$executeRawUnsafe(`
      CREATE UNIQUE INDEX IF NOT EXISTS "NavbarOrbitItem_groupKey_systemActionKey_key"
      ON "NavbarOrbitItem"("groupKey", "systemActionKey");
    `),
    prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "NavbarOrbitItem_groupKey_isActive_displayOrder_idx"
      ON "NavbarOrbitItem"("groupKey", "isActive", "displayOrder");
    `),
  ]);
};

const mapOrbitItem = (item) => ({
  id: item.id,
  groupKey: item.groupKey,
  actionType: item.actionType,
  systemActionKey: item.systemActionKey,
  label: item.label,
  iconKey: item.iconKey,
  externalUrl: item.externalUrl,
  internalPath: item.internalPath,
  openInNewTab: item.openInNewTab,
  tooltip: item.tooltip,
  visibility: item.visibility,
  displayOrder: item.displayOrder,
  isActive: item.isActive,
  isSystem: item.isSystem,
  createdAt: item.createdAt,
  updatedAt: item.updatedAt,
});

const sortOrbitItems = (items) =>
  [...items].sort(
    (a, b) =>
      a.displayOrder - b.displayOrder ||
      String(a.label || "").localeCompare(String(b.label || "")) ||
      new Date(a.createdAt || 0) - new Date(b.createdAt || 0)
  );

const defaultGroups = () =>
  NAVBAR_ORBIT_DEFAULT_ITEMS.reduce(
    (acc, item) => {
      acc[item.groupKey] = acc[item.groupKey] || [];
      acc[item.groupKey].push(item);
      return acc;
    },
    {
      [NAVBAR_ORBIT_GROUPS.SOCIAL]: [],
      [NAVBAR_ORBIT_GROUPS.THEME]: [],
      [NAVBAR_ORBIT_GROUPS.PROFILE]: [],
    }
  );

const groupDefaults = defaultGroups();

const ensureDefaultRecords = async () => {
  await ensureOrbitSchema();

  const totalItems = await prisma.navbarOrbitItem.count();

  if (totalItems > 0) {
    return;
  }

  await prisma.$transaction(
    NAVBAR_ORBIT_DEFAULT_ITEMS.map((item) =>
      prisma.navbarOrbitItem.upsert({
        where: {
          groupKey_systemActionKey: {
            groupKey: item.groupKey,
            systemActionKey: item.systemActionKey,
          },
        },
        update: {
          label: item.label,
          iconKey: item.iconKey,
          actionType: item.actionType,
          externalUrl: item.externalUrl || null,
          internalPath: item.internalPath || null,
          openInNewTab: item.openInNewTab,
          tooltip: item.tooltip || null,
          visibility: item.visibility,
          displayOrder: item.displayOrder,
          isActive: true,
          isSystem: true,
        },
        create: {
          groupKey: item.groupKey,
          systemActionKey: item.systemActionKey,
          label: item.label,
          iconKey: item.iconKey,
          actionType: item.actionType,
          externalUrl: item.externalUrl || null,
          internalPath: item.internalPath || null,
          openInNewTab: item.openInNewTab,
          tooltip: item.tooltip || null,
          visibility: item.visibility,
          displayOrder: item.displayOrder,
          isActive: true,
          isSystem: true,
        },
      })
    )
  );
};

const loadOrbitItems = async () => {
  await ensureDefaultRecords();

  const items = await prisma.navbarOrbitItem.findMany({
    orderBy: [
      {
        groupKey: "asc",
      },
      {
        displayOrder: "asc",
      },
      {
        createdAt: "asc",
      },
    ],
  });

  return sortOrbitItems(items.map(mapOrbitItem));
};

const getAllowedVisibility = (groupKey, visibility) => {
  if (groupKey === NAVBAR_ORBIT_GROUPS.SOCIAL) {
    return NAVBAR_ORBIT_VISIBILITY.PUBLIC;
  }

  if (groupKey === NAVBAR_ORBIT_GROUPS.THEME) {
    return NAVBAR_ORBIT_VISIBILITY.PUBLIC;
  }

  if (visibility === NAVBAR_ORBIT_VISIBILITY.PUBLIC) {
    return NAVBAR_ORBIT_VISIBILITY.PUBLIC;
  }

  return visibility;
};

const prepareCreatePayload = (data) => {
  const payload = normalizeOrbitPayload(data);
  payload.visibility = getAllowedVisibility(
    payload.groupKey,
    payload.visibility
  );

  if (payload.groupKey === NAVBAR_ORBIT_GROUPS.SOCIAL) {
    payload.isSystem = Boolean(payload.systemActionKey);
  }

  if (payload.groupKey === NAVBAR_ORBIT_GROUPS.THEME) {
    payload.isSystem = true;
  }

  if (payload.groupKey === NAVBAR_ORBIT_GROUPS.PROFILE) {
    payload.isSystem = Boolean(payload.systemActionKey);
  }

  return payload;
};

const prepareUpdateData = (existing, data) => {
  const payload = normalizeOrbitPayload(data, existing);
  payload.visibility = getAllowedVisibility(
    existing.groupKey,
    payload.visibility
  );

  if (existing.isSystem) {
    payload.groupKey = existing.groupKey;
    payload.actionType = existing.actionType;
    payload.systemActionKey = existing.systemActionKey;
    payload.isSystem = true;
  }

  return payload;
};

export const listNavbarOrbitItems = async ({
  activeOnly = false,
} = {}) => {
  const items = await loadOrbitItems();

  return items.filter((item) =>
    activeOnly ? item.isActive !== false : true
  );
};

export const getPublicNavbarOrbitItems = async () => {
  const items = await listNavbarOrbitItems({
    activeOnly: true,
  });

  return {
    items: items.map((item) => ({
      groupKey: item.groupKey,
      actionType: item.actionType,
      systemActionKey: item.systemActionKey,
      label: item.label,
      iconKey: item.iconKey,
      externalUrl: item.externalUrl,
      internalPath: item.internalPath,
      openInNewTab: item.openInNewTab,
      tooltip: item.tooltip,
      visibility: item.visibility,
      displayOrder: item.displayOrder,
      isActive: item.isActive,
      isSystem: item.isSystem,
    })),
  };
};

export const getAdminNavbarOrbitItems = async () => {
  const items = await loadOrbitItems();
  return items;
};

export const createNavbarOrbitItem = async (data) => {
  const payload = prepareCreatePayload(data);
  const systemActionKey = payload.systemActionKey || null;

  if (systemActionKey) {
    const existing = await prisma.navbarOrbitItem.findUnique({
      where: {
        groupKey_systemActionKey: {
          groupKey: payload.groupKey,
          systemActionKey,
        },
      },
    });

    if (existing) {
      const updated = await prisma.navbarOrbitItem.update({
        where: {
          id: existing.id,
        },
        data: {
          ...payload,
          systemActionKey,
        },
      });

      return mapOrbitItem(updated);
    }
  }

  const created = await prisma.navbarOrbitItem.create({
    data: {
      groupKey: payload.groupKey,
      actionType: payload.actionType,
      systemActionKey,
      label: payload.label,
      iconKey: payload.iconKey,
      externalUrl: payload.externalUrl,
      internalPath: payload.internalPath,
      openInNewTab: payload.openInNewTab,
      tooltip: payload.tooltip,
      visibility: payload.visibility,
      displayOrder: payload.displayOrder,
      isActive: payload.isActive,
      isSystem: payload.isSystem,
    },
  });

  return mapOrbitItem(created);
};

export const updateNavbarOrbitItem = async (id, data) => {
  const existing = await prisma.navbarOrbitItem.findUnique({
    where: {
      id,
    },
  });

  if (!existing) {
    const error = new Error("Navbar orbit item not found");
    error.statusCode = 404;
    throw error;
  }

  const payload = prepareUpdateData(existing, data);

  if (existing.isSystem) {
    const updated = await prisma.navbarOrbitItem.update({
      where: {
        id,
      },
      data: {
        label: payload.label,
        iconKey: payload.iconKey,
        externalUrl:
          existing.groupKey === NAVBAR_ORBIT_GROUPS.SOCIAL
            ? payload.externalUrl
            : existing.externalUrl,
        internalPath:
          existing.groupKey === NAVBAR_ORBIT_GROUPS.PROFILE &&
          payload.actionType === NAVBAR_ORBIT_ACTION_TYPES.INTERNAL_ROUTE
            ? payload.internalPath
            : existing.internalPath,
        openInNewTab:
          existing.groupKey === NAVBAR_ORBIT_GROUPS.SOCIAL
            ? payload.openInNewTab
            : existing.openInNewTab,
        tooltip: payload.tooltip,
        visibility: payload.visibility,
        displayOrder: payload.displayOrder,
        isActive: payload.isActive,
      },
    });

    return mapOrbitItem(updated);
  }

  const updated = await prisma.navbarOrbitItem.update({
    where: {
      id,
    },
    data: {
      groupKey: payload.groupKey,
      actionType: payload.actionType,
      systemActionKey: payload.systemActionKey,
      label: payload.label,
      iconKey: payload.iconKey,
      externalUrl: payload.externalUrl,
      internalPath: payload.internalPath,
      openInNewTab: payload.openInNewTab,
      tooltip: payload.tooltip,
      visibility: payload.visibility,
      displayOrder: payload.displayOrder,
      isActive: payload.isActive,
      isSystem: payload.isSystem,
    },
  });

  return mapOrbitItem(updated);
};

export const updateNavbarOrbitItemStatus = async (id, isActive) => {
  const existing = await prisma.navbarOrbitItem.findUnique({
    where: {
      id,
    },
  });

  if (!existing) {
    const error = new Error("Navbar orbit item not found");
    error.statusCode = 404;
    throw error;
  }

  const updated = await prisma.navbarOrbitItem.update({
    where: {
      id,
    },
    data: {
      isActive: toBoolean(isActive, true),
    },
  });

  return mapOrbitItem(updated);
};

export const deleteNavbarOrbitItem = async (id) => {
  const existing = await prisma.navbarOrbitItem.findUnique({
    where: {
      id,
    },
  });

  if (!existing) {
    const error = new Error("Navbar orbit item not found");
    error.statusCode = 404;
    throw error;
  }

  await prisma.navbarOrbitItem.delete({
    where: {
      id,
    },
  });

  return {
    item: { id },
    message: "Orbit item deleted successfully",
  };
};

export const reorderNavbarOrbitItems = async (
  groupKey,
  orderedIds
) => {
  const ids = ensureArray(orderedIds).filter(Boolean);
  const items = await prisma.navbarOrbitItem.findMany({
    where: {
      groupKey,
      id: {
        in: ids,
      },
    },
  });

  const itemById = new Map(items.map((item) => [item.id, item]));

  await prisma.$transaction(
    ids
      .map((itemId, index) => itemById.get(itemId))
      .filter(Boolean)
      .map((item, index) =>
        prisma.navbarOrbitItem.update({
          where: {
            id: item.id,
          },
          data: {
            displayOrder: index + 1,
          },
        })
      )
  );

  return listNavbarOrbitItems({
    activeOnly: false,
  });
};

export const resetNavbarOrbitGroup = async (groupKey) => {
  const defaults = groupDefaults[groupKey] || [];

  await prisma.$transaction([
    prisma.navbarOrbitItem.deleteMany({
      where: {
        groupKey,
        isSystem: false,
      },
    }),
    ...defaults.map((item) =>
      prisma.navbarOrbitItem.upsert({
        where: {
          groupKey_systemActionKey: {
            groupKey: item.groupKey,
            systemActionKey: item.systemActionKey,
          },
        },
        update: {
          label: item.label,
          iconKey: item.iconKey,
          actionType: item.actionType,
          externalUrl: item.externalUrl || null,
          internalPath: item.internalPath || null,
          openInNewTab: item.openInNewTab,
          tooltip: item.tooltip || null,
          visibility: item.visibility,
          displayOrder: item.displayOrder,
          isActive: true,
          isSystem: true,
        },
        create: {
          groupKey: item.groupKey,
          actionType: item.actionType,
          systemActionKey: item.systemActionKey,
          label: item.label,
          iconKey: item.iconKey,
          externalUrl: item.externalUrl || null,
          internalPath: item.internalPath || null,
          openInNewTab: item.openInNewTab,
          tooltip: item.tooltip || null,
          visibility: item.visibility,
          displayOrder: item.displayOrder,
          isActive: true,
          isSystem: true,
        },
      })
    ),
  ]);

  return listNavbarOrbitItems({
    activeOnly: false,
  });
};
