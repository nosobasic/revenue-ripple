import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { fetchPrompts, fetchPromptSuggestions, fetchCompetitors, fetchAnalytics } from "../api/insightsClient";
import { FaEye, FaChartLine, FaList, FaUsers, FaLightbulb, FaCrown } from "react-icons/fa";
import Navbar from "../components/Navbar";

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

export default function Insights() {
  const { user, getToken } = useAuth();
  const [tab, setTab] = useState("Overview");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [prompts, setPrompts] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [competitors, setCompetitors] = useState([]);
  const [analytics, setAnalytics] = useState(null);

  const tier = user?.tier || "core"; // fallback

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const token = await getToken?.();
        if (!token) {
          setError("Authentication required");
          return;
        }
        
        // preload minimal data for Overview
        const [p, s] = await Promise.all([
          fetchPrompts(token).catch(() => []),
          fetchPromptSuggestions(token, {}).catch(() => [])
        ]);
        setPrompts(p); 
        setSuggestions(s);
      } catch (e) { 
        setError(String(e.message || e)); 
      } finally { 
        setLoading(false); 
      }
    })();
  }, [getToken]);

  const loadCompetitors = async (industry, limit = 25) => {
    setError(""); 
    setLoading(true);
    try {
      const token = await getToken?.();
      const data = await fetchCompetitors(token, { industry, limit });
      setCompetitors(data);
    } catch (e) { 
      setError(String(e.message || e)); 
    } finally { 
      setLoading(false); 
    }
  };

  const loadAnalytics = async (params = {}) => {
    setError(""); 
    setLoading(true);
    try {
      const token = await getToken?.();
      const data = await fetchAnalytics(token, params);
      setAnalytics(data);
    } catch (e) { 
      setError(String(e.message || e)); 
    } finally { 
      setLoading(false); 
    }
  };

  const loadSuggestions = async (q, business_id) => {
    setError(""); 
    setLoading(true);
    try {
      const token = await getToken?.();
      const data = await fetchPromptSuggestions(token, { q, business_id });
      setSuggestions(data);
    } catch (e) { 
      setError(String(e.message || e)); 
    } finally { 
      setLoading(false); 
    }
  };

  // Available tabs based on tier
  const availableTabs = [
    "Overview",
    "Prompts", 
    "Suggestions",
    ...(tier !== "core" ? ["Competitors", "Analytics"] : [])
  ];

  return (
    <>
      <Navbar />
      <div className="container" style={{ padding: "2rem 0" }}>
        <motion.h1 
          initial={{ opacity: 0, y: 10 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.4 }} 
          style={{ color: "#1e293b", fontSize: "2rem", marginBottom: "0.5rem" }}
        >
          AI Insights
        </motion.h1>
        <p style={{ color: "#64748b", marginBottom: "1.5rem" }}>
          Market visibility, competitor intel, and performance analytics — inside your Business OS.
        </p>

        {/* Tabs */}
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginBottom: "1rem" }}>
          {availableTabs.map((t) => (
            <button 
              key={t} 
              onClick={() => setTab(t)}
              style={{
                padding: "0.6rem 1rem", 
                border: "none", 
                borderRadius: 50,
                background: tab === t ? "#2563eb" : "white",
                color: tab === t ? "white" : "#64748b",
                fontWeight: 600, 
                cursor: "pointer", 
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                transition: "all 0.2s ease"
              }}
            >
              {t}
            </button>
          ))}
          
          {/* Show upgrade tabs for core tier */}
          {tier === "core" && (
            <>
              <button 
                style={{
                  padding: "0.6rem 1rem", 
                  border: "none", 
                  borderRadius: 50,
                  background: "white",
                  color: "#9ca3af",
                  fontWeight: 600, 
                  cursor: "not-allowed", 
                  boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                  opacity: 0.6
                }}
                disabled
              >
                Competitors <FaLightbulb style={{ marginLeft: "0.25rem", fontSize: "0.75rem" }} />
              </button>
              <button 
                style={{
                  padding: "0.6rem 1rem", 
                  border: "none", 
                  borderRadius: 50,
                  background: "white",
                  color: "#9ca3af",
                  fontWeight: 600, 
                  cursor: "not-allowed", 
                  boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                  opacity: 0.6
                }}
                disabled
              >
                Analytics <FaLightbulb style={{ marginLeft: "0.25rem", fontSize: "0.75rem" }} />
              </button>
            </>
          )}
        </div>

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
            Loading…
          </motion.div>
        )}

        {/* Overview Tab */}
        {tab === "Overview" && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.3 }}
            style={{ display: "grid", gap: "1rem", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))" }}
          >
            <div style={{ 
              background: "white", 
              borderRadius: 12, 
              padding: "1.5rem", 
              boxShadow: "0 8px 25px rgba(0,0,0,0.06)",
              border: "1px solid #f1f5f9"
            }}>
              <div style={{ display: "flex", alignItems: "center", marginBottom: "0.75rem" }}>
                <FaLightbulb style={{ color: "#f59e0b", marginRight: "0.5rem" }} />
                <h3 style={{ color: "#1f2937", margin: 0 }}>Insight of the Day</h3>
              </div>
              <p style={{ color: "#4b5563", lineHeight: 1.6 }}>
                {suggestions[0]?.suggestion || "Connect your business to start receiving AI-powered suggestions and insights."}
              </p>
            </div>
            
            <div style={{ 
              background: "white", 
              borderRadius: 12, 
              padding: "1.5rem", 
              boxShadow: "0 8px 25px rgba(0,0,0,0.06)",
              border: "1px solid #f1f5f9"
            }}>
              <div style={{ display: "flex", alignItems: "center", marginBottom: "0.75rem" }}>
                <FaList style={{ color: "#2563eb", marginRight: "0.5rem" }} />
                <h3 style={{ color: "#1f2937", margin: 0 }}>Recent Prompts</h3>
              </div>
              <ul style={{ margin: 0, paddingLeft: "1rem", color: "#4b5563" }}>
                {prompts.slice(0, 5).map((p) => (
                  <li key={p.id} style={{ marginBottom: 6, lineHeight: 1.4 }}>
                    {p.title || p.body?.slice(0, 80) || "Untitled prompt"}…
                  </li>
                ))}
                {prompts.length === 0 && (
                  <li style={{ color: "#9ca3af", fontStyle: "italic" }}>No prompts yet</li>
                )}
              </ul>
            </div>

            <div style={{ 
              background: "white", 
              borderRadius: 12, 
              padding: "1.5rem", 
              boxShadow: "0 8px 25px rgba(0,0,0,0.06)",
              border: "1px solid #f1f5f9"
            }}>
              <div style={{ display: "flex", alignItems: "center", marginBottom: "0.75rem" }}>
                <FaCrown style={{ color: "#f59e0b", marginRight: "0.5rem" }} />
                <h3 style={{ color: "#1f2937", margin: 0 }}>Your Tier</h3>
              </div>
              <p style={{ color: "#4b5563", marginBottom: "0.5rem" }}>
                <strong>{tier.charAt(0).toUpperCase() + tier.slice(1)}</strong>
              </p>
              {tier === "core" && (
                <p style={{ color: "#9ca3af", fontSize: "0.875rem" }}>
                  Upgrade to Growth to unlock Competitors & Analytics features.
                </p>
              )}
            </div>
          </motion.div>
        )}

        {/* Prompts Tab */}
        {tab === "Prompts" && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.3 }}
            style={{ 
              background: "white", 
              borderRadius: 12, 
              padding: "1.5rem", 
              boxShadow: "0 8px 25px rgba(0,0,0,0.06)",
              border: "1px solid #f1f5f9"
            }}
          >
            <div style={{ display: "flex", alignItems: "center", marginBottom: "1rem" }}>
              <FaList style={{ color: "#2563eb", marginRight: "0.5rem" }} />
              <h3 style={{ color: "#1f2937", margin: 0 }}>Your Prompts</h3>
            </div>
            {prompts.length > 0 ? (
              <div style={{ display: "grid", gap: "1rem" }}>
                {prompts.map((p) => (
                  <div 
                    key={p.id} 
                    style={{ 
                      padding: "1rem", 
                      border: "1px solid #e5e7eb", 
                      borderRadius: 8,
                      background: "#fafafa"
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.5rem" }}>
                      <h4 style={{ color: "#1f2937", margin: 0, fontSize: "1rem" }}>
                        {p.title || "Untitled Prompt"}
                      </h4>
                      <span style={{ color: "#9ca3af", fontSize: "0.875rem" }}>
                        {formatDateTime(p.created_at)}
                      </span>
                    </div>
                    <p style={{ color: "#4b5563", margin: 0, lineHeight: 1.5 }}>
                      {p.body}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: "#9ca3af", textAlign: "center", fontStyle: "italic" }}>
                No prompts found. Create your first prompt to get started.
              </p>
            )}
          </motion.div>
        )}

        {/* Suggestions Tab */}
        {tab === "Suggestions" && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.3 }}
            style={{ 
              background: "white", 
              borderRadius: 12, 
              padding: "1.5rem", 
              boxShadow: "0 8px 25px rgba(0,0,0,0.06)",
              border: "1px solid #f1f5f9"
            }}
          >
            <div style={{ display: "flex", alignItems: "center", marginBottom: "1rem" }}>
              <FaLightbulb style={{ color: "#f59e0b", marginRight: "0.5rem" }} />
              <h3 style={{ color: "#1f2937", margin: 0 }}>Prompt Suggestions</h3>
            </div>
            
            {/* Search Controls */}
            <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginBottom: "1rem" }}>
              <input 
                placeholder="Search suggestions..." 
                id="suggestion-q" 
                style={{ 
                  padding: "0.6rem 0.8rem", 
                  border: "1px solid #e5e7eb", 
                  borderRadius: 8,
                  minWidth: "200px"
                }} 
              />
              <input 
                placeholder="Business ID (optional)" 
                id="suggestion-biz" 
                style={{ 
                  padding: "0.6rem 0.8rem", 
                  border: "1px solid #e5e7eb", 
                  borderRadius: 8,
                  minWidth: "150px"
                }} 
              />
              <button 
                onClick={async () => {
                  const q = document.getElementById("suggestion-q").value || undefined;
                  const business_id = document.getElementById("suggestion-biz").value || undefined;
                  await loadSuggestions(q, business_id);
                }} 
                style={{ 
                  padding: "0.6rem 1rem", 
                  border: "none", 
                  borderRadius: 8, 
                  background: "#2563eb", 
                  color: "white", 
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "background 0.2s ease"
                }}
                onMouseEnter={(e) => e.target.style.background = "#1d4ed8"}
                onMouseLeave={(e) => e.target.style.background = "#2563eb"}
              >
                Search
              </button>
            </div>
            
            {/* Suggestions List */}
            {suggestions.length > 0 ? (
              <div style={{ display: "grid", gap: "1rem" }}>
                {suggestions.map((s) => (
                  <div 
                    key={s.id} 
                    style={{ 
                      padding: "1rem", 
                      border: "1px solid #e5e7eb", 
                      borderRadius: 8,
                      background: "#fafafa"
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.5rem" }}>
                      <span style={{ color: "#9ca3af", fontSize: "0.875rem" }}>
                        Score: {s.score ? s.score.toFixed(2) : "N/A"}
                      </span>
                      <span style={{ color: "#9ca3af", fontSize: "0.875rem" }}>
                        {formatDateTime(s.created_at)}
                      </span>
                    </div>
                    <p style={{ color: "#4b5563", margin: 0, lineHeight: 1.5 }}>
                      {s.suggestion}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: "#9ca3af", textAlign: "center", fontStyle: "italic" }}>
                No suggestions found. Try adjusting your search criteria.
              </p>
            )}
          </motion.div>
        )}

        {/* Competitors Tab */}
        {tab === "Competitors" && (tier === "growth" || tier === "partner" ? (
          <motion.div 
            initial={{ opacity: 0, y: 10 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.3 }}
            style={{ 
              background: "white", 
              borderRadius: 12, 
              padding: "1.5rem", 
              boxShadow: "0 8px 25px rgba(0,0,0,0.06)",
              border: "1px solid #f1f5f9"
            }}
          >
            <div style={{ display: "flex", alignItems: "center", marginBottom: "1rem" }}>
              <FaUsers style={{ color: "#7c3aed", marginRight: "0.5rem" }} />
              <h3 style={{ color: "#1f2937", margin: 0 }}>Competitors</h3>
            </div>
            
            {/* Controls */}
            <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginBottom: "1rem" }}>
              <input 
                placeholder="Industry filter (optional)" 
                id="competitor-industry" 
                style={{ 
                  padding: "0.6rem 0.8rem", 
                  border: "1px solid #e5e7eb", 
                  borderRadius: 8,
                  minWidth: "200px"
                }} 
              />
              <select 
                id="competitor-limit" 
                defaultValue="25" 
                style={{ 
                  padding: "0.6rem 0.8rem", 
                  border: "1px solid #e5e7eb", 
                  borderRadius: 8
                }}
              >
                <option value="10">10 results</option>
                <option value="25">25 results</option>
                <option value="50">50 results</option>
              </select>
              <button 
                onClick={async () => {
                  const industry = document.getElementById("competitor-industry").value || undefined;
                  const limit = parseInt(document.getElementById("competitor-limit").value, 10);
                  await loadCompetitors(industry, limit);
                }} 
                style={{ 
                  padding: "0.6rem 1rem", 
                  border: "none", 
                  borderRadius: 8, 
                  background: "#2563eb", 
                  color: "white", 
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "background 0.2s ease"
                }}
                onMouseEnter={(e) => e.target.style.background = "#1d4ed8"}
                onMouseLeave={(e) => e.target.style.background = "#2563eb"}
              >
                Load Competitors
              </button>
            </div>
            
            {/* Competitors List */}
            {competitors.length > 0 ? (
              <div style={{ display: "grid", gap: "1rem" }}>
                {competitors.map((c) => (
                  <div 
                    key={c.id} 
                    style={{ 
                      padding: "1rem", 
                      border: "1px solid #e5e7eb", 
                      borderRadius: 8,
                      background: "#fafafa"
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.5rem" }}>
                      <h4 style={{ color: "#1f2937", margin: 0, fontSize: "1rem" }}>
                        {c.name}
                      </h4>
                      <span style={{ color: "#9ca3af", fontSize: "0.875rem" }}>
                        Score: {c.score ? c.score.toFixed(2) : "N/A"}
                      </span>
                    </div>
                    <p style={{ color: "#4b5563", margin: "0.25rem 0" }}>
                      <strong>Industry:</strong> {c.industry}
                    </p>
                    {c.website && (
                      <p style={{ color: "#4b5563", margin: "0.25rem 0" }}>
                        <strong>Website:</strong> {c.website}
                      </p>
                    )}
                    <p style={{ color: "#9ca3af", fontSize: "0.875rem", margin: "0.25rem 0" }}>
                      Last seen: {formatDateTime(c.last_seen)}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: "#9ca3af", textAlign: "center", fontStyle: "italic" }}>
                No competitors found. Try adjusting your filters.
              </p>
            )}
          </motion.div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, y: 10 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.3 }}
            style={{ 
              background: "#fff7ed", 
              border: "1px solid #fed7aa", 
              color: "#9a3412", 
              padding: "1.5rem", 
              borderRadius: 12,
              textAlign: "center"
            }}
          >
            <FaLightbulb style={{ fontSize: "2rem", marginBottom: "1rem", color: "#f59e0b" }} />
            <h3 style={{ margin: "0 0 0.5rem 0" }}>Competitors is a Growth Feature</h3>
            <p style={{ margin: "0 0 1rem 0" }}>
              Unlock competitor intelligence and market insights with our Growth plan.
            </p>
            <a 
              href="/pricing" 
              style={{ 
                color: "#2563eb", 
                fontWeight: 600, 
                textDecoration: "none",
                padding: "0.75rem 1.5rem",
                background: "white",
                borderRadius: "8px",
                display: "inline-block",
                border: "1px solid #e5e7eb"
              }}
            >
              Upgrade to Growth
            </a>
          </motion.div>
        ))}

        {/* Analytics Tab */}
        {tab === "Analytics" && (tier === "growth" || tier === "partner" ? (
          <motion.div 
            initial={{ opacity: 0, y: 10 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.3 }}
            style={{ 
              background: "white", 
              borderRadius: 12, 
              padding: "1.5rem", 
              boxShadow: "0 8px 25px rgba(0,0,0,0.06)",
              border: "1px solid #f1f5f9"
            }}
          >
            <div style={{ display: "flex", alignItems: "center", marginBottom: "1rem" }}>
              <FaChartLine style={{ color: "#10b981", marginRight: "0.5rem" }} />
              <h3 style={{ color: "#1f2937", margin: 0 }}>Analytics</h3>
            </div>
            
            {/* Controls */}
            <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginBottom: "1rem" }}>
              <input 
                type="date" 
                id="analytics-from" 
                style={{ 
                  padding: "0.6rem 0.8rem", 
                  border: "1px solid #e5e7eb", 
                  borderRadius: 8
                }} 
              />
              <input 
                type="date" 
                id="analytics-to" 
                style={{ 
                  padding: "0.6rem 0.8rem", 
                  border: "1px solid #e5e7eb", 
                  borderRadius: 8
                }} 
              />
              <select 
                id="analytics-group" 
                defaultValue="day" 
                style={{ 
                  padding: "0.6rem 0.8rem", 
                  border: "1px solid #e5e7eb", 
                  borderRadius: 8
                }}
              >
                <option value="day">Daily</option>
                <option value="week">Weekly</option>
                <option value="month">Monthly</option>
              </select>
              <select 
                id="analytics-metrics" 
                defaultValue="impressions,clicks,conversions,rev" 
                style={{ 
                  padding: "0.6rem 0.8rem", 
                  border: "1px solid #e5e7eb", 
                  borderRadius: 8
                }}
              >
                <option value="impressions,clicks,conversions,rev">All Metrics</option>
                <option value="impressions,rev">Impressions + Revenue</option>
                <option value="clicks,conversions">Clicks + Conversions</option>
              </select>
              <button 
                onClick={async () => {
                  const params = {
                    from: document.getElementById("analytics-from").value || undefined,
                    to: document.getElementById("analytics-to").value || undefined,
                    group_by: document.getElementById("analytics-group").value,
                    metrics: document.getElementById("analytics-metrics").value
                  };
                  await loadAnalytics(params);
                }} 
                style={{ 
                  padding: "0.6rem 1rem", 
                  border: "none", 
                  borderRadius: 8, 
                  background: "#2563eb", 
                  color: "white", 
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "background 0.2s ease"
                }}
                onMouseEnter={(e) => e.target.style.background = "#1d4ed8"}
                onMouseLeave={(e) => e.target.style.background = "#2563eb"}
              >
                Load Analytics
              </button>
            </div>
            
            {/* Analytics Table */}
            {analytics?.rows && analytics.rows.length > 0 ? (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: 0 }}>
                  <thead>
                    <tr>
                      <th style={{ textAlign: "left", padding: "12px", background: "#111827", color: "white", borderRadius: "8px 0 0 0" }}>
                        Period
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
                    {analytics.rows.map((r, i) => (
                      <tr key={i} style={{ background: i % 2 === 0 ? "#f9fafb" : "white" }}>
                        <td style={{ padding: "12px", color: "#1f2937", fontWeight: 500 }}>
                          {formatDateTime(r.period_start)} — {formatDateTime(r.period_end)}
                        </td>
                        <td style={{ padding: "12px", color: "#1f2937" }}>
                          {r.impressions?.toLocaleString() ?? "-"}
                        </td>
                        <td style={{ padding: "12px", color: "#1f2937" }}>
                          {r.clicks?.toLocaleString() ?? "-"}
                        </td>
                        <td style={{ padding: "12px", color: "#1f2937" }}>
                          {r.conversions?.toLocaleString() ?? "-"}
                        </td>
                        <td style={{ padding: "12px", color: "#1f2937" }}>
                          {typeof r.rev === "number" ? `$${r.rev.toFixed(2)}` : "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                
                {/* Totals */}
                {analytics.totals && (
                  <div style={{ 
                    marginTop: "1rem", 
                    padding: "1rem", 
                    background: "#f8fafc", 
                    borderRadius: "8px",
                    border: "1px solid #e2e8f0"
                  }}>
                    <h4 style={{ color: "#1f2937", margin: "0 0 0.5rem 0" }}>Totals</h4>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "0.5rem" }}>
                      <div><strong>Impressions:</strong> {analytics.totals.impressions?.toLocaleString() ?? "-"}</div>
                      <div><strong>Clicks:</strong> {analytics.totals.clicks?.toLocaleString() ?? "-"}</div>
                      <div><strong>Conversions:</strong> {analytics.totals.conversions?.toLocaleString() ?? "-"}</div>
                      <div><strong>Revenue:</strong> {typeof analytics.totals.rev === "number" ? `$${analytics.totals.rev.toFixed(2)}` : "-"}</div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <p style={{ color: "#9ca3af", textAlign: "center", fontStyle: "italic" }}>
                No analytics data found. Select a date range and load analytics.
              </p>
            )}
          </motion.div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, y: 10 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.3 }}
            style={{ 
              background: "#fff7ed", 
              border: "1px solid #fed7aa", 
              color: "#9a3412", 
              padding: "1.5rem", 
              borderRadius: 12,
              textAlign: "center"
            }}
          >
            <FaChartLine style={{ fontSize: "2rem", marginBottom: "1rem", color: "#f59e0b" }} />
            <h3 style={{ margin: "0 0 0.5rem 0" }}>Analytics is a Growth Feature</h3>
            <p style={{ margin: "0 0 1rem 0" }}>
              Unlock detailed performance analytics and insights with our Growth plan.
            </p>
            <a 
              href="/pricing" 
              style={{ 
                color: "#2563eb", 
                fontWeight: 600, 
                textDecoration: "none",
                padding: "0.75rem 1.5rem",
                background: "white",
                borderRadius: "8px",
                display: "inline-block",
                border: "1px solid #e5e7eb"
              }}
            >
              Upgrade to Growth
            </a>
          </motion.div>
        ))}
      </div>
    </>
  );
}
