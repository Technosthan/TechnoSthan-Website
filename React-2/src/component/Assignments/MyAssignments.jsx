import { useEffect, useMemo, useState } from "react";
import AdminLayout from "../AdminLayout/AdminLayout";
import AssignmentCard from "./AssignmentCard";
import AssignmentDetails from "./AssignmentDetails";
import AssignmentTable from "./AssignmentTable";
import useAssignmentSocket from "../../hooks/useAssignmentSocket";
import { useToast } from "../Toast/ToastProvider";
import {
  getAssignmentById,
  getMyAssignments,
  submitAssignment,
  updateAssignmentStatus,
} from "../../lib/assignments";
import { useWorkspaceAccess } from "../../context/WorkspaceAccessContext";

const initialFilters = {
  search: "",
  status: "",
  priority: "",
  deadlineState: "",
  sortBy: "deadline",
  sortOrder: "asc",
};

const MyAssignments = () => {
  const { showToast } = useToast();
  const { canAccessFeature } = useWorkspaceAccess();
  const [assignments, setAssignments] = useState([]);
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
  });
  const [loading, setLoading] = useState(true);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const canSubmitAssignments = canAccessFeature("usersCanSubmitAssignments");
  const canUploadFiles =
    canAccessFeature("fileUploadsEnabled") &&
    canAccessFeature("usersCanUploadFiles");

  const fetchAssignments = async (page = pagination.page) => {
    try {
      setLoading(true);
      const response = await getMyAssignments({
        ...filters,
        page,
        limit: pagination.limit,
      });
      setAssignments(response.data);
      setPagination(response.pagination);
      setAnalytics(response.analytics);
    } catch (error) {
      showToast({
        title: "Unable to load assignments",
        message: error.response?.data?.message || "Please try again shortly.",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchCurrentAssignments = async () => {
      setLoading(true);
      try {
        const response = await getMyAssignments({
          ...filters,
          page: 1,
          limit: pagination.limit,
        });
        setAssignments(response.data);
        setPagination(response.pagination);
        setAnalytics(response.analytics);
      } catch (error) {
        showToast({
          title: "Unable to load assignments",
          message: error.response?.data?.message || "Please try again shortly.",
          type: "error",
        });
      } finally {
        setLoading(false);
      }
    };

    void fetchCurrentAssignments();
  }, [filters, pagination.limit, showToast]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters((current) => ({ ...current, search: searchInput.trim() }));
    }, 250);

    return () => clearTimeout(timer);
  }, [searchInput]);

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
        filters.deadlineState,
      ),
    [filters, searchInput],
  );

  const emptyStateMessage = hasActiveFilters
    ? "No matching assignments found"
    : "No assignments yet";

  useAssignmentSocket(
    {
      assignment_created: () => fetchAssignments(),
      assignment_updated: () => fetchAssignments(),
      assignment_completed: () => fetchAssignments(),
    },
    true,
  );

  const metricCards = useMemo(
    () => [
      {
        label: "My Tasks",
        value: analytics.total,
        tone: "from-indigo-500/20 to-indigo-400/5",
      },
      {
        label: "Submitted",
        value: analytics.submitted,
        tone: "from-violet-500/20 to-violet-400/5",
      },
      {
        label: "Completed",
        value: analytics.completed,
        tone: "from-emerald-500/20 to-emerald-400/5",
      },
      {
        label: "Overdue",
        value: analytics.overdue,
        tone: "from-rose-500/20 to-rose-400/5",
      },
    ],
    [analytics],
  );

  const handleSubmission = async (payload) => {
    try {
      await submitAssignment(selectedAssignment._id, payload);
      showToast({
        title: "Submission saved",
        message: "Your assignment progress has been updated.",
        type: "success",
      });
      fetchAssignments();
      if (selectedAssignment?._id) {
        handleOpenAssignment(selectedAssignment);
      }
    } catch (error) {
      showToast({
        title: "Submission failed",
        message: error.response?.data?.message || "Please try again.",
        type: "error",
      });
    }
  };

  const handleStatusChange = async (status, remark) => {
    try {
      await updateAssignmentStatus(selectedAssignment._id, { status, remark });
      showToast({
        title: "Progress updated",
        message: `Assignment marked as ${status.replace("_", " ")}.`,
        type: "success",
      });
      fetchAssignments();
      if (selectedAssignment?._id) {
        handleOpenAssignment(selectedAssignment);
      }
    } catch (error) {
      showToast({
        title: "Status update failed",
        message: error.response?.data?.message || "Please try again.",
        type: "error",
      });
    }
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

  return (
    <AdminLayout
      title="My Assignments"
      subtitle="Track work, submit progress, and review feedback in one focused workspace."
    >
      <div className="space-y-5">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {metricCards.map((card) => (
            <div
              key={card.label}
              className={`rounded-[24px] border border-white/10 bg-gradient-to-br ${card.tone} px-4 py-4 shadow-xl shadow-slate-950/25`}
            >
              <p className="text-xs uppercase tracking-[0.22em] text-slate-400">
                {card.label}
              </p>
              <p className="mt-3 text-3xl font-semibold text-white">
                {card.value}
              </p>
            </div>
          ))}
        </div>

        <AssignmentTable
          assignments={assignments}
          filters={tableFilters}
          onFilterChange={(field, value) => {
            if (field === "search") {
              setSearchInput(value);
              setPagination((current) => ({ ...current, page: 1 }));
              return;
            }

            setFilters((current) => ({ ...current, [field]: value }));
            setPagination((current) => ({ ...current, page: 1 }));
          }}
          onReset={() => {
            setFilters(initialFilters);
            setSearchInput(initialFilters.search);
            setPagination((current) => ({ ...current, page: 1 }));
          }}
          canManageAssignment={() => false}
          onView={handleOpenAssignment}
          loading={loading}
          emptyMessage={emptyStateMessage}
        />

        <div className="grid gap-3 lg:hidden">
          {loading ? (
            <div className="rounded-[22px] border border-white/10 bg-slate-900/70 p-8 text-center text-slate-400">
              Loading your assignments...
            </div>
          ) : assignments.length > 0 ? (
            assignments.map((assignment) => (
              <AssignmentCard
                key={assignment._id}
                assignment={assignment}
                onView={handleOpenAssignment}
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
                  : "When new work is assigned, it will appear here automatically."}
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
      <AssignmentDetails
        assignment={selectedAssignment}
        open={Boolean(selectedAssignment)}
        onClose={() => setSelectedAssignment(null)}
        canManageAssignments={false}
        onStatusChange={handleStatusChange}
        onFeedback={() => {}}
        onSubmitWork={handleSubmission}
        loading={loading}
        canSubmitWork={canSubmitAssignments}
        canUploadFiles={canUploadFiles}
      />
    </AdminLayout>
  );
};

export default MyAssignments;
