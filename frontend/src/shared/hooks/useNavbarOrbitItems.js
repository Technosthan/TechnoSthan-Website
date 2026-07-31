import { useCallback, useEffect, useMemo, useState } from "react";

import { getNavbarOrbitItems } from "../../api/navbar-orbit.api";
import {
  NAVBAR_ORBIT_DEFAULT_ITEMS,
  NAVBAR_ORBIT_GROUPS,
} from "../constants/navbar-orbit";

const normalizeText = (value, fallback = "") =>
  String(value ?? fallback)
    .replace(/\r/g, "")
    .trim()
    .replace(/\s+/g, " ");

const normalizeOrbitItem = (item, index) => ({
  id: item?.id || `${item?.groupKey || "orbit"}-${item?.systemActionKey || item?.label || index}`,
  groupKey: String(item?.groupKey || "").toLowerCase(),
  actionType: String(item?.actionType || "").toLowerCase(),
  systemActionKey: String(item?.systemActionKey || "").toLowerCase() || null,
  label: normalizeText(item?.label),
  iconKey: normalizeText(item?.iconKey),
  externalUrl: normalizeText(item?.externalUrl) || null,
  internalPath: normalizeText(item?.internalPath) || null,
  openInNewTab: Boolean(item?.openInNewTab),
  tooltip: normalizeText(item?.tooltip) || null,
  visibility: String(item?.visibility || "public").toLowerCase(),
  displayOrder: Number.parseInt(item?.displayOrder, 10) || index + 1,
  isActive: item?.isActive !== false,
  isSystem: item?.isSystem === true,
});

const groupItems = (items) =>
  items.reduce(
    (acc, item) => {
      const group = item.groupKey || NAVBAR_ORBIT_GROUPS.SOCIAL;
      acc[group] = acc[group] || [];
      acc[group].push(item);
      return acc;
    },
    {
      [NAVBAR_ORBIT_GROUPS.SOCIAL]: [],
      [NAVBAR_ORBIT_GROUPS.THEME]: [],
      [NAVBAR_ORBIT_GROUPS.PROFILE]: [],
    }
  );

const useNavbarOrbitItems = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sourceKind, setSourceKind] = useState("loading");

  const refresh = useCallback(async () => {
    setLoading(true);

    try {
      const response = await getNavbarOrbitItems();
      const nextItems = Array.isArray(response.data?.data?.items)
        ? response.data.data.items
        : Array.isArray(response.data?.data)
          ? response.data.data
          : [];

      const normalized = nextItems.map(normalizeOrbitItem);
      setItems(normalized);
      setError("");
      setSourceKind("api");
    } catch (fetchError) {
      setItems(NAVBAR_ORBIT_DEFAULT_ITEMS);
      setError(
        fetchError?.response?.data?.message ||
          fetchError?.message ||
          "Failed to load navbar orbit configuration"
      );
      setSourceKind("fallback");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        const response = await getNavbarOrbitItems();
        const nextItems = Array.isArray(response.data?.data?.items)
          ? response.data.data.items
          : Array.isArray(response.data?.data)
            ? response.data.data
            : [];

        if (!mounted) {
          return;
        }

        const normalized = nextItems.map(normalizeOrbitItem);
        setItems(normalized);
        setError("");
        setSourceKind("api");
      } catch (fetchError) {
        if (!mounted) {
          return;
        }

        setItems(NAVBAR_ORBIT_DEFAULT_ITEMS);
        setError(
          fetchError?.response?.data?.message ||
            fetchError?.message ||
            "Failed to load navbar orbit configuration"
        );
        setSourceKind("fallback");
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    load();

    return () => {
      mounted = false;
    };
  }, []);

  const itemsByGroup = useMemo(() => groupItems(items), [items]);

  return {
    items,
    itemsByGroup,
    loading,
    error,
    sourceKind,
    refresh,
  };
};

export default useNavbarOrbitItems;
