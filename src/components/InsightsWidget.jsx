import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { fetchDailyInsight } from "../api/insightsClient";
import { 
  FaLightbulb, 
  FaRobot, 
  FaChartLine, 
  FaUsers, 
  FaExclamationTriangle,
  FaArrowRight
} from "react-icons/fa";

export default function InsightsWidget() {
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

        const data = await fetchDailyInsight(token);
        setInsight(data);
      } catch (err) {
        console.error("Failed to fetch insight for widget:", err);
        setError(err.message || "Failed to load insight");
      } finally {
        setLoading(false);
      }
    };

    fetchInsight();
  }, [user, getToken]);

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
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <FaLightbulb style={{ color: "#f59e0b", fontSize: "1.25rem" }} />
          <h3 style={{ color: "#1f2937", margin: 0, fontSize: "1.1rem", fontWeight: 600 }}>
            Insight of the Day
          </h3>
        </div>
        <Link 
          to="/insights"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            color: "#2563eb",
            textDecoration: "none",
            fontSize: "0.875rem",
            fontWeight: 600
          }}
        >
          View All
          <FaArrowRight style={{ fontSize: "0.75rem" }} />
        </Link>
      </div>

      {/* Loading State */}
      {loading && (
        <div style={{ color: "#6b7280", fontStyle: "italic", fontSize: "0.875rem" }}>
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
            lineHeight: 1.5,
            fontSize: "0.875rem"
          }}>
            {insight.suggestion.length > 150 
              ? `${insight.suggestion.substring(0, 150)}...` 
              : insight.suggestion
            }
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

          {/* Quick Actions */}
          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
            <Link 
              to="/insights"
              style={{
                background: "#2563eb",
                color: "white",
                padding: "0.5rem 1rem",
                borderRadius: "8px",
                textDecoration: "none",
                fontSize: "0.875rem",
                fontWeight: 600,
                display: "inline-flex",
                alignItems: "center",
                gap: "0.5rem"
              }}
            >
              <FaChartLine />
              View Analytics
            </Link>
            <Link 
              to="/insights"
              style={{
                background: "transparent",
                color: "#2563eb",
                padding: "0.5rem 1rem",
                borderRadius: "8px",
                textDecoration: "none",
                fontSize: "0.875rem",
                fontWeight: 600,
                border: "1px solid #2563eb",
                display: "inline-flex",
                alignItems: "center",
                gap: "0.5rem"
              }}
            >
              <FaUsers />
              Competitors
            </Link>
          </div>
        </>
      )}

      {/* No Data State */}
      {!loading && !error && !insight && (
        <div style={{ textAlign: "center", padding: "1rem 0" }}>
          <FaLightbulb style={{ color: "#9ca3af", fontSize: "1.5rem", marginBottom: "0.5rem" }} />
          <p style={{ color: "#6b7280", margin: "0 0 1rem 0", fontSize: "0.875rem" }}>
            Connect a business to receive daily insights.
          </p>
          <Link 
            to="/insights"
            style={{
              background: "#2563eb",
              color: "white",
              padding: "0.5rem 1rem",
              borderRadius: "8px",
              textDecoration: "none",
              fontSize: "0.875rem",
              fontWeight: 600
            }}
          >
            Get Started
          </Link>
        </div>
      )}
    </motion.div>
  );
}
