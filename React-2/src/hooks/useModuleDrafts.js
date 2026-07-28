import { useCallback, useEffect, useMemo, useState } from "react";
import {
  clearExpiredDraftEntriesForUser,
  deleteDraftEntry,
  getCurrentDraftUserId,
  listDraftEntriesForModule,
} from "../shared/lib/draftPersistence";
import { getStoredUser } from "../utils/auth";

const useModuleDrafts = ({
  module,
  userId: userIdProp,
  version = 1,
}) => {
  const storedUser = getStoredUser();
  const userId = useMemo(
    () => getCurrentDraftUserId(userIdProp || storedUser),
    [storedUser, userIdProp],
  );
  const [drafts, setDrafts] = useState([]);

  const refreshDrafts = useCallback(() => {
    clearExpiredDraftEntriesForUser(userId);
    const nextDrafts = listDraftEntriesForModule(userId, module).filter(
      (draft) => Number(draft.version || 0) === Number(version),
    );
    nextDrafts.sort((a, b) => {
      const left = new Date(b.savedAt || 0).getTime();
      const right = new Date(a.savedAt || 0).getTime();
      return left - right;
    });
    setDrafts(nextDrafts);
    return nextDrafts;
  }, [module, userId, version]);

  useEffect(() => {
    refreshDrafts();
  }, [refreshDrafts]);

  useEffect(() => {
    const handleStorage = () => {
      refreshDrafts();
    };
    window.addEventListener("storage", handleStorage);
    window.addEventListener("focus", handleStorage);
    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("focus", handleStorage);
    };
  }, [refreshDrafts]);

  const removeDraft = useCallback(
    (key) => {
      deleteDraftEntry(key);
      const next = refreshDrafts();
      return next;
    },
    [refreshDrafts],
  );

  const count = drafts.length;

  return {
    drafts,
    count,
    refreshDrafts,
    removeDraft,
    userId,
  };
};

export default useModuleDrafts;
  