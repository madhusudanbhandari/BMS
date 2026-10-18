
import { useCallback, useEffect, useState } from "react";
import { Bell, CheckCheck, RefreshCw, X } from "lucide-react";
import api from "../api/axios";

const getItems = (data) => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.data)) return data.data;
  return [];
};

const NotificationBell = () => {
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState(null);

  const loadNotifications = useCallback(async (showLoading = true) => {
    if (showLoading) setLoading(true);
    setError("");

    try {
      const response = await api.get("/Notification");
      setNotifications(getItems(response.data));
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to load notifications."
      );
    } finally {
      if (showLoading) setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadNotifications();

    // Periodically check for new database notifications.
    const intervalId = setInterval(() => {
      loadNotifications(false);
    }, 30000);

    return () => clearInterval(intervalId);
  }, [loadNotifications]);

  const markAsRead = async (notification) => {
    const id = notification.id ?? notification.Id;
    const isRead = notification.isRead ?? notification.IsRead;

    if (id == null || isRead || updatingId !== null) return;

    setUpdatingId(id);
    setError("");

    try {
      await api.patch(`/Notification/${id}/read`);

      setNotifications((current) =>
        current.map((item) => {
          const itemId = item.id ?? item.Id;
          return itemId === id
            ? { ...item, isRead: true, IsRead: true }
            : item;
        })
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to mark notification as read."
      );
    } finally {
      setUpdatingId(null);
    }
  };

  const unreadCount = notifications.filter(
    (item) => !(item.isRead ?? item.IsRead ?? false)
  ).length;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => {
          setOpen((current) => !current);
          if (!open) loadNotifications();
        }}
        aria-label={`Notifications, ${unreadCount} unread`}
        aria-expanded={open}
        className="relative inline-flex h-11 w-11 items-center justify-center
          rounded-xl border border-gray-200 bg-white text-gray-700
          shadow-sm transition hover:bg-gray-50"
      >
        <Bell className="h-5 w-5" />

        {unreadCount > 0 && (
          <span
            className="absolute -right-1 -top-1 flex h-5 min-w-5
              items-center justify-center rounded-full bg-red-600
              px-1 text-xs font-bold text-white"
          >
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <>
          <button
            type="button"
            aria-label="Close notifications"
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-40 cursor-default"
          />

          <section
            aria-label="Notifications"
            className="absolute right-0 z-50 mt-3 w-[min(24rem,calc(100vw-2rem))]
              overflow-hidden rounded-2xl border border-gray-200
              bg-white shadow-xl"
          >
            <div className="flex items-center justify-between border-b
              border-gray-100 px-4 py-4">
              <div>
                <h2 className="font-semibold text-gray-900">
                  Notifications
                </h2>
                <p className="mt-1 text-xs text-gray-500">
                  {unreadCount} unread
                </p>
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => loadNotifications()}
                  disabled={loading}
                  title="Refresh notifications"
                  className="rounded-lg p-2 text-gray-500 hover:bg-gray-100
                    disabled:opacity-50"
                >
                  <RefreshCw
                    className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
                  />
                </button>

                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label="Close"
                  className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {error && (
              <div className="border-b border-red-100 bg-red-50 px-4 py-3
                text-sm text-red-700">
                {error}
                <button
                  type="button"
                  onClick={() => loadNotifications()}
                  className="ml-2 font-semibold underline"
                >
                  Retry
                </button>
              </div>
            )}

            <div className="max-h-96 overflow-y-auto">
              {loading && notifications.length === 0 ? (
                <div className="flex items-center justify-center gap-2
                  px-4 py-10 text-sm text-gray-500">
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Loading notifications...
                </div>
              ) : notifications.length === 0 ? (
                <div className="px-5 py-10 text-center">
                  <Bell className="mx-auto h-8 w-8 text-gray-300" />
                  <p className="mt-3 text-sm font-medium text-gray-700">
                    No notifications yet
                  </p>
                  <p className="mt-1 text-xs text-gray-500">
                    Updates will appear here when available.
                  </p>
                </div>
              ) : (
                notifications.map((notification, index) => {
                  const id = notification.id ?? notification.Id ?? index;
                  const title =
                    notification.title ?? notification.Title ?? "Notification";
                  const message =
                    notification.message ?? notification.Message ?? "";
                  const isRead =
                    notification.isRead ?? notification.IsRead ?? false;
                  const createdAt =
                    notification.createdAt ?? notification.CreatedAt;

                  return (
                    <button
                      type="button"
                      key={id}
                      onClick={() => markAsRead(notification)}
                      disabled={isRead || updatingId !== null}
                      className={`flex w-full items-start gap-3 border-b
                        border-gray-100 px-4 py-4 text-left transition
                        last:border-b-0 hover:bg-gray-50
                        ${!isRead ? "bg-indigo-50/60" : "bg-white"}
                        disabled:cursor-default`}
                    >
                      <span
                        className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full
                          ${isRead ? "bg-gray-300" : "bg-indigo-600"}`}
                      />

                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-semibold
                          text-gray-900">
                          {title}
                        </span>

                        <span className="mt-1 block text-sm text-gray-600">
                          {message}
                        </span>

                        <span className="mt-2 block text-xs text-gray-400">
                          {createdAt && !Number.isNaN(Date.parse(createdAt))
                            ? new Date(createdAt).toLocaleString()
                            : "Date unavailable"}
                        </span>

                        {updatingId === id && (
                          <span className="mt-1 block text-xs text-indigo-600">
                            Marking as read...
                          </span>
                        )}
                      </span>

                      {isRead && (
                        <CheckCheck className="mt-1 h-4 w-4 shrink-0
                          text-gray-400" />
                      )}
                    </button>
                  );
                })
              )}
            </div>

            <div className="border-t border-gray-100 px-4 py-3">
              <p className="text-center text-xs text-gray-400">
                Click an unread notification to mark it as read.
              </p>
            </div>
          </section>
        </>
      )}
    </div>
  );
};

export default NotificationBell;
