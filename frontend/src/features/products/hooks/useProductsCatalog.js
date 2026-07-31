import { useEffect, useMemo, useState } from "react";

import { getProjects } from "../../../api/projects.api";
import { getServices } from "../../../api/services.api";
import { normalizeServiceRecord } from "../../services/data/serviceCatalog";
import {
  normalizeProductRecord,
  sortProducts,
} from "../data/productsData";

const useProductsCatalog = () => {
  const [products, setProducts] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadTick, setReloadTick] = useState(0);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      setLoading(true);
      setError("");

      const [productsRes, servicesRes] = await Promise.allSettled([
        getProjects(),
        getServices(),
      ]);

      if (!mounted) {
        return;
      }

      if (productsRes.status === "fulfilled") {
        const items = Array.isArray(productsRes.value.data?.data)
          ? productsRes.value.data.data
          : [];
        setProducts(
          sortProducts(
            items
              .map(normalizeProductRecord)
              .filter((item) => item.isActive !== false)
          )
        );
      } else {
        setProducts([]);
        setError(
          productsRes.reason?.response?.data?.message ||
            "We could not load the public product catalog."
        );
      }

      if (servicesRes.status === "fulfilled") {
        const items = Array.isArray(servicesRes.value.data?.data)
          ? servicesRes.value.data.data
          : [];
        setServices(items.map(normalizeServiceRecord).filter((service) => service.isActive));
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

  const activeProducts = useMemo(() => sortProducts(products), [products]);

  const refresh = () => setReloadTick((value) => value + 1);

  return {
    products: activeProducts,
    services,
    loading,
    error,
    refresh,
  };
};

export default useProductsCatalog;

