import { useCallback, useEffect, useMemo, useState } from "react";
import { AnimatePresence } from "framer-motion";
import {
  BriefcaseBusiness,
  CheckCheck,
  ClipboardList,
  Plus,
  Search,
  TrendingUp,
} from "lucide-react";
import AdminLayout from "../AdminLayout/AdminLayout";
import AssignmentCard from "./AssignmentCard";
import AssignmentDetails from "./AssignmentDetails";
import AssignmentModal from "./AssignmentModal";
import AssignmentTable from "./AssignmentTable";
import useAssignmentSocket from "../../hooks/useAssignmentSocket";
import { useToast } from "../Toast/ToastProvider";
import {
  addAssignmentFeedback,
  createAssignment,
  deleteAssignment,
  getAssignableUsers,
  getAssignmentById,
  getAssignments,
  reviewSubmission,
  transferAssignment as transferAssignmentApi,
  updateAssignment,
  updateAssignmentStatus,
} from "../../lib/assignments";
import { getStoredUser, normalizeRole } from "../../utils/auth";
import { useWorkspaceAccess } from "../../context/WorkspaceAccessContext";
import usePermissions from "../../hooks/usePermissions";
import { PERMISSION_KEYS } from "../../lib/permissionResolver";
import {
  DashboardActionLink,
  EmptyState,
  GlassPanel,
  MiniAnalyticsCard,
  NotificationPanel,
  SectionHeading,
  SkeletonList,
  StatCard,
  Timeline,
} from "../Dashboard/DashboardWidgets";
import {
  buildAssignmentActivity,
  createSparklineData,
} from "../Dashboard/dashboardHelpers";

const initialFilters = {
  search: "",
  status: "",
  priority: "",
  assignedTo: "",
  deadlineState: "",
  sortBy: "createdAt",
  sortOrder: "desc",
};

