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
import {
  motion,
  useInView,
  AnimatePresence,
} from "framer-motion";
import {
  mean,
  median,
  mode,
  standardDeviation,
  min,
  max,
  variance,
} from "simple-statistics";

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

/* ---------- helpers ---------- */
const formatFileSize = (s: number) =>
  s < 1024 * 1024
    ? `${(s / 1024).toFixed(2)} KB`
    : `${(s / 1024 / 1024).toFixed(2)} MB`;

/* ---------- animated background ---------- */
const AnimatedBackground = () => (
  <div className="absolute inset-0 -z-10 overflow-hidden">
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 0.4 }}
      transition={{ duration: 3, repeat: Infinity, repeatType: "mirror" }}
      className="absolute inset-0 bg-gradient-to-br from-blue-800 via-purple-900 to-black"
    />
    {[
      { x: -100, y: -100, dur: 20, cls: "w-40 h-40 bg-blue-500" },
      { x: 200, y: -200, dur: 25, cls: "w-48 h-48 bg-purple-500" },
      { x: -150, y: 150, dur: 30, cls: "w-32 h-32 bg-pink-500" },
    ].map(({ x, y, dur, cls }, i) => (
      <motion.div
        key={i}
        initial={{ x, y }}
        animate={{ x: -x, y: -y }}
        transition={{
          duration: dur,
          ease: "linear",
          repeat: Infinity,
          repeatType: "mirror",
        }}
        className={`absolute rounded-full opacity-20 blur-3xl ${cls}`}
      />
    ))}
  </div>
);

