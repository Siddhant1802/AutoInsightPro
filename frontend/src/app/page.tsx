"use client";

import React, { useState, useRef, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import Papa from "papaparse";
import { Bar, Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { mean, median, mode, standardDeviation } from "simple-statistics";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend
);

// Helper function to format file size: Files <1MB in KB; otherwise in MB.
const formatFileSize = (size: number): string => {
  if (size < 1024 * 1024) return (size / 1024).toFixed(2) + " KB";
  else return (size / (1024 * 1024)).toFixed(2) + " MB";
};

export default function HomePage() {
  const [csvData, setCsvData] = useState<any[]>([]);
  const [fileName, setFileName] = useState<string>("");
  const [fileSize, setFileSize] = useState<number>(0); // stored in bytes
  const [selectedFeature, setSelectedFeature] = useState<string | null>(null);
  const [stats, setStats] = useState<any | null>(null);
  const [selectedColumn, setSelectedColumn] = useState<string | null>(null);
  const [chartType, setChartType] = useState<"bar" | "line">("bar");
  const [notification, setNotification] = useState<string>("");

  // Auto-dismiss notification after 3 seconds
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(""), 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  // Handle feature card toggle
  const handleFeatureClick = (title: string) => {
    if (selectedFeature === title) {
      setSelectedFeature(null);
      setStats(null);
    } else {
      setSelectedFeature(title);
      if (title === "Statistical Analysis" && csvData.length > 0) {
        const numericKeys = Object.keys(csvData[0]).filter(
          (k) => !isNaN(Number(csvData[0][k]))
        );
        const firstKey = numericKeys[0];
        const values = csvData
          .map((row) => Number(row[firstKey]))
          .filter((v) => !isNaN(v));
        setStats({
          mean: mean(values),
          median: median(values),
          mode: mode(values),
          stdDev: standardDeviation(values),
        });
      }
    }
  };

  // When file is dropped or selected
  const onDrop = (acceptedFiles: File[]) => {
    if (!acceptedFiles.length) return;
    const file = acceptedFiles[0];
    setFileName(file.name);
    setFileSize(file.size);
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        setCsvData(results.data);
        setSelectedFeature(null);
        setStats(null);
        setSelectedColumn(null);
        setNotification("File Uploaded Successfully");
      },
    });
  };

  // Remove file and reset state
  const handleRemoveFile = () => {
    setFileName("");
    setFileSize(0);
    setCsvData([]);
    setSelectedFeature(null);
    setStats(null);
    setSelectedColumn(null);
    setNotification("File Removed Successfully");
  };

  const { getRootProps, getInputProps } = useDropzone({ onDrop });

  // Prepare chart data
  const numericKeys = csvData.length
    ? Object.keys(csvData[0]).filter((k) => !isNaN(Number(csvData[0][k])))
    : [];
  const currentColumn = selectedColumn || numericKeys[0];
  const chartData = {
    labels: csvData.map((_, idx) => `Row ${idx + 1}`),
    datasets: [
      {
        label: currentColumn,
        data: csvData.map((row) => Number(row[currentColumn])),
        backgroundColor: "rgba(99, 102, 241, 0.6)",
        borderColor: "rgba(99, 102, 241, 1)",
        borderWidth: 2,
        tension: 0.3,
      },
    ],
  };

  // Feature card data
  const features = [
    {
      icon: "📊",
      title: "Statistical Analysis",
      desc: "Get comprehensive statistics including mean, median, mode, and standard deviation.",
    },
    {
      icon: "📈",
      title: "Visual Charts",
      desc: "Generate beautiful visualizations from your data automatically.",
    },
    {
      icon: "🧹",
      title: "Data Cleaning",
      desc: "Identify and handle missing values, outliers, and data inconsistencies.",
    },
    {
      icon: "🛠️",
      title: "Data Transformation",
      desc: "Normalize, encode, and transform your raw data for better insights.",
    },
    {
      icon: "📤",
      title: "Export Insights",
      desc: "Share your findings in multiple formats like PDF, Excel, or as images.",
    },
  ];

  // Card animation variants
  const cardVariants = {
    default: { y: 0, opacity: 1, scale: 1 },
    expanded: { y: -10, opacity: 1, scale: 1.05 },
    faded: { y: 10, opacity: 0.6, scale: 0.95 },
  };

  // Staggered list item animation for stats
  const listItemVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: { opacity: 1, x: 0 },
  };

  const featureRef = useRef(null);
  const inView = useInView(featureRef, { once: true, threshold: 0.2 });

  return (
    <AnimatePresence>
      {/* Notification Popup */}
      {notification && (
        <motion.div
          key="notification"
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 100 }}
          className="fixed top-20 right-5 bg-white text-black px-4 py-2 rounded shadow-lg z-50"
        >
          {notification}
        </motion.div>
      )}

      <motion.main
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
        className="min-h-screen flex flex-col bg-gradient-to-br from-gray-900 to-gray-800 text-white"
      >
        {/* Header */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-6 px-4"
        >
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold leading-tight text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">
            Upload CSV. Discover Insights.
          </h1>
          <p className="mt-4 text-lg sm:text-xl text-gray-300">
            AutoInsight Pro turns your raw CSV data into meaningful summaries,
            statistics, and visual insights.
          </p>
        </motion.div>

        {/* Upload Section */}
        <motion.section
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col items-center gap-6 px-6"
        >
          {/* Dropzone Card */}
          <motion.div
            {...getRootProps()}
            whileHover={{ scale: 1.03 }}
            className="relative border-2 border-dashed border-blue-600 bg-blue-600 p-10 rounded-xl cursor-pointer w-full max-w-2xl text-center hover:bg-blue-500 transition"
          >
            <input {...getInputProps()} />
            <div className="flex flex-col items-center gap-3 text-white">
              <div className="text-6xl">📤</div>
              <button className="bg-white text-blue-600 font-semibold px-4 py-2 rounded shadow hover:bg-gray-100 flex items-center gap-2">
                Select File
                <span className="text-sm">▼</span>
              </button>
              <p className="text-sm">
                Drag & drop your CSV file here, or click to select
              </p>
            </div>
          </motion.div>

          {/* (No separate file card; notification handles file status) */}

          {/* Feature Cards + Output Panel */}
          <div className="flex flex-col gap-10 mt-10 w-full max-w-screen-xl mx-auto">
            {/* Feature Cards */}
            <div
              ref={featureRef}
              className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6"
            >
              {features.map(({ icon, title, desc }) => {
                const isSelected = selectedFeature === title;
                const cardAnimationState = selectedFeature
                  ? isSelected
                    ? "expanded"
                    : "faded"
                  : "default";

                // Unified style for all feature cards
                const cardClass =
                  "cursor-pointer bg-gray-900 p-5 rounded-xl border border-gray-700 shadow hover:shadow-xl transition";

                return (
                  <motion.div
                    key={title}
                    onClick={() => handleFeatureClick(title)}
                    variants={cardVariants}
                    animate={cardAnimationState}
                    initial="default"
                    transition={{ duration: 0.4 }}
                    whileHover={{ scale: 1.05 }}
                    className={cardClass}
                  >
                    <div className="text-3xl mb-3">{icon}</div>
                    <h4 className="text-lg font-semibold mb-1">{title}</h4>
                    <p className="text-sm text-gray-400">{desc}</p>
                  </motion.div>
                );
              })}
            </div>

            {/* Output Panel */}
            <div className="w-full max-w-lg self-start space-y-6">
              {selectedFeature === "Statistical Analysis" && stats && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  transition={{ duration: 0.7 }}
                  className="bg-gradient-to-br from-gray-800 to-gray-900 p-6 rounded-2xl shadow-xl border border-indigo-500"
                >
                  <h3 className="text-xl font-bold mb-4 text-indigo-300">
                    📊 Statistical Summary
                  </h3>
                  <motion.ul
                    initial="hidden"
                    animate="visible"
                    variants={{
                      visible: { transition: { staggerChildren: 0.2 } },
                    }}
                    className="list-disc pl-6 text-sm text-indigo-100"
                  >
                    <motion.li variants={listItemVariants}>
                      <strong>Mean:</strong> {stats.mean.toFixed(2)}
                    </motion.li>
                    <motion.li variants={listItemVariants}>
                      <strong>Median:</strong> {stats.median.toFixed(2)}
                    </motion.li>
                    <motion.li variants={listItemVariants}>
                      <strong>Mode:</strong>{" "}
                      {Array.isArray(stats.mode)
                        ? stats.mode.join(", ")
                        : stats.mode}
                    </motion.li>
                    <motion.li variants={listItemVariants}>
                      <strong>Standard Deviation:</strong>{" "}
                      {stats.stdDev.toFixed(2)}
                    </motion.li>
                  </motion.ul>
                </motion.div>
              )}

              {selectedFeature === "Visual Charts" && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  transition={{ duration: 0.7 }}
                  className="bg-gradient-to-br from-gray-800 to-gray-900 p-6 rounded-2xl shadow-xl border border-green-500"
                >
                  <h3 className="text-xl font-bold mb-4 text-green-300">
                    📈 Interactive Chart
                  </h3>
                  <div className="mb-4">
                    <label className="text-sm text-white">
                      Select Column:
                    </label>
                    <select
                      value={currentColumn}
                      onChange={(e) => setSelectedColumn(e.target.value)}
                      className="ml-2 bg-gray-700 border border-gray-600 text-white px-2 py-1 rounded"
                    >
                      {numericKeys.map((key) => (
                        <option key={key} value={key}>
                          {key}
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={() =>
                        setChartType(chartType === "bar" ? "line" : "bar")
                      }
                      className="ml-4 px-3 py-1 bg-blue-600 text-sm rounded hover:bg-blue-700"
                    >
                      Toggle to {chartType === "bar" ? "Line" : "Bar"}
                    </button>
                  </div>
                  {chartType === "bar" ? (
                    <Bar data={chartData} />
                  ) : (
                    <Line data={chartData} />
                  )}
                </motion.div>
              )}
            </div>
          </div>
        </motion.section>

        {/* Footer */}
        <motion.footer
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="mt-auto bg-gray-900 text-gray-400 py-6 text-center text-sm"
        >
          © {new Date().getFullYear()} AutoInsight Pro. All rights reserved.
        </motion.footer>
      </motion.main>
    </AnimatePresence>
  );
}
