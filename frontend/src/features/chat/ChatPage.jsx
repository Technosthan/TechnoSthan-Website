import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { sendChatMessage, getChatHistory } from "./chatApi";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import {
  Send,
  Mic,
  MicOff,
  MessageCircle,
  User,
  Bot,
  Loader2,
} from "lucide-react";

const ChatPage = () => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Fetch chat history on component mount
    const fetchChatHistory = async () => {
      try {
        const response = await getChatHistory();
        const history = response.data.data || [];
        // Convert history to message format
        const formattedMessages = [];
        history.reverse().forEach((chat) => {
          formattedMessages.push({
            id: `user-${chat._id}`,
            text: chat.message,
            sender: "user",
            timestamp: new Date(chat.createdAt),
          });
          formattedMessages.push({
            id: `bot-${chat._id}`,
            text: chat.response,
            sender: "bot",
            timestamp: new Date(chat.createdAt),
          });
        });
        setMessages(formattedMessages);
      } catch (err) {
        console.error("Failed to fetch chat history:", err);
        setError("Failed to load chat history");
      }
    };

    fetchChatHistory();
  }, []);

  const handleSendMessage = async (message = inputMessage) => {
    if (!message.trim()) return;

    const userMessage = {
      id: `user-${Date.now()}`,
      text: message,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage("");
    setIsLoading(true);
    setError(null);

    try {
      // Prepare history for context (last 5 messages)
      const recentMessages = messages.slice(-5);
      const history = recentMessages.map((msg) => ({
        role: msg.sender === "user" ? "user" : "assistant",
        content: msg.text,
      }));

      const response = await sendChatMessage(message, history);
      const botMessage = {
        id: `bot-${Date.now()}`,
        text: response.data.data,
        sender: "bot",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMessage]);
    } catch (err) {
      console.error("Failed to send message:", err);
      setError("Failed to send message. Please try again.");
      // Remove the user message if sending failed
      setMessages((prev) => prev.filter((msg) => msg.id !== userMessage.id));
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

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.5,
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5 },
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-100 via-white to-yellow-100 dark:from-green-900 dark:via-gray-900 dark:to-yellow-900 transition-colors duration-500">
      <Navbar />

      <div className="container mx-auto px-6 py-8">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-4xl mx-auto"
        >
          {/* Header */}
          <motion.div
            variants={itemVariants}
            className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-lg rounded-2xl p-6 shadow-xl border border-white/20 mb-6"
          >
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center">
                <MessageCircle className="text-white" size={32} />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
                  AI Agricultural Assistant
                </h1>
                <p className="text-gray-600 dark:text-gray-300">
                  Get instant farming advice and agricultural insights
                </p>
              </div>
            </div>
          </motion.div>

          {/* Chat Container */}
          <motion.div
            variants={itemVariants}
            className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 overflow-hidden"
          >
            {/* Messages Area */}
            <div className="h-96 overflow-y-auto p-6 space-y-4">
              {messages.length === 0 && !isLoading && (
                <div className="text-center py-12">
                  <Bot className="mx-auto mb-4 text-gray-400" size={48} />
                  <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-400 mb-2">
                    Start a conversation
                  </h3>
                  <p className="text-gray-500 dark:text-gray-500">
                    Ask me anything about farming, agriculture, or crop
                    management!
                  </p>
                </div>
              )}

              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex items-start gap-3 ${
                    message.sender === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  {message.sender === "bot" && (
                    <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <Bot className="text-white" size={16} />
                    </div>
                  )}

                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                      message.sender === "user"
                        ? "bg-gradient-to-r from-green-400 to-blue-500 text-white"
                        : "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white"
                    }`}
                  >
                    <p className="text-sm">{message.text}</p>
                    <p
                      className={`text-xs mt-1 ${
                        message.sender === "user"
                          ? "text-green-100"
                          : "text-gray-500 dark:text-gray-400"
                      }`}
                    >
                      {message.timestamp.toLocaleTimeString()}
                    </p>
                  </div>

                  {message.sender === "user" && (
                    <div className="w-8 h-8 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0">
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
                  <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <Bot className="text-white" size={16} />
                  </div>
                  <div className="bg-gray-100 dark:bg-gray-700 px-4 py-2 rounded-2xl">
                    <div className="flex items-center gap-2">
                      <Loader2 className="animate-spin" size={16} />
                      <span className="text-sm text-gray-600 dark:text-gray-400">
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
                  className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3"
                >
                  <p className="text-sm text-red-600 dark:text-red-400">
                    {error}
                  </p>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="border-t border-gray-200 dark:border-gray-700 p-4">
              <div className="flex items-center gap-3">
                <div className="flex-1 relative">
                  <textarea
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Ask about farming, crops, weather, or any agricultural question..."
                    className="w-full px-4 py-3 pr-12 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                    rows="1"
                    disabled={isLoading}
                  />
                  <button
                    onClick={
                      isListening ? stopVoiceRecognition : startVoiceRecognition
                    }
                    className={`absolute right-3 top-1/2 transform -translate-y-1/2 p-1 rounded-full transition-colors ${
                      isListening
                        ? "text-red-500 hover:text-red-600"
                        : "text-gray-400 hover:text-gray-600"
                    }`}
                    disabled={isLoading}
                  >
                    {isListening ? <MicOff size={20} /> : <Mic size={20} />}
                  </button>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleSendMessage()}
                  disabled={!inputMessage.trim() || isLoading}
                  className="bg-gradient-to-r from-green-400 to-blue-500 hover:from-green-500 hover:to-blue-600 disabled:from-gray-400 disabled:to-gray-500 text-white p-3 rounded-xl shadow-lg transition-all duration-300 disabled:cursor-not-allowed"
                >
                  <Send size={20} />
                </motion.button>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
                Press Enter to send • Click microphone for voice input
              </p>
            </div>
          </motion.div>
        </motion.div>
      </div>

      <Footer />
    </div>
  );
};

export default ChatPage;
