import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { getAllContent } from "./contentApi";
import {
  BookOpen,
  Play,
  Search,
  Sprout,
  Droplets,
  Zap,
  Target,
} from "lucide-react";

const ContentPage = () => {
  const [contents, setContents] = useState([]);
  const [selectedContent, setSelectedContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Icons for topics
  const getTopicIcon = (title) => {
    if (title.toLowerCase().includes("smart farming"))
      return <Sprout className="text-gray-500" size={24} />;
    if (title.toLowerCase().includes("soil"))
      return <Droplets className="text-blue-500" size={24} />;
    return <Zap className="text-gray-500" size={24} />;
  };

  useEffect(() => {
    const fetchContents = async () => {
      try {
        const response = await getAllContent();
        setContents(response.data.data);
      } catch (err) {
        console.error("API Error:", err);
        // Mock data for testing
        setContents([
          {
            title: "Introduction to Smart Farming",
            description:
              "Learn the basics of smart farming technologies and how they revolutionize agriculture",
            subtopics: [
              {
                heading: "What is Smart Farming?",
                body: "Smart farming uses IoT sensors, AI, and data analytics to optimize crop production, reduce waste, and improve sustainability.",
              },
              {
                heading: "Key Technologies",
                body: "Explore drones, automated irrigation systems, precision farming tools, and weather monitoring devices.",
              },
            ],
            resources: [
              {
                label: "Smart Farming Overview Video",
                url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
              },
            ],
          },
          {
            title: "Soil Health Management",
            description:
              "Understanding soil health for better crops and sustainable farming practices",
            subtopics: [
              {
                heading: "Soil Testing Importance",
                body: "Regular soil testing helps determine nutrient levels, pH balance, and organic matter content for optimal plant growth.",
              },
              {
                heading: "Soil Conservation Techniques",
                body: "Learn about crop rotation, cover cropping, and reduced tillage methods to maintain soil health.",
              },
            ],
            resources: [
              {
                label: "Soil Health Management Guide",
                url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
              },
            ],
          },
        ]);
        setError(null);
      } finally {
        setLoading(false);
      }
    };
    fetchContents();
  }, []);

  const filteredContents = Array.isArray(contents)
    ? contents.filter(
        (content) =>
          content.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          content.description.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    : [];

  const convertToEmbedUrl = (url) => {
    const videoId = url.split("v=")[1]?.split("&")[0];
    return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
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
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-xl text-red-600 dark:text-red-400">
          Error: {error}
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-700 text-gray-900 dark:text-white"
    >
      <div className="container mx-auto p-6">
        <motion.h1
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-4xl font-bold mb-6 text-green-600 dark:text-green-400 flex items-center justify-center"
        >
          <BookOpen className="mr-3" size={40} />
          Learning Center
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
            className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-full bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500 shadow-lg"
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
                  className={`bg-white dark:bg-gray-800 p-4 rounded-xl shadow-lg cursor-pointer transition-all hover:scale-105 hover:shadow-xl border-l-4 ${
                    selectedContent?.title === content.title
                      ? "border-gray-400 ring-2 ring-gray-400"
                      : "border-transparent hover:border-gray-300"
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
                className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg max-h-screen overflow-y-auto border border-gray-200 dark:border-gray-700"
              >
                <h2 className="text-3xl font-bold mb-4 text-green-600 dark:text-green-400 flex items-center">
                  {getTopicIcon(selectedContent.title)}
                  <span className="ml-3">{selectedContent.title}</span>
                </h2>
                <p className="text-gray-700 dark:text-gray-300 mb-6 text-lg leading-relaxed">
                  {selectedContent.description}
                </p>

                {/* Take Quiz Button */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="mb-8 text-center"
                >
                  <Link
                    to="/quiz"
                    className="inline-flex items-center bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-full shadow-lg transition-all hover:scale-105"
                  >
                    <Target className="mr-2" size={20} />
                    Take Knowledge Quiz
                  </Link>
                </motion.div>

                {/* Subtopics */}
                {selectedContent.subtopics &&
                  selectedContent.subtopics.map((subtopic, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 * idx }}
                      className="mb-6 p-4 bg-gradient-to-r from-green-50 to-blue-50 dark:from-gray-700 dark:to-gray-600 rounded-lg"
                    >
                      <h3 className="text-xl font-semibold mb-2 text-gray-600 dark:text-gray-400 flex items-center">
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
                              <Play className="mr-2 text-red-500" size={16} />
                              {resource.label}
                            </h4>
                            <div className="aspect-video rounded-lg overflow-hidden">
                              <iframe
                                src={convertToEmbedUrl(resource.url)}
                                title={resource.label}
                                className="w-full h-full"
                                allowFullScreen
                              ></iframe>
                            </div>
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
                className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg flex flex-col items-center justify-center h-64 border-2 border-dashed border-gray-300 dark:border-gray-600"
              >
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <BookOpen className="mx-auto mb-4 text-gray-400" size={64} />
                </motion.div>
                <p className="text-gray-500 dark:text-gray-400 text-center text-lg">
                  Select a topic from the left to start your learning journey!
                  🚀
                </p>
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default ContentPage;
