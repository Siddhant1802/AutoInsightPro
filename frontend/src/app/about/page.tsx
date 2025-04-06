"use client";

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white p-10">
      <div className="max-w-3xl mx-auto text-center">
        <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500 mb-6">
          About AutoInsight Pro
        </h1>
        <p className="text-gray-400 mb-4">
          AutoInsight Pro is a powerful web app designed to help you gain insights from tabular data effortlessly.
        </p>
        <p className="text-gray-400 mb-4">
          Upload your raw data (CSV format), and <span className="text-indigo-400 font-semibold">AutoInsight Pro</span> automatically:
        </p>
        <ul className="list-disc list-inside mt-2 text-left text-gray-300">
          <li><strong>Parses</strong> and visualizes data</li>
          <li><strong>Detects</strong> anomalies and outliers</li>
          <li><strong>Generates</strong> natural language summaries using AI</li>
        </ul>
      </div>
    </main>
  );
}
