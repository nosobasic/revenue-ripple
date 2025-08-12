import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { FaLightbulb, FaRobot, FaExclamationTriangle } from "react-icons/fa";

export default function InsightOfDayCard() {
  const { user, getToken } = useAuth();
  const [insight, setInsight] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchInsight = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");
        
        const token = await getToken?.();
        if (!token) {
          setError("Authentication required");
          return;
        }

        const response = await fetch("/insights/api/insight-of-day", {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        });

        if (response.status === 401) {
          setError("Please log in to view insights");
          return;
        }

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Request failed: ${errorText}`);
        }

        const data = await response.json();
        setInsight(data);
      } catch (err) {
        console.error("Failed to fetch insight of the day:", err);
        setError(err.message || "Failed to load insight");
      } finally {
        setLoading(false);
      }
    };

    fetchInsight();
  }, [user, getToken]);

  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  const getSourceIcon = (source) => {
    switch (source) {
      case "top_suggestion":
        return <FaLightbulb style={{ color: "#f59e0b" }} />;
      case "generated":
        return <FaRobot style={{ color: "#7c3aed" }} />;
      default:
        return <FaLightbulb style={{ color: "#6b7280" }} />;
    }
  };

  const getSourceLabel = (source) => {
    switch (source) {
      case "top_suggestion":
        return "Top suggestion";
      case "generated":
        return "AI generated";
      default:
        return source;
    }
  };

  if (!user) {
    return null; // Don't render if not logged in
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      style={{
        background: "white",
        borderRadius: 12,
        padding: "1.5rem",
        boxShadow: "0 8px 25px rgba(0,0,0,0.06)",
        border: "1px solid #f1f5f9",
        height: "fit-content"
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1rem" }}>
        <FaLightbulb style={{ color: "#f59e0b", fontSize: "1.25rem" }} />
        <h3 style={{ color: "#1f2937", margin: 0, fontSize: "1.1rem", fontWeight: 600 }}>
          {insight?.title || "Insight of the Day"}
        </h3>
      </div>

      {/* Loading State */}
      {loading && (
        <div style={{ color: "#6b7280", fontStyle: "italic" }}>
          Loading today's insight...
        </div>
      )}

      {/* Error State */}
      {error && (
        <div style={{
          background: "#fee2e2",
          color: "#991b1b",
          padding: "0.75rem",
          borderRadius: "8px",
          border: "1px solid #fecaca",
          fontSize: "0.875rem",
          display: "flex",
          alignItems: "center",
          gap: "0.5rem"
        }}>
          <FaExclamationTriangle />
          {error}
        </div>
      )}

      {/* Content */}
      {!loading && !error && insight && (
        <>
          <p style={{ 
            color: "#374151", 
            margin: "0 0 1rem 0", 
            lineHeight: 1.6,
            fontSize: "0.95rem"
          }}>
            {insight.suggestion}
          </p>

          {/* Source Tag */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.75rem" }}>
            {getSourceIcon(insight.source)}
            <span style={{
              background: insight.source === "top_suggestion" ? "#fef3c7" : "#e0e7ff",
              color: insight.source === "top_suggestion" ? "#92400e" : "#3730a3",
              padding: "0.25rem 0.75rem",
              borderRadius: "20px",
              fontSize: "0.75rem",
              fontWeight: 600,
              textTransform: "uppercase"
            }}>
              {getSourceLabel(insight.source)}
            </span>
          </div>

          {/* Date */}
          <div style={{ color: "#9ca3af", fontSize: "0.875rem" }}>
            {formatDate(insight.day)}
          </div>
        </>
      )}

      {/* No Data State */}
      {!loading && !error && !insight && (
        <div style={{ textAlign: "center", padding: "1rem 0" }}>
          <FaLightbulb style={{ color: "#9ca3af", fontSize: "2rem", marginBottom: "0.75rem" }} />
          <p style={{ color: "#6b7280", margin: 0, fontSize: "0.95rem" }}>
            Connect a business to receive daily insights.
          </p>
        </div>
      )}
    </motion.div>
  );
}
