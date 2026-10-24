
import { useCallback, useEffect, useRef, useState } from "react";
import {
  MessageCircle,
  Send,
  Users,
  Search,
  Circle,
} from "lucide-react";
import chatService from "../services/chatService";
import chatConnection from "../services/chatConnection";

function getId(user) {
  return (
    user?.id ??
    user?.Id ??
    user?.userId ??
    user?.UserId ??
    user?.userID ??
    null
  );
}

function getName(user) {
  if (!user) return "Unknown user";

  const firstName = user.firstName ?? user.FirstName ?? "";
  const lastName = user.lastName ?? user.LastName ?? "";
  const fullName = `${firstName} ${lastName}`.trim();

  return (
    user.fullName ||
    user.FullName ||
    user.name ||
    user.Name ||
    user.userName ||
    user.UserName ||
    fullName ||
    user.email ||
    user.Email ||
    "Unknown user"
  );
}

function getRole(user) {
  const role = user?.role ?? user?.Role;

  const roles = {
    1: "Organization Admin",
    2: "Platform Admin",
    3: "Employee",
    4: "Manager",
    5: "HR",
  };

  if (typeof role === "number" || /^\d+$/.test(String(role ?? ""))) {
    return roles[Number(role)] ?? "Member";
  }

  return role || "Member";
}

function getMessageSenderId(message) {
  return message?.senderId ?? message?.SenderId ?? null;
}

function getMessageReceiverId(message) {
  return message?.receiverId ?? message?.ReceiverId ?? null;
}

function getMessageText(message) {
  return message?.message ?? message?.Message ?? "";
}

function getMessageId(message) {
  return message?.id ?? message?.Id ?? null;
}

// Returns true when the message is unread.
function isUnreadMessage(message) {
  const value = message?.isRead ?? message?.IsRead;

  return value === false || value === 0 || value === "false";
}

function getMessageTime(message) {
  const value = message?.sentAt ?? message?.SentAt;

  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "";

  return date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getCurrentUser() {
  try {
    const storedUser = localStorage.getItem("user");

    if (storedUser) {
      const user = JSON.parse(storedUser);

      if (getId(user) != null) {
        return user;
      }
    }
  } catch {
    // Fall back to the JWT.
  }

  try {
    const token = localStorage.getItem("token");

    if (!token) return null;

    const payload = token.split(".")[1];
    const normalizedPayload = payload
      .replace(/-/g, "+")
      .replace(/_/g, "/");

    const decoded = JSON.parse(
      atob(
        normalizedPayload +
          "=".repeat((4 - (normalizedPayload.length % 4)) % 4)
      )
    );

    const id =
      decoded[
        "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"
      ] ??
      decoded.nameid ??
      decoded.sub;

    return {
      id,
      name:
        decoded[
          "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"
        ] ??
        decoded.name ??
        decoded.unique_name ??
        decoded.email ??
        "You",
    };
  } catch {
    return null;
  }
}

function getEmployeeList(response) {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.employees)) return response.employees;
  if (Array.isArray(response?.Employees)) return response.Employees;
  if (Array.isArray(response?.users)) return response.users;
  if (Array.isArray(response?.Users)) return response.Users;

  return [];
}

function getConversationList(response) {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.messages)) return response.messages;
  if (Array.isArray(response?.Messages)) return response.Messages;

  return [];
}

function sortMessages(messages) {
  return [...messages].sort((a, b) => {
    const aTime = new Date(a.sentAt ?? a.SentAt ?? 0).getTime();
    const bTime = new Date(b.sentAt ?? b.SentAt ?? 0).getTime();

    return aTime - bTime;
  });
}

