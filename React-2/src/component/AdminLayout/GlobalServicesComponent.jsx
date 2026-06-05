import React, { useState, useEffect } from "react";
import { Power, AlertCircle, CheckCircle2 } from "lucide-react";
import api from "../../lib/api";

/**
 * GLOBAL SERVICES COMPONENT
 * Master switches for workspace-wide service availability
 * If disabled here, permission is ALWAYS blocked regardless of role/overrides
 */
const GlobalServices = ({ onUpdate }) => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  // Service categories for grouping
  const servicesByCategory = {
    assignments: [],
    social: [],
    analytics: [],
    dashboard: [],
  };

  // Fetch global services
  const fetchServices = async () => {
    try {
      setLoading(true);
      setError(null);
      const { data } = await api.get("/api/permissions/global-services");

      if (data.success) {
        setServices(data.data || []);

        // Group by category
        data.data.forEach((service) => {
          const category = service.category || "assignments";
          if (servicesByCategory[category]) {
            servicesByCategory[category].push(service);
          }
        });
      }
    } catch (err) {
      console.error("Failed to fetch global services:", err);
      setError("Failed to load global services");
    } finally {
      setLoading(false);
    }
  };

  // Update service status
  const updateService = async (serviceKey, enabled) => {
    try {
      setSaving(true);
      const { data } = await api.put("/api/permissions/global-services", {
        serviceKey,
        enabled,
      });

      if (data.success) {
        // Update local state
        setServices((prev) =>
          prev.map((s) =>
            s.serviceKey === serviceKey ? { ...s, enabled } : s,
          ),
        );

        // Notify parent
        if (onUpdate) {
          onUpdate();
        }
      }
    } catch (err) {
      console.error("Failed to update service:", err);
      setError("Failed to update service");
    } finally {
      setSaving(false);
    }
  };

  // Fetch on mount
  useEffect(() => {
    fetchServices();
  }, []);

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-20 rounded-2xl border border-white/10 bg-slate-900/40 animate-pulse"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 p-4 text-sm text-rose-200">
          {error}
        </div>
      )}

      <div className="grid gap-3 md:grid-cols-2">
        {services.map((service) => (
          <div
            key={service.serviceKey}
            className="group rounded-2xl border border-white/10 bg-gradient-to-br from-slate-900/60 to-slate-950/40 p-4 transition hover:border-white/20 hover:from-slate-900/80"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <h4 className="text-sm font-semibold text-white">
                  {service.name}
                </h4>
                <p className="mt-1 text-xs text-slate-400">
                  {service.description}
                </p>
              </div>

              {/* Toggle Switch */}
              <button
                onClick={() =>
                  updateService(service.serviceKey, !service.enabled)
                }
                disabled={saving}
                className={`relative inline-flex h-8 w-14 flex-shrink-0 items-center rounded-full transition ${
                  service.enabled
                    ? "bg-emerald-500/30 ring-1 ring-emerald-500/50"
                    : "bg-slate-700/40 ring-1 ring-slate-600/50"
                }`}
              >
                {/* Toggle Circle */}
                <div
                  className={`absolute h-6 w-6 rounded-full bg-white/90 transition ${
                    service.enabled ? "translate-x-7" : "translate-x-1"
                  }`}
                />

                {/* Icons */}
                <div className="absolute inset-0 flex items-center justify-between px-1.5">
                  {service.enabled && (
                    <CheckCircle2 size={14} className="text-emerald-600" />
                  )}
                  {!service.enabled && (
                    <AlertCircle size={14} className="text-slate-500" />
                  )}
                </div>
              </button>
            </div>

            {/* Status Badge */}
            <div className="mt-3 flex items-center gap-2">
              <div
                className={`h-2 w-2 rounded-full ${
                  service.enabled ? "bg-emerald-400" : "bg-slate-500"
                }`}
              />
              <span className="text-xs font-medium text-slate-300">
                {service.enabled ? "Enabled" : "Disabled"}
              </span>
            </div>
          </div>
        ))}
      </div>

      {services.length === 0 && (
        <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-8 text-center">
          <Power size={32} className="mx-auto text-slate-600" />
          <p className="mt-2 text-sm text-slate-400">
            No global services configured
          </p>
        </div>
      )}
    </div>
  );
};

export default GlobalServices;
