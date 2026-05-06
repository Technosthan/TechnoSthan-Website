import React, { useState, useEffect, useRef } from "react";
import { useTheme } from "../../contexts/ThemeContext";
import {
  Brain,
  Save,
  RefreshCw,
  Settings as SettingsIcon,
  Plus,
  Edit,
  Trash2,
  Play,
  Pause,
  Upload,
  ChevronUp,
  ChevronDown,
  FileText,
} from "lucide-react";
import {
  getAIProviders,
  addAIProvider,
  updateAIProvider,
  deleteAIProvider,
  updateAIMode,
  updateProviderPriority,
  updateAIConfig,
} from "./adminApi";

const AIControlPanel = () => {
  const { theme } = useTheme();
  const [providers, setProviders] = useState([]);
  const [mode, setMode] = useState("single");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [success, setSuccess] = useState("");
  const [globalSettings, setGlobalSettings] = useState({
    systemPrompt: "",
    temperature: 0.7,
    maxTokens: 3000,
  });
  const [uploadingFile, setUploadingFile] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchProviders();
  }, []);

  const fetchProviders = async () => {
    try {
      setLoading(true);
      const response = await getAIProviders();
      setProviders(response.data.data.providers || []);
      setMode(response.data.data.mode || "single");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load AI providers");
    } finally {
      setLoading(false);
    }
  };

  const handleAddProvider = async (providerData) => {
    try {
      setSaving(true);
      setError("");
      await addAIProvider(providerData);
      await fetchProviders();
      setShowAddForm(false);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add provider");
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateProvider = async (providerId, updateData) => {
    try {
      setSaving(true);
      setError("");
      await updateAIProvider(providerId, updateData);
      await fetchProviders();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update provider");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteProvider = async (providerId) => {
    if (!confirm("Are you sure you want to delete this provider?")) return;

    try {
      setSaving(true);
      setError("");
      await deleteAIProvider(providerId);
      await fetchProviders();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete provider");
    } finally {
      setSaving(false);
    }
  };

  const handleModeChange = async (newMode) => {
    try {
      setSaving(true);
      setError("");
      await updateAIMode(newMode);
      setMode(newMode);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update mode");
    } finally {
      setSaving(false);
    }
  };

  const handlePriorityChange = async (providerId, direction) => {
    const currentProvider = providers.find((p) => p.providerId === providerId);
    if (!currentProvider) return;

    const newPriority =
      direction === "up"
        ? currentProvider.priority + 1
        : currentProvider.priority - 1;

    try {
      await updateProviderPriority(providerId, newPriority);
      await fetchProviders();
    } catch (err) {
      setError("Failed to update priority");
    }
  };

  const handleGlobalSettingsSave = async () => {
    try {
      setSaving(true);
      setError("");
      await updateAIConfig(globalSettings);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save global settings");
    } finally {
      setSaving(false);
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ["application/json", "text/csv", "text/plain"];
    if (
      !allowedTypes.includes(file.type) &&
      !file.name.endsWith(".json") &&
      !file.name.endsWith(".csv")
    ) {
      setError("Please upload a JSON or CSV file");
      return;
    }

    try {
      setUploadingFile(true);
      setError("");

      const fileContent = await file.text();
      let providers = [];

      if (file.type === "application/json" || file.name.endsWith(".json")) {
        // Parse JSON
        const data = JSON.parse(fileContent);
        if (data.providers && Array.isArray(data.providers)) {
          providers = data.providers;
        } else if (Array.isArray(data)) {
          providers = data;
        } else {
          providers = [data];
        }
      } else if (file.type === "text/csv" || file.name.endsWith(".csv")) {
        // Parse CSV
        const lines = fileContent.split("\n").filter((line) => line.trim());
        if (lines.length < 2) {
          throw new Error(
            "CSV file must have at least a header row and one data row",
          );
        }

        const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());
        const requiredHeaders = ["apikey", "modelname"];
        const hasRequiredHeaders = requiredHeaders.some(
          (header) =>
            headers.includes(header) ||
            headers.includes("api_key") ||
            headers.includes("model_name"),
        );

        if (!hasRequiredHeaders) {
          throw new Error("CSV must contain 'apiKey' or 'modelName' columns");
        }

        for (let i = 1; i < lines.length; i++) {
          const values = lines[i].split(",").map((v) => v.trim());
          if (values.length !== headers.length) continue;

          const provider = {};
          headers.forEach((header, index) => {
            const value = values[index];
            if (header.includes("provider") || header === "type") {
              provider.providerType = value || "";
            } else if (
              header.includes("apikey") ||
              header.includes("api_key") ||
              header.includes("key")
            ) {
              provider.apiKey = value;
            } else if (
              header.includes("model") ||
              header.includes("modelname") ||
              header.includes("model_name")
            ) {
              provider.modelName = value;
            } else if (
              header.includes("url") ||
              header.includes("apiurl") ||
              header.includes("api_url")
            ) {
              provider.apiUrl = value;
            } else if (header.includes("name") && !header.includes("model")) {
              provider.customName = value;
            }
          });

          // Set defaults
          if (!provider.providerType) provider.providerType = "openai";
          if (!provider.isActive) provider.isActive = true;

          providers.push(provider);
        }
      }

      // Normalize providers data
      providers = providers.map((provider) => ({
        providerType: provider.providerType,
        customName: provider.customName,
        apiKey: provider.apiKey,
        modelName: provider.modelName,
        apiUrl: provider.apiUrl,
        isActive: provider.isActive,
      }));

      // Validate and add providers
      for (const provider of providers) {
        // Map token to apiKey if needed
        if (provider.token && !provider.apiKey) {
          provider.apiKey = provider.token;
        }

        await addAIProvider(provider);
      }

      await fetchProviders();
      setSuccess(`Providers added successfully from file`);
      setTimeout(() => {
        setSuccess("");
      }, 3000);
      setError("");
    } catch (err) {
      setError(err.message || "Failed to process file");
    } finally {
      setUploadingFile(false);
      event.target.value = ""; // Reset file input
    }
  };

  if (loading) {
    return (
      <div className="p-6 w-full flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <RefreshCw className="animate-spin h-16 w-16 mx-auto mb-4 text-purple-500" />
          <p className={`${theme.textSecondary} font-medium`}>
            Loading AI providers...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`p-6 w-full space-y-8 ${theme.text}`}>
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className={`text-3xl font-bold ${theme.text} mb-2`}>
            AI Control Panel
          </h1>
          <p className={`${theme.textSecondary}`}>
            Manage multiple AI providers with intelligent fallback
          </p>
        </div>
        <div className="flex gap-3 mt-4 lg:mt-0">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".json,.csv"
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadingFile}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center font-medium disabled:opacity-50"
          >
            <FileText className="h-4 w-4 mr-2" />
            {uploadingFile ? "Uploading..." : "Upload Config"}
          </button>
          <button
            onClick={() => setShowAddForm(true)}
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center font-medium"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Provider
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-xl p-6 shadow-sm">
          <div className="flex items-center mb-4">
            <div className="p-2 bg-red-100 rounded-lg mr-3">
              <SettingsIcon className="h-5 w-5 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-red-800">Error</h3>
          </div>
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Success Message */}
      {success && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-6 shadow-sm">
          <h3 className="text-green-800 font-semibold">Success</h3>
          <p className="text-green-700">{success}</p>
        </div>
      )}

      {/* Mode Toggle */}
      <div
        className={`${theme.card} rounded-2xl shadow-lg p-6 border ${theme.border}`}
      >
        <h3 className={`text-xl font-bold ${theme.text} mb-4`}>AI Mode</h3>
        <div className="flex gap-4">
          <label className="flex items-center">
            <input
              type="radio"
              name="mode"
              value="single"
              checked={mode === "single"}
              onChange={(e) => handleModeChange(e.target.value)}
              className="mr-2"
            />
            <span className={theme.text}>Single Provider</span>
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              name="mode"
              value="fallback"
              checked={mode === "fallback"}
              onChange={(e) => handleModeChange(e.target.value)}
              className="mr-2"
            />
            <span className={theme.text}>Fallback Mode</span>
          </label>
        </div>
        <p className={`text-sm ${theme.textSecondary} mt-2`}>
          {mode === "single"
            ? "Use only one active provider"
            : "Try providers in priority order, fallback to next on failure"}
        </p>
      </div>

      {/* Provider Cards */}
      <div
        className={`${theme.card} rounded-2xl shadow-lg p-6 border ${theme.border}`}
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className={`text-xl font-bold ${theme.text}`}>AI Providers</h3>
            <p className={`text-sm ${theme.textSecondary} mt-1`}>
              Upload JSON/CSV files with API keys and model names to add
              providers automatically
            </p>
          </div>
          <span className={`text-sm ${theme.textSecondary}`}>
            {providers.length} provider{providers.length !== 1 ? "s" : ""}
          </span>
        </div>

        <div className="space-y-4">
          {providers.map((provider, index) => (
            <ProviderCard
              key={provider.providerId}
              provider={provider}
              index={index}
              totalProviders={providers.length}
              onUpdate={handleUpdateProvider}
              onDelete={handleDeleteProvider}
              onPriorityChange={handlePriorityChange}
              theme={theme}
            />
          ))}

          {providers.length === 0 && (
            <div className="text-center py-8">
              <Brain className="h-16 w-16 mx-auto mb-4 text-gray-400" />
              <p className={`${theme.textSecondary} mb-4`}>
                No AI providers configured
              </p>
              <button
                onClick={() => setShowAddForm(true)}
                className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
              >
                Add Your First Provider
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Global Settings */}
      <div
        className={`${theme.card} rounded-2xl shadow-lg p-6 border ${theme.border}`}
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className={`text-xl font-bold ${theme.text}`}>
            Global AI Settings
          </h3>
          <button
            onClick={handleGlobalSettingsSave}
            disabled={saving}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Settings"}
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className={`block text-sm font-semibold ${theme.text} mb-2`}>
              System Prompt
            </label>
            <textarea
              value={globalSettings.systemPrompt}
              onChange={(e) =>
                setGlobalSettings((prev) => ({
                  ...prev,
                  systemPrompt: e.target.value,
                }))
              }
              rows={4}
              className={`${theme.input} w-full px-4 py-3 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors duration-200 resize-none`}
              placeholder="Enter system prompt..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                className={`block text-sm font-semibold ${theme.text} mb-2`}
              >
                Temperature: {globalSettings.temperature}
              </label>
              <input
                type="range"
                min="0"
                max="2"
                step="0.1"
                value={globalSettings.temperature}
                onChange={(e) =>
                  setGlobalSettings((prev) => ({
                    ...prev,
                    temperature: parseFloat(e.target.value),
                  }))
                }
                className="w-full"
              />
            </div>

            <div>
              <label
                className={`block text-sm font-semibold ${theme.text} mb-2`}
              >
                Max Tokens: {globalSettings.maxTokens}
              </label>
              <input
                type="range"
                min="100"
                max="8192"
                step="100"
                value={globalSettings.maxTokens}
                onChange={(e) =>
                  setGlobalSettings((prev) => ({
                    ...prev,
                    maxTokens: parseInt(e.target.value),
                  }))
                }
                className="w-full"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Add Provider Modal */}
      {showAddForm && (
        <AddProviderModal
          onClose={() => setShowAddForm(false)}
          onSave={handleAddProvider}
          theme={theme}
        />
      )}
    </div>
  );
};