const AdminAssignments = () => {
  const { showToast } = useToast();
  const { refreshAccess } = useWorkspaceAccess();
  const { hasPermission, getPermissionDetails } = usePermissions();
  const [assignments, setAssignments] = useState([]);
  const [assignees, setAssignees] = useState([]);
  const [filters, setFilters] = useState(initialFilters);
  const [searchInput, setSearchInput] = useState(initialFilters.search);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 8,
    total: 0,
    totalPages: 1,
  });
  const [analytics, setAnalytics] = useState({
    total: 0,
    completed: 0,
    overdue: 0,
    submitted: 0,
    submissions: { submitted: 0, approved: 0, rejected: 0 },
  });
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [editingAssignment, setEditingAssignment] = useState(null);
  const [saving, setSaving] = useState(false);
  const [transferOpen, setTransferOpen] = useState(false);
  const [transferAssignment, setTransferAssignment] = useState(null);
  const [transferRecipient, setTransferRecipient] = useState("");
  const [transferNote, setTransferNote] = useState("");
  const [transferSearch, setTransferSearch] = useState("");
  const [transferSaving, setTransferSaving] = useState(false);

  const currentRole = normalizeRole(getStoredUser()?.role);
  const isAdmin = currentRole === "ADMIN";
  const canCreateAssignments = hasPermission(
    PERMISSION_KEYS.CREATE_ASSIGNMENTS,
  );
  const canEditAssignments = hasPermission(PERMISSION_KEYS.EDIT_ASSIGNMENTS);
  const canDeleteAssignments = hasPermission(
    PERMISSION_KEYS.DELETE_ASSIGNMENTS,
  );
  const canReviewSubmissions = hasPermission(
    PERMISSION_KEYS.REVIEW_SUBMISSIONS,
  );

  // Permission checks for submission interactions
  const canUserSubmitWork = hasPermission(PERMISSION_KEYS.SUBMIT_WORK);
  const canUserUploadFiles = hasPermission(PERMISSION_KEYS.UPLOAD_FILES);

  // Get detailed permission reasons for UI display
  const submitWorkDetails = getPermissionDetails(PERMISSION_KEYS.SUBMIT_WORK);
  const uploadFilesDetails = getPermissionDetails(PERMISSION_KEYS.UPLOAD_FILES);

  const canManageAssignment = (assignment) => {
    if (
      !canEditAssignments &&
      !canDeleteAssignments &&
      !canReviewSubmissions &&
      !isAdmin
    ) {
      return false;
    }

    if (isAdmin) {
      return true;
    }

    if (currentRole !== "HR") {
      return false;
    }

    const assignedById =
      assignment.assignedBy?._id || assignment.assignedBy || "";
    const currentUserId = getStoredUser()?.id || "";
    return String(assignedById) === String(currentUserId);
  };

  const canUserTransferAssignment = (assignment) => {
    // Admin can transfer any assignment
    if (isAdmin) {
      return true;
    }

    // HR can transfer assignments they manage
    if (currentRole === "HR") {
      return canManageAssignment(assignment);
    }

    // USER can only transfer assignments assigned to them
    if (currentRole === "USER") {
      const assignedTo =
        assignment.assignedTo?._id ||
        assignment.assignedTo ||
        assignment.assignedUsers?.[0]?._id ||
        null;
      const currentUserId = getStoredUser()?.id;
      return assignedTo === currentUserId;
    }

    return false;
  };

  const getTransferableUsers = () => {
    if (isAdmin) {
      // Admin can transfer to anyone
      return assignees;
    }

    if (currentRole === "HR") {
      // HR can transfer to HR or USER, not ADMIN
      return assignees.filter((user) => {
        const userRole = normalizeRole(user.role);
        return userRole === "HR" || userRole === "USER";
      });
    }

    if (currentRole === "USER") {
      // USER can only transfer to HR
      return assignees.filter((user) => {
        const userRole = normalizeRole(user.role);
        return userRole === "HR";
      });
    }

    return [];
  };

  const filteredTransferableUsers = useMemo(() => {
    const currentAssigneeId =
      transferAssignment?.assignedTo?._id ||
      transferAssignment?.assignedTo ||
      transferAssignment?.assignedUsers?.[0]?._id ||
      "";
    const normalizedSearch = transferSearch.trim().toLowerCase();

    return getTransferableUsers().filter((user) => {
      if (!user?._id || String(user._id) === String(currentAssigneeId)) {
        return false;
      }

      if (!normalizedSearch) {
        return true;
      }

      return [user.name, user.email, user.role]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(normalizedSearch));
    });
  }, [assignees, currentRole, isAdmin, transferAssignment, transferSearch]);

  const fetchAssignments = useCallback(
    async (page = pagination.page) => {
      try {
        setLoading(true);
        const assignmentsResponse = await getAssignments({
          ...filters,
          page,
          limit: pagination.limit,
        });

        setAssignments(assignmentsResponse.data);
        setPagination(assignmentsResponse.pagination);
        setAnalytics(assignmentsResponse.analytics);
      } catch (error) {
        showToast({
          title: "Assignments unavailable",
          message:
            error.response?.data?.message ||
            "We couldn't load assignments right now.",
          type: "error",
        });
      } finally {
        setLoading(false);
      }
    },
    [filters, pagination.limit, pagination.page, showToast],
  );

  const fetchAssignees = useCallback(async () => {
    try {
      const response = await getAssignableUsers();
      setAssignees(response.data);
    } catch (error) {
      showToast({
        title: "Unable to load assignees",
        message:
          error.response?.data?.message || "Please try again in a moment.",
        type: "error",
      });
    }
  }, [showToast]);

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    fetchAssignees();
  }, [fetchAssignees]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters((current) => ({ ...current, search: searchInput.trim() }));
    }, 250);

    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    fetchAssignments(1);
  }, [fetchAssignments]);
  /* eslint-enable react-hooks/set-state-in-effect */

  useAssignmentSocket(
    {
      assignment_created: () => fetchAssignments(),
      assignment_updated: () => fetchAssignments(),
      assignment_deleted: () => fetchAssignments(),
      assignment_completed: () => fetchAssignments(),
      assignment_transferred: () => fetchAssignments(),
      submission_created: () => fetchAssignments(),
      submission_reviewed: () => fetchAssignments(),
    },
    true,
  );

  const metricCards = useMemo(
    () => [
      {
        label: "Total Assignments",
        value: analytics.total,
        tone: "from-indigo-500/20 to-indigo-400/5",
        trend: `${analytics.completed} completed`,
        hint: "Across the current workspace",
        icon: BriefcaseBusiness,
      },
      {
        label: "Pending Reviews",
        value: analytics.submissions?.submitted ?? analytics.submitted,
        tone: "from-violet-500/20 to-violet-400/5",
        trend: `${analytics.submissions?.approved ?? 0} approved`,
        hint: "Waiting for HR or admin feedback",
        icon: ClipboardList,
      },
      {
        label: "Approved",
        value: analytics.submissions?.approved ?? analytics.completed,
        tone: "from-emerald-500/20 to-emerald-400/5",
        trend: `${analytics.total ? Math.round(((analytics.submissions?.approved ?? analytics.completed) / analytics.total) * 100) : 0}% success`,
        hint: "Moved successfully through review",
        icon: CheckCheck,
      },
      {
        label: "Rejected / Overdue",
        value: (analytics.submissions?.rejected ?? 0) + analytics.overdue,
        tone: "from-rose-500/20 to-rose-400/5",
        trend: `${analytics.overdue} overdue`,
        hint: "Needs revision or schedule attention",
        icon: TrendingUp,
      },
    ],
    [analytics],
  );

  const analyticsCards = useMemo(
    () => [
      {
        label: "Assignment Completion",
        value:
          analytics.total > 0
            ? `${Math.round((analytics.completed / analytics.total) * 100)}%`
            : "0%",
        delta: `${analytics.completed} completed`,
        chartData: createSparklineData([
          analytics.total,
          analytics.completed,
          analytics.submissions?.approved ?? 0,
          analytics.overdue,
        ]),
        tone: "#22d3ee",
      },
      {
        label: "Review Health",
        value: `${analytics.submissions?.submitted ?? 0}`,
        delta: `${analytics.submissions?.rejected ?? 0} blocked`,
        chartData: createSparklineData([
          analytics.submissions?.submitted ?? 0,
          analytics.submissions?.approved ?? 0,
          analytics.submissions?.rejected ?? 0,
          analytics.overdue,
        ]),
        tone: "#818cf8",
      },
    ],
    [analytics],
  );

  const handleFilterChange = (field, value) => {
    if (field === "search") {
      setSearchInput(value);
      setPagination((current) => ({ ...current, page: 1 }));
      return;
    }

    setFilters((current) => ({ ...current, [field]: value }));
    setPagination((current) => ({ ...current, page: 1 }));
  };

  const handleOpenAssignment = async (assignment) => {
    try {
      const response = await getAssignmentById(assignment._id);
      setSelectedAssignment(response.data);
    } catch (error) {
      showToast({
        title: "Unable to open assignment",
        message: error.response?.data?.message || "Please try again.",
        type: "error",
      });
    }
  };

  const handleOpenTransfer = (assignment) => {
    setTransferAssignment(assignment);

    const currentAssignmentAssignee =
      assignment.assignedTo?._id ||
      assignment.assignedTo ||
      assignment.assignedUsers?.[0]?._id ||
      "";

    setTransferRecipient(currentAssignmentAssignee || "");
    setTransferNote("");
    setTransferSearch("");
    setTransferOpen(true);
  };

  const closeTransferModal = () => {
    setTransferOpen(false);
    setTransferAssignment(null);
    setTransferRecipient("");
    setTransferNote("");
    setTransferSearch("");
    setTransferSaving(false);
  };

  const handleTransferAssignment = async () => {
    if (!transferAssignment) {
      return;
    }

    if (!transferRecipient) {
      showToast({
        title: "Choose a recipient",
        message: "Please select a user to transfer the assignment to.",
        type: "warning",
      });
      return;
    }

    try {
      setTransferSaving(true);
      const response = await transferAssignmentApi(transferAssignment._id, {
        assignedTo: transferRecipient,
        note: transferNote,
      });

      showToast({
        title: "Assignment transferred",
        message: response.message,
        type: "success",
      });
      closeTransferModal();
      fetchAssignments();
      if (selectedAssignment?._id === transferAssignment._id) {
        if (isAdmin) {
          setSelectedAssignment(response.data);
        } else {
          setSelectedAssignment(null);
        }
      }
    } catch (error) {
      showToast({
        title: "Transfer failed",
        message: error.response?.data?.message || "Please try again.",
        type: "error",
      });
    } finally {
      setTransferSaving(false);
    }
  };

  const handleSaveAssignment = async (payload) => {
    try {
      setSaving(true);
      const response = editingAssignment
        ? await updateAssignment(editingAssignment._id, payload)
        : await createAssignment(payload);

      showToast({
        title: editingAssignment ? "Assignment updated" : "Assignment created",
        message: response.message,
        type: "success",
      });
      setModalOpen(false);
      setEditingAssignment(null);
      fetchAssignments();
    } catch (error) {
      showToast({
        title: "Unable to save assignment",
        message:
          error.response?.data?.message ||
          "Please review the form and try again.",
        type: "error",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAssignment = async (assignment) => {
    if (!window.confirm(`Delete "${assignment.title}"?`)) {
      return;
    }

    try {
      await deleteAssignment(assignment._id);
      showToast({
        title: "Assignment deleted",
        message: "The assignment has been removed.",
        type: "success",
      });
      fetchAssignments();
    } catch (error) {
      showToast({
        title: "Delete failed",
        message: error.response?.data?.message || "Please try again.",
        type: "error",
      });
    }
  };

  const handleStatusChange = async (status, remark) => {
    try {
      await updateAssignmentStatus(selectedAssignment._id, { status, remark });
      showToast({
        title: "Status updated",
        message: `Assignment marked as ${status.replace("_", " ")}.`,
        type: "success",
      });
      fetchAssignments();
      handleOpenAssignment(selectedAssignment);
    } catch (error) {
      showToast({
        title: "Status update failed",
        message: error.response?.data?.message || "Please try again.",
        type: "error",
      });
    }
  };

  const handleFeedback = async (payload) => {
    try {
      await addAssignmentFeedback(selectedAssignment._id, payload);
      showToast({
        title: "Feedback sent",
        message: "The assignment feedback has been added.",
        type: "success",
      });
      fetchAssignments();
      handleOpenAssignment(selectedAssignment);
    } catch (error) {
      showToast({
        title: "Feedback failed",
        message: error.response?.data?.message || "Please try again.",
        type: "error",
      });
    }
  };

  const handleReviewSubmission = async (submissionId, payload) => {
    try {
      await reviewSubmission(submissionId, payload);
      showToast({
        title: "Submission reviewed",
        message: `Submission marked as ${payload.status}.`,
        type: "success",
      });
      fetchAssignments();
      if (selectedAssignment?._id) {
        handleOpenAssignment(selectedAssignment);
      }
    } catch (error) {
      showToast({
        title: "Review failed",
        message: error.response?.data?.message || "Please try again.",
        type: "error",
      });
    }
  };

  const tableFilters = useMemo(
    () => ({ ...filters, search: searchInput }),
    [filters, searchInput],
  );

  const hasActiveFilters = useMemo(
    () =>
      Boolean(
        searchInput.trim() ||
        filters.status ||
        filters.priority ||
        filters.assignedTo ||
        filters.deadlineState,
      ),
    [filters, searchInput],
  );

  const emptyStateMessage = hasActiveFilters
    ? "No matching assignments found"
    : "No assignments yet";

  const activityItems = useMemo(
    () =>
      assignments
        .flatMap((assignment) =>
          buildAssignmentActivity(assignment, isAdmin ? "Admin" : "HR"),
        )
        .sort((a, b) => new Date(b.time) - new Date(a.time))
        .slice(0, 6),
    [assignments, isAdmin],
  );

  const notifications = useMemo(
    () =>
      [
        {
          id: "pending",
          title: "Pending review summary",
          message: `${analytics.submissions?.submitted ?? 0} submissions are waiting for action.`,
          time: new Date().toISOString(),
          tone: "amber",
        },
        {
          id: "overdue",
          title: "Deadline watch",
          message: `${analytics.overdue} assignments are currently overdue.`,
          time: new Date().toISOString(),
          tone: "rose",
        },
      ].filter((item) =>
        item.id === "pending"
          ? (analytics.submissions?.submitted ?? 0) > 0
          : analytics.overdue > 0,
      ),
    [analytics],
  );

  return (
    <AdminLayout
      title={isAdmin ? "Assignment Center" : "HR Assignment Center"}
      subtitle={
        isAdmin
          ? "Create, track, review, and prioritize assignments in one enterprise-grade workspace."
          : "Manage user assignments, review delivery, and keep the queue moving from one focused workspace."
      }
    >
      <div className="space-y-5 pb-24 lg:pb-0">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {metricCards.map((card, index) => (
            <StatCard key={card.label} delay={index * 0.05} {...card} />
          ))}
        </div>

        <div className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
          <GlassPanel compact>
            <SectionHeading
              eyebrow="Completion Analytics"
              title="Team productivity"
              description="Monitor delivery rates, review flow, and the health of your assignment queue."
            />
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {analyticsCards.map((card) => (
                <MiniAnalyticsCard key={card.label} {...card} />
              ))}
            </div>
          </GlassPanel>

          <GlassPanel compact>
            <SectionHeading
              eyebrow="Queue alerts"
              title="Status overview"
              description="Important updates, overdue counts, and pending reviews in one place."
            />
            <div className="mt-4">
              <NotificationPanel items={notifications} />
            </div>
          </GlassPanel>
        </div>

        <GlassPanel>
          <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
            <SectionHeading
              eyebrow="Assignment Operations"
              title="Manage the current queue"
              description="Compact filters, stronger progress visibility, and clearer action states without changing the existing workflow."
            />
            {canCreateAssignments ? (
              <button
                className="hidden rounded-full bg-indigo-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition hover:bg-indigo-400 sm:inline-flex"
                onClick={() => {
                  setEditingAssignment(null);
                  setModalOpen(true);
                }}
              >
                Create New
              </button>
            ) : null}
          </div>

          <div className="mt-5">
            <AssignmentTable
              assignments={assignments}
              filters={tableFilters}
              onFilterChange={handleFilterChange}
              onReset={() => {
                setFilters(initialFilters);
                setSearchInput(initialFilters.search);
                setPagination((current) => ({ ...current, page: 1 }));
              }}
              assignees={assignees}
              showAssigneeFilter
              canManageAssignment={canManageAssignment}
              canEditAssignment={(assignment) =>
                canEditAssignments && canManageAssignment(assignment)
              }
              canDeleteAssignment={(assignment) =>
                canDeleteAssignments && canManageAssignment(assignment)
              }
              canTransferAssignment={canUserTransferAssignment}
              onView={handleOpenAssignment}
              onEdit={(assignment) => {
                setEditingAssignment(assignment);
                setModalOpen(true);
              }}
              onTransfer={handleOpenTransfer}
              onDelete={handleDeleteAssignment}
              loading={loading}
              emptyMessage={emptyStateMessage}
            />
          </div>

          <div className="mt-5 grid gap-3 lg:hidden">
            {loading ? (
              <div className="rounded-[22px] border border-white/10 bg-slate-900/70 p-8 text-center text-slate-400">
                Loading assignments...
              </div>
            ) : assignments.length > 0 ? (
              assignments.map((assignment) => (
                <AssignmentCard
                  key={assignment._id}
                  assignment={assignment}
                  canManageAssignment={canManageAssignment}
                  canEditAssignment={(item) =>
                    canEditAssignments && canManageAssignment(item)
                  }
                  canDeleteAssignment={(item) =>
                    canDeleteAssignments && canManageAssignment(item)
                  }
                  canTransferAssignment={canUserTransferAssignment}
                  onView={handleOpenAssignment}
                  onEdit={(item) => {
                    setEditingAssignment(item);
                    setModalOpen(true);
                  }}
                  onTransfer={handleOpenTransfer}
                  onDelete={handleDeleteAssignment}
                />
              ))
            ) : (
              <div className="rounded-[22px] border border-dashed border-white/10 bg-slate-900/70 p-10 text-center">
                <h3 className="text-xl font-semibold text-white">
                  {emptyStateMessage}
                </h3>
                <p className="mt-3 text-sm text-slate-400">
                  {hasActiveFilters
                    ? "Try changing the search or filters."
                    : "When new work is created, it will appear here automatically."}
                </p>
              </div>
            )}
          </div>

          <div className="mt-4 flex flex-col gap-3 rounded-[18px] border border-white/10 bg-slate-900/60 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-slate-400">
              Showing page {pagination.page} of {pagination.totalPages} with{" "}
              {pagination.total} total assignments
            </p>
            <div className="flex gap-3">
              <button
                className="rounded-full border border-white/10 px-4 py-2 text-sm text-slate-300 transition disabled:cursor-not-allowed disabled:border-white/5 disabled:text-slate-600"
                disabled={pagination.page <= 1}
                onClick={() => fetchAssignments(pagination.page - 1)}
              >
                Previous
              </button>
              <button
                className="rounded-full border border-white/10 px-4 py-2 text-sm text-slate-300 transition disabled:cursor-not-allowed disabled:border-white/5 disabled:text-slate-600"
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => fetchAssignments(pagination.page + 1)}
              >
                Next
              </button>
            </div>
          </div>
        </GlassPanel>

        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(360px,0.9fr)]">
          <GlassPanel>
            <SectionHeading
              eyebrow="Recent Activity"
              title="Assignment timeline"
              description="See how the latest work is progressing across the queue."
            />
            <div className="mt-4">
              <Timeline
                items={activityItems}
                emptyTitle="No assignment activity yet"
                emptyMessage="New assignment, submission, and review events will show up here."
              />
            </div>
          </GlassPanel>

          <GlassPanel compact>
            <SectionHeading
              eyebrow="Pending Review Summary"
              title="Current priorities"
              action={
                canCreateAssignments ? (
                  <DashboardActionLink
                    onClick={() => {
                      setEditingAssignment(null);
                      setModalOpen(true);
                    }}
                  >
                    Create assignment
                  </DashboardActionLink>
                ) : null
              }
            />
            <div className="mt-4 space-y-3">
              {loading ? (
                <SkeletonList rows={3} compact />
              ) : assignments.length === 0 ? (
                <EmptyState
                  title="No assignments in the queue"
                  message="Once work is created, this panel will highlight recent priorities and pending approvals."
                />
              ) : (
                assignments.slice(0, 4).map((assignment) => (
                  <div
                    key={assignment._id}
                    className="rounded-[22px] border border-white/10 bg-slate-950/55 px-4 py-4"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-semibold text-white">
                        {assignment.title}
                      </p>
                    </div>
                    <p className="mt-2 text-sm text-slate-400">
                      {assignment.assignedTo?.name || assignment.assignedToRole}
                    </p>
                    <p className="mt-2 text-xs text-slate-500">
                      {assignment.status === "submitted"
                        ? "Pending review"
                        : assignment.status === "rejected"
                          ? "Needs revision"
                          : assignment.status === "completed"
                            ? "Approved"
                            : "In progress"}
                    </p>
                  </div>
                ))
              )}
            </div>
          </GlassPanel>
        </div>
      </div>

      {canCreateAssignments ? (
        <button
          className="fixed bottom-4 right-4 z-40 inline-flex h-14 items-center gap-2 rounded-full bg-indigo-500 px-5 text-sm font-semibold text-white shadow-2xl shadow-indigo-500/30 transition hover:bg-indigo-400 lg:hidden"
          onClick={() => {
            setEditingAssignment(null);
            setModalOpen(true);
          }}
        >
          <Plus size={18} />
          Create Assignment
        </button>
      ) : null}

      <AssignmentModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingAssignment(null);
        }}
        onSubmit={handleSaveAssignment}
        assignees={assignees}
        assignment={editingAssignment}
        loading={saving}
        canManageAllRoles={isAdmin}
      />

      <AnimatePresence>
        {transferOpen && (
          <div
            className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/95 px-4 py-6 backdrop-blur"
            role="dialog"
            aria-modal="true"
            aria-labelledby="transfer-assignment-title"
          >
            <div className="relative w-full max-w-2xl overflow-hidden rounded-[32px] border border-white/10 bg-slate-900/95 shadow-2xl shadow-slate-950/40">
              <div className="flex flex-col gap-3 border-b border-white/10 bg-slate-950/80 px-6 py-5">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-3xl bg-emerald-500/10 text-emerald-200">
                      <ArrowRightLeft size={20} />
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
                        Transfer Assignment
                      </p>
                      <h2
                        id="transfer-assignment-title"
                        className="mt-1 text-lg font-semibold text-white"
                      >
                        {transferAssignment?.title || "Transfer work"}
                      </h2>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="rounded-full border border-white/10 bg-slate-950/80 p-2 text-slate-300 transition hover:border-white/20 hover:bg-slate-900"
                    onClick={closeTransferModal}
                  >
                    <span className="sr-only">Close transfer dialog</span>✕
                  </button>
                </div>
              </div>

              <div className="space-y-5 px-6 py-6">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-300">
                    Assignment
                  </label>
                  <div className="rounded-2xl border border-white/10 bg-slate-950/75 px-4 py-3">
                    <p className="text-sm text-white">
                      {transferAssignment?.title}
                    </p>
                    <p className="mt-1 text-xs text-slate-400">
                      {transferAssignment?.assignedTo?.name ||
                        transferAssignment?.assignedToRole ||
                        "Unassigned"}
                    </p>
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-300">
                    Search user
                  </label>
                  <div className="relative">
                    <Search
                      className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
                      size={16}
                    />
                    <input
                      className="w-full rounded-2xl border border-white/10 bg-slate-950/75 px-4 py-3 pl-11 text-sm text-white outline-none transition focus:border-emerald-400/60"
                      value={transferSearch}
                      onChange={(event) => setTransferSearch(event.target.value)}
                      placeholder="Search by name, email, or role"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-300">
                    New assignee
                  </label>
                  <select
                    className="w-full rounded-2xl border border-white/10 bg-slate-950/75 px-4 py-3 text-sm text-white outline-none transition focus:border-emerald-400/60"
                    value={transferRecipient}
                    onChange={(event) =>
                      setTransferRecipient(event.target.value)
                    }
                  >
                    <option value="">Select user</option>
                    {filteredTransferableUsers.map((user) => (
                      <option key={user._id} value={user._id}>
                        {user.name} — {user.email}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-300">
                    Transfer reason
                  </label>
                  <textarea
                    className="min-h-[140px] w-full rounded-2xl border border-white/10 bg-slate-950/75 px-4 py-3 text-sm text-white outline-none transition focus:border-emerald-400/60"
                    value={transferNote}
                    onChange={(event) => setTransferNote(event.target.value)}
                    placeholder="Optional reason for the transfer"
                  />
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    className="rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm font-semibold text-slate-200 transition hover:border-white/20 hover:bg-slate-900"
                    onClick={closeTransferModal}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="inline-flex items-center justify-center rounded-2xl bg-emerald-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
                    onClick={handleTransferAssignment}
                    disabled={transferSaving}
                  >
                    {transferSaving ? "Transferring..." : "Transfer Assignment"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>

      <AssignmentDetails
        assignment={selectedAssignment}
        open={Boolean(selectedAssignment)}
        onClose={() => setSelectedAssignment(null)}
        canManageAssignments={
          selectedAssignment && canReviewSubmissions
            ? canManageAssignment(selectedAssignment)
            : false
        }
        onStatusChange={handleStatusChange}
        onFeedback={handleFeedback}
        onReviewSubmission={handleReviewSubmission}
        onSubmitWork={() => {}}
        loading={saving}
        canUploadFiles={canUserUploadFiles}
        canSubmitWork={canUserSubmitWork}
        showSubmissionActions={canUserSubmitWork || canUserUploadFiles}
        submitWorkDenyReason={
          !canUserSubmitWork && submitWorkDetails?.reason
            ? submitWorkDetails.reason
            : null
        }
        uploadFilesDenyReason={
          !canUserUploadFiles && uploadFilesDetails?.reason
            ? uploadFilesDetails.reason
            : null
        }
      />
    </AdminLayout>
  );
};

export default AdminAssignments;