function Chat() {
  const currentUser = getCurrentUser();
  const currentUserId = getId(currentUser);

  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState("");
  const [searchText, setSearchText] = useState("");
  const [loadingEmployees, setLoadingEmployees] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  // IDs of messages received while this page is open.
  const [newMessageIds, setNewMessageIds] = useState([]);

  // IDs of users who have unread messages addressed to the logged-in user.
  const [unreadUsers, setUnreadUsers] = useState([]);

  const messagesEndRef = useRef(null);
  const selectedEmployeeIdRef = useRef(null);
  const currentUserIdRef = useRef(currentUserId);

  useEffect(() => {
    selectedEmployeeIdRef.current = getId(selectedEmployee);
  }, [selectedEmployee]);

  useEffect(() => {
    currentUserIdRef.current = currentUserId;
  }, [currentUserId]);

  const addMessageIfMissing = useCallback((newMessage) => {
    setMessages((previousMessages) => {
      const newId = getMessageId(newMessage);

      if (
        newId != null &&
        previousMessages.some(
          (message) =>
            getMessageId(message) != null &&
            String(getMessageId(message)) === String(newId)
        )
      ) {
        return previousMessages;
      }

      return sortMessages([...previousMessages, newMessage]);
    });
  }, []);

  // Load organization members.
  useEffect(() => {
    let cancelled = false;

    async function loadEmployees() {
      setLoadingEmployees(true);
      setError("");

      try {
        const response = await chatService.getEmployees();
        const employeeList = getEmployeeList(response);

        const filteredEmployees = employeeList.filter((employee) => {
          const employeeId = getId(employee);

          return (
            employeeId != null &&
            String(employeeId) !== String(currentUserId)
          );
        });

        if (!cancelled) {
          setEmployees(filteredEmployees);

          setSelectedEmployee((previous) => {
            if (!previous) return null;

            return (
              filteredEmployees.find(
                (employee) =>
                  String(getId(employee)) === String(getId(previous))
              ) ?? null
            );
          });
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message || "Failed to load organization users.");
        }
      } finally {
        if (!cancelled) {
          setLoadingEmployees(false);
        }
      }
    }

    loadEmployees();

    return () => {
      cancelled = true;
    };
  }, [currentUserId]);

  // Load unread messages from the database when the chat page opens.
  // This ensures highlights also appear for messages received earlier.
  useEffect(() => {
    let cancelled = false;

    async function loadUnreadMessages() {
      if (
        currentUserId == null ||
        typeof chatService.getMyMessages !== "function"
      ) {
        return;
      }

      try {
        const response = await chatService.getMyMessages();
        const allMessages = getConversationList(response);

        const unreadSenderIds = [
          ...new Set(
            allMessages
              .filter((message) => {
                const senderId = getMessageSenderId(message);
                const receiverId = getMessageReceiverId(message);

                return (
                  senderId != null &&
                  receiverId != null &&
                  String(receiverId) === String(currentUserId) &&
                  String(senderId) !== String(currentUserId) &&
                  isUnreadMessage(message)
                );
              })
              .map((message) => String(getMessageSenderId(message)))
          ),
        ];

        if (!cancelled) {
          const currentlySelectedId = selectedEmployeeIdRef.current;

          setUnreadUsers(
            unreadSenderIds.filter(
              (id) => String(id) !== String(currentlySelectedId)
            )
          );
        }
      } catch (err) {
        console.error("Failed to load unread messages:", err);
      }
    }

    loadUnreadMessages();

    return () => {
      cancelled = true;
    };
  }, [currentUserId]);

  // Load conversation history when a user is selected.
  useEffect(() => {
    const otherUserId = getId(selectedEmployee);

    selectedEmployeeIdRef.current = otherUserId;

    if (otherUserId == null) {
      setMessages([]);
      setNewMessageIds([]);
      return;
    }

    let cancelled = false;

    async function loadConversation() {
      setLoadingMessages(true);
      setMessages([]);
      setNewMessageIds([]);
      setError("");

      try {
        const response = await chatService.getConversation(otherUserId);
        const conversation = getConversationList(response);

        if (cancelled) return;

        setMessages(sortMessages(conversation));

        // Mark messages from this user to the logged-in user as read.
        try {
          await chatService.markMessagesAsRead(otherUserId);

          if (!cancelled) {
            setUnreadUsers((previous) =>
              previous.filter(
                (id) => String(id) !== String(otherUserId)
              )
            );
          }
        } catch (readError) {
          // Keep the messages visible if marking them as read fails.
          console.error("Failed to mark messages as read:", readError);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err.message || "Failed to load conversation history."
          );
        }
      } finally {
        if (!cancelled) {
          setLoadingMessages(false);
        }
      }
    }

    loadConversation();

    return () => {
      cancelled = true;
    };
  }, [selectedEmployee]);

  // Handle real-time SignalR messages.
  useEffect(() => {
    const handleReceiveMessage = (message) => {
      const senderId = getMessageSenderId(message);
      const receiverId = getMessageReceiverId(message);
      const loggedInUserId = currentUserIdRef.current;
      const selectedUserId = selectedEmployeeIdRef.current;

      if (
        loggedInUserId == null ||
        senderId == null ||
        receiverId == null
      ) {
        return;
      }

      const isIncoming =
        String(receiverId) === String(loggedInUserId) &&
        String(senderId) !== String(loggedInUserId);

      const isOutgoing =
        String(senderId) === String(loggedInUserId) &&
        String(receiverId) !== String(loggedInUserId);

      if (!isIncoming && !isOutgoing) return;

      const belongsToCurrentConversation =
        selectedUserId != null &&
        ((String(senderId) === String(selectedUserId) &&
          String(receiverId) === String(loggedInUserId)) ||
          (String(senderId) === String(loggedInUserId) &&
            String(receiverId) === String(selectedUserId)));

      if (belongsToCurrentConversation) {
        addMessageIfMissing(message);

        if (isIncoming) {
          const messageId = getMessageId(message);

          if (messageId != null) {
            setNewMessageIds((previous) =>
              previous.includes(String(messageId))
                ? previous
                : [...previous, String(messageId)]
            );
          }

          // This conversation is open, so mark the incoming message read.
          chatService
            .markMessagesAsRead(senderId)
            .then(() => {
              setUnreadUsers((previous) =>
                previous.filter((id) => String(id) !== String(senderId))
              );
            })
            .catch((err) => {
              console.error(
                "Failed to mark incoming message as read:",
                err
              );
            });
        }
      } else if (isIncoming) {
        // A message from a different user should highlight that user's row.
        setUnreadUsers((previous) =>
          previous.includes(String(senderId))
            ? previous
            : [...previous, String(senderId)]
        );
      }
    };

    chatConnection.on("ReceiveMessage", handleReceiveMessage);

    if (chatConnection.state === "Disconnected") {
      chatConnection.start().catch((err) => {
        console.error("Unable to start chat connection:", err);
      });
    }

    return () => {
      chatConnection.off("ReceiveMessage", handleReceiveMessage);
    };
  }, [addMessageIfMissing]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  }, [messages]);

  const handleSelectEmployee = (employee) => {
    setSelectedEmployee(employee);
  };

  const handleSendMessage = async (event) => {
    event.preventDefault();

    const text = messageText.trim();
    const receiverId = getId(selectedEmployee);

    if (!text || receiverId == null || sending) return;

    setSending(true);
    setError("");

    try {
      const sentMessage = await chatService.sendMessage(receiverId, text);

      addMessageIfMissing(sentMessage);
      setMessageText("");
    } catch (err) {
      setError(err.message || "Failed to send message.");
    } finally {
      setSending(false);
    }
  };

  const filteredEmployees = employees.filter((employee) =>
    getName(employee).toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <div className="flex h-[calc(100vh-2rem)] min-h-[520px] overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
      {/* Sidebar */}
      <aside className="flex w-full max-w-sm flex-col border-r border-gray-200 sm:w-80">
        <div className="border-b border-gray-200 p-5">
          <div className="mb-4 flex items-center gap-3">
            <div className="rounded-xl bg-indigo-100 p-3 text-indigo-600">
              <MessageCircle size={23} />
            </div>

            <div>
              <h1 className="text-xl font-bold text-gray-900">
                Messages
              </h1>
              <p className="text-sm text-gray-500">
                Chat with your organization
              </p>
            </div>
          </div>

          <div className="relative">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              value={searchText}
              onChange={(event) => setSearchText(event.target.value)}
              placeholder="Search people..."
              className="w-full rounded-xl border border-gray-200 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="px-5 pb-2 pt-4 text-xs font-semibold uppercase tracking-wider text-gray-400">
            Organization members
          </div>

          {loadingEmployees ? (
            <p className="px-5 py-6 text-sm text-gray-500">
              Loading people...
            </p>
          ) : filteredEmployees.length === 0 ? (
            <div className="px-5 py-8 text-center">
              <Users className="mx-auto mb-2 text-gray-300" size={28} />
              <p className="text-sm text-gray-500">
                No other organization members found.
              </p>
            </div>
          ) : (
            filteredEmployees.map((employee) => {
              const employeeId = getId(employee);
              const selected =
                String(getId(selectedEmployee)) === String(employeeId);

              const hasUnread = unreadUsers.includes(String(employeeId));

              return (
                <button
                  type="button"
                  key={employeeId}
                  onClick={() => handleSelectEmployee(employee)}
                  className={`flex w-full items-center gap-3 border-l-4 px-5 py-4 text-left transition ${
                    hasUnread
                      ? "border-amber-500 bg-amber-50 hover:bg-amber-100"
                      : selected
                        ? "border-indigo-600 bg-indigo-50"
                        : "border-transparent hover:bg-gray-50"
                  }`}
                >
                  <div
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full font-semibold ${
                      hasUnread
                        ? "bg-amber-200 text-amber-900 ring-2 ring-amber-400"
                        : "bg-indigo-100 text-indigo-700"
                    }`}
                  >
                    {getName(employee).charAt(0).toUpperCase()}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p
                      className={`truncate ${
                        hasUnread
                          ? "font-bold text-amber-900"
                          : "font-semibold text-gray-900"
                      }`}
                    >
                      {getName(employee)}
                    </p>

                    <div className="flex items-center gap-2">
                      <p
                        className={`truncate text-sm ${
                          hasUnread
                            ? "font-medium text-amber-800"
                            : "text-gray-500"
                        }`}
                      >
                        {getRole(employee)}
                      </p>

                      {hasUnread && (
                        <span className="rounded-full bg-amber-600 px-2 py-0.5 text-[10px] font-bold text-white">
                          NEW
                        </span>
                      )}
                    </div>
                  </div>

                  {selected && !hasUnread && (
                    <Circle
                      size={8}
                      className="shrink-0 fill-indigo-600 text-indigo-600"
                    />
                  )}
                </button>
              );
            })
          )}
        </div>
      </aside>

      {/* Main conversation */}
      <section className="flex min-w-0 flex-1 flex-col">
        {!selectedEmployee ? (
          <div className="flex flex-1 flex-col items-center justify-center p-6 text-center">
            <div className="mb-4 rounded-full bg-indigo-50 p-5 text-indigo-500">
              <MessageCircle size={38} />
            </div>

            <h2 className="text-lg font-semibold text-gray-800">
              Select a conversation
            </h2>

            <p className="mt-2 max-w-xs text-sm text-gray-500">
              Choose an organization member to view messages and start
              chatting.
            </p>
          </div>
        ) : (
          <>
            <header className="flex items-center gap-3 border-b border-gray-200 px-5 py-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 font-semibold text-indigo-700">
                {getName(selectedEmployee).charAt(0).toUpperCase()}
              </div>

              <div>
                <h2 className="font-semibold text-gray-900">
                  {getName(selectedEmployee)}
                </h2>
                <p className="text-sm text-gray-500">
                  {getRole(selectedEmployee)}
                </p>
              </div>
            </header>

            <div className="flex-1 space-y-4 overflow-y-auto bg-gray-50/70 p-4 sm:p-6">
              {loadingMessages ? (
                <p className="py-8 text-center text-sm text-gray-500">
                  Loading conversation...
                </p>
              ) : messages.length === 0 ? (
                <div className="flex h-full min-h-40 flex-col items-center justify-center text-center">
                  <MessageCircle
                    size={32}
                    className="mb-3 text-gray-300"
                  />
                  <p className="font-medium text-gray-600">
                    No messages yet
                  </p>
                  <p className="mt-1 text-sm text-gray-400">
                    Send a message to start this conversation.
                  </p>
                </div>
              ) : (
                messages.map((message, index) => {
                  const senderId = getMessageSenderId(message);
                  const isMine =
                    currentUserId != null &&
                    String(senderId) === String(currentUserId);

                  const messageId = getMessageId(message);
                  const isNew =
                    !isMine &&
                    messageId != null &&
                    newMessageIds.includes(String(messageId));

                  return (
                    <div
                      key={messageId ?? `${senderId}-${index}`}
                      className={`flex ${
                        isMine ? "justify-end" : "justify-start"
                      }`}
                    >
                      <div className="max-w-[85%] sm:max-w-[70%]">
                        <p
                          className={`mb-1 text-xs font-medium ${
                            isMine
                              ? "text-right text-indigo-600"
                              : "text-left text-amber-700"
                          }`}
                        >
                          {isMine ? "You" : getName(selectedEmployee)}
                        </p>

                        <div
                          className={`rounded-2xl px-4 py-3 shadow-sm transition-colors ${
                            isMine
                              ? "rounded-br-sm bg-indigo-600 text-white"
                              : isNew
                                ? "rounded-bl-sm border-2 border-amber-400 bg-amber-100 text-gray-900 ring-2 ring-amber-200"
                                : "rounded-bl-sm border border-gray-200 bg-white text-gray-900"
                          }`}
                        >
                          {isNew && (
                            <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-amber-700">
                              New message
                            </p>
                          )}

                          <p className="whitespace-pre-wrap break-words text-sm">
                            {getMessageText(message)}
                          </p>

                          <p
                            className={`mt-2 text-right text-[11px] ${
                              isMine ? "text-indigo-100" : "text-gray-400"
                            }`}
                          >
                            {getMessageTime(message)}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}

              <div ref={messagesEndRef} />
            </div>

            <form
              onSubmit={handleSendMessage}
              className="border-t border-gray-200 bg-white p-4"
            >
              {error && (
                <p className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
                  {error}
                </p>
              )}

              <div className="flex items-end gap-3">
                <textarea
                  rows={1}
                  value={messageText}
                  onChange={(event) => setMessageText(event.target.value)}
                  onKeyDown={(event) => {
                    if (
                      event.key === "Enter" &&
                      !event.shiftKey &&
                      !event.nativeEvent.isComposing
                    ) {
                      event.preventDefault();
                      event.currentTarget.form?.requestSubmit();
                    }
                  }}
                  placeholder={`Message ${getName(selectedEmployee)}...`}
                  className="max-h-32 min-h-11 flex-1 resize-y rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />

                <button
                  type="submit"
                  disabled={!messageText.trim() || sending}
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
                  aria-label="Send message"
                >
                  <Send size={18} />
                </button>
              </div>

              <p className="mt-2 text-xs text-gray-400">
                Press Enter to send. Use Shift + Enter for a new line.
              </p>
            </form>
          </>
        )}
      </section>
    </div>
  );
}

export default Chat;
