import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import toast from "react-hot-toast";
import {
  ArrowDown,
  ArrowUp,
  BookOpen,
  Cpu,
  Eye,
  GraduationCap,
  Image as ImageIcon,
  Leaf,
  Link2,
  Move,
  Monitor,
  Pencil,
  Plus,
  RefreshCcw,
  Save,
  Sparkles,
  Sprout,
  Tractor,
  Trash2,
  ToggleLeft,
  ToggleRight,
  Upload,
  Users,
  X,
  Video,
} from "lucide-react";
import { useTheme } from "../../contexts/ThemeContext";
import {
  createAdminEmpoweringCard,
  deleteAdminEmpoweringCard,
  getAdminEmpoweringCards,
  reorderAdminEmpoweringCards,
  updateAdminEmpoweringCard,
  updateAdminEmpoweringCardStatus,
} from "../empoweringCards/empoweringCardsApi";
import {
  CARD_ICONS,
  DEFAULT_CARD_ICON,
  isSafeCardButtonLink,
} from "../empoweringCards/empoweringCards.utils";

const EMPTY_FORM = {
  title: "",
  description: "",
  mediaType: "image",
  iconKey: "tractor",
  buttonText: "Learn More",
  buttonLink: "#",
  openInNewTab: false,
  displayOrder: 0,
  isActive: true,
  mediaUrl: "",
  mediaPublicId: "",
  mediaResourceType: "image",
  thumbnailUrl: "",
  thumbnailPublicId: "",
  thumbnailResourceType: "image",
};

const IMAGE_ACCEPT = "image/jpeg,image/png,image/webp,image/gif";
const VIDEO_ACCEPT = "video/mp4,video/webm,video/quicktime";

const ICON_OPTIONS = [
  { value: "tractor", label: "Tractor", icon: Tractor },
  { value: "leaf", label: "Leaf", icon: Leaf },
  { value: "book", label: "Book", icon: BookOpen },
  { value: "users", label: "Users", icon: Users },
  { value: "monitor", label: "Monitor", icon: Monitor },
  { value: "graduation", label: "Graduation", icon: GraduationCap },
  { value: "cpu", label: "Cpu", icon: Cpu },
  { value: "sprout", label: "Sprout", icon: Sprout },
  { value: "sparkles", label: "Sparkles", icon: Sparkles },
];

const getCardId = (card = {}, index = 0) => card?.id || card?._id || String(index);

const createEmptyForm = (order = 0) => ({
  ...EMPTY_FORM,
  displayOrder: order,
});

const mediaAcceptForType = (type = "image") =>
  type === "video" ? VIDEO_ACCEPT : IMAGE_ACCEPT;

