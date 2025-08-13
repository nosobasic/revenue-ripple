import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { 
  fetchDailyInsight, 
  fetchPrompts, 
  fetchSuggestions, 
  fetchCompetitors, 
  fetchAnalytics 
} from "../api/insightsClient";
import { 
  FaEye, 
  FaChartLine, 
  FaList, 
  FaUsers, 
  FaLightbulb, 
  FaCrown, 
  FaArrowUp, 
  FaArrowDown, 
  FaSearch,
  FaRobot,
  FaGlobe,
  FaCrosshairs,
  FaChartBar,
  FaLock,
  FaBrain,
  FaRocket,
  FaClock,
  FaStar,
  FaExclamationTriangle,
  FaCheckCircle,
  FaPlus
} from "react-icons/fa";
import Navbar from "../components/Navbar";
import InsightOfDayCard from "../components/InsightOfDayCard";

// Utility function to format datetime
const formatDateTime = (isoString) => {
  try {
    return new Date(isoString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return isoString;
  }
};

// Mock data for placeholder UI
const mockData = {
  summary: {
    totalImpressions: 15420,
    totalClicks: 892,
    conversionRate: 5.8,
    revenue: 12450,
    growthRate: 12.5,
    aiMentions: 47,
    competitorAlerts: 3
  },
  trafficAnalytics: [
    { date: '2024-01-01', impressions: 1200, clicks: 68, conversions: 4, revenue: 850 },
    { date: '2024-01-02', impressions: 1350, clicks: 72, conversions: 5, revenue: 920 },
    { date: '2024-01-03', impressions: 1100, clicks: 65, conversions: 3, revenue: 780 },
    { date: '2024-01-04', impressions: 1600, clicks: 89, conversions: 6, revenue: 1100 },
    { date: '2024-01-05', impressions: 1400, clicks: 78, conversions: 4, revenue: 950 },
    { date: '2024-01-06', impressions: 1800, clicks: 95, conversions: 7, revenue: 1250 },
    { date: '2024-01-07', impressions: 1700, clicks: 88, conversions: 5, revenue: 1050 }
  ],
  competitorMentions: [
    { platform: 'ChatGPT', competitor: 'TechCorp', mention: 'TechCorp offers better pricing for small businesses', sentiment: 'negative', impact: 'high' },
    { platform: 'Claude', competitor: 'InnovateAI', mention: 'InnovateAI has superior customer support', sentiment: 'neutral', impact: 'medium' },
    { platform: 'Perplexity', competitor: 'DataFlow', mention: 'DataFlow leads in enterprise solutions', sentiment: 'positive', impact: 'low' }
  ],
  suggestedActions: [
    { 
      type: 'urgent', 
      title: 'Optimize Landing Page', 
      description: 'Your conversion rate is 2% below industry average. Consider A/B testing your CTA buttons.',
      impact: 'high',
      effort: 'medium',
      priority: 1
    },
    { 
      type: 'opportunity', 
      title: 'Target Competitor Keywords', 
      description: 'TechCorp is ranking for 15 keywords you could easily compete for.',
      impact: 'medium',
      effort: 'low',
      priority: 2
    },
    { 
      type: 'improvement', 
      title: 'Enhance AI Content', 
      description: 'Your AI-generated content is performing 23% better than manual content.',
      impact: 'high',
      effort: 'low',
      priority: 3
    }
  ],
  aiInsights: [
    {
      insight: "Your business is mentioned 47 times across AI platforms this week, up 15% from last week.",
      sentiment: "positive",
      trend: "up"
    },
    {
      insight: "Competitor 'TechCorp' is gaining traction in AI search results for your target keywords.",
      sentiment: "warning",
      trend: "down"
    },
    {
      insight: "Your AI-generated content is performing 23% better than manual content across all channels.",
      sentiment: "positive",
      trend: "up"
    }
  ]
};

export default function Insights() {
  const { user, getToken } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [data, setData] = useState(mockData);
  const [activeTab, setActiveTab] = useState("overview");
  const [apiData, setApiData] = useState({
    prompts: [],
    suggestions: [],
    competitors: [],
    analytics: null
  });

  const tier = user?.tier || "core"; // fallback

  useEffect(() => {
    // Load real data when available
    const loadData = async () => {
      try {
        setLoading(true);
        const token = await getToken?.();
        if (!token) {
          setError("Authentication required");
          return;
        }
        
        // Load data from new API endpoints
        const [prompts, suggestions, competitors, analytics] = await Promise.all([
          fetchPrompts(token).catch(() => []),
          fetchSuggestions(token, {}).catch(() => []),
          fetchCompetitors(token, {}).catch(() => []),
          fetchAnalytics(token, {}).catch(() => null)
        ]);
        
        setApiData({
          prompts,
          suggestions,
          competitors,
          analytics
        });
        
        // For now, use mock data for the main dashboard
        setData(mockData);
      } catch (e) { 
        setError(String(e.message || e)); 
      } finally { 
        setLoading(false); 
      }
    };

    loadData();
  }, [getToken]);

  const InsightActionButton = ({ icon, title, description, onClick, disabled = false }) => (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      style={{
        background: "white",
        border: "1px solid #e2e8f0",
        borderRadius: "12px",
        padding: "1.5rem",
        textAlign: "left",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.6 : 1,
        transition: "all 0.2s ease",
        width: "100%"
      }}
      whileHover={!disabled ? { scale: 1.02, boxShadow: "0 8px 25px rgba(0,0,0,0.1)" } : {}}
      whileTap={!disabled ? { scale: 0.98 } : {}}
    >
      <div style={{ display: "flex", alignItems: "flex-start", gap: "1rem" }}>
        <div style={{
          width: "48px",
          height: "48px",
          borderRadius: "12px",
          background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "white",
          flexShrink: 0
        }}>
          {icon}
        </div>
        <div style={{ flex: 1 }}>
          <h3 style={{ 
            color: "#1f2937", 
            margin: "0 0 0.5rem 0", 
            fontSize: "1.1rem",
            fontWeight: 600
          }}>
            {title}
          </h3>
          <p style={{ 
            color: "#6b7280", 
            margin: 0, 
            fontSize: "0.875rem",
            lineHeight: 1.5
          }}>
            {description}
          </p>
          {disabled && (
            <div style={{ 
              display: "flex", 
              alignItems: "center", 
              gap: "0.5rem",
              marginTop: "0.5rem",
              color: "#f59e0b",
              fontSize: "0.75rem",
              fontWeight: 600
            }}>
              <FaLock />
              {tier === "core" ? "Upgrade required" : "Coming soon"}
            </div>
          )}
        </div>
      </div>
    </motion.button>
  );

  const StatCard = ({ title, value, change, icon, color = "blue" }) => (
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
        display: "flex",
        alignItems: "center",
        gap: "1rem"
      }}
    >
      <div style={{
        width: "48px",
        height: "48px",
        borderRadius: "12px",
        background: `linear-gradient(135deg, ${color === "blue" ? "#2563eb" : color === "green" ? "#10b981" : color === "orange" ? "#f59e0b" : "#7c3aed"}, ${color === "blue" ? "#1d4ed8" : color === "green" ? "#059669" : color === "orange" ? "#d97706" : "#6d28d9"})`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "white"
      }}>
        {icon}
      </div>
      <div style={{ flex: 1 }}>
        <h3 style={{ color: "#6b7280", fontSize: "0.875rem", margin: "0 0 0.25rem 0", fontWeight: 500 }}>
          {title}
        </h3>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <span style={{ color: "#1f2937", fontSize: "1.5rem", fontWeight: 700 }}>
            {typeof value === "number" && value >= 1000 ? value.toLocaleString() : value}
          </span>
          {change && (
            <div style={{ 
              display: "flex", 
              alignItems: "center", 
              gap: "0.25rem",
              color: change > 0 ? "#10b981" : "#ef4444",
              fontSize: "0.875rem",
              fontWeight: 600
            }}>
              {change > 0 ? <FaArrowUp /> : <FaArrowDown />}
              {Math.abs(change)}%
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );

  const InsightCard = ({ insight, sentiment, trend }) => (
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
        borderLeft: `4px solid ${sentiment === "positive" ? "#10b981" : sentiment === "warning" ? "#f59e0b" : "#ef4444"}`
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", gap: "0.75rem" }}>
        <div style={{
          color: sentiment === "positive" ? "#10b981" : sentiment === "warning" ? "#f59e0b" : "#ef4444",
          marginTop: "0.25rem"
        }}>
          {sentiment === "positive" ? <FaCheckCircle /> : sentiment === "warning" ? <FaExclamationTriangle /> : <FaExclamationTriangle />}
        </div>
        <div style={{ flex: 1 }}>
          <p style={{ color: "#374151", margin: "0 0 0.5rem 0", lineHeight: 1.5 }}>
            {insight}
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span style={{ 
              color: trend === "up" ? "#10b981" : "#ef4444",
              fontSize: "0.875rem",
              fontWeight: 600
            }}>
              {trend === "up" ? <FaChartBar /> : <FaArrowDown />}
            </span>
            <span style={{ color: "#6b7280", fontSize: "0.875rem" }}>
              {trend === "up" ? "Trending up" : "Trending down"}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );

  const ActionCard = ({ action }) => (
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
        borderLeft: `4px solid ${action.type === "urgent" ? "#ef4444" : action.type === "opportunity" ? "#10b981" : "#f59e0b"}`
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.75rem" }}>
        <h4 style={{ color: "#1f2937", margin: 0, fontSize: "1.1rem", fontWeight: 600 }}>
          {action.title}
        </h4>
        <span style={{
          background: action.type === "urgent" ? "#fee2e2" : action.type === "opportunity" ? "#d1fae5" : "#fef3c7",
          color: action.type === "urgent" ? "#991b1b" : action.type === "opportunity" ? "#065f46" : "#92400e",
          padding: "0.25rem 0.75rem",
          borderRadius: "20px",
          fontSize: "0.75rem",
          fontWeight: 600,
          textTransform: "uppercase"
        }}>
          {action.type}
        </span>
      </div>
      <p style={{ color: "#6b7280", margin: "0 0 1rem 0", lineHeight: 1.5 }}>
        {action.description}
      </p>
      <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <span style={{ color: "#6b7280", fontSize: "0.875rem" }}>Impact:</span>
          <span style={{ 
            color: action.impact === "high" ? "#ef4444" : action.impact === "medium" ? "#f59e0b" : "#10b981",
            fontWeight: 600,
            fontSize: "0.875rem"
          }}>
            {action.impact}
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <span style={{ color: "#6b7280", fontSize: "0.875rem" }}>Effort:</span>
          <span style={{ 
            color: action.effort === "high" ? "#ef4444" : action.effort === "medium" ? "#f59e0b" : "#10b981",
            fontWeight: 600,
            fontSize: "0.875rem"
          }}>
            {action.effort}
          </span>
        </div>
        <button style={{
          background: "#2563eb",
          color: "white",
          border: "none",
          borderRadius: "8px",
          padding: "0.5rem 1rem",
          fontSize: "0.875rem",
          fontWeight: 600,
          cursor: "pointer",
          marginLeft: "auto"
        }}>
          Take Action
        </button>
      </div>
    </motion.div>
  );

  return (
    <>
      <Navbar />
      <div className="container" style={{ padding: "2rem 0" }}>
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          style={{ marginBottom: "2rem" }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "0.5rem" }}>
            <FaBrain style={{ color: "#2563eb", fontSize: "2rem" }} />
            <h1 style={{ color: "#1e293b", fontSize: "2rem", margin: 0 }}>
              AI Insight Dashboard
            </h1>
            <span style={{
              background: "#f59e0b",
              color: "white",
              fontSize: "0.75rem",
              padding: "0.25rem 0.75rem",
              borderRadius: "20px",
              fontWeight: 600,
              textTransform: "uppercase"
            }}>
              Beta
            </span>
          </div>
          <p style={{ color: "#64748b", margin: 0, fontSize: "1.1rem" }}>
            AI-powered marketing analytics, competitor intelligence, and actionable insights for your business.
          </p>
        </motion.div>

        {/* Insight of the Day - Prominent Display */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          style={{ marginBottom: "2rem" }}
        >
          <InsightOfDayCard />
        </motion.div>

        {/* Quick Action Buttons */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          style={{ marginBottom: "2rem" }}
        >
          <h2 style={{ color: "#1e293b", fontSize: "1.5rem", marginBottom: "1rem" }}>
            AI Insights Tools
          </h2>
          <div style={{ 
            display: "grid", 
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", 
            gap: "1rem" 
          }}>
            <InsightActionButton
              icon={<FaList />}
              title="AI Prompts"
              description="Create and manage AI prompts for business insights and automation."
              onClick={() => setActiveTab("prompts")}
            />
            <InsightActionButton
              icon={<FaLightbulb />}
              title="AI Suggestions"
              description="Get personalized AI-powered suggestions for your business growth."
              onClick={() => setActiveTab("suggestions")}
            />
            <InsightActionButton
              icon={<FaUsers />}
              title="Competitor Analysis"
              description="Track competitors and identify market opportunities."
              onClick={() => setActiveTab("competitors")}
              disabled={tier === "core"}
            />
            <InsightActionButton
              icon={<FaChartLine />}
              title="Advanced Analytics"
              description="Deep dive into your business performance with AI-powered analytics."
              onClick={() => setActiveTab("analytics")}
              disabled={tier === "core"}
            />
          </div>
        </motion.section>

        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ 
              background: "#fee2e2", 
              color: "#991b1b", 
              padding: "0.75rem 1rem", 
              borderRadius: 8, 
              marginBottom: "1rem",
              border: "1px solid #fecaca"
            }}
          >
            {error}
          </motion.div>
        )}
        
        {loading && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ color: "#64748b", margin: "0.75rem 0" }}
          >
            Loading AI insights...
          </motion.div>
        )}

        {/* High-Level Summary */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={{ marginBottom: "2rem" }}
        >
          <h2 style={{ color: "#1e293b", fontSize: "1.5rem", marginBottom: "1rem" }}>
            Performance Summary
          </h2>
          <div style={{ 
            display: "grid", 
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", 
            gap: "1rem" 
          }}>
            <StatCard 
              title="Total Impressions"
              value={data.summary.totalImpressions}
              change={data.summary.growthRate}
              icon={<FaEye />}
              color="blue"
            />
                         <StatCard 
               title="Conversion Rate"
               value={`${data.summary.conversionRate}%`}
               change={2.1}
               icon={<FaCrosshairs />}
               color="green"
             />
            <StatCard 
              title="Revenue"
              value={`$${data.summary.revenue.toLocaleString()}`}
              change={8.3}
              icon={<FaChartLine />}
              color="green"
            />
            <StatCard 
              title="AI Mentions"
              value={data.summary.aiMentions}
              change={15}
              icon={<FaRobot />}
              color="orange"
            />
          </div>
        </motion.section>

        {/* AI Insights */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          style={{ marginBottom: "2rem" }}
        >
          <h2 style={{ color: "#1e293b", fontSize: "1.5rem", marginBottom: "1rem" }}>
            AI-Powered Insights
          </h2>
          <div style={{ display: "grid", gap: "1rem" }}>
            {data.aiInsights.map((insight, index) => (
              <InsightCard key={index} {...insight} />
            ))}
          </div>
        </motion.section>

        {/* Traffic & Conversion Analytics */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          style={{ marginBottom: "2rem" }}
        >
          <h2 style={{ color: "#1e293b", fontSize: "1.5rem", marginBottom: "1rem" }}>
            Traffic & Conversion Analytics
          </h2>
          <div style={{
            background: "white",
            borderRadius: 12,
            padding: "1.5rem",
            boxShadow: "0 8px 25px rgba(0,0,0,0.06)",
            border: "1px solid #f1f5f9"
          }}>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: 0 }}>
                <thead>
                  <tr>
                    <th style={{ textAlign: "left", padding: "12px", background: "#111827", color: "white", borderRadius: "8px 0 0 0" }}>
                      Date
                    </th>
                    <th style={{ textAlign: "left", padding: "12px", background: "#111827", color: "white" }}>
                      Impressions
                    </th>
                    <th style={{ textAlign: "left", padding: "12px", background: "#111827", color: "white" }}>
                      Clicks
                    </th>
                    <th style={{ textAlign: "left", padding: "12px", background: "#111827", color: "white" }}>
                      Conversions
                    </th>
                    <th style={{ textAlign: "left", padding: "12px", background: "#111827", color: "white", borderRadius: "0 8px 0 0" }}>
                      Revenue
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {data.trafficAnalytics.map((row, i) => (
                    <tr key={i} style={{ background: i % 2 === 0 ? "#f9fafb" : "white" }}>
                      <td style={{ padding: "12px", color: "#1f2937", fontWeight: 500 }}>
                        {formatDateTime(row.date)}
                      </td>
                      <td style={{ padding: "12px", color: "#1f2937" }}>
                        {row.impressions.toLocaleString()}
                      </td>
                      <td style={{ padding: "12px", color: "#1f2937" }}>
                        {row.clicks.toLocaleString()}
                      </td>
                      <td style={{ padding: "12px", color: "#1f2937" }}>
                        {row.conversions}
                      </td>
                      <td style={{ padding: "12px", color: "#1f2937" }}>
                        ${row.revenue.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </motion.section>

        {/* Competitor Mentions */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          style={{ marginBottom: "2rem" }}
        >
          <h2 style={{ color: "#1e293b", fontSize: "1.5rem", marginBottom: "1rem" }}>
            Competitor Mentions in AI Platforms
          </h2>
          <div style={{
            background: "white",
            borderRadius: 12,
            padding: "1.5rem",
            boxShadow: "0 8px 25px rgba(0,0,0,0.06)",
            border: "1px solid #f1f5f9"
          }}>
            {data.competitorMentions.map((mention, index) => (
              <div 
                key={index}
                style={{
                  padding: "1rem",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                  marginBottom: index < data.competitorMentions.length - 1 ? "1rem" : 0,
                  background: "#fafafa"
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.5rem" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <FaGlobe style={{ color: "#2563eb" }} />
                    <span style={{ color: "#1f2937", fontWeight: 600 }}>
                      {mention.platform}
                    </span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <span style={{
                      background: mention.sentiment === "positive" ? "#d1fae5" : mention.sentiment === "negative" ? "#fee2e2" : "#fef3c7",
                      color: mention.sentiment === "positive" ? "#065f46" : mention.sentiment === "negative" ? "#991b1b" : "#92400e",
                      padding: "0.25rem 0.75rem",
                      borderRadius: "20px",
                      fontSize: "0.75rem",
                      fontWeight: 600,
                      textTransform: "uppercase"
                    }}>
                      {mention.sentiment}
                    </span>
                    <span style={{
                      background: mention.impact === "high" ? "#fee2e2" : mention.impact === "medium" ? "#fef3c7" : "#d1fae5",
                      color: mention.impact === "high" ? "#991b1b" : mention.impact === "medium" ? "#92400e" : "#065f46",
                      padding: "0.25rem 0.75rem",
                      borderRadius: "20px",
                      fontSize: "0.75rem",
                      fontWeight: 600
                    }}>
                      {mention.impact} impact
                    </span>
                  </div>
                </div>
                <p style={{ color: "#6b7280", margin: "0 0 0.5rem 0", fontStyle: "italic" }}>
                  "{mention.mention}"
                </p>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <FaUsers style={{ color: "#6b7280", fontSize: "0.875rem" }} />
                  <span style={{ color: "#6b7280", fontSize: "0.875rem" }}>
                    Competitor: {mention.competitor}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </motion.section>

        {/* Suggested Actions */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <h2 style={{ color: "#1e293b", fontSize: "1.5rem", marginBottom: "1rem" }}>
            Suggested Actions
          </h2>
          <div style={{ display: "grid", gap: "1rem" }}>
            {data.suggestedActions.map((action, index) => (
              <ActionCard key={index} action={action} />
            ))}
          </div>
        </motion.section>

        {/* Upgrade CTA for Core Tier */}
        {tier === "core" && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            style={{
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              borderRadius: 12,
              padding: "2rem",
              textAlign: "center",
              marginTop: "2rem"
            }}
          >
            <FaRocket style={{ color: "white", fontSize: "2rem", marginBottom: "1rem" }} />
            <h3 style={{ color: "white", margin: "0 0 0.5rem 0", fontSize: "1.5rem" }}>
              Unlock Advanced AI Insights
            </h3>
            <p style={{ color: "rgba(255,255,255,0.9)", margin: "0 0 1.5rem 0" }}>
              Upgrade to Growth or Partner tier to access real-time competitor monitoring, advanced analytics, and AI-powered recommendations.
            </p>
            <a 
              href="/pricing" 
              style={{
                background: "white",
                color: "#2563eb",
                padding: "0.75rem 2rem",
                borderRadius: "8px",
                textDecoration: "none",
                fontWeight: 600,
                display: "inline-block"
              }}
            >
              View Plans
            </a>
          </motion.div>
        )}
      </div>
    </>
  );
}
