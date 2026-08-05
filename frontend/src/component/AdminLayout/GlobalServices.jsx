import React, { useEffect, useState } from "react";
import api from "../../lib/api";
import ToggleSwitch from "./ToggleSwitch";

const GlobalServices = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  // Sirf jis toggle par click hua hai, uski loading store hogi
  const [updatingKey, setUpdatingKey] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get("/api/admin/workspace-services");

        const settings = data?.data || {};

        const entries = Object.keys(settings).map((key) => ({
          key,
          ...settings[key],
        }));

        setServices(entries);
      } catch (error) {
        console.error("Failed to load global services:", error);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const handleToggle = async (serviceKey, nextEnabledValue) => {
    // Same toggle par double click rokega
    if (updatingKey === serviceKey) return;

    const previousService = services.find(
      (service) => service.key === serviceKey,
    );

    setUpdatingKey(serviceKey);

    // Sirf clicked service ko update karo
    setServices((previousServices) =>
      previousServices.map((service) =>
        service.key === serviceKey
          ? {
              ...service,
              enabled: nextEnabledValue,
            }
          : service,
      ),
    );

    try {
      await api.patch("/api/admin/workspace-services", {
        serviceKey,
        enabled: nextEnabledValue,
      });
    } catch (error) {
      console.error("Failed to update service:", error);

      // API fail ho to sirf wahi toggle previous state me aaye
      setServices((previousServices) =>
        previousServices.map((service) =>
          service.key === serviceKey
            ? {
                ...service,
                enabled: previousService?.enabled ?? false,
              }
            : service,
        ),
      );
    } finally {
      setUpdatingKey(null);
    }
  };

  if (loading) {
    return <div>Loading global services...</div>;
  }

  return (
    <div className="gs-grid">
      {services.map((service) => {
        const isUpdating = updatingKey === service.key;

        return (
          <div key={service.key} className="gs-card">
            <div className="gs-row">
              <div className="min-w-0 flex-1">
                <div className="gs-title">{service.key}</div>

                <div className="gs-desc">{service.description || ""}</div>
              </div>

              {/* Fixed width container: UI move nahi hogi */}
              <div className="flex w-[145px] shrink-0 items-center justify-end gap-3">
                <ToggleSwitch
                  checked={Boolean(service.enabled)}
                  disabled={false}
                  loading={isUpdating}
                  onChange={(nextValue) => handleToggle(service.key, nextValue)}
                  label={`Toggle ${service.key}`}
                />

                {/* Enabled/Disabled text ki fixed width */}
                <span
                  className={`w-[72px] shrink-0 text-left text-sm font-semibold ${
                    service.enabled ? "text-cyan-300" : "text-slate-400"
                  }`}
                >
                  {service.enabled ? "Enabled" : "Disabled"}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default GlobalServices;
