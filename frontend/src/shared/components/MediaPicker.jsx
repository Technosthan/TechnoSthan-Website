import { useEffect, useMemo, useRef, useState } from "react";
import { CloudUpload, Image as ImageIcon, PlayCircle, RefreshCw, Trash2 } from "lucide-react";
import { normalizeMediaUrl } from "../utils/media";
import { buildApiUrl } from "../services/apiBase";

const getUploadEndpoint = (type) => buildApiUrl(`/uploads/${type === "video" ? "videos" : "images"}`);

const MediaPicker = ({
  type = "image",
  label,
  value = "",
  onChange,
  onRemove,
  helperText,
}) => {
  const inputRef = useRef(null);
  const [mode, setMode] = useState(value ? "url" : "upload");
  const [urlValue, setUrlValue] = useState(value || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setUrlValue(value || "");
  }, [value]);

  const previewNode = useMemo(() => {
    if (!value) return null;

    if (type === "video") {
      return (
        <video className="media-preview" controls preload="metadata">
          <source src={value} />
        </video>
      );
    }

    return <img className="media-preview" src={value} alt={label || "Media preview"} />;
  }, [label, type, value]);

  const handleUrlChange = (event) => {
    const nextValue = event.target.value;
    setUrlValue(nextValue);
    onChange?.(nextValue);
  };

  const handleUrlBlur = () => {
    const normalized = normalizeMediaUrl(urlValue, type);
    setUrlValue(normalized);
    onChange?.(normalized);
  };

  const handleUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setError("");
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", type);

      const token = localStorage.getItem("technosthan_access_token");
      const response = await fetch(getUploadEndpoint(type), {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.message || "Upload failed");
      }

      const uploadedUrl = data.url || data.file?.url || "";
      onChange?.(uploadedUrl);
      setMode("url");
      setUrlValue(uploadedUrl);
    } catch (uploadError) {
      setError(uploadError.message || "Upload failed");
    } finally {
      setLoading(false);
      if (inputRef.current) {
        inputRef.current.value = "";
      }
    }
  };

  const triggerUpload = () => {
    inputRef.current?.click();
  };

  const Icon = type === "video" ? PlayCircle : ImageIcon;

  return (
    <div className="media-picker card">
      <div className="media-picker-header">
        <div>
          <span className="media-picker-label">{label}</span>
          {helperText ? <p className="media-picker-helper">{helperText}</p> : null}
        </div>
        <div className="media-picker-toggle">
          <button
            type="button"
            className={`btn ${mode === "upload" ? "btn-primary" : "btn-secondary"}`}
            onClick={() => setMode("upload")}
          >
            Upload {type === "video" ? "Video" : "Image"}
          </button>
          <button
            type="button"
            className={`btn ${mode === "url" ? "btn-primary" : "btn-secondary"}`}
            onClick={() => setMode("url")}
          >
            Paste URL
          </button>
        </div>
      </div>

      {previewNode ? <div className="media-preview-wrap">{previewNode}</div> : null}

      <input
        ref={inputRef}
        type="file"
        accept={type === "video" ? "video/*" : "image/*"}
        className="sr-only"
        onChange={handleUpload}
      />

      {mode === "upload" ? (
        <div className="media-upload-row">
          <button type="button" className="btn btn-secondary" onClick={triggerUpload} disabled={loading}>
            <CloudUpload size={16} />
            {loading ? "Uploading..." : "Choose File"}
          </button>
          <button type="button" className="btn btn-secondary" onClick={() => onRemove?.()} disabled={!value}>
            <Trash2 size={16} />
            Remove
          </button>
          <button type="button" className="btn btn-secondary" onClick={() => setMode("url")}>
            <RefreshCw size={16} />
            Use URL
          </button>
        </div>
      ) : (
        <div className="media-url-row">
          <input
            className="input"
            value={urlValue}
            onChange={handleUrlChange}
            onBlur={handleUrlBlur}
            placeholder={type === "video" ? "https://..." : "https://..."}
          />
          <button type="button" className="btn btn-secondary" onClick={() => onRemove?.()} disabled={!value && !urlValue}>
            <Trash2 size={16} />
            Remove
          </button>
        </div>
      )}

      {error ? <p className="form-error">{error}</p> : null}
      {!error && !value && !urlValue ? (
        <div className="media-picker-empty">
          <Icon size={18} />
          <span>No media selected</span>
        </div>
      ) : null}
    </div>
  );
};

export default MediaPicker;