export default function HomePage() {
  /* ----- state ----- */
  const [csvData, setCsvData] = useState<any[]>([]);
  const [fileName, setFileName] = useState("");
  const [fileSize, setFileSize] = useState(0);
  const [selectedFeature, setSelectedFeature] = useState<string | null>(null);
  const [stats, setStats] = useState<any | null>(null);
  const [selectedColumn, setSelectedColumn] = useState<string | null>(null);
  const [chartType, setChartType] = useState<"bar" | "line">("bar");
  const [toast, setToast] = useState("");

  /* ----- refs ----- */
  const outputRef = useRef<HTMLDivElement>(null);
  const featureRef = useRef(null);
  const inView = useInView(featureRef, { once: true, threshold: 0.2 });

  /* ----- toast auto‑dismiss ----- */
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(""), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  /* ----- auto‑scroll to output ----- */
  useEffect(() => {
    if (selectedFeature === "Statistical Analysis" && outputRef.current) {
      outputRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [selectedFeature]);

  /* ----- dropzone ----- */
  const onDrop = (files: File[]) => {
    if (!files.length) return;
    const file = files[0];
    setFileName(file.name);
    setFileSize(file.size);
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (r) => {
        setCsvData(r.data);
        setToast("File Uploaded Successfully");
      },
    });
  };
  const { getRootProps, getInputProps } = useDropzone({ onDrop });

  /* ----- feature cards ----- */
  const features = [
    {
      icon: "📊",
      title: "Statistical Analysis",
      desc: "View mean, median, mode, variance & more.",
    },
    {
      icon: "📈",
      title: "Visual Charts",
      desc: "Generate interactive bar & line charts.",
    },
    {
      icon: "📤",
      title: "Export Insights",
      desc: "Download summaries as PDF, Excel or images.",
    },
  ];

  const toggleFeature = (title: string) => {
    if (selectedFeature === title) {
      setSelectedFeature(null);
      setStats(null);
      return;
    }
    setSelectedFeature(title);

    if (title === "Statistical Analysis" && csvData.length) {
      const numericKeys = Object.keys(csvData[0]).filter(
        (k) => !isNaN(Number(csvData[0][k]))
      );
      const key = numericKeys[0];
      const vals = csvData
        .map((r) => Number(r[key]))
        .filter((v) => !isNaN(v));
      setStats({
        mean: mean(vals),
        median: median(vals),
        mode: mode(vals),
        stdDev: standardDeviation(vals),
        min: min(vals),
        max: max(vals),
        range: max(vals) - min(vals),
        variance: variance(vals),
      });
    }
  };

  /* ----- chart data (visual charts) ----- */
  const numericKeys = csvData.length
    ? Object.keys(csvData[0]).filter((k) => !isNaN(Number(csvData[0][k])))
    : [];
  const currentCol = selectedColumn || numericKeys[0];
  const chartData = {
    labels: csvData.map((_, i) => `Row ${i + 1}`),
    datasets: [
      {
        label: currentCol,
        data: csvData.map((r) => Number(r[currentCol])),
        backgroundColor: "rgba(99,102,241,0.6)",
        borderColor: "rgba(99,102,241,1)",
        borderWidth: 2,
        tension: 0.3,
      },
    ],
  };

  return (
    <>
      <AnimatedBackground />

      {/* toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            key="toast"
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            className="fixed top-20 right-5 bg-white text-black px-4 py-2 rounded shadow-lg z-50"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      {/* header */}
      <header className="text-center pt-12 px-4 text-white">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">
          Upload CSV. Discover Insights.
        </h1>
        <p className="mt-4 text-lg sm:text-xl text-gray-300 max-w-xl mx-auto">
          AutoInsight Pro turns raw CSV data into instant summaries, charts and
          exportable insights.
        </p>
      </header>

      {/* dropzone */}
      <section className="mt-10 flex justify-center px-6">
        <motion.div
          {...getRootProps()}
          whileHover={{ scale: 1.03 }}
          className="border-2 border-dashed border-blue-600 bg-blue-600 p-10 rounded-xl cursor-pointer w-full max-w-2xl text-center hover:bg-blue-500 transition"
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center gap-3 text-white">
            <div className="text-6xl">📤</div>
            <button className="bg-white text-blue-600 font-semibold px-4 py-2 rounded shadow hover:bg-gray-100 flex items-center gap-2">
              Select File <span className="text-sm">▼</span>
            </button>
            <p className="text-sm">
              Drag & drop your CSV file here, or click to select
            </p>
          </div>
        </motion.div>
      </section>

      {/* feature cards */}
      <section className="mt-14 w-full max-w-screen-xl mx-auto px-6">
        <motion.div
          ref={featureRef}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          variants={{
            visible: { transition: { staggerChildren: 0.15 } },
          }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {features.map(({ icon, title, desc }) => (
            <motion.div
              key={title}
              onClick={() => toggleFeature(title)}
              variants={{
                hidden: { opacity: 0, y: 30 },
                visible: { opacity: 1, y: 0 },
              }}
              whileHover={{
                scale: 1.06,
                rotateX: 5,
                rotateY: -5,
                boxShadow: "0 12px 25px rgba(0,0,0,0.25)",
                transition: {
                  type: "spring",
                  stiffness: 250,
                  damping: 15,
                },
              }}
              className={`bg-gray-900 p-6 rounded-2xl border ${
                selectedFeature === title
                  ? "border-indigo-500"
                  : "border-gray-700"
              } shadow-lg cursor-pointer select-none transition-colors`}
            >
              <div className="text-4xl mb-4">{icon}</div>
              <h4 className="text-xl font-semibold mb-2">{title}</h4>
              <p className="text-sm text-gray-400">{desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* statistical output */}
      {selectedFeature === "Statistical Analysis" && stats && (
        <section
          ref={outputRef}
          className="mt-14 px-6 w-full max-w-lg mx-auto text-white"
        >
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
            <ul className="list-disc pl-6 text-sm text-indigo-100 space-y-1">
              <li>
                <strong>Mean:</strong> {stats.mean.toFixed(2)}
              </li>
              <li>
                <strong>Median:</strong> {stats.median.toFixed(2)}
              </li>
              <li>
                <strong>Mode:</strong>{" "}
                {Array.isArray(stats.mode) ? stats.mode.join(", ") : stats.mode}
              </li>
              <li>
                <strong>Std Dev:</strong> {stats.stdDev.toFixed(2)}
              </li>
              <li>
                <strong>Min:</strong> {stats.min.toFixed(2)}
              </li>
              <li>
                <strong>Max:</strong> {stats.max.toFixed(2)}
              </li>
              <li>
                <strong>Range:</strong> {stats.range.toFixed(2)}
              </li>
              <li>
                <strong>Variance:</strong> {stats.variance.toFixed(2)}
              </li>
            </ul>
          </motion.div>
        </section>
      )}

      {/* footer */}
      <footer className="mt-20 bg-gray-900 text-gray-400 py-6 text-center text-sm">
        © {new Date().getFullYear()} AutoInsight Pro. All rights reserved.
      </footer>
    </>
  );
}
