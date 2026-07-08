import { useEffect, useMemo, useRef, useState } from "react";
import {
  CloudUpload,
  Image as ImageIcon,
  PlayCircle,
  RefreshCw,
  RotateCw,
  Trash2,
  Volume2,
  VolumeX,
} from "lucide-react";
import { buildApiUrl } from "../services/apiBase";
import { getMediaUrl, isValidMediaUrl, normalizeStoredMediaUrl } from "../utils/media";

const IMAGE_ACCEPT = ".jpg,.jpeg,.png,.webp,.svg,image/jpeg,image/png,image/webp,image/svg+xml";
const VIDEO_ACCEPT = ".mp4,.webm,.mov,video/mp4,video/webm,video/quicktime";

const IMAGE_MIME_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/svg+xml"]);
const IMAGE_EXTENSIONS = new Set(["jpg", "jpeg", "png", "webp", "svg"]);
const VIDEO_MIME_TYPES = new Set(["video/mp4", "video/webm", "video/quicktime"]);
const VIDEO_EXTENSIONS = new Set(["mp4", "webm", "mov"]);

const getUploadEndpoint = () => buildApiUrl("/uploads");

const formatDuration = (seconds = 0) => {
  const totalSeconds = Number.isFinite(seconds) ? Math.max(0, Math.round(seconds)) : 0;
  const minutes = Math.floor(totalSeconds / 60);
  const remainingSeconds = totalSeconds % 60;
  return `${minutes}:${String(remainingSeconds).padStart(2, "0")}`;
};

const getFileExtension = (name = "") => String(name).split(".").pop().toLowerCase();

const isSupportedFile = (file, type) => {
  const extension = getFileExtension(file.name);
  if (type === "video") {
    return VIDEO_MIME_TYPES.has(file.type) || VIDEO_EXTENSIONS.has(extension);
  }

  return IMAGE_MIME_TYPES.has(file.type) || IMAGE_EXTENSIONS.has(extension);
};

const uploadFileWithProgress = ({ file, type, token, onProgress }) =>
  new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", getUploadEndpoint());
    if (token) {
      xhr.setRequestHeader("Authorization", `Bearer ${token}`);
    }

    xhr.upload.onprogress = (event) => {
      if (!event.lengthComputable) return;
      onProgress?.(Math.round((event.loaded / event.total) * 100));
    };

    xhr.onerror = () => reject(new Error("Upload failed"));
    xhr.onload = () => {
      const data = (() => {
        try {
          return JSON.parse(xhr.responseText || "{}");
        } catch (_error) {
          return {};
        }
      })();

      if (xhr.status < 200 || xhr.status >= 300) {
        reject(new Error(data.message || "Upload failed"));
        return;
      }

      resolve(data);
    };

    const formData = new FormData();
    formData.append("file", file);
    formData.append("mediaType", type.toUpperCase());
    xhr.send(formData);
  });

