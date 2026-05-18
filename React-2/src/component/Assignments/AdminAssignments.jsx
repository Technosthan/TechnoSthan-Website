import { motion } from "framer-motion";
import { useCallback, useEffect, useMemo, useState } from "react";
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
  updateAssignment,
  updateAssignmentStatus,
} from "../../lib/assignments";
import { getStoredUser, normalizeRole } from "../../utils/auth";
import { useWorkspaceAccess } from "../../context/WorkspaceAccessContext";

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
  const { canAccessFeature } = useWorkspaceAccess();
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

  const currentRole = normalizeRole(getStoredUser()?.role);
  const isAdmin = currentRole === "ADMIN";
  const canCreateAssignments = canAccessFeature("hrCanCreateAssignments");
  const canEditAssignments = canAccessFeature("hrCanEditOwnAssignments");
  const canDeleteAssignments = canAccessFeature("hrCanDeleteAssignments");
  const canReviewSubmissions =
    canAccessFeature("assignmentReviewsEnabled") &&
    canAccessFeature("hrCanReviewSubmissions");
  const MotionCard = motion.div;

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

    const creatorRole = normalizeRole(
      assignment.creatorRole || assignment.assignedBy?.role,
    );
    return creatorRole === "HR";
  };

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

  // Debounce live search input so the user can type freely without losing focus.
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
      },
      {
        label: "Pending Reviews",
        value: analytics.submissions?.submitted ?? analytics.submitted,
        tone: "from-violet-500/20 to-violet-400/5",
      },
      {
        label: "Approved",
        value: analytics.submissions?.approved ?? analytics.completed,
        tone: "from-emerald-500/20 to-emerald-400/5",
      },
      {
        label: "Rejected / Overdue",
        value: (analytics.submissions?.rejected ?? 0) + analytics.overdue,
        tone: "from-rose-500/20 to-rose-400/5",
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

  return (
    <AdminLayout
      title={isAdmin ? "Assignment Center" : "HR Assignment Center"}
      subtitle={
        isAdmin
          ? "Create, track, and review assignments in one focused workspace."
          : "Manage user assignments and review delivery in one focused workspace."
      }
    >
      <div className="space-y-5">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {metricCards.map((card, index) => (
            <MotionCard
              key={card.label}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`rounded-[24px] border border-white/10 bg-gradient-to-br ${card.tone} px-4 py-4 shadow-xl shadow-slate-950/25`}
            >
              <p className="text-xs uppercase tracking-[0.22em] text-slate-400">
                {card.label}
              </p>
              <p className="mt-3 text-3xl font-semibold text-white">
                {card.value}
              </p>
            </MotionCard>
          ))}
        </div>

        <div className="flex items-center justify-end">
          {canCreateAssignments && (
            <button
              className="rounded-full bg-indigo-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition hover:bg-indigo-400"
              onClick={() => {
                setEditingAssignment(null);
                setModalOpen(true);
              }}
            >
              Create New
            </button>
          )}
        </div>

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
          onView={handleOpenAssignment}
          onEdit={(assignment) => {
            setEditingAssignment(assignment);
            setModalOpen(true);
          }}
          onDelete={handleDeleteAssignment}
          loading={loading}
          emptyMessage={emptyStateMessage}
        />

        <div className="grid gap-3 lg:hidden">
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
                onView={handleOpenAssignment}
                onEdit={(item) => {
                  setEditingAssignment(item);
                  setModalOpen(true);
                }}
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
                  : "Create a new assignment to get started."}
              </p>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-3 rounded-[18px] border border-white/10 bg-slate-900/60 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-slate-400">
            Page {pagination.page} of {pagination.totalPages} |{" "}
            {pagination.total} assignments
          </p>
          <div className="flex gap-3">
            <button
              className="rounded-full border border-white/10 px-4 py-2 text-sm text-slate-300 disabled:opacity-40"
              disabled={pagination.page <= 1}
              onClick={() => fetchAssignments(pagination.page - 1)}
            >
              Previous
            </button>
            <button
              className="rounded-full border border-white/10 px-4 py-2 text-sm text-slate-300 disabled:opacity-40"
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => fetchAssignments(pagination.page + 1)}
            >
              Next
            </button>
          </div>
        </div>
      </div>

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
        canUploadFiles={false}
        showSubmissionActions={false}
      />
    </AdminLayout>
  );
};

export default AdminAssignments;