// Provider Card Component
const ProviderCard = ({
  provider,
  index,
  totalProviders,
  onUpdate,
  onDelete,
  onPriorityChange,
  theme,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({ ...provider });

  const handleSave = () => {
    onUpdate(provider.providerId, editData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditData({ ...provider });
    setIsEditing(false);
  };

  const getStatusColor = () => {
    if (!provider.isActive) return "bg-gray-500";
    if (provider.isPaused) return "bg-yellow-500";
    return "bg-green-500";
  };

  const getStatusText = () => {
    if (!provider.isActive) return "Inactive";
    if (provider.isPaused) return "Paused";
    return "Active";
  };

  return (
    <div
      className={`${theme.card} rounded-xl p-4 border ${theme.border} shadow-sm`}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className={`w-3 h-3 rounded-full ${getStatusColor()}`} />
          <div>
            <h4 className={`font-semibold ${theme.text}`}>
              {provider.providerType === "custom"
                ? provider.customName
                : provider.providerType}
            </h4>
            
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Priority Controls */}
          <div className="flex flex-col">
            <button
              onClick={() => onPriorityChange(provider.providerId, "up")}
              disabled={index === 0}
              className="p-1 hover:bg-gray-100 rounded disabled:opacity-50"
            >
              <ChevronUp className="h-4 w-4" />
            </button>
            <button
              onClick={() => onPriorityChange(provider.providerId, "down")}
              disabled={index === totalProviders - 1}
              className="p-1 hover:bg-gray-100 rounded disabled:opacity-50"
            >
              <ChevronDown className="h-4 w-4" />
            </button>
          </div>

          {/* Action Buttons */}
          <button
            onClick={() =>
              onUpdate(provider.providerId, { isPaused: !provider.isPaused })
            }
            className={`p-2 rounded-lg ${provider.isPaused ? "bg-green-100 text-green-600" : "bg-yellow-100 text-yellow-600"}`}
          >
            {provider.isPaused ? (
              <Play className="h-4 w-4" />
            ) : (
              <Pause className="h-4 w-4" />
            )}
          </button>

          <button
            onClick={() => setIsEditing(!isEditing)}
            className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200"
          >
            <Edit className="h-4 w-4" />
          </button>

          <button
            onClick={() => onDelete(provider.providerId)}
            className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {isEditing && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Provider Type
              </label>
              <select
                value={editData.providerType}
                onChange={(e) =>
                  setEditData((prev) => ({
                    ...prev,
                    providerType: e.target.value,
                  }))
                }
                className={`${theme.input} w-full px-3 py-2 rounded-lg`}
              >
                <option value="gemini">Gemini</option>
                <option value="openai">OpenAI</option>
                <option value="custom">Custom</option>
                <option value="token-only">Token Only</option>
              </select>
            </div>

            {editData.providerType === "custom" && (
              <div>
                <label className="block text-sm font-medium mb-1">
                  Custom Name
                </label>
                <input
                  type="text"
                  value={editData.customName || ""}
                  onChange={(e) =>
                    setEditData((prev) => ({
                      ...prev,
                      customName: e.target.value,
                    }))
                  }
                  className={`${theme.input} w-full px-3 py-2 rounded-lg`}
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-1">API Key</label>
              <input
                type="password"
                value={editData.apiKey || ""}
                onChange={(e) =>
                  setEditData((prev) => ({ ...prev, apiKey: e.target.value }))
                }
                className={`${theme.input} w-full px-3 py-2 rounded-lg`}
                placeholder="Enter API key"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Model Name
              </label>
              <input
                type="text"
                value={editData.modelName || ""}
                onChange={(e) =>
                  setEditData((prev) => ({
                    ...prev,
                    modelName: e.target.value,
                  }))
                }
                className={`${theme.input} w-full px-3 py-2 rounded-lg`}
                placeholder="e.g. gpt-4o-mini"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">API URL</label>
              <input
                type="text"
                value={editData.apiUrl || ""}
                onChange={(e) =>
                  setEditData((prev) => ({ ...prev, apiUrl: e.target.value }))
                }
                className={`${theme.input} w-full px-3 py-2 rounded-lg`}
                placeholder="https://api.example.com/v1/chat"
              />
            </div>

            <div className="flex items-center gap-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={editData.isActive}
                  onChange={(e) =>
                    setEditData((prev) => ({
                      ...prev,
                      isActive: e.target.checked,
                    }))
                  }
                  className="mr-2"
                />
                Active
              </label>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
            >
              Save
            </button>
            <button
              onClick={handleCancel}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// Add Provider Modal Component
const AddProviderModal = ({ onClose, onSave, theme }) => {
  const [formData, setFormData] = useState({
    providerType: "gemini",
    customName: "",
    apiKey: "",
    modelName: "",
    apiUrl: "",
    isActive: true,
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className={`${theme.card} rounded-2xl p-6 w-full max-w-md mx-4`}>
        <h3 className={`text-xl font-bold ${theme.text} mb-4`}>
          Add AI Provider
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Provider Type
            </label>
            <select
              value={formData.providerType}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  providerType: e.target.value,
                }))
              }
              className={`${theme.input} w-full px-3 py-2 rounded-lg`}
              required
            >
              <option value="gemini">Gemini</option>
              <option value="openai">OpenAI</option>
              <option value="custom">Custom</option>
              <option value="token-only">Token Only</option>
            </select>
          </div>

          {formData.providerType === "custom" && (
            <div>
              <label className="block text-sm font-medium mb-1">
                Custom Name
              </label>
              <input
                type="text"
                value={formData.customName}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    customName: e.target.value,
                  }))
                }
                className={`${theme.input} w-full px-3 py-2 rounded-lg`}
                required
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-1">API Key</label>
            <input
              type="password"
              value={formData.apiKey}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, apiKey: e.target.value }))
              }
              className={`${theme.input} w-full px-3 py-2 rounded-lg`}
              required={formData.providerType !== "token-only"}
            />
          </div>

          {formData.providerType !== "token-only" && (
            <div>
              <label className="block text-sm font-medium mb-1">
                Model Name
              </label>
              <input
                type="text"
                value={formData.modelName}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    modelName: e.target.value,
                  }))
                }
                className={`${theme.input} w-full px-3 py-2 rounded-lg`}
                placeholder="e.g. gpt-4o-mini"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-1">API URL</label>
            <input
              type="text"
              value={formData.apiUrl}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, apiUrl: e.target.value }))
              }
              className={`${theme.input} w-full px-3 py-2 rounded-lg`}
              placeholder="https://api.example.com/v1/chat"
            />
          </div>

          <div className="flex items-center gap-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    isActive: e.target.checked,
                  }))
                }
                className="mr-2"
              />
              Active
            </label>
          </div>

          <div className="flex gap-2 pt-4">
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600"
            >
              Add Provider
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AIControlPanel;
