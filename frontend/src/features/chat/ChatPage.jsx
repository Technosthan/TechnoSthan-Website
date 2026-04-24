import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { sendChatMessage } from "./chatApi";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Copy, Check } from "lucide-react";
import { useTheme } from "../../contexts/ThemeContext";
import {
  Send,
  Mic,
  MicOff,
  MessageCircle,
  User,
  Bot,
  Loader2,
  Plus,
  Trash2,
  Menu,
  X,
} from "lucide-react";

const CodeBlock = ({ children, className, ...props }) => {
  const { theme } = useTheme();
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const text = children;
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isCodeBlock = className && className.startsWith("language-");

  if (isCodeBlock) {
    return (
      <div className="relative group">
        <pre
          className={`${className} !bg-gray-900 !border !border-gray-700 !rounded-lg !p-4 !overflow-x-auto`}
        >
          <code {...props} className={className}>
            {children}
          </code>
        </pre>
        <button
          onClick={handleCopy}
          className="absolute top-2 right-2 p-2 bg-gray-800 hover:bg-gray-700 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200"
          title="Copy code"
        >
          {copied ? (
            <Check size={16} className="text-green-400" />
          ) : (
            <Copy size={16} className="text-gray-400" />
          )}
        </button>
      </div>
    );
  }

  return (
    <code
      className={`${className} !bg-gray-700 !px-1.5 !py-0.5 !rounded !text-sm`}
      {...props}
    >
      {children}
    </code>
  );
};