const MediaPreview = ({ card, mediaPreview, thumbnailPreview }) => {
  const Icon = CARD_ICONS[String(card.iconKey || "").toLowerCase()] || DEFAULT_CARD_ICON;
  let mediaContent = null;

  if (card.mediaType === "video") {
    mediaContent = mediaPreview || card.mediaUrl ? (
      <video
        src={mediaPreview || card.mediaUrl}
        poster={thumbnailPreview || card.thumbnailUrl || undefined}
        muted
        loop
        playsInline
        autoPlay
        preload="metadata"
        className="h-full w-full object-cover"
        controls={false}
      />
    ) : (
      <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
        <div className="text-center">
          <Video className="mx-auto h-10 w-10 text-white/70" />
          <p className="mt-3 text-sm text-white/70">Video preview will appear here</p>
        </div>
      </div>
    );
  } else {
    mediaContent = mediaPreview || card.mediaUrl ? (
      <img
        src={mediaPreview || card.mediaUrl}
        alt={card.title || "Preview"}
        className="h-full w-full object-cover"
      />
    ) : (
      <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
        <div className="text-center">
          <ImageIcon className="mx-auto h-10 w-10 text-white/70" />
          <p className="mt-3 text-sm text-white/70">Image preview will appear here</p>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-slate-950 text-white shadow-2xl">
      <div className="relative h-[320px] w-full overflow-hidden">
        {mediaContent}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />
        <div className="absolute bottom-0 left-0 p-5">
          <div className="mb-3 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-md">
              <Icon className="h-6 w-6" />
            </div>
            <div>
              <h4 className="text-lg font-bold">{card.title || "Card preview"}</h4>
              <p className="text-sm text-white/75">
                {card.description || "Preview the card before saving."}
              </p>
            </div>
          </div>
          <span className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-300">
            <Eye className="h-4 w-4" />
            {card.buttonText || "Learn More"}
          </span>
        </div>
      </div>
    </div>
  );
};

const EmpoweringCards = () => {
  const { theme } = useTheme();
  const reduceMotion = useReducedMotion();

  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingCardId, setEditingCardId] = useState(null);
  const [form, setForm] = useState(createEmptyForm());
  const [selectedMediaFile, setSelectedMediaFile] = useState(null);
  const [selectedThumbnailFile, setSelectedThumbnailFile] = useState(null);
  const [mediaPreview, setMediaPreview] = useState("");
  const [thumbnailPreview, setThumbnailPreview] = useState("");
  const mediaPreviewUrlRef = useRef("");
  const thumbnailPreviewUrlRef = useRef("");

  const editingCard = useMemo(
    () => cards.find((card, index) => getCardId(card, index) === editingCardId) || null,
    [cards, editingCardId],
  );

  const refreshCards = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await getAdminEmpoweringCards();
      setCards(Array.isArray(response.data?.data) ? response.data.data : []);
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to load cards");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshCards();
  }, []);

  useEffect(() => {
    if (selectedMediaFile) {
      const url = URL.createObjectURL(selectedMediaFile);
      if (mediaPreviewUrlRef.current) URL.revokeObjectURL(mediaPreviewUrlRef.current);
      mediaPreviewUrlRef.current = url;
      setMediaPreview(url);
      return () => URL.revokeObjectURL(url);
    }

    setMediaPreview(form.mediaUrl || "");
    return undefined;
  }, [selectedMediaFile, form.mediaUrl]);

  useEffect(() => {
    if (selectedThumbnailFile) {
      const url = URL.createObjectURL(selectedThumbnailFile);
      if (thumbnailPreviewUrlRef.current) URL.revokeObjectURL(thumbnailPreviewUrlRef.current);
      thumbnailPreviewUrlRef.current = url;
      setThumbnailPreview(url);
      return () => URL.revokeObjectURL(url);
    }

    setThumbnailPreview(form.thumbnailUrl || "");
    return undefined;
  }, [selectedThumbnailFile, form.thumbnailUrl]);

  useEffect(
    () => () => {
      if (mediaPreviewUrlRef.current) {
        URL.revokeObjectURL(mediaPreviewUrlRef.current);
      }
      if (thumbnailPreviewUrlRef.current) {
        URL.revokeObjectURL(thumbnailPreviewUrlRef.current);
      }
    },
    [],
  );

  const openCreateForm = () => {
    setEditingCardId(null);
    setForm(createEmptyForm(cards.length));
    setSelectedMediaFile(null);
    setSelectedThumbnailFile(null);
    setShowForm(true);
  };

  const openEditForm = (card) => {
    setEditingCardId(getCardId(card));
    setForm({
      ...EMPTY_FORM,
      ...card,
      buttonLink: card.buttonLink || "#",
      buttonText: card.buttonText || "Learn More",
    });
    setSelectedMediaFile(null);
    setSelectedThumbnailFile(null);
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingCardId(null);
    setForm(createEmptyForm());
    setSelectedMediaFile(null);
    setSelectedThumbnailFile(null);
  };

  const reorderLocal = (currentIndex, direction) => {
    const nextIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
    if (nextIndex < 0 || nextIndex >= cards.length) return;

    const nextCards = [...cards];
    [nextCards[currentIndex], nextCards[nextIndex]] = [
      nextCards[nextIndex],
      nextCards[currentIndex],
    ];
    setCards(nextCards.map((card, index) => ({ ...card, displayOrder: index })));
  };

  const saveOrder = async () => {
    try {
      const items = cards.map((card, index) => ({
        id: getCardId(card, index),
        displayOrder: index,
      }));
      await reorderAdminEmpoweringCards(items);
      toast.success("Card order updated successfully.");
      await refreshCards();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to reorder cards");
      await refreshCards();
    }
  };

  const handleStatusToggle = async (card) => {
    const next = !card.isActive;
    try {
      await updateAdminEmpoweringCardStatus(getCardId(card), next);
      toast.success(next ? "Card enabled successfully." : "Card disabled successfully.");
      await refreshCards();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update status");
    }
  };

  const handleDelete = async (card) => {
    if (!window.confirm(`Delete "${card.title}"?`)) return;

    try {
      await deleteAdminEmpoweringCard(getCardId(card));
      toast.success("Card deleted successfully.");
      await refreshCards();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete card");
    }
  };

  const handleSave = async () => {
    if (!String(form.title || "").trim()) {
      toast.error("Title is required");
      return;
    }

    if (!isSafeCardButtonLink(form.buttonLink)) {
      toast.error("Invalid button link");
      return;
    }

    if (!editingCardId && !selectedMediaFile) {
      toast.error("A media file is required");
      return;
    }

    if (
      editingCardId &&
      !selectedMediaFile &&
      editingCard &&
      form.mediaType !== editingCard.mediaType
    ) {
      toast.error("Changing the media type requires a new media upload");
      return;
    }

    const payload = new FormData();
    payload.append("title", form.title);
    payload.append("description", form.description || "");
    payload.append("mediaType", form.mediaType);
    payload.append("iconKey", form.iconKey);
    payload.append("buttonText", form.buttonText || "Learn More");
    payload.append("buttonLink", form.buttonLink || "#");
    payload.append("openInNewTab", String(Boolean(form.openInNewTab)));
    payload.append("displayOrder", String(Number(form.displayOrder || 0)));
    payload.append("isActive", String(Boolean(form.isActive)));

    if (selectedMediaFile) {
      payload.append("media", selectedMediaFile);
    }

    if (selectedThumbnailFile) {
      payload.append("thumbnail", selectedThumbnailFile);
    }

    try {
      setSaving(true);
      const response = editingCardId
        ? await updateAdminEmpoweringCard(editingCardId, payload)
        : await createAdminEmpoweringCard(payload);
      toast.success(response.data?.message || "Card saved successfully.");
      closeForm();
      await refreshCards();
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || "Failed to save card");
    } finally {
      setSaving(false);
    }
  };

  const sortedCards = useMemo(
    () => [...cards].sort((a, b) => Number(a.displayOrder || 0) - Number(b.displayOrder || 0)),
    [cards],
  );

  return (
    <div className={`min-h-full ${theme.surface} px-4 py-6 sm:px-6 lg:px-8`}>
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-slate-400">
            Homepage Media Cards
          </p>
          <h1 className={`mt-2 text-3xl font-black ${theme.text}`}>
            Empowering Farmers & Students
          </h1>
          <p className="mt-2 max-w-3xl text-sm text-slate-500">
            Manage the homepage cards shown in the Empowering Farmers & Students section.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={refreshCards}
            className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
          >
            <RefreshCcw className="h-4 w-4" />
            Refresh
          </button>
          <button
            type="button"
            onClick={openCreateForm}
            className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-emerald-700"
          >
            <Plus className="h-4 w-4" />
            Add New Card
          </button>
        </div>
      </div>

      {error ? (
        <div className="mb-6 rounded-3xl border border-rose-200 bg-rose-50 p-5 text-rose-700">
          {error}
        </div>
      ) : null}

      {loading ? (
        <div className="grid gap-4 lg:grid-cols-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="animate-pulse rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="h-48 rounded-2xl bg-slate-200" />
              <div className="mt-4 h-5 w-2/3 rounded bg-slate-200" />
              <div className="mt-3 h-4 w-full rounded bg-slate-200" />
              <div className="mt-2 h-4 w-5/6 rounded bg-slate-200" />
            </div>
          ))}
        </div>
      ) : sortedCards.length === 0 ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
          <h2 className="text-xl font-bold text-slate-900">No cards yet</h2>
          <p className="mt-2 text-sm text-slate-500">
            Create the first homepage card to populate the section.
          </p>
          <button
            type="button"
            onClick={openCreateForm}
            className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700"
          >
            <Plus className="h-4 w-4" />
            Add New Card
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button
              type="button"
              onClick={saveOrder}
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
            >
              <Move className="h-4 w-4" />
              Save order
            </button>
          </div>

          {sortedCards.map((card, index) => {
            const Icon =
              CARD_ICONS[String(card.iconKey || "").toLowerCase()] || DEFAULT_CARD_ICON;
            const mediaIsVideo = card.mediaType === "video";

            return (
              <div
                key={getCardId(card, index)}
                className={`rounded-3xl border p-5 shadow-sm transition ${
                  card.isActive ? "border-emerald-200 bg-white" : "border-slate-200 bg-slate-50"
                }`}
              >
                <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                  <div className="flex min-w-0 flex-1 gap-4">
                    <div className="h-28 w-28 shrink-0 overflow-hidden rounded-2xl bg-slate-100">
                      {mediaIsVideo ? (
                        <video
                          src={card.thumbnailUrl || card.mediaUrl}
                          poster={card.thumbnailUrl || undefined}
                          muted
                          playsInline
                          loop
                          autoPlay={!reduceMotion}
                          className="h-full w-full object-cover"
                          controls={false}
                        />
                      ) : (
                        <img
                          src={card.mediaUrl}
                          alt={card.title}
                          className="h-full w-full object-cover"
                          loading="lazy"
                          decoding="async"
                        />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className={`truncate text-xl font-bold ${theme.text}`}>
                          {card.title}
                        </h2>
                        <span
                          className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                            card.isActive
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-slate-200 text-slate-600"
                          }`}
                        >
                          {card.isActive ? "Active" : "Inactive"}
                        </span>
                        <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                          {card.mediaType}
                        </span>
                        <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                          Order {card.displayOrder}
                        </span>
                      </div>
                      <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-500">
                        {card.description}
                      </p>
                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                          <Icon className="h-3.5 w-3.5" />
                          {card.iconKey}
                        </div>
                        <a
                          href={card.buttonLink || "#"}
                          target={card.openInNewTab ? "_blank" : "_self"}
                          rel={card.openInNewTab ? "noreferrer" : undefined}
                          className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700"
                        >
                          <Link2 className="h-3.5 w-3.5" />
                          {card.buttonText}
                        </a>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-start xl:self-center">
                    <button
                      type="button"
                      onClick={() => reorderLocal(index, "up")}
                      className="rounded-2xl border border-slate-200 bg-white p-3 text-slate-600 transition hover:bg-slate-50"
                      aria-label="Move up"
                    >
                      <ArrowUp className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => reorderLocal(index, "down")}
                      className="rounded-2xl border border-slate-200 bg-white p-3 text-slate-600 transition hover:bg-slate-50"
                      aria-label="Move down"
                    >
                      <ArrowDown className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => openEditForm(card)}
                      className="rounded-2xl border border-slate-200 bg-white p-3 text-slate-600 transition hover:bg-slate-50"
                      aria-label="Edit"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleStatusToggle(card)}
                      className="rounded-2xl border border-slate-200 bg-white p-3 text-slate-600 transition hover:bg-slate-50"
                      aria-label="Toggle active"
                    >
                      {card.isActive ? (
                        <ToggleRight className="h-4 w-4" />
                      ) : (
                        <ToggleLeft className="h-4 w-4" />
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(card)}
                      className="rounded-2xl border border-rose-200 bg-rose-50 p-3 text-rose-600 transition hover:bg-rose-100"
                      aria-label="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <AnimatePresence>
        {showForm ? (
          <motion.div
            className="fixed inset-0 z-[70] flex items-end justify-center bg-slate-950/70 p-3 backdrop-blur-sm md:items-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              initial={{ y: reduceMotion ? 0 : 28, opacity: 0, scale: 0.98 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: reduceMotion ? 0 : 18, opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.25 }}
              className="max-h-[92vh] w-full max-w-6xl overflow-y-auto rounded-[2rem] border border-slate-200 bg-white shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
                <div>
                  <p className="text-xs uppercase tracking-[0.28em] text-slate-400">
                    {editingCardId ? "Edit card" : "Add card"}
                  </p>
                  <h2 className="text-2xl font-black text-slate-900">
                    {editingCardId ? "Update homepage card" : "Create homepage card"}
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={closeForm}
                  className="rounded-2xl bg-slate-100 p-3 text-slate-600 transition hover:bg-slate-200"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="grid gap-6 px-6 py-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(330px,0.85fr)]">
                <div className="space-y-6">
                  <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                    <div className="mb-4 flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-emerald-600" />
                      <h3 className="text-lg font-bold text-slate-900">Card details</h3>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="md:col-span-2">
                        <label className="mb-2 block text-sm font-semibold text-slate-600">
                          Title
                        </label>
                        <input
                          value={form.title}
                          onChange={(e) =>
                            setForm((prev) => ({ ...prev, title: e.target.value }))
                          }
                          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100"
                          placeholder="Enter title"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="mb-2 block text-sm font-semibold text-slate-600">
                          Description
                        </label>
                        <textarea
                          value={form.description}
                          onChange={(e) =>
                            setForm((prev) => ({ ...prev, description: e.target.value }))
                          }
                          rows={4}
                          className="w-full resize-none rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100"
                          placeholder="Enter description"
                        />
                      </div>

                      <div>
                        <label className="mb-2 block text-sm font-semibold text-slate-600">
                          Media Type
                        </label>
                        <select
                          value={form.mediaType}
                          onChange={(e) =>
                            setForm((prev) => ({ ...prev, mediaType: e.target.value }))
                          }
                          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100"
                        >
                          <option value="image">Image</option>
                          <option value="video">Video</option>
                        </select>
                      </div>

                      <div>
                        <label className="mb-2 block text-sm font-semibold text-slate-600">
                          Display order
                        </label>
                        <input
                          type="number"
                          value={form.displayOrder}
                          onChange={(e) =>
                            setForm((prev) => ({
                              ...prev,
                              displayOrder: Number(e.target.value || 0),
                            }))
                          }
                          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100"
                        />
                      </div>

                      <div>
                        <label className="mb-2 block text-sm font-semibold text-slate-600">
                          Icon
                        </label>
                        <select
                          value={form.iconKey}
                          onChange={(e) =>
                            setForm((prev) => ({ ...prev, iconKey: e.target.value }))
                          }
                          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100"
                        >
                          {ICON_OPTIONS.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="mb-2 block text-sm font-semibold text-slate-600">
                          Button Text
                        </label>
                        <input
                          value={form.buttonText}
                          onChange={(e) =>
                            setForm((prev) => ({ ...prev, buttonText: e.target.value }))
                          }
                          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100"
                          placeholder="Learn More"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="mb-2 block text-sm font-semibold text-slate-600">
                          Button Link
                        </label>
                        <input
                          value={form.buttonLink}
                          onChange={(e) =>
                            setForm((prev) => ({ ...prev, buttonLink: e.target.value }))
                          }
                          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100"
                          placeholder="/about or https://example.com"
                        />
                      </div>

                      <div className="md:col-span-2 flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-4">
                        <div>
                          <p className="font-semibold text-slate-700">
                            Open link in new tab
                          </p>
                          <p className="text-xs text-slate-500">
                            Applies to safe internal or external links.
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            setForm((prev) => ({ ...prev, openInNewTab: !prev.openInNewTab }))
                          }
                          className={`relative h-8 w-14 rounded-full transition ${
                            form.openInNewTab ? "bg-emerald-500" : "bg-slate-300"
                          }`}
                        >
                          <span
                            className={`absolute top-1 h-6 w-6 rounded-full bg-white shadow transition ${
                              form.openInNewTab ? "left-7" : "left-1"
                            }`}
                          />
                        </button>
                      </div>

                      <div className="md:col-span-2 flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-4">
                        <div>
                          <p className="font-semibold text-slate-700">Active</p>
                          <p className="text-xs text-slate-500">
                            Inactive cards stay in admin and hide publicly.
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            setForm((prev) => ({ ...prev, isActive: !prev.isActive }))
                          }
                          className={`relative h-8 w-14 rounded-full transition ${
                            form.isActive ? "bg-emerald-500" : "bg-slate-300"
                          }`}
                        >
                          <span
                            className={`absolute top-1 h-6 w-6 rounded-full bg-white shadow transition ${
                              form.isActive ? "left-7" : "left-1"
                            }`}
                          />
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                    <div className="mb-4 flex items-center gap-2">
                      <Upload className="h-5 w-5 text-emerald-600" />
                      <h3 className="text-lg font-bold text-slate-900">Media upload</h3>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <label className="flex cursor-pointer flex-col gap-2 rounded-2xl border border-dashed border-slate-300 bg-white p-4 hover:bg-slate-50">
                        <span className="text-sm font-semibold text-slate-700">
                          {form.mediaType === "video" ? "Upload video" : "Upload image"}
                        </span>
                        <span className="text-xs text-slate-500">
                          {form.mediaType === "video"
                            ? "MP4, WEBM or MOV up to 50 MB"
                            : "JPG, PNG, WEBP or GIF up to 5 MB"}
                        </span>
                        <input
                          type="file"
                          accept={mediaAcceptForType(form.mediaType)}
                          className="hidden"
                          onChange={(e) => setSelectedMediaFile(e.target.files?.[0] || null)}
                        />
                      </label>

                      {form.mediaType === "video" ? (
                        <label className="flex cursor-pointer flex-col gap-2 rounded-2xl border border-dashed border-slate-300 bg-white p-4 hover:bg-slate-50">
                          <span className="text-sm font-semibold text-slate-700">
                            Upload thumbnail
                          </span>
                          <span className="text-xs text-slate-500">
                            Optional preview image for the video.
                          </span>
                          <input
                            type="file"
                            accept={IMAGE_ACCEPT}
                            className="hidden"
                            onChange={(e) =>
                              setSelectedThumbnailFile(e.target.files?.[0] || null)
                            }
                          />
                        </label>
                      ) : (
                        <div className="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-500">
                          Video thumbnail is only needed for video cards.
                        </div>
                      )}
                    </div>

                    <div className="mt-4 flex flex-wrap gap-3">
                      {selectedMediaFile ? (
                        <button
                          type="button"
                          onClick={() => setSelectedMediaFile(null)}
                          className="inline-flex items-center gap-2 rounded-2xl bg-slate-100 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-200"
                        >
                          <X className="h-4 w-4" />
                          Clear media
                        </button>
                      ) : null}
                      {selectedThumbnailFile ? (
                        <button
                          type="button"
                          onClick={() => setSelectedThumbnailFile(null)}
                          className="inline-flex items-center gap-2 rounded-2xl bg-slate-100 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-200"
                        >
                          <X className="h-4 w-4" />
                          Clear thumbnail
                        </button>
                      ) : null}
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <MediaPreview
                    card={{
                      ...form,
                      title: form.title || "Preview",
                      description: form.description || "Preview the selected card before saving.",
                    }}
                    mediaPreview={mediaPreview}
                    thumbnailPreview={thumbnailPreview}
                  />

                  <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                    <div className="mb-4 flex items-center gap-2">
                      <ImageIcon className="h-5 w-5 text-emerald-600" />
                      <h3 className="text-lg font-bold text-slate-900">Save summary</h3>
                    </div>
                    <div className="space-y-3 text-sm text-slate-600">
                      <div className="flex items-center justify-between">
                        <span>Media type</span>
                        <span className="font-semibold text-slate-900">{form.mediaType}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Status</span>
                        <span className="font-semibold text-slate-900">
                          {form.isActive ? "Active" : "Inactive"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Open link</span>
                        <span className="font-semibold text-slate-900">
                          {form.openInNewTab ? "New tab" : "Same tab"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Icon</span>
                        <span className="font-semibold text-slate-900">{form.iconKey}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="sticky bottom-0 flex items-center justify-end gap-3 border-t border-slate-200 bg-white px-6 py-4">
                <button
                  type="button"
                  onClick={closeForm}
                  className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving}
                  className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving ? (
                    <span className="inline-flex items-center gap-2">
                      <RefreshCcw className="h-4 w-4 animate-spin" />
                      Saving...
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-2">
                      <Save className="h-4 w-4" />
                      Save card
                    </span>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
};

export default EmpoweringCards;