const MediaUploader = ({
  type = "image",
  label,
  value = "",
  onChange,
  onRemove,
  helperText,
}) => {
  const inputRef = useRef(null);
  const videoRef = useRef(null);
  const objectUrlRef = useRef("");
  const [mode, setMode] = useState(value ? "url" : "upload");
  const [urlValue, setUrlValue] = useState(value || "");
  const [previewUrl, setPreviewUrl] = useState(getMediaUrl(value, type));
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  const [duration, setDuration] = useState("");
  const [muted, setMuted] = useState(true);

  useEffect(() => {
    setUrlValue(value || "");
    setPreviewUrl(getMediaUrl(value, type));
    setError("");
  }, [type, value]);

  useEffect(() => {
    return () => {
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
      }
    };
  }, []);

  const accept = type === "video" ? VIDEO_ACCEPT : IMAGE_ACCEPT;
  const hasPreview = Boolean(previewUrl);

  const previewNode = useMemo(() => {
    if (!previewUrl) return null;

    if (type === "video") {
      return (
        <div className="media-preview-shell">
          <video
            ref={videoRef}
            className="media-preview media-preview-video"
            controls
            preload="metadata"
            muted={muted}
            playsInline
            onLoadedMetadata={(event) => {
              setDuration(formatDuration(event.currentTarget.duration));
            }}
          >
            <source src={previewUrl} />
          </video>
          <div className="media-preview-toolbar">
            <span className="media-preview-pill">
              {duration || "0:00"}
            </span>
            <button
              type="button"
              className="btn btn-secondary media-preview-action"
              onClick={() => setMuted((prev) => !prev)}
            >
              {muted ? <VolumeX size={16} /> : <Volume2 size={16} />}
              {muted ? "Unmute" : "Mute"}
            </button>
          </div>
        </div>
      );
    }

    return (
      <img
        className="media-preview media-preview-image"
        src={previewUrl}
        alt={label || "Media preview"}
      />
    );
  }, [duration, label, muted, previewUrl, type]);

  const triggerUpload = () => {
    setMode("upload");
    inputRef.current?.click();
  };

  const handleRemove = () => {
    setError("");
    setProgress(0);
    setPreviewUrl("");
    setUrlValue("");
    setDuration("");
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = "";
    }
    onRemove?.();
    onChange?.("");
  };

  const handleUrlChange = (event) => {
    const nextValue = event.target.value;
    setUrlValue(nextValue);
    setError("");
    setMode("url");
    setPreviewUrl(getMediaUrl(nextValue, type));
    onChange?.(nextValue);
  };

  const commitUrl = () => {
    const trimmed = String(urlValue || "").trim();
    if (!trimmed) {
      handleRemove();
      return;
    }

    if (!isValidMediaUrl(trimmed)) {
      setError("Please enter a valid image/video URL or Google Drive link.");
      return;
    }

    const normalized = normalizeStoredMediaUrl(trimmed, type);
    const preview = getMediaUrl(normalized, type);
    setUrlValue(normalized);
    setPreviewUrl(preview);
    setError("");
    onChange?.(normalized);
  };

  const handleUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!isSupportedFile(file, type)) {
      setError(`Unsupported ${type} file. Please choose a valid ${type === "video" ? "video" : "image"} file.`);
      if (inputRef.current) {
        inputRef.current.value = "";
      }
      return;
    }

    setError("");
    setLoading(true);
    setProgress(0);

    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
    }

    const objectUrl = URL.createObjectURL(file);
    objectUrlRef.current = objectUrl;
    setPreviewUrl(objectUrl);

    try {
      const token = localStorage.getItem("technosthan_access_token");
      const data = await uploadFileWithProgress({
        file,
        type,
        token,
        onProgress: setProgress,
      });

      const storedUrl = normalizeStoredMediaUrl(data.path || data.file?.path || data.url || data.file?.url || "", type);
      const uploadedUrl = getMediaUrl(storedUrl, type);
      if (!uploadedUrl) {
        throw new Error("Upload completed but no media URL was returned.");
      }

      setUrlValue(storedUrl);
      setPreviewUrl(uploadedUrl);
      onChange?.(storedUrl);
      setMode("url");
      setProgress(100);
    } catch (uploadError) {
      setError(uploadError.message || "Upload failed");
      setPreviewUrl(getMediaUrl(value, type));
      setUrlValue(value || "");
    } finally {
      setLoading(false);
      if (inputRef.current) {
        inputRef.current.value = "";
      }
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
        objectUrlRef.current = "";
      }
    }
  };

  const actionLabel = mode === "upload" ? "Choose File" : "Paste URL";

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

      {hasPreview ? (
        <div className="media-preview-wrap">
          {previewNode}
          <div className="media-preview-actions">
            <button type="button" className="btn btn-secondary" onClick={triggerUpload} disabled={loading}>
              <RotateCw size={16} />
              Replace
            </button>
            <button type="button" className="btn btn-secondary" onClick={handleRemove} disabled={!value && !urlValue && !previewUrl}>
              <Trash2 size={16} />
              Remove
            </button>
          </div>
        </div>
      ) : null}

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="sr-only"
        onChange={handleUpload}
      />

      {mode === "upload" ? (
        <div className="media-upload-row">
          <button type="button" className="btn btn-secondary" onClick={triggerUpload} disabled={loading}>
            <CloudUpload size={16} />
            {loading ? "Uploading..." : actionLabel}
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
            onBlur={commitUrl}
            placeholder={
              type === "video"
                ? "Paste a video URL, CDN link, or Google Drive share link"
                : "Paste an image URL, CDN link, or Google Drive share link"
            }
          />
          <button type="button" className="btn btn-secondary" onClick={handleRemove} disabled={!value && !urlValue}>
            <Trash2 size={16} />
            Remove
          </button>
        </div>
      )}

      {loading ? (
        <div className="media-progress-wrap" aria-label="Upload progress">
          <div className="media-progress-track">
            <div className="media-progress-fill" style={{ width: `${progress}%` }} />
          </div>
          <span className="media-progress-label">{progress || 0}%</span>
        </div>
      ) : null}

      {error ? <p className="form-error">{error}</p> : null}
      {!error && !hasPreview && !urlValue ? (
        <div className="media-picker-empty">
          {type === "video" ? <PlayCircle size={18} /> : <ImageIcon size={18} />}
          <span>No media selected</span>
        </div>
      ) : null}
    </div>
  );
};

export default MediaUploader;