const ChatPage = () => {
  const { theme } = useTheme();
  const [chats, setChats] = useState([]);
  const [currentChatId, setCurrentChatId] = useState(null);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);

  // Load chats from localStorage on mount
  useEffect(() => {
    const savedChats = localStorage.getItem("chatHistory");
    if (savedChats) {
      const parsedChats = JSON.parse(savedChats);
      // Convert timestamp strings back to Date objects
      const chatsWithDates = parsedChats.map((chat) => ({
        ...chat,
        messages: chat.messages.map((msg) => ({
          ...msg,
          timestamp: new Date(msg.timestamp),
        })),
      }));
      setChats(chatsWithDates);
      if (chatsWithDates.length > 0) {
        setCurrentChatId(chatsWithDates[0].id);
      }
    } else {
      // Create initial chat
      createNewChat();
    }
  }, []);

  // Save chats to localStorage whenever chats change
  useEffect(() => {
    if (chats.length > 0) {
      localStorage.setItem("chatHistory", JSON.stringify(chats));
    }
  }, [chats]);

  // Auto-collapse sidebar on mobile
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chats, currentChatId]);

  const createNewChat = () => {
    const newChat = {
      id: `chat-${Date.now()}`,
      title: "New Chat",
      messages: [],
    };
    setChats((prev) => [newChat, ...prev]);
    setCurrentChatId(newChat.id);
  };

  const getCurrentChat = () => {
    return chats.find((chat) => chat.id === currentChatId);
  };

  const updateChat = (chatId, updates) => {
    setChats((prev) =>
      prev.map((chat) => (chat.id === chatId ? { ...chat, ...updates } : chat)),
    );
  };

  const handleSendMessage = async (message = inputMessage) => {
    if (!message.trim()) return;

    const userMessage = {
      id: `user-${Date.now()}`,
      text: message,
      sender: "user",
      timestamp: new Date(),
    };

    const currentChat = getCurrentChat();
    if (!currentChat) return;

    // Update title if it's the first message
    const updatedMessages = [...currentChat.messages, userMessage];
    const title =
      currentChat.title === "New Chat"
        ? message.slice(0, 30) + (message.length > 30 ? "..." : "")
        : currentChat.title;

    updateChat(currentChatId, { messages: updatedMessages, title });
    setInputMessage("");
    setIsLoading(true);
    setError(null);

    try {
      const history = updatedMessages.slice(-5).map((msg) => ({
        role: msg.sender === "user" ? "user" : "assistant",
        content: msg.text,
      }));

      const response = await sendChatMessage(message, history);

      // Debug: Log the full API response
      console.log("API Response:", response);
      console.log("Response data:", response?.data);

      // Extract AI response with multiple fallback options
      let aiResponse = "";

      if (response?.data?.reply) {
        aiResponse = response.data.reply;
      } else if (response?.data?.data) {
        aiResponse = response.data.data;
      } else if (response?.data?.message) {
        aiResponse = response.data.message;
      } else if (response?.data?.response) {
        aiResponse = response.data.response;
      } else if (response?.data?.candidates?.[0]?.content?.parts?.[0]?.text) {
        aiResponse = response.data.candidates[0].content.parts[0].text;
      }

      // Fallback if response is empty or undefined
      if (!aiResponse || aiResponse.trim() === "") {
        aiResponse = "No response received from AI. Please try again.";
      }

      console.log("Extracted AI response:", aiResponse);

      const botMessage = {
        id: `bot-${Date.now()}`,
        text: aiResponse,
        sender: "bot",
        timestamp: new Date(),
      };

      updateChat(currentChatId, { messages: [...updatedMessages, botMessage] });
    } catch (err) {
      console.error("Chat error:", err);
      setError("Failed to send message. Please try again.");
      // Remove the user message on error
      updateChat(currentChatId, { messages: currentChat.messages });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const startVoiceRecognition = () => {
    if (!("webkitSpeechRecognition" in window)) {
      alert("Voice recognition is not supported in this browser.");
      return;
    }

    const recognition = new window.webkitSpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-US";

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInputMessage(transcript);
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  const stopVoiceRecognition = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  };

  const deleteChat = (chatId) => {
    setChats((prev) => prev.filter((chat) => chat.id !== chatId));
    if (currentChatId === chatId) {
      const remainingChats = chats.filter((chat) => chat.id !== chatId);
      if (remainingChats.length > 0) {
        setCurrentChatId(remainingChats[0].id);
      } else {
        createNewChat();
      }
    }
  };

  const currentChat = getCurrentChat();
  const messages = currentChat ? currentChat.messages : [];

  return (
    <div className={`flex h-screen ${theme.bgGradient} ${theme.text}`}>
      {/* Sidebar */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: 260 }}
            exit={{ width: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className={`${theme.navbar} border-r ${theme.border} flex flex-col overflow-hidden`}
          >
            {/* Sidebar Header */}
            <div className={`p-4 border-b ${theme.border}`}>
              <button
                onClick={createNewChat}
                className={`w-full flex items-center gap-3 px-3 py-2 ${theme.button} rounded-lg transition-colors`}
              >
                <Plus size={16} />
                <span className="text-sm font-medium">New Chat</span>
              </button>
            </div>

            {/* Chat History */}
            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              {chats.map((chat) => (
                <div
                  key={chat.id}
                  className={`group relative p-3 rounded-lg cursor-pointer transition-colors ${
                    chat.id === currentChatId
                      ? theme.navItemHover
                      : theme.navItem
                  }`}
                  onClick={() => setCurrentChatId(chat.id)}
                >
                  <h3 className="text-sm font-medium truncate pr-6">
                    {chat.title}
                  </h3>
                  {chat.messages.length > 0 && (
                    <p className="text-xs text-gray-400 truncate mt-1">
                      {chat.messages[chat.messages.length - 1].text}
                    </p>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteChat(chat.id);
                    }}
                    className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-gray-600 rounded"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className={`h-14 border-b ${theme.border} flex items-center px-4`}>
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className={`p-2 hover:bg-gray-700/50 rounded-lg transition-colors`}
          >
            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <h1 className="ml-4 text-lg font-semibold">AI Assistant</h1>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="max-w-4xl mx-auto space-y-6">
            {messages.length === 0 && !isLoading && (
              <div className="text-center py-12">
                <Bot className="mx-auto mb-4 text-gray-400" size={48} />
                <h3 className="text-xl font-semibold text-gray-300 mb-2">
                  Start a conversation
                </h3>
                <p className={`${theme.textSecondary}`}>
                  Ask me anything about farming, agriculture, or crop
                  management!
                </p>
              </div>
            )}

            {messages.map((message, index) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className={`flex items-start gap-3 ${
                  message.sender === "user" ? "justify-end" : "justify-start"
                }`}
              >
                {message.sender === "bot" && (
                  <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <Bot className="text-white" size={16} />
                  </div>
                )}

                <div
                  className={`max-w-2xl px-4 py-3 rounded-2xl ${
                    message.sender === "user"
                      ? `${theme.primary} text-white shadow-lg`
                      : `${theme.cardOpacity}`
                  }`}
                >
                  <div className={`${theme.text} leading-relaxed`}>
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        code: CodeBlock,
                        pre: ({ children }) => <>{children}</>,
                      }}
                    >
                      {message.text || "Message content unavailable"}
                    </ReactMarkdown>
                  </div>
                  <p
                    className={`text-xs mt-2 ${
                      message.sender === "user"
                        ? "text-blue-200"
                        : `${theme.textSecondary}`
                    }`}
                  >
                    {message.timestamp.toLocaleTimeString()}
                  </p>
                </div>

                {message.sender === "user" && (
                  <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <User className="text-white" size={16} />
                  </div>
                )}
              </motion.div>
            ))}

            {isLoading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-start gap-3"
              >
                <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <Bot className="text-white" size={16} />
                </div>
                <div className={`${theme.card} px-4 py-3 rounded-2xl`}>
                  <div className="flex items-center gap-2">
                    <Loader2 className="animate-spin" size={16} />
                    <span className={`text-sm ${theme.textSecondary}`}>
                      Thinking...
                    </span>
                  </div>
                </div>
              </motion.div>
            )}

            {error && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-red-900/20 border border-red-800 rounded-lg p-3 max-w-2xl"
              >
                <p className="text-sm text-red-400">{error}</p>
              </motion.div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input */}
        <div className={`p-4 border-t ${theme.border}`}>
          <div className="max-w-4xl mx-auto">
            <div className="relative">
              <textarea
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask about farming, crops, weather, or any agricultural question..."
                className={`${theme.input} ${theme.text} w-full px-4 py-3 pr-12 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none placeholder-gray-400`}
                rows="1"
                disabled={isLoading}
              />
              <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
                <button
                  onClick={
                    isListening ? stopVoiceRecognition : startVoiceRecognition
                  }
                  className={`p-1 rounded-full transition-colors ${
                    isListening
                      ? "text-red-400 hover:text-red-300"
                      : "text-gray-400 hover:text-gray-300"
                  }`}
                  disabled={isLoading}
                >
                  {isListening ? <MicOff size={18} /> : <Mic size={18} />}
                </button>
                <button
                  onClick={() => handleSendMessage()}
                  disabled={!inputMessage.trim() || isLoading}
                  className={`p-2 ${theme.button} disabled:bg-gray-600 rounded-full transition-colors`}
                >
                  <Send size={16} />
                </button>
              </div>
            </div>
            <p className={`text-xs ${theme.textSecondary} mt-2 text-center`}>
              Press Enter to send • Click microphone for voice input
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
