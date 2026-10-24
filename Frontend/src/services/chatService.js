
const API_URL = "http://localhost:5250/api";

const getToken = () => localStorage.getItem("token");

async function apiRequest(url, options = {}) {
  const token = getToken();

  const response = await fetch(`${API_URL}${url}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || `Request failed: ${response.status}`);
  }

  if (response.status === 204) return null;

  return response.json();
}

const chatService = {
  getEmployees: () =>
    apiRequest("/Auth/organization-employees"),

  sendMessage: (receiverId, message) =>
    apiRequest("/Chat/message", {
      method: "POST",
      body: JSON.stringify({
        receiverId: Number(receiverId),
        message,
      }),
    }),

  getMyMessages: () =>
    apiRequest("/Chat/message/my"),

  getConversation: (otherUserId) =>
  apiRequest(`/Chat/conversation/${Number(otherUserId)}`),

  markMessagesAsRead: (senderId) =>
  apiRequest(`/Chat/conversation/${Number(senderId)}/read`, {
    method: "PATCH",
  }),
};

export default chatService;
