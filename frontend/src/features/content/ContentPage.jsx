import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  getAllContent,
  getQuestionsByContentId,
  summarizeContent,
} from "./contentApi";
import { useTheme } from "../../contexts/ThemeContext";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import {
  BookOpen,
  Play,
  Search,
  Sprout,
  Droplets,
  Zap,
  Target,
  Image as ImageIcon,
  Link as LinkIcon,
  Brain,
  Loader2,
} from "lucide-react";

const ContentPage = () => {
  const { theme } = useTheme();
  const [contents, setContents] = useState([]);
  const [selectedContent, setSelectedContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [hasQuiz, setHasQuiz] = useState(false);
  const [summary, setSummary] = useState(null);
  const [summarizing, setSummarizing] = useState(false);

  // Icons for topics
  const getTopicIcon = (title) => {
    if (title.toLowerCase().includes("smart farming"))
      return <Sprout className="text-green-500" size={24} />;
    if (title.toLowerCase().includes("soil"))
      return <Droplets className="text-blue-500" size={24} />;
    return <Zap className="text-yellow-500" size={24} />;
  };

  useEffect(() => {
    const fetchContents = async () => {
      try {
        const response = await getAllContent();
        setContents(response.data.data);
      } catch (err) {
        console.error("API Error:", err);
        setError("Failed to load content. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    fetchContents();
  }, []);

  useEffect(() => {
    if (selectedContent) {
      getQuestionsByContentId(selectedContent._id)
        .then((res) => {
          setHasQuiz(res.data.data.length > 0);
        })
        .catch(() => setHasQuiz(false));
      setSummary(null); // Clear summary when selecting new content
    } else {
      setHasQuiz(false);
      setSummary(null);
    }
  }, [selectedContent]);

  const filteredContents = Array.isArray(contents)
    ? contents.filter(
        (content) =>
          content.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          content.description.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    : [];

  const convertToEmbedUrl = (url) => {
    // Check if it's a YouTube URL
    const videoId = url.split("v=")[1]?.split("&")[0];
    if (videoId) {
      return `https://www.youtube.com/embed/${videoId}`;
    }
    return url;
  };

  const isPDF = (resource) => {
    return (
      resource.type === "pdf" || resource.url.toLowerCase().includes(".pdf")
    );
  };

  const isVideo = (resource) => {
    return (
      resource.type === "video" ||
      resource.url.includes("youtube.com") ||
      resource.url.includes("youtu.be") ||
      resource.url.includes("vimeo.com")
    );
  };

  const isImage = (resource) => {
    return (
      resource.type === "image" ||
      /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(resource.url)
    );
  };

  const handleSummarize = async () => {
    if (!selectedContent) return;

    setSummarizing(true);
    setSummary(null);

    try {
      // Collect all content text
      let contentText = `${selectedContent.title}\n\n${selectedContent.description}\n\n`;

      if (selectedContent.subtopics) {
        selectedContent.subtopics.forEach((subtopic) => {
          contentText += `${subtopic.heading}\n${subtopic.body}\n\n`;
        });
      }

      const response = await summarizeContent(contentText);
      setSummary(response.data.data);
    } catch (error) {
      console.error("Summarization error:", error);
      setSummary({
        keyPoints: ["Error generating summary"],
        shortSummary:
          "Unable to generate summary at this time. Please try again later.",
      });
    } finally {
      setSummarizing(false);
    }
  };

  if (loading) {
    return (
      <div
        className={`min-h-screen ${theme.bg} flex items-center justify-center`}
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="text-6xl text-green-500"
        >
          🌱
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className={`min-h-screen ${theme.bg} flex items-center justify-center`}
      >
        <div className="text-xl text-red-600 dark:text-red-400">
          Error: {error}
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${theme.bgGradient} ${theme.text}`}>
      <Navbar />
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className={`min-h-screen ${theme.bgGradient} ${theme.darkBgGradient} ${theme.text}`}
      >
        <div className="container mx-auto p-6">
          <motion.h1
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className={`text-4xl font-bold mb-6 ${theme.accent} flex items-center justify-center`}
          >
            <BookOpen className="mr-3" size={40} />
            AgriTech Wiki Center
            <motion.span
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="ml-2"
            >
              🌱
            </motion.span>
          </motion.h1>

          {/* Search Bar */}
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mb-6 relative max-w-md mx-auto"
          >
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="text"
              placeholder="Search topics..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pl-10 pr-4 py-3 ${theme.border} rounded-full ${theme.card} text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500 shadow-lg`}
            />
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Side: Topics List */}
            <motion.div
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="lg:col-span-1"
            >
              <h2 className="text-xl font-semibold mb-4 text-green-600 dark:text-green-400 flex items-center">
                <Sprout className="mr-2" size={20} />
                Topics ({filteredContents.length})
              </h2>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {filteredContents.map((content, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * index }}
                    onClick={() => setSelectedContent(content)}
                    className={`${theme.card} p-4 rounded-xl shadow-lg cursor-pointer transition-all hover:scale-105 hover:shadow-xl border-l-4 ${
                      selectedContent?.title === content.title
                        ? "border-green-500 ring-2 ring-green-500"
                        : "border-transparent hover:border-green-300"
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <div className="flex items-center mb-2">
                      {getTopicIcon(content.title)}
                      <h3 className="font-semibold text-lg ml-3">
                        {content.title}
                      </h3>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 overflow-hidden line-clamp-2">
                      {content.description}
                    </p>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Right Side: Content Details */}
            <motion.div
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="lg:col-span-2"
            >
              {selectedContent ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                  className={`${theme.card} p-6 rounded-xl shadow-lg max-h-screen overflow-y-auto border border-gray-200 dark:border-gray-700`}
                >
                  <h2 className="text-3xl font-bold mb-4 text-green-600 dark:text-green-400 flex items-center">
                    {getTopicIcon(selectedContent.title)}
                    <span className="ml-3">{selectedContent.title}</span>
                  </h2>
                  <p className="text-gray-700 dark:text-gray-300 mb-6 text-lg leading-relaxed">
                    {selectedContent.description}
                  </p>

                  {/* Summarize with AI Button */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="mb-6 text-center"
                  >
                    <motion.button
                      onClick={handleSummarize}
                      disabled={summarizing}
                      className={`inline-flex items-center px-6 py-3 cursor-pointer rounded-full font-semibold shadow-lg transition-all ${
                        summarizing
                          ? "bg-gray-400 cursor-not-allowed"
                          : `${theme.button} hover:scale-105`
                      }`}
                      whileHover={!summarizing ? { scale: 1.05 } : {}}
                      whileTap={!summarizing ? { scale: 0.95 } : {}}
                    >
                      {summarizing ? (
                        <Loader2 className="mr-2 animate-spin" size={20} />
                      ) : (
                        <Brain className="mr-2" size={20} />
                      )}
                      {summarizing ? "Summarizing..." : "Summarize with AI"}
                    </motion.button>
                  </motion.div>

                  {/* AI Summary Display */}
                  {summary && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="mb-8 p-6 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-700 dark:to-gray-600 rounded-xl border border-blue-200 dark:border-gray-600"
                    >
                      <h3 className="text-xl font-semibold mb-4 text-blue-600 dark:text-blue-400 flex items-center">
                        <Brain className="mr-2" size={20} />
                        AI Summary
                      </h3>

                      {/* Key Points */}
                      {summary.keyPoints && summary.keyPoints.length > 0 && (
                        <div className="mb-4">
                          <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">
                            Key Points:
                          </h4>
                          <ul className="list-disc list-inside space-y-1 text-gray-700 dark:text-gray-300">
                            {summary.keyPoints.map((point, idx) => (
                              <li key={idx}>{point}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Short Summary */}
                      {summary.shortSummary && (
                        <div>
                          <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">
                            Summary:
                          </h4>
                          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                            {summary.shortSummary}
                          </p>
                        </div>
                      )}
                    </motion.div>
                  )}

                  {/* Take Quiz Button */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="mb-8 text-center"
                  >
                    {hasQuiz ? (
                      <Link
                        to={`/quiz/${selectedContent._id}`}
                        className={`inline-flex items-center ${theme.button} font-semibold py-3 px-6 rounded-full shadow-lg transition-all hover:scale-105`}
                      >
                        <Target className="mr-2" size={20} />
                        Take Knowledge Quiz
                      </Link>
                    ) : (
                      <div className="inline-flex items-center bg-gray-400 text-white font-semibold py-3 px-6 rounded-full cursor-not-allowed">
                        <Target className="mr-2" size={20} />
                        No Quiz Available
                      </div>
                    )}
                  </motion.div>

                  {/* Subtopics */}
                  {selectedContent.subtopics &&
                    selectedContent.subtopics.map((subtopic, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 * idx }}
                        className="mb-6 p-4 bg-linear-to-r from-green-50 to-blue-50 dark:from-gray-700 dark:to-gray-600 rounded-lg"
                      >
                        <h3 className="text-xl font-semibold mb-2 text-yellow-600 dark:text-yellow-400 flex items-center">
                          <Zap className="mr-2" size={18} />
                          {subtopic.heading}
                        </h3>
                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                          {subtopic.body}
                        </p>
                      </motion.div>
                    ))}

                  {/* Resources/Videos */}
                  {selectedContent.resources &&
                    selectedContent.resources.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        className="mt-8"
                      >
                        <h3 className="text-xl font-semibold mb-4 text-green-600 dark:text-green-400 flex items-center">
                          <Play className="mr-2" size={20} />
                          Videos & Resources
                        </h3>
                        <div className="space-y-4">
                          {selectedContent.resources.map((resource, idx) => (
                            <motion.div
                              key={idx}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 0.1 * idx }}
                              className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow"
                            >
                              <h4 className="font-semibold mb-2 flex items-center">
                                {resource.type === "pdf" ? (
                                  <BookOpen
                                    className="mr-2 text-red-500"
                                    size={16}
                                  />
                                ) : resource.type === "image" ? (
                                  <ImageIcon
                                    className="mr-2 text-green-500"
                                    size={16}
                                  />
                                ) : resource.type === "link" ? (
                                  <LinkIcon
                                    className="mr-2 text-blue-500"
                                    size={16}
                                  />
                                ) : (
                                  <Play
                                    className="mr-2 text-red-500"
                                    size={16}
                                  />
                                )}
                                {resource.label}
                              </h4>
                              {isVideo(resource) ? (
                                <div className="aspect-video rounded-lg overflow-hidden">
                                  <iframe
                                    src={convertToEmbedUrl(resource.url)}
                                    title={resource.label}
                                    className="w-full h-full"
                                    allowFullScreen
                                  ></iframe>
                                </div>
                              ) : isPDF(resource) ? (
                                <div
                                  className={`${theme.surface} p-4 rounded-lg`}
                                >
                                  <iframe
                                    src={resource.url}
                                    title={resource.label}
                                    className="w-full h-96 border-0 rounded"
                                    type="application/pdf"
                                  ></iframe>
                                  <div className="mt-2 text-center">
                                    <a
                                      href={resource.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className={`inline-flex items-center px-4 py-2 ${theme.button} rounded-lg transition-colors`}
                                    >
                                      <BookOpen className="mr-2" size={16} />
                                      Open PDF in New Tab
                                    </a>
                                  </div>
                                </div>
                              ) : isImage(resource) ? (
                                <div
                                  className={`${theme.surface} p-4 rounded-lg`}
                                >
                                  <img
                                    src={resource.url}
                                    alt={resource.label}
                                    className="w-full max-h-96 object-contain rounded"
                                    onError={(e) => {
                                      e.target.src = "/placeholder-image.png"; // Fallback image
                                    }}
                                  />
                                  <div className="mt-2 text-center">
                                    <a
                                      href={resource.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className={`inline-flex items-center px-4 py-2 ${theme.button} rounded-lg transition-colors`}
                                    >
                                      <ImageIcon className="mr-2" size={16} />
                                      View Full Image
                                    </a>
                                  </div>
                                </div>
                              ) : (
                                <div
                                  className={`p-4 ${theme.surface} rounded-lg`}
                                >
                                  <a
                                    href={resource.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 dark:text-blue-400 hover:underline flex items-center"
                                  >
                                    <LinkIcon className="mr-2" size={16} />
                                    {resource.label} - Click to open
                                  </a>
                                </div>
                              )}
                            </motion.div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                </motion.div>
              ) : (
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 1 }}
                  className={`${theme.card} p-6 rounded-xl shadow-lg flex flex-col items-center justify-center h-64 border-2 border-dashed ${theme.border}`}
                >
                  <motion.div
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <BookOpen
                      className="mx-auto mb-4 text-gray-400"
                      size={64}
                    />
                  </motion.div>
                  <p className="text-gray-500 dark:text-gray-400 text-center text-lg">
                    Select a topic from the left to start your AgriTech Wiki
                    journey! 🚀
                  </p>
                </motion.div>
              )}
            </motion.div>
          </div>
        </div>
      </motion.div>
      <Footer />
    </div>
  );
};

export default ContentPage;
