import { useEffect, useState } from "react";
import { getServices } from "../../../api/services.api";
import {
  DEFAULT_SERVICE_MENU_ITEMS,
  getServiceMenuGroups,
  getFeaturedService,
} from "../data/serviceCatalog";

export default function useServices({
  navbarOnly = false,
} = {}) {
  const [services, setServices] = useState(
    navbarOnly ? DEFAULT_SERVICE_MENU_ITEMS : []
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        const response = await getServices(
          navbarOnly ? { navbar: true } : {}
        );
        const items = response.data?.data || [];

        if (!mounted) {
          return;
        }

        setServices(items.length > 0 ? items : DEFAULT_SERVICE_MENU_ITEMS);
      } catch (err) {
        if (!mounted) {
          return;
        }

        setError(
          err?.response?.data?.message ||
            "Failed to load services"
        );
        setServices(DEFAULT_SERVICE_MENU_ITEMS);
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
  }, [navbarOnly]);

  return {
    services,
    loading,
    error,
    menuGroups: getServiceMenuGroups(services),
    featuredService: getFeaturedService(services),
  };
}
