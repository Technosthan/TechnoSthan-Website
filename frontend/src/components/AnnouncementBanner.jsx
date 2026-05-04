import React, { useEffect, useState } from "react";
import { useTheme } from "../contexts/ThemeContext";
import {
  dismissAnnouncement,
  getPublicAnnouncements,
} from "../shared/lib/announcementsApi";
import { Bell, X } from "lucide-react";

const LOCAL_KEY = "dismissedAnnouncements";

const AnnouncementBanner = () => {
  const { theme } = useTheme();
  const [announcements, setAnnouncements] = useState([]);
  const [visible, setVisible] = useState(true);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    let mounted = true;
    const fetch = async () => {
      try {
        const res = await getPublicAnnouncements();
        const list = res.data?.data || [];
        if (!mounted) return;
        const dismissed = JSON.parse(localStorage.getItem(LOCAL_KEY) || "[]");
        const filtered = list.filter((a) => !dismissed.includes(a._id));
        setAnnouncements(filtered);
        setVisible(filtered.length > 0);
      } catch {
        // ignore
      }
    };
    fetch();
    return () => (mounted = false);
  }, []);

  const dismissOne = async (id) => {
    try {
      await dismissAnnouncement(id);
    } catch {
      // ignore
    }

    const dismissed = JSON.parse(localStorage.getItem(LOCAL_KEY) || "[]");
    if (!dismissed.includes(id)) dismissed.push(id);
    localStorage.setItem(LOCAL_KEY, JSON.stringify(dismissed));
    setAnnouncements((prev) => {
      const next = prev.filter((a) => a._id !== id);
      setVisible(next.length > 0);
      return next;
    });

    window.dispatchEvent(new Event("announcements:changed"));
  };

  if (!visible) return null;

  const latest = announcements[0] || null;

  return (
    <>
      <div
        className={`p-4 rounded-lg mb-6 border ${theme.border} ${theme.card}`}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 flex-1">
            <button
              aria-label="Announcements"
              onClick={() => setShowModal(true)}
              className={`p-2 rounded-lg hover:${theme.card} transition-colors`}
            >
              <Bell className={`h-6 w-6 ${theme.textSecondary}`} />
            </button>

            <div className="flex-1">
              <h4 className={`font-semibold ${theme.text}`}>
                {latest?.title || "Announcement"}
              </h4>
              <p className={`text-sm ${theme.textSecondary} line-clamp-2`}>
                {latest?.message}
              </p>
              <div className={`text-xs mt-2 ${theme.textSecondary}`}>
                Priority: {latest?.priority}
              </div>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <button
              title="Dismiss"
              onClick={() => latest && dismissOne(latest._id)}
              className="p-2 rounded hover:bg-gray-100/10"
            >
              <X className={`h-4 w-4 ${theme.textSecondary}`} />
            </button>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-6">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setShowModal(false)}
          />
          <div
            className={`${theme.card} relative rounded-2xl shadow-2xl max-w-2xl w-full z-10 p-6`}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-lg font-bold ${theme.text}`}>
                Announcements
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 rounded hover:bg-gray-100/10"
              >
                <X className={`h-5 w-5 ${theme.textSecondary}`} />
              </button>
            </div>

            <div className="space-y-4 max-h-[60vh] overflow-y-auto">
              {announcements.length === 0 && (
                <div className={`text-sm ${theme.textSecondary}`}>
                  No new announcements
                </div>
              )}
              {announcements.map((a) => (
                <div
                  key={a._id}
                  className={`p-4 rounded-lg border ${theme.border}`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className={`font-semibold ${theme.text}`}>
                        {a.title}
                      </div>
                      <div className={`text-sm ${theme.textSecondary} mt-1`}>
                        {a.message}
                      </div>
                      <div className={`text-xs mt-2 ${theme.textSecondary}`}>
                        Priority: {a.priority}
                      </div>
                    </div>
                    <div className="pl-4 shrink-0">
                      <button
                        onClick={() => dismissOne(a._id)}
                        className="px-3 py-1 rounded bg-red-600 text-white"
                      >
                        Dismiss
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AnnouncementBanner;
