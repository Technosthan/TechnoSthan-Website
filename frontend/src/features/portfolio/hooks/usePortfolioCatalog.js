import { useEffect, useMemo, useState } from "react";

import { getProjects } from "../../../api/projects.api";
import { getServices } from "../../../api/services.api";
import {
  normalizeProjectRecord,
  normalizeServiceRecord,
  sortProjects,
} from "../data/portfolioData";

const usePortfolioCatalog = () => {
  const [projects, setProjects] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadTick, setReloadTick] = useState(0);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      setLoading(true);
      setError("");

      const [projectsRes, servicesRes] = await Promise.allSettled([
        getProjects(),
        getServices(),
      ]);

      if (!mounted) {
        return;
      }

      if (projectsRes.status === "fulfilled") {
        const items = Array.isArray(projectsRes.value.data?.data)
          ? projectsRes.value.data.data
          : [];

        setProjects(
          sortProjects(items.map(normalizeProjectRecord).filter((item) => item.isActive))
        );
      } else {
        setProjects([]);
        setError(
          projectsRes.reason?.response?.data?.message ||
            "We could not load the public project catalog."
        );
      }

      if (servicesRes.status === "fulfilled") {
        const items = Array.isArray(servicesRes.value.data?.data)
          ? servicesRes.value.data.data
          : [];
        setServices(
          items.map(normalizeServiceRecord).filter((service) => service.isActive)
        );
      } else {
        setServices([]);
      }

      setLoading(false);
    };

    load();

    return () => {
      mounted = false;
    };
  }, [reloadTick]);

  const activeProjects = useMemo(() => sortProjects(projects), [projects]);

  const refresh = () => setReloadTick((value) => value + 1);

  return {
    projects: activeProjects,
    services,
    loading,
    error,
    refresh,
  };
};

export default usePortfolioCatalog;

