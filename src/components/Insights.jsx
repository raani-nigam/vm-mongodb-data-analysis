import React, { useEffect, useState } from "react";
import { Pie, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
} from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

export function Insights() {
  const [voicemails, setVoicemails] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchVoicemails() {
      try {
        const res = await fetch("http://localhost:5001/api/voicemails?limit=0");
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const data = await res.json();
        const vmArray = Array.isArray(data.voicemails)
          ? data.voicemails
          : Array.isArray(data)
          ? data
          : [];
        setVoicemails(vmArray);
      } catch (err) {
        console.error("Error fetching voicemails:", err);
        setVoicemails([]);
      } finally {
        setLoading(false);
      }
    }

    fetchVoicemails();
  }, []);

  if (loading) return <p style={{ padding: 20 }}>Loading...</p>;

  // Compute overall sentiment counts
  const counts = voicemails.reduce(
    (acc, vm) => {
      const s = vm.sentiment?.toLowerCase();
      if (s === "positive") acc.positive += 1;
      else if (s === "negative") acc.negative += 1;
      else acc.neutral += 1;
      return acc;
    },
    { positive: 0, negative: 0, neutral: 0 }
  );

  const total = voicemails.length;

  // Prepare category-based sentiment
  const categoryMap = {};
  voicemails.forEach((vm) => {
    if (!vm.category) return;
    if (!categoryMap[vm.category])
      categoryMap[vm.category] = { positive: 0, neutral: 0, negative: 0 };
    const s = vm.sentiment?.toLowerCase() || "neutral";
    categoryMap[vm.category][s] += 1;
  });

  const categories = Object.keys(categoryMap);

  // Pie chart data
  const pieData = {
    labels: ["Positive", "Neutral", "Negative"],
    datasets: [
      {
        data: [counts.positive, counts.neutral, counts.negative],
        backgroundColor: ["#34D399", "#9CA3AF", "#F87171"],
        hoverOffset: 4,
      },
    ],
  };

  // Bar chart data
  const barData = {
    labels: categories,
    datasets: [
      {
        label: "Positive",
        data: categories.map((cat) => categoryMap[cat].positive),
        backgroundColor: "#34D399",
      },
      {
        label: "Neutral",
        data: categories.map((cat) => categoryMap[cat].neutral),
        backgroundColor: "#9CA3AF",
      },
      {
        label: "Negative",
        data: categories.map((cat) => categoryMap[cat].negative),
        backgroundColor: "#F87171",
      },
    ],
  };

  const barOptions = {
    indexAxis: "y",
    responsive: true,
    plugins: {
      legend: { position: "top" },
      title: { display: false },
    },
  };

  return (
    <div style={{ padding: 20 }}>
      {/* Top cards */}
      <div style={{ display: "flex", gap: 16, marginBottom: 20 }}>
        <div
          style={{
            flex: 1,
            padding: 16,
            background: "#f3f4f6",
            borderRadius: 8,
            textAlign: "center",
          }}
        >
          <h4>Total Voicemails</h4>
          <p style={{ fontSize: 24, fontWeight: "bold" }}>{total}</p>
        </div>
        <div
          style={{
            flex: 1,
            padding: 16,
            background: "#d1fae5",
            borderRadius: 8,
            textAlign: "center",
          }}
        >
          <h4>Positive Voicemails</h4>
          <p style={{ fontSize: 24, fontWeight: "bold" }}>{counts.positive}</p>
        </div>
        <div
          style={{
            flex: 1,
            padding: 16,
            background: "#fee2e2",
            borderRadius: 8,
            textAlign: "center",
          }}
        >
          <h4>Negative Voicemails</h4>
          <p style={{ fontSize: 24, fontWeight: "bold" }}>{counts.negative}</p>
        </div>
      </div>

      {/* Charts */}
      <div style={{ display: "flex", gap: 40, flexWrap: "wrap" }}>
        <div style={{ flex: "1 1 300px" }}>
          <h3>Overall Sentiment</h3>
          <Pie data={pieData} />
        </div>

        <div style={{ flex: "2 1 500px" }}>
          <h3>Sentiment by Category</h3>
          {categories.length === 0 ? (
            <p>No category data available</p>
          ) : (
            <Bar data={barData} options={barOptions} />
          )}
        </div>
      </div>
    </div>
  );
}
