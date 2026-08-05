import { useEffect } from "react";
import { io } from "socket.io-client";
import { getStoredToken } from "../utils/auth";

const SOCKET_URL = import.meta.env.VITE_API_BASE || "http://localhost:5000";

const useAssignmentSocket = (handlers = {}, enabled = true) => {
  const onCreated = handlers.assignment_created;
  const onUpdated = handlers.assignment_updated;
  const onDeleted = handlers.assignment_deleted;
  const onCompleted = handlers.assignment_completed;
  const onTransferred = handlers.assignment_transferred;
  const onSubmissionCreated = handlers.submission_created;
  const onSubmissionReviewed = handlers.submission_reviewed;

  useEffect(() => {
    if (!enabled) {
      return undefined;
    }

    const token = getStoredToken();
    if (!token) {
      return undefined;
    }

    const socket = io(SOCKET_URL, {
      transports: ["websocket"],
      auth: { token },
    });

    if (onCreated) {
      socket.on("assignment_created", onCreated);
    }

    if (onUpdated) {
      socket.on("assignment_updated", onUpdated);
    }

    if (onDeleted) {
      socket.on("assignment_deleted", onDeleted);
    }

    if (onCompleted) {
      socket.on("assignment_completed", onCompleted);
    }

    if (onTransferred) {
      socket.on("assignment_transferred", onTransferred);
    }

    if (onSubmissionCreated) {
      socket.on("submission_created", onSubmissionCreated);
    }

    if (onSubmissionReviewed) {
      socket.on("submission_reviewed", onSubmissionReviewed);
    }

    return () => {
      socket.disconnect();
    };
  }, [
    enabled,
    onCompleted,
    onCreated,
    onDeleted,
    onSubmissionCreated,
    onSubmissionReviewed,
    onTransferred,
    onUpdated,
  ]);
};

export default useAssignmentSocket;
