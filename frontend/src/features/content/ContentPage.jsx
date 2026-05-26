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
    if (title.toLowerCase().includes("smart farming")) {
      return <Sprout className="text-green-500" size={24} />;
    }

    if (title.toLowerCase().includes("soil")) {
      return <Droplets className="text-blue-500" size={24} />;
    }

    return <Zap className="text-yellow-500" size={24} />;
  };

  useEffect(() => {
    const fetchContents = async () => {
      try {
        const response = await getAllContent();
        setContents(response.data.data);

        // Auto select first content
        if (response.data.data?.length > 0) {
          setSelectedContent(response.data.data[0]);
        }
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

      setSummary(null);
    } else {
      setHasQuiz(false);
      setSummary(null);
    }
  }, [selectedContent]);

  const filteredContents = Array.isArray(contents)
    ? contents.filter(
        (content) =>
          content.title
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          content.description
            .toLowerCase()
            .includes(searchTerm.toLowerCase()),
      )
    : [];

  const convertToEmbedUrl = (url) => {
    const videoId = url.split("v=")[1]?.split("&")[0];

    if (videoId) {
      return `https://www.youtube.com/embed/${videoId}`;
    }

    return url;
  };

  const isPDF = (resource) => {
    return (
      resource.type === "pdf" ||
      resource.url.toLowerCase().includes(".pdf")
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
          transition={{
            duration: 1,
            repeat: Infinity,
            ease: "linear",
          }}
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
    <div
      className={`min-h-screen ${theme.bgGradient} ${theme.text}`}
    >
      <Navbar />

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className={`min-h-screen ${theme.bgGradient} ${theme.darkBgGradient} ${theme.text}`}
      >
        <div className="container mx-auto px-4 py-6">
          {/* Header */}
          <motion.h1
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className={`text-3xl md:text-5xl font-bold mb-8 ${theme.accent} flex items-center justify-center text-center`}
          >
            <BookOpen className="mr-3" size={40} />

            AgriTech Wiki Center

            <motion.span
              animate={{ scale: [1, 1.1, 1] }}
              transition={{
                duration: 2,
                repeat: Infinity,
              }}
              className="ml-2"
            >
              🌱
            </motion.span>
          </motion.h1>

          {/* Search */}
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mb-8 relative max-w-lg mx-auto"
          >
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              size={20}
            />

            <input
              type="text"
              placeholder="Search AgriTech topics..."
              value={searchTerm}
              onChange={(e) =>
                setSearchTerm(e.target.value)
              }
              className={`w-full pl-12 pr-4 py-4 rounded-2xl shadow-xl border ${theme.border} ${theme.card} focus:outline-none focus:ring-2 focus:ring-green-500`}
            />
          </motion.div>

          {/* Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* LEFT SIDEBAR */}
            <motion.div
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="lg:col-span-1"
            >
              <div className="sticky top-24">
                <div
                  className={`${theme.card} border ${theme.border} rounded-3xl shadow-2xl overflow-hidden`}
                >
                  {/* Sidebar Header */}
                  <div className="p-5 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-xl font-bold text-green-600 dark:text-green-400 flex items-center">
                      <Sprout className="mr-2" size={22} />
                      Topics ({filteredContents.length})
                    </h2>
                  </div>

                  {/* Topics */}
                  <div className="max-h-[650px] overflow-y-auto p-4 space-y-3 custom-scrollbar">
                    {filteredContents.length > 0 ? (
                      filteredContents.map((content, index) => {
                        const isSelected =
                          selectedContent?._id === content._id;

                        return (
                          <motion.div
                            key={index}
                            initial={{
                              opacity: 0,
                              y: 15,
                            }}
                            animate={{
                              opacity: 1,
                              y: 0,
                            }}
                            transition={{
                              delay: index * 0.05,
                            }}
                            onClick={() =>
                              setSelectedContent(content)
                            }
                            whileTap={{ scale: 0.98 }}
                            className={`
                              relative
                              group
                              rounded-2xl
                              cursor-pointer
                              overflow-hidden
                              border
                              transition-all
                              duration-300
                              ${
                                isSelected
                                  ? `
                                    border-green-500
                                    bg-green-50
                                    dark:bg-green-900/20
                                    shadow-lg
                                    shadow-green-500/20
                                  `
                                  : `
                                    border-transparent
                                    hover:border-green-300
                                    dark:hover:border-green-700
                                    hover:bg-green-50/70
                                    dark:hover:bg-gray-800
                                  `
                              }
                            `}
                          >
                            {/* Active Bar */}
                            <div
                              className={`
                                absolute
                                left-0
                                top-0
                                h-full
                                w-1
                                rounded-r-full
                                transition-all
                                duration-300
                                ${
                                  isSelected
                                    ? "bg-green-500"
                                    : "bg-transparent group-hover:bg-green-400"
                                }
                              `}
                            />

                            <div className="p-4">
                              <div className="flex items-start gap-3">
                                {/* Icon */}
                                <div
                                  className={`
                                    flex-shrink-0
                                    p-3
                                    rounded-xl
                                    transition-all
                                    duration-300
                                    ${
                                      isSelected
                                        ? "bg-white dark:bg-gray-800 shadow-md"
                                        : "bg-gray-100 dark:bg-gray-700"
                                    }
                                  `}
                                >
                                  {getTopicIcon(content.title)}
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                  <h3
                                    className={`
                                      font-semibold
                                      text-base
                                      leading-snug
                                      transition-colors
                                      duration-300
                                      ${
                                        isSelected
                                          ? "text-green-700 dark:text-green-400"
                                          : "text-gray-800 dark:text-white"
                                      }
                                    `}
                                  >
                                    {content.title}
                                  </h3>

                                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                                    {content.description}
                                  </p>
                                </div>
                              </div>
                            </div>

                            {/* Hover Effect */}
                            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none bg-gradient-to-r from-green-500/5 to-blue-500/5" />
                          </motion.div>
                        );
                      })
                    ) : (
                      <div className="text-center py-10">
                        <Search
                          className="mx-auto text-gray-400 mb-3"
                          size={40}
                        />

                        <p className="text-gray-500 dark:text-gray-400">
                          No topics found
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>

            {/* RIGHT CONTENT */}
            <motion.div
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="lg:col-span-2"
            >
              {selectedContent ? (
                <motion.div
                  initial={{
                    opacity: 0,
                    scale: 0.95,
                  }}
                  animate={{
                    opacity: 1,
                    scale: 1,
                  }}
                  className={`${theme.card} rounded-3xl shadow-2xl border ${theme.border} p-6 md:p-8`}
                >
                  {/* Title */}
                  <div className="flex items-center mb-5">
                    {getTopicIcon(selectedContent.title)}

                    <h2 className="text-3xl font-bold ml-3 text-green-600 dark:text-green-400">
                      {selectedContent.title}
                    </h2>
                  </div>

                  {/* Description */}
                  <p className="text-lg leading-relaxed text-gray-700 dark:text-gray-300 mb-8">
                    {selectedContent.description}
                  </p>

                  {/* AI Summary Button */}
                  <div className="mb-8 text-center">
                    <motion.button
                      onClick={handleSummarize}
                      disabled={summarizing}
                      whileHover={
                        !summarizing
                          ? { scale: 1.05 }
                          : {}
                      }
                      whileTap={
                        !summarizing
                          ? { scale: 0.95 }
                          : {}
                      }
                      className={`
                        inline-flex
                        items-center
                        px-6
                        py-3
                        rounded-full
                        font-semibold
                        shadow-lg
                        transition-all
                        ${
                          summarizing
                            ? "bg-gray-400 cursor-not-allowed"
                            : `${theme.button}`
                        }
                      `}
                    >
                      {summarizing ? (
                        <Loader2
                          className="mr-2 animate-spin"
                          size={20}
                        />
                      ) : (
                        <Brain
                          className="mr-2"
                          size={20}
                        />
                      )}

                      {summarizing
                        ? "Summarizing..."
                        : "Summarize with AI"}
                    </motion.button>
                  </div>

                  {/* Summary */}
                  {summary && (
                    <motion.div
                      initial={{
                        opacity: 0,
                        y: 20,
                      }}
                      animate={{
                        opacity: 1,
                        y: 0,
                      }}
                      className="mb-8 p-6 rounded-2xl bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-700 dark:to-gray-800 border border-blue-200 dark:border-gray-600"
                    >
                      <h3 className="text-xl font-bold text-blue-600 dark:text-blue-400 mb-4 flex items-center">
                        <Brain
                          className="mr-2"
                          size={20}
                        />
                        AI Summary
                      </h3>

                      {summary.keyPoints &&
                        summary.keyPoints.length > 0 && (
                          <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 mb-4">
                            {summary.keyPoints.map(
                              (point, idx) => (
                                <li key={idx}>
                                  {point}
                                </li>
                              ),
                            )}
                          </ul>
                        )}

                      {summary.shortSummary && (
                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                          {summary.shortSummary}
                        </p>
                      )}
                    </motion.div>
                  )}

                  {/* Quiz Button */}
                  <div className="mb-8 text-center">
                    {hasQuiz ? (
                      <Link
                        to={`/quiz/${selectedContent._id}`}
                        className={`inline-flex items-center ${theme.button} font-semibold py-3 px-6 rounded-full shadow-lg transition-all hover:scale-105`}
                      >
                        <Target
                          className="mr-2"
                          size={20}
                        />
                        Take Knowledge Quiz
                      </Link>
                    ) : (
                      <div className="inline-flex items-center bg-gray-400 text-white font-semibold py-3 px-6 rounded-full cursor-not-allowed">
                        <Target
                          className="mr-2"
                          size={20}
                        />
                        No Quiz Available
                      </div>
                    )}
                  </div>

                  {/* Subtopics */}
                  {selectedContent.subtopics &&
                    selectedContent.subtopics.map(
                      (subtopic, idx) => (
                        <motion.div
                          key={idx}
                          initial={{
                            opacity: 0,
                            y: 20,
                          }}
                          animate={{
                            opacity: 1,
                            y: 0,
                          }}
                          transition={{
                            delay: idx * 0.05,
                          }}
                          className="mb-6 p-5 rounded-2xl bg-gradient-to-r from-green-50 to-blue-50 dark:from-gray-700 dark:to-gray-800 border border-gray-200 dark:border-gray-700"
                        >
                          <h3 className="text-xl font-semibold mb-3 text-yellow-600 dark:text-yellow-400 flex items-center">
                            <Zap
                              className="mr-2"
                              size={18}
                            />
                            {subtopic.heading}
                          </h3>

                          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                            {subtopic.body}
                          </p>
                        </motion.div>
                      ),
                    )}

                  {/* Resources */}
                  {selectedContent.resources &&
                    selectedContent.resources.length >
                      0 && (
                      <div className="mt-10">
                        <h3 className="text-2xl font-bold mb-5 text-green-600 dark:text-green-400 flex items-center">
                          <Play
                            className="mr-2"
                            size={22}
                          />
                          Videos & Resources
                        </h3>

                        <div className="space-y-5">
                          {selectedContent.resources.map(
                            (resource, idx) => (
                              <motion.div
                                key={idx}
                                initial={{
                                  opacity: 0,
                                  x: -20,
                                }}
                                animate={{
                                  opacity: 1,
                                  x: 0,
                                }}
                                transition={{
                                  delay: idx * 0.05,
                                }}
                                className="bg-gray-100 dark:bg-gray-800 rounded-2xl p-5 shadow-lg"
                              >
                                <h4 className="font-semibold mb-3 flex items-center">
                                  {resource.type ===
                                  "pdf" ? (
                                    <BookOpen
                                      className="mr-2 text-red-500"
                                      size={18}
                                    />
                                  ) : resource.type ===
                                    "image" ? (
                                    <ImageIcon
                                      className="mr-2 text-green-500"
                                      size={18}
                                    />
                                  ) : resource.type ===
                                    "link" ? (
                                    <LinkIcon
                                      className="mr-2 text-blue-500"
                                      size={18}
                                    />
                                  ) : (
                                    <Play
                                      className="mr-2 text-red-500"
                                      size={18}
                                    />
                                  )}

                                  {resource.label}
                                </h4>

                                {isVideo(resource) ? (
                                  <div className="aspect-video overflow-hidden rounded-xl">
                                    <iframe
                                      src={convertToEmbedUrl(
                                        resource.url,
                                      )}
                                      title={
                                        resource.label
                                      }
                                      className="w-full h-full"
                                      allowFullScreen
                                    />
                                  </div>
                                ) : isPDF(resource) ? (
                                  <iframe
                                    src={resource.url}
                                    title={resource.label}
                                    className="w-full h-96 rounded-xl border-0"
                                  />
                                ) : isImage(resource) ? (
                                  <img
                                    src={resource.url}
                                    alt={resource.label}
                                    className="w-full rounded-xl max-h-96 object-contain"
                                  />
                                ) : (
                                  <a
                                    href={resource.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 dark:text-blue-400 hover:underline"
                                  >
                                    Open Resource
                                  </a>
                                )}
                              </motion.div>
                            ),
                          )}
                        </div>
                      </div>
                    )}
                </motion.div>
              ) : (
                <div
                  className={`${theme.card} rounded-3xl p-10 shadow-2xl flex flex-col items-center justify-center h-96`}
                >
                  <BookOpen
                    className="text-gray-400 mb-4"
                    size={70}
                  />

                  <p className="text-lg text-center text-gray-500 dark:text-gray-400">
                    Select a topic from the left to
                    start your AgriTech journey 🚀
                  </p>
                </div>
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