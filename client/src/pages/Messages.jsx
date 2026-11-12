import { useContext, useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router";
import AuthContext from "../context/AuthContext";
import SocketContext from "../context/SocketContext";

function Messages() {
  const { user, token } = useContext(AuthContext);
  const socket = useContext(SocketContext);
  const [searchParams] = useSearchParams();
  const targetUserId = searchParams.get("userId");
  const currentUserId = String(user?._id || user?.id || "");

  const chatMessagesRef = useRef(null);
  const typingTimerRef = useRef(null);
  const searchControllerRef = useRef(null);

  const [search, setSearch] = useState("");
  const [users, setUsers] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [conversationsLoading, setConversationsLoading] = useState(false);
  const [conversationsError, setConversationsError] = useState("");
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [isOtherUserTyping, setIsOtherUserTyping] = useState(false);
  const [loading, setLoading] = useState(false);
  const [chatLoading, setChatLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [chatError, setChatError] = useState("");

  const closeSearchResults = () => {
    searchControllerRef.current?.abort();
    setLoading(false);
    setShowSearchResults(false);
    setSearch("");
    setUsers([]);
    setError("");
  };

  const openConversation = (person) => {
    const personId = person?._id || person?.id;
    if (!personId || String(personId) === currentUserId) return;

    const selectedPerson = { ...person, _id: personId };
    setSelectedUser(selectedPerson);
    closeSearchResults();

    // Show a new contact temporarily, even before their first message.
    setConversations((previous) => {
      const existing = previous.find(
        (conversation) => String(conversation.user?._id) === String(personId)
      );
      if (existing) return previous;
      return [
        { user: selectedPerson, lastMessage: null, unreadCount: 0 },
        ...previous,
      ];
    });
  };

  // Open chat links from Discover and other users' profile pages.
  useEffect(() => {
    if (!targetUserId || !token || String(targetUserId) === currentUserId) {
      return;
    }

    const controller = new AbortController();
    const loadTargetUser = async () => {
      try {
        const response = await fetch(`/api/users/${targetUserId}`, {
          headers: { Authorization: `Bearer ${token}` },
          signal: controller.signal,
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || "Failed to load user");

        const profile = data.user || data.profile || data;
        const personId = profile?._id || profile?.id;
        if (!personId || !profile.username) {
          throw new Error("Invalid user profile");
        }
        if (controller.signal.aborted) return;

        const person = { ...profile, _id: personId };
        setSelectedUser(person);
        setShowSearchResults(false);
        setSearch("");
        setUsers([]);
        setConversations((previous) => {
          if (previous.some((item) => String(item.user?._id) === String(personId))) {
            return previous;
          }
          return [{ user: person, lastMessage: null, unreadCount: 0 }, ...previous];
        });
      } catch (err) {
        if (err.name !== "AbortError") setError(err.message);
      }
    };

    loadTargetUser();
    return () => controller.abort();
  }, [targetUserId, token, currentUserId]);

  // Load the inbox from MongoDB.
  useEffect(() => {
    if (!token) {
      setConversations([]);
      return;
    }
    const controller = new AbortController();
    const loadConversations = async () => {
      setConversationsLoading(true);
      setConversationsError("");
      try {
        const response = await fetch("/api/messages/conversations", {
          headers: { Authorization: `Bearer ${token}` },
          signal: controller.signal,
        });
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.message || "Failed to load conversations");
        }
        if (controller.signal.aborted) return;
        const saved = data.conversations || [];
        setConversations((previous) => [
          ...saved,
          ...previous.filter(
            (entry) =>
              !entry.lastMessage &&
              !saved.some(
                (item) => String(item.user?._id) === String(entry.user?._id)
              )
          ),
        ]);
      } catch (err) {
        if (err.name !== "AbortError") setConversationsError(err.message);
      } finally {
        if (!controller.signal.aborted) setConversationsLoading(false);
      }
    };
    loadConversations();
    return () => controller.abort();
  }, [token]);

  const handleSearch = async (event) => {
    event.preventDefault();
    const query = search.trim();
    if (!query) return;

    searchControllerRef.current?.abort();
    const controller = new AbortController();
    searchControllerRef.current = controller;
    setShowSearchResults(true);
    setLoading(true);
    setError("");
    setUsers([]);

    try {
      const response = await fetch(
        `/api/users/search?q=${encodeURIComponent(query)}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          signal: controller.signal,
        }
      );
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Search failed");
      if (controller.signal.aborted) return;
      setUsers(
        (data.users || []).filter(
          (person) => String(person._id || person.id) !== currentUserId
        )
      );
    } catch (err) {
      if (err.name !== "AbortError") setError(err.message);
    } finally {
      if (!controller.signal.aborted) setLoading(false);
    }
  };

  // Load the messages when a conversation is selected.
  useEffect(() => {
    const personId = selectedUser?._id;
    if (!personId || !token) {
      setMessages([]);
      return;
    }
    const controller = new AbortController();
    const loadChat = async () => {
      setChatLoading(true);
      setChatError("");
      setMessages([]);
      setNewMessage("");
      setIsOtherUserTyping(false);

      try {
        const response = await fetch(`/api/messages/${personId}`, {
          headers: { Authorization: `Bearer ${token}` },
          signal: controller.signal,
        });
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.message || "Failed to load conversation");
        }
        if (controller.signal.aborted) return;
        setMessages((previous) => {
          const saved = data.messages || [];
          const incoming = previous.filter(
            (message) => !saved.some((item) => item._id === message._id)
          );
          return [...saved, ...incoming].sort(
            (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
          );
        });
      } catch (err) {
        if (err.name !== "AbortError") setChatError(err.message);
      } finally {
        if (!controller.signal.aborted) setChatLoading(false);
      }
    };
    loadChat();
    return () => controller.abort();
  }, [selectedUser?._id, token]);

  // Mark existing messages as read when opening a chat.
  useEffect(() => {
    const personId = selectedUser?._id;
    if (!personId || !token) return;
    const controller = new AbortController();
    const markRead = async () => {
      try {
        const response = await fetch(`/api/messages/${personId}/read`, {
          method: "PATCH",
          headers: { Authorization: `Bearer ${token}` },
          signal: controller.signal,
        });
        if (!response.ok) throw new Error("Could not mark messages as read");
        if (controller.signal.aborted) return;
        setConversations((previous) =>
          previous.map((item) =>
            String(item.user?._id) === String(personId)
              ? { ...item, unreadCount: 0 }
              : item
          )
        );
      } catch (err) {
        if (err.name !== "AbortError") console.error(err.message);
      }
    };
    markRead();
    return () => controller.abort();
  }, [selectedUser?._id, token]);

  // Receive messages immediately and update the inbox/unread counts.
  useEffect(() => {
    if (!socket || !currentUserId || !token) return;
    const onNewMessage = async (message) => {
      const senderId = String(message.sender?._id || message.sender || "");
      const receiverId = String(message.receiver?._id || message.receiver || "");
      if (receiverId !== currentUserId) return;

      const isOpen = senderId === String(selectedUser?._id || "");
      if (isOpen) {
        setMessages((previous) =>
          previous.some((item) => item._id === message._id)
            ? previous
            : [...previous, message]
        );
      }

      setConversations((previous) => {
        const old = previous.find(
          (item) => String(item.user?._id) === senderId
        );
        const sender =
          typeof message.sender === "object" && message.sender
            ? message.sender
            : old?.user || (isOpen ? selectedUser : { _id: senderId, username: "User" });
        return [
          {
            user: { ...sender, _id: senderId },
            lastMessage: {
              content: message.content,
              sender: senderId,
              createdAt: message.createdAt,
            },
            unreadCount: isOpen ? 0 : (old?.unreadCount || 0) + 1,
          },
          ...previous.filter((item) => String(item.user?._id) !== senderId),
        ];
      });

      if (isOpen) {
        try {
          const response = await fetch(`/api/messages/${senderId}/read`, {
            method: "PATCH",
            headers: { Authorization: `Bearer ${token}` },
          });
          if (!response.ok) throw new Error("Failed to mark message as read");
        } catch (err) {
          console.error(err.message);
          setConversations((previous) =>
            previous.map((item) =>
              String(item.user?._id) === senderId
                ? { ...item, unreadCount: (item.unreadCount || 0) + 1 }
                : item
            )
          );
        }
      }
    };
    socket.on("message:new", onNewMessage);
    return () => socket.off("message:new", onNewMessage);
  }, [socket, currentUserId, selectedUser?._id, token]);

  // Read receipts for messages we've sent.
  useEffect(() => {
    if (!socket || !selectedUser?._id || !currentUserId) return;
    const onRead = ({ readBy }) => {
      if (String(readBy) !== String(selectedUser._id)) return;
      setMessages((previous) =>
        previous.map((message) => {
          const senderId = String(message.sender?._id || message.sender || "");
          const receiverId = String(message.receiver?._id || message.receiver || "");
          return senderId === currentUserId && receiverId === String(readBy)
            ? { ...message, isRead: true }
            : message;
        })
      );
    };
    socket.on("messages:read", onRead);
    return () => socket.off("messages:read", onRead);
  }, [socket, selectedUser?._id, currentUserId]);

  // Typing indicators for the currently selected conversation.
  useEffect(() => {
    setIsOtherUserTyping(false);
    if (!socket || !selectedUser?._id) return;
    let timeout;
    const stop = () => {
      clearTimeout(timeout);
      setIsOtherUserTyping(false);
    };
    const onStart = ({ senderId }) => {
      if (String(senderId) !== String(selectedUser._id)) return;
      setIsOtherUserTyping(true);
      clearTimeout(timeout);
      timeout = setTimeout(stop, 2500);
    };
    const onStop = ({ senderId }) => {
      if (String(senderId) === String(selectedUser._id)) stop();
    };
    socket.on("typing:start", onStart);
    socket.on("typing:stop", onStop);
    socket.on("disconnect", stop);
    return () => {
      clearTimeout(timeout);
      socket.off("typing:start", onStart);
      socket.off("typing:stop", onStop);
      socket.off("disconnect", stop);
    };
  }, [socket, selectedUser?._id]);

  const stopTyping = () => {
    clearTimeout(typingTimerRef.current);
    typingTimerRef.current = null;
    if (socket?.connected && selectedUser?._id) {
      socket.emit("typing:stop", selectedUser._id);
    }
  };

  const handleMessageChange = (event) => {
    const value = event.target.value;
    setNewMessage(value);
    clearTimeout(typingTimerRef.current);
    if (!socket?.connected || !selectedUser?._id) return;
    if (!value.trim()) {
      stopTyping();
      return;
    }
    socket.emit("typing:start", selectedUser._id);
    typingTimerRef.current = setTimeout(() => {
      socket.emit("typing:stop", selectedUser._id);
      typingTimerRef.current = null;
    }, 1500);
  };

  useEffect(() => {
    return () => {
      clearTimeout(typingTimerRef.current);
      if (socket?.connected && selectedUser?._id) {
        socket.emit("typing:stop", selectedUser._id);
      }
    };
  }, [socket, selectedUser?._id]);

  const handleSendMessage = async (event) => {
    event.preventDefault();
    const content = newMessage.trim();
    if (!content || !selectedUser?._id || sending || chatLoading) return;
    if (content.length > 2000) {
      setChatError("Message cannot exceed 2000 characters");
      return;
    }

    setSending(true);
    setChatError("");
    try {
      const response = await fetch(`/api/messages/${selectedUser._id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to send message");
      const sent = data.data;
      if (!sent?._id) throw new Error("Unexpected message response");

      setMessages((previous) =>
        previous.some((item) => item._id === sent._id)
          ? previous
          : [...previous, sent]
      );
      setConversations((previous) => [
        {
          user: selectedUser,
          lastMessage: {
            content: sent.content,
            sender: currentUserId,
            createdAt: sent.createdAt,
          },
          unreadCount: 0,
        },
        ...previous.filter(
          (item) => String(item.user?._id) !== String(selectedUser._id)
        ),
      ]);
      setNewMessage("");
      stopTyping();
    } catch (err) {
      setChatError(err.message);
    } finally {
      setSending(false);
    }
  };

  // Scroll to the latest message.
  useEffect(() => {
    const container = chatMessagesRef.current;
    if (container) container.scrollTop = container.scrollHeight;
  }, [messages]);

  return (
    <div className="messages-page ss-messages-page">
      <h1>Messages 💬</h1>
      <p>Search for someone to start a private conversation.</p>

      <form className="ss-message-search" onSubmit={handleSearch} role="search">
        <input
          type="search"
          placeholder="Search by username..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          aria-label="Search users by username"
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? "Searching..." : "Search"}
        </button>
      </form>

      {showSearchResults ? (
        <section className="message-users ss-messages-sidebar">
          <div className="ss-sidebar-heading">
            <h2>Search Results</h2>
            <button type="button" className="ss-back-inbox" onClick={closeSearchResults}>
              ← Inbox
            </button>
          </div>

          {loading && <p>Searching users...</p>}
          {!loading && error && <p role="alert">{error}</p>}
          {!loading && !error && users.length === 0 && (
            <p className="ss-sidebar-empty">No matching users found.</p>
          )}
          {!loading && !error && users.map((person) => (
            <button
              key={person._id || person.id}
              type="button"
              className="ss-search-user-row"
              onClick={() => openConversation(person)}
            >
              {person.profilePicture ? (
                <img src={person.profilePicture} alt="" className="ss-inbox-avatar" />
              ) : (
                <span className="ss-inbox-avatar ss-inbox-placeholder">👤</span>
              )}
              <span className="ss-sidebar-user-info">
                <strong>@{person.username}</strong>
                <small>{person.bio || "Start a conversation"}</small>
              </span>
              <span className="ss-sidebar-chevron">›</span>
            </button>
          ))}
        </section>
      ) : (
        <section className="recent-conversations ss-messages-sidebar">
          <div className="ss-sidebar-heading"><h2>Recent Conversations</h2></div>
          {conversationsLoading && <p>Loading conversations...</p>}
          {conversationsError && <p role="alert">{conversationsError}</p>}
          {!conversationsLoading && !conversationsError && conversations.length === 0 && (
            <p className="ss-sidebar-empty">No recent conversations yet. Search for someone to start chatting!</p>
          )}
          {conversations.filter((item) => item.user?._id).map((conversation) => {
            const person = conversation.user;
            const isSelected = String(selectedUser?._id) === String(person._id);
            return (
              <button
                key={person._id}
                type="button"
                className={`conversation-card ss-conversation-row ${isSelected ? "is-selected" : ""}`}
                onClick={() => openConversation(person)}
                aria-pressed={isSelected}
              >
                {person.profilePicture ? (
                  <img src={person.profilePicture} alt="" className="ss-inbox-avatar" />
                ) : (
                  <span className="ss-inbox-avatar ss-inbox-placeholder">👤</span>
                )}
                <span className="ss-sidebar-user-info">
                  <strong>@{person.username}</strong>
                  <small>{conversation.lastMessage?.content || "Start a conversation"}</small>
                </span>
                {conversation.unreadCount > 0 && (
                  <span className="unread-badge">{conversation.unreadCount}</span>
                )}
              </button>
            );
          })}
        </section>
      )}

      {!selectedUser && (
        <div className="chat-container ss-empty-chat">
          <div className="ss-empty-chat-icon">💬</div>
          <h2>Your messages, your space</h2>
          <p>Select a conversation or search for someone to start chatting.</p>
          <span>Connect. Share. Stay close.</span>
        </div>
      )}

      {selectedUser && (
        <div className="chat-container">
          <div className="chat-header">
            {selectedUser.profilePicture ? (
              <img
                src={selectedUser.profilePicture}
                alt=""
                className="chat-header-avatar"
              />
            ) : (
              <div className="chat-header-avatar chat-header-placeholder">👤</div>
            )}
            <div className="chat-header-info">
              <h2>@{selectedUser.username}</h2>
              <span>Private conversation</span>
            </div>
          </div>

          {chatLoading && <p>Loading messages...</p>}
          {chatError && <p role="alert">{chatError}</p>}
          {!chatLoading && !chatError && messages.length === 0 && (
            <p>No messages yet. Start the conversation!</p>
          )}

          <div className="chat-messages" ref={chatMessagesRef}>
            {messages.map((message) => {
              const senderId = String(message.sender?._id || message.sender || "");
              const isMine = senderId === currentUserId;
              return (
                <div
                  key={message._id}
                  className={`chat-message ${isMine ? "my-message" : "other-message"}`}
                >
                  <p>{message.content}</p>
                  <small>
                    {new Date(message.createdAt).toLocaleString()}
                    {isMine && (
                      <span>{message.isRead ? " · Seen ✓✓" : " · Sent ✓"}</span>
                    )}
                  </small>
                </div>
              );
            })}
          </div>

          {isOtherUserTyping && (
            <p className="typing-indicator">@{selectedUser.username} is typing...</p>
          )}

          <form className="message-form" onSubmit={handleSendMessage}>
            <input
              type="text"
              placeholder="Type a message..."
              value={newMessage}
              onChange={handleMessageChange}
              onBlur={stopTyping}
              maxLength={2000}
              disabled={sending || chatLoading}
            />
            <button type="submit" disabled={sending || chatLoading || !newMessage.trim()}>
              {sending ? "Sending..." : "Send"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

export default Messages;
