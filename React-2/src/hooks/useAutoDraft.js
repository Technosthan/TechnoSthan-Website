import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  clearDraft,
  getDraftMetadata,
  loadDraft,
  saveDraft,
} from "../shared/lib/draftPersistence";

const DEFAULT_DEBOUNCE_MS = 1000;
const DEFAULT_EXPIRY_MS = 7 * 24 * 60 * 60 * 1000;

const useAutoDraft = ({
  key,
  data,
  enabled = true,
  debounceMs = DEFAULT_DEBOUNCE_MS,
  version = 1,
  module,
  mode,
  recordId = null,
  userId = "anonymous",
  expiresInMs = DEFAULT_EXPIRY_MS,
  onRestore,
  onClear,
  onStatusChange,
}) => {
  const [draftSnapshot, setDraftSnapshot] = useState(() =>
    key ? loadDraft(key, version) : null,
  );
  const [draftStatus, setDraftStatus] = useState("idle");
  const [draftError, setDraftError] = useState("");
  const [externalUpdateAt, setExternalUpdateAt] = useState(null);
  const saveTimerRef = useRef(null);
  const recoveryPendingRef = useRef(Boolean(draftSnapshot));

  const draftMeta = useMemo(() => {
    if (!key) return null;
    return getDraftMetadata(key);
  }, [key, draftSnapshot, externalUpdateAt]);

  const emitStatus = useCallback(
    (nextStatus) => {
      setDraftStatus(nextStatus);
      if (typeof onStatusChange === "function") {
        onStatusChange(nextStatus);
      }
    },
    [onStatusChange],
  );

  const markRecoveryHandled = useCallback(() => {
    recoveryPendingRef.current = false;
  }, []);

  const clearCurrentDraft = useCallback(() => {
    if (!key) return;
    clearDraft(key);
    setDraftSnapshot(null);
    setDraftError("");
    emitStatus("cleared");
    if (typeof onClear === "function") {
      onClear();
    }
  }, [emitStatus, key, onClear]);

  const discardCurrentDraft = useCallback(() => {
    clearCurrentDraft();
    markRecoveryHandled();
  }, [clearCurrentDraft, markRecoveryHandled]);

  const restoreCurrentDraft = useCallback(
    (applyDraft) => {
      if (!draftSnapshot?.data) return false;
      if (typeof applyDraft === "function") {
        applyDraft(draftSnapshot.data, draftSnapshot);
      }
      markRecoveryHandled();
      emitStatus("restored");
      if (typeof onRestore === "function") {
        onRestore(draftSnapshot.data, draftSnapshot);
      }
      return true;
    },
    [draftSnapshot, emitStatus, markRecoveryHandled, onRestore],
  );

  useEffect(() => {
    if (!key) {
      setDraftSnapshot(null);
      recoveryPendingRef.current = false;
      return undefined;
    }

    const nextDraft = loadDraft(key, version);
    setDraftSnapshot(nextDraft);
    recoveryPendingRef.current = Boolean(nextDraft);
    if (!nextDraft) {
      emitStatus("idle");
    } else {
      emitStatus("recovery-needed");
    }
    return undefined;
  }, [emitStatus, key, version]);

  useEffect(() => {
    if (!key || !enabled) {
      return undefined;
    }

    if (recoveryPendingRef.current) {
      return undefined;
    }

    if (saveTimerRef.current) {
      window.clearTimeout(saveTimerRef.current);
    }

    saveTimerRef.current = window.setTimeout(() => {
      const result = saveDraft({
        key,
        module,
        mode,
        recordId,
        userId,
        data,
        version,
        expiresInMs,
      });

      if (result.success) {
        setDraftSnapshot(result.payload);
        setDraftError("");
        emitStatus("saved");
      } else {
        setDraftError(
          result.error?.name === "QuotaExceededError"
            ? "Draft could not be saved in this browser."
            : "Draft could not be saved in this browser.",
        );
        emitStatus("error");
      }
    }, Math.max(0, debounceMs));

    return () => {
      if (saveTimerRef.current) {
        window.clearTimeout(saveTimerRef.current);
      }
    };
  }, [data, debounceMs, enabled, expiresInMs, key, module, mode, recordId, userId, version]);

  useEffect(() => {
    if (!key || !enabled) {
      return undefined;
    }

    const flushDraft = () => {
      if (recoveryPendingRef.current) {
        return;
      }

      const result = saveDraft({
        key,
        module,
        mode,
        recordId,
        userId,
        data,
        version,
        expiresInMs,
      });

      if (result.success) {
        setDraftSnapshot(result.payload);
        setDraftError("");
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        flushDraft();
      }
    };

    const handleBeforeUnload = () => {
      flushDraft();
    };

    const handleStorage = (event) => {
      if (event.key !== key) {
        return;
      }

      const nextDraft = loadDraft(key, version);
      setDraftSnapshot(nextDraft);
      if (nextDraft?.savedAt) {
        setExternalUpdateAt(nextDraft.savedAt);
      }
      if (nextDraft && !recoveryPendingRef.current) {
        emitStatus("external-update");
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("storage", handleStorage);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("storage", handleStorage);
      if (saveTimerRef.current) {
        window.clearTimeout(saveTimerRef.current);
      }
    };
  }, [data, enabled, expiresInMs, emitStatus, key, module, mode, recordId, userId, version]);

  return {
    draftSnapshot,
    draftMeta,
    draftStatus,
    draftError,
    hasDraft: Boolean(draftSnapshot),
    externalUpdateAt,
    restoreDraft: restoreCurrentDraft,
    discardDraft: discardCurrentDraft,
    clearDraft: clearCurrentDraft,
    markRecoveryHandled,
  };
};

export default useAutoDraft;
