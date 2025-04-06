 "use client";

import React, { useState } from "react";
import { useDropzone } from "react-dropzone";
import Papa from "papaparse";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { useRef } from "react";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function HomePage() {
  const [csvData, setCsvData] = useState<any[]>([]);
  const [fileName, setFileName] = useState<string>("");

  const onDrop = (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    setFileName(file.name);
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        setCsvData(results.data);
      },
    });
  };

  const { getRootProps, getInputProps } = useDropzone({ onDrop });

  const numericKeys = csvData.length ? Object.keys(csvData[0]).filter(k => !isNaN(Number(csvData[0][k]))) : [];
  const firstKey = numericKeys[0];
  const chartData = {
    labels: csvData.map((_, idx) => `Row ${idx + 1}`),
    datasets: [
      {
        label: firstKey,
        data: csvData.map((row) => Number(row[firstKey])),
        backgroundColor: "rgba(99, 102, 241, 0.6)",
      },
    ],
  };

  const features = [
    {
      icon: "📊",
      title: "Statistical Analysis",
      desc: "Get comprehensive statistics including mean, median, mode, and standard deviation."
    },
    {
      icon: "📈",
      title: "Visual Charts",
      desc: "Generate beautiful visualizations from your data automatically."
    },
    {
      icon: "🧹",
      title: "Data Cleaning",
      desc: "Identify and handle missing values, outliers, and data inconsistencies."
    },
    {
      icon: "🛠️",
      title: "Data Transformation",
      desc: "Normalize, encode, and transform your raw data for better insights."
    },
    {
      icon: "📤",
      title: "Export Insights",
      desc: "Share your findings in multiple formats like PDF, Excel, or as images."
    },
    {
      icon: "📁",
      title: "Sample Templates",
      desc: "Download sample CSV templates to see how the system works."
    },
  ];

  const featureRef = useRef(null);
  const chartRef = useRef(null);
  const inView = useInView(featureRef, { once: true, threshold: 0.2 });
  const chartInView = useInView(chartRef, { once: true, threshold: 0.2 });

  return (
    <AnimatePresence mode="wait">
      <motion.main
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
        className="min-h-screen flex flex-col bg-gradient-to-br from-gray-900 to-gray-800 text-white"
      >
        {/* Hero Section */}
        <motion.section
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center py-16 px-4"
        >
          <h2 className="text-5xl sm:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 mb-4">
            Upload CSV. Discover Insights.
          </h2>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="text-gray-400 max-w-2xl mx-auto text-lg"
          >
            AutoInsight Pro turns your raw CSV data into meaningful summaries, statistics, and visual insights.
          </motion.p>
        </motion.section>

        {/* Upload Section */}
        <motion.section
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col items-center gap-6 px-6"
        >
          <motion.div
            {...getRootProps()}
            whileHover={{ scale: 1.03 }}
            className="border-2 border-dashed border-gray-300 bg-gray-800 p-10 rounded-xl cursor-pointer w-full max-w-2xl text-center hover:bg-gray-700 transition"
          >
            <input {...getInputProps()} />
            <div className="flex flex-col items-center gap-2">
              <span className="text-4xl">📤</span>
              <p className="text-gray-300">Drag & drop your CSV file here, or click to select</p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Select File
              </motion.button>
              <p className="text-xs text-yellow-400 mt-2">⚠️ Maximum file size: 10MB</p>
              {fileName && <p className="mt-2 text-green-400">📎 {fileName}</p>}
            </div>
          </motion.div>

          {/* Feature Cards */}
          <div ref={featureRef} className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-10 w-full max-w-6xl">
            {features.map(({ icon, title, desc }) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 40 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.4 }}
                whileHover={{ scale: 1.03 }}
                className="bg-gray-900 p-5 rounded-xl border border-gray-700 shadow hover:shadow-xl transition"
              >
                <div className="text-3xl mb-3">{icon}</div>
                <h4 className="text-lg font-semibold mb-1">{title}</h4>
                <p className="text-sm text-gray-400">{desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Chart + Table */}
        {csvData.length > 0 && (
          <motion.div
            ref={chartRef}
            initial={{ opacity: 0, y: 40 }}
            animate={chartInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8 }}
            className="w-full max-w-6xl space-y-10 mt-12"
          >
            <div className="overflow-x-auto border rounded shadow-md">
              <table className="min-w-full table-auto text-sm">
                <thead className="bg-gray-800 text-white">
                  <tr>
                    {Object.keys(csvData[0]).map((key) => (
                      <th key={key} className="px-4 py-2 border">{key}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-gray-700 text-white">
                  {csvData.slice(0, 5).map((row, idx) => (
                    <tr key={idx}>
                      {Object.values(row).map((val, i) => (
                        <td key={i} className="px-4 py-2 border">{val as string}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="bg-gray-900 p-6 rounded shadow">
              <h3 className="text-lg font-semibold mb-4">📊 Quick Insight (First Numeric Column)</h3>
              <Bar data={chartData} />
            </div>
          </motion.div>
        )}

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

