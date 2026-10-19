
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Menu,
  Bell,
  ChevronDown,
  UserRound,
  ShieldCheck,
  Mail,
  LogOut,
  Check,
  RefreshCw,
  X,
  Clock,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";

const getAdminInfo = () => {
  try {
    const savedUser =
      localStorage.getItem("user") ||
      localStorage.getItem("currentUser") ||
      localStorage.getItem("authUser");

    const user = savedUser ? JSON.parse(savedUser) : {};

    return {
      name:
        user.name ||
        user.fullName ||
        user.Name ||
        user.FullName ||
        user.firstName ||
        user.FirstName ||
        user.username ||
        user.Username ||
        "Admin",
      email: user.email || user.Email || "Email not available",
      role: user.role || user.Role || "Administrator",
    };
  } catch {
    return {
      name: "Admin",
      email: "Email not available",
      role: "Administrator",
    };
  }
};

const getErrorMessage = (error) =>
  error.response?.data?.message ||
  error.response?.data?.title ||
  error.message ||
  "Unable to load notifications.";

const getIsRead = (notification) =>
  notification.isRead ?? notification.IsRead ?? false;

const formatDate = (date) => {
  if (!date) return "";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) return "";

  return parsedDate.toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
};

export default function AdminHeader({ onMenuClick }) {
  const navigate = useNavigate();

  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const [notificationError, setNotificationError] = useState("");
  const [markingId, setMarkingId] = useState(null);

  const profileRef = useRef(null);
  const notificationRef = useRef(null);

  const admin = getAdminInfo();

  const unreadCount = notifications.filter(
    (notification) => !getIsRead(notification)
  ).length;

  // GET /api/Notification
  const loadNotifications = useCallback(async () => {
    setLoadingNotifications(true);
    setNotificationError("");

    try {
      const response = await api.get("/Notification");

      const data = response.data;
      const list = Array.isArray(data)
        ? data
        : Array.isArray(data?.$values)
          ? data.$values
          : [];

      setNotifications(list);
    } catch (error) {
      console.error("Failed to load notifications:", error);
      setNotificationError(getErrorMessage(error));
    } finally {
      setLoadingNotifications(false);
    }
  }, []);

  // Load notifications when the header mounts.
  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  // Close dropdowns when clicking outside or pressing Escape.
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target)
      ) {
        setProfileOpen(false);
      }

      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target)
      ) {
        setNotificationsOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setProfileOpen(false);
        setNotificationsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const handleProfileClick = () => {
    setProfileOpen((open) => !open);
    setNotificationsOpen(false);
  };

  const handleNotificationClick = () => {
    const willOpen = !notificationsOpen;

    setNotificationsOpen(willOpen);
    setProfileOpen(false);

    if (willOpen) {
      loadNotifications();
    }
  };

  // PATCH /api/Notification/{id}/read
  const handleMarkAsRead = async (notification) => {
    const id = notification.id ?? notification.Id;

    if (getIsRead(notification) || id == null || markingId !== null) {
      return;
    }

    setMarkingId(id);
    setNotificationError("");

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
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
      setNotificationError(getErrorMessage(error));
    } finally {
      setMarkingId(null);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("currentUser");
    localStorage.removeItem("authUser");

    setProfileOpen(false);
    setNotificationsOpen(false);

    navigate("/login", { replace: true });
  };

  const initial = admin.name.charAt(0).toUpperCase();

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-gray-200 bg-white/95 px-4 backdrop-blur sm:px-8">
      {/* Dashboard title */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onMenuClick}
          aria-label="Open navigation"
          className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 lg:hidden"
        >
          <Menu size={22} />
        </button>

        <div>
          <p className="text-sm font-semibold text-gray-900">
            Organization Dashboard
          </p>
          <p className="hidden text-xs text-gray-500 sm:block">
            Manage your workspace in one place
          </p>
        </div>
      </div>

      {/* Header actions */}
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Notifications */}
        <div className="relative" ref={notificationRef}>
          <button
            type="button"
            onClick={handleNotificationClick}
            aria-label={`Notifications, ${unreadCount} unread`}
            aria-expanded={notificationsOpen}
            aria-haspopup="true"
            className="relative rounded-full p-2 text-gray-600 transition hover:bg-gray-100"
          >
            <Bell size={21} />

            {unreadCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold text-white">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </button>

          {notificationsOpen && (
            <div className="absolute right-0 top-full mt-3 w-[min(24rem,calc(100vw-2rem))] overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl">
              {/* Notification heading */}
              <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
                <div>
                  <h2 className="font-semibold text-gray-900">
                    Notifications
                  </h2>
                  <p className="text-xs text-gray-500">
                    {unreadCount} unread notification
                    {unreadCount === 1 ? "" : "s"}
                  </p>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={loadNotifications}
                    disabled={loadingNotifications}
                    aria-label="Refresh notifications"
                    title="Refresh notifications"
                    className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 disabled:opacity-50"
                  >
                    <RefreshCw
                      size={16}
                      className={
                        loadingNotifications ? "animate-spin" : ""
                      }
                    />
                  </button>

                  <button
                    type="button"
                    onClick={() => setNotificationsOpen(false)}
                    aria-label="Close notifications"
                    className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>

              {/* Loading state */}
              {loadingNotifications && notifications.length === 0 && (
                <div className="flex items-center justify-center gap-2 p-8 text-sm text-gray-500">
                  <RefreshCw size={16} className="animate-spin" />
                  Loading notifications...
                </div>
              )}

              {/* Error state */}
              {notificationError && (
                <div className="m-3 rounded-lg bg-red-50 p-3 text-sm text-red-700">
                  <p>{notificationError}</p>
                  <button
                    type="button"
                    onClick={loadNotifications}
                    className="mt-2 font-semibold underline"
                  >
                    Try again
                  </button>
                </div>
              )}

              {/* Empty state */}
              {!loadingNotifications &&
                !notificationError &&
                notifications.length === 0 && (
                  <div className="flex flex-col items-center px-5 py-10 text-center">
                    <Bell size={30} className="text-gray-300" />
                    <p className="mt-3 font-medium text-gray-800">
                      You're all caught up
                    </p>
                    <p className="mt-1 text-sm text-gray-500">
                      New notifications will appear here.
                    </p>
                  </div>
                )}

              {/* Notification list */}
              {notifications.length > 0 && (
                <div className="max-h-[min(28rem,65vh)] overflow-y-auto">
                  {notifications.map((notification) => {
                    const id = notification.id ?? notification.Id;
                    const title =
                      notification.title ??
                      notification.Title ??
                      "Notification";
                    const message =
                      notification.message ??
                      notification.Message ??
                      "";
                    const createdAt =
                      notification.createdAt ??
                      notification.CreatedAt;
                    const isRead = getIsRead(notification);

                    return (
                      <button
                        type="button"
                        key={id}
                        onClick={() => handleMarkAsRead(notification)}
                        disabled={isRead || markingId !== null}
                        className={`flex w-full items-start gap-3 border-b border-gray-100 px-4 py-4 text-left transition last:border-b-0 ${
                          isRead
                            ? "bg-white hover:bg-gray-50"
                            : "bg-indigo-50/70 hover:bg-indigo-50"
                        } disabled:cursor-default`}
                      >
                        <span
                          className={`mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
                            isRead
                              ? "bg-gray-100 text-gray-500"
                              : "bg-indigo-100 text-indigo-700"
                          }`}
                        >
                          {isRead ? (
                            <Check size={17} />
                          ) : (
                            <Bell size={17} />
                          )}
                        </span>

                        <span className="min-w-0 flex-1">
                          <span className="flex items-start justify-between gap-2">
                            <span className="text-sm font-semibold text-gray-900">
                              {title}
                            </span>

                            {!isRead && (
                              <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-indigo-600" />
                            )}
                          </span>

                          <span className="mt-1 block whitespace-normal break-words text-sm leading-5 text-gray-600">
                            {message}
                          </span>

                          <span className="mt-2 flex items-center gap-1 text-xs text-gray-400">
                            <Clock size={12} />
                            {formatDate(createdAt)}
                          </span>

                          {!isRead && (
                            <span className="mt-2 block text-xs font-medium text-indigo-700">
                              {markingId === id
                                ? "Marking as read..."
                                : "Click to mark as read"}
                            </span>
                          )}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}

              <div className="border-t border-gray-100 bg-gray-50 px-4 py-2">
                <p className="text-center text-xs text-gray-500">
                  Showing notifications for your account
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="hidden h-8 w-px bg-gray-200 sm:block" />

        {/* Admin profile */}
        <div className="relative" ref={profileRef}>
          <button
            type="button"
            onClick={handleProfileClick}
            aria-expanded={profileOpen}
            aria-haspopup="true"
            aria-label="Open admin profile"
            className="flex items-center gap-2 rounded-lg px-2 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 font-semibold text-indigo-700">
              {initial}
            </span>

            <span className="hidden text-left sm:block">
              <span className="block">{admin.name}</span>
              <span className="block text-xs font-normal text-gray-500">
                {admin.role}
              </span>
            </span>

            <ChevronDown
              size={16}
              className={`hidden transition-transform sm:block ${
                profileOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {profileOpen && (
            <div className="absolute right-0 top-full mt-2 w-72 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl">
              <div className="border-b border-gray-100 bg-gray-50 p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-lg font-bold text-indigo-700">
                    {initial}
                  </div>

                  <div className="min-w-0">
                    <p className="truncate font-semibold text-gray-900">
                      {admin.name}
                    </p>
                    <p className="truncate text-sm text-gray-500">
                      {admin.email}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-1 p-3">
                <div className="flex items-start gap-3 rounded-lg px-3 py-2">
                  <UserRound
                    size={18}
                    className="mt-0.5 text-gray-500"
                  />
                  <div>
                    <p className="text-xs text-gray-500">Name</p>
                    <p className="break-words text-sm font-medium text-gray-800">
                      {admin.name}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 rounded-lg px-3 py-2">
                  <Mail
                    size={18}
                    className="mt-0.5 text-gray-500"
                  />
                  <div className="min-w-0">
                    <p className="text-xs text-gray-500">Email</p>
                    <p className="break-all text-sm font-medium text-gray-800">
                      {admin.email}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 rounded-lg px-3 py-2">
                  <ShieldCheck
                    size={18}
                    className="mt-0.5 text-gray-500"
                  />
                  <div>
                    <p className="text-xs text-gray-500">Role</p>
                    <p className="text-sm font-medium text-gray-800">
                      {admin.role}
                    </p>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-100 p-3">
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50"
                >
                  <LogOut size={18} />
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
