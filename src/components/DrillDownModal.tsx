import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "./ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { ScrollArea } from "./ui/scroll-area";
import { Progress } from "./ui/progress";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Users,
  DollarSign,
  MousePointer,
  Eye,
  Calendar,
  Filter,
  Download,
  Lightbulb,
  Target,
  AlertTriangle,
  CheckCircle,
  ArrowUpRight,
  ArrowDownRight,
  Zap
} from "lucide-react";

interface DrillDownData {
  metric: string;
  value: number;
  previousValue?: number;
  change?: number;
  changeType?: "increase" | "decrease" | "neutral";
  breakdown: {
    segments: Array<{
      name: string;
      value: number;
      percentage: number;
      trend: "up" | "down" | "stable";
    }>;
    timeSeries: Array<{
      date: string;
      value: number;
    }>;
    correlations: Array<{
      metric: string;
      correlation: number;
      impact: "high" | "medium" | "low";
    }>;
  };
  insights: Array<{
    type: "opportunity" | "risk" | "trend" | "anomaly";
    title: string;
    description: string;
    confidence: number;
    actionable: boolean;
    recommendation?: string;
  }>;
  relatedMetrics: Array<{
    name: string;
    value: number;
    change: number;
    relation: "positive" | "negative" | "neutral";
  }>;
}

interface DrillDownModalProps {
  isOpen: boolean;
  onClose: () => void;
  agentId: number;
  agentName: string;
  metric: string;
  initialValue: number;
}

export function DrillDownModal({ 
  isOpen, 
  onClose, 
  agentId, 
  agentName, 
  metric, 
  initialValue 
}: DrillDownModalProps) {
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedTimeRange, setSelectedTimeRange] = useState("7d");

  const { data: drillDownData, isLoading } = useQuery({
    queryKey: [`/api/agents/${agentId}/drill-down/${metric}`, selectedTimeRange],
    enabled: isOpen,
    refetchInterval: 30000,
  });

  // Generate contextual insights based on metric type and data patterns
  const generateContextualInsights = (data: DrillDownData) => {
    const insights = [];

    // Trend analysis
    if (data.change && Math.abs(data.change) > 10) {
      insights.push({
        type: data.change > 0 ? "opportunity" : "risk",
        title: `Significant ${data.change > 0 ? 'Growth' : 'Decline'} Detected`,
        description: `${metric} has ${data.change > 0 ? 'increased' : 'decreased'} by ${Math.abs(data.change).toFixed(1)}% in the selected period`,
        confidence: 95,
        actionable: true,
        recommendation: data.change > 0 
          ? "Analyze successful factors and scale winning strategies"
          : "Immediate investigation needed to identify root causes"
      });
    }

    // Segment analysis
    const topSegment = data.breakdown.segments[0];
    if (topSegment && topSegment.percentage > 50) {
      insights.push({
        type: "trend",
        title: "Dominant Segment Identified",
        description: `${topSegment.name} represents ${topSegment.percentage}% of total ${metric}`,
        confidence: 88,
        actionable: true,
        recommendation: "Consider segment-specific optimization strategies"
      });
    }

    // Correlation insights
    const highCorrelation = data.breakdown.correlations.find(c => Math.abs(c.correlation) > 0.7);
    if (highCorrelation) {
      insights.push({
        type: "opportunity",
        title: "Strong Correlation Found",
        description: `${metric} shows ${Math.abs(highCorrelation.correlation * 100).toFixed(0)}% correlation with ${highCorrelation.metric}`,
        confidence: 92,
        actionable: true,
        recommendation: "Leverage this correlation for predictive optimization"
      });
    }

    return insights;
  };

  const mockData: DrillDownData = {
    metric,
    value: initialValue,
    previousValue: initialValue * 0.85,
    change: 17.6,
    changeType: "increase",
    breakdown: {
      segments: [
        { name: "Desktop Users", value: initialValue * 0.6, percentage: 60, trend: "up" },
        { name: "Mobile Users", value: initialValue * 0.35, percentage: 35, trend: "stable" },
        { name: "Tablet Users", value: initialValue * 0.05, percentage: 5, trend: "down" }
      ],
      timeSeries: Array.from({ length: 7 }, (_, i) => ({
        date: new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        value: initialValue * (0.8 + Math.random() * 0.4)
      })),
      correlations: [
        { metric: "User Engagement", correlation: 0.82, impact: "high" },
        { metric: "Page Load Time", correlation: -0.64, impact: "medium" },
        { metric: "Marketing Spend", correlation: 0.71, impact: "high" }
      ]
    },
    insights: [],
    relatedMetrics: [
      { name: "Conversion Rate", value: 2.4, change: 12.3, relation: "positive" },
      { name: "Bounce Rate", value: 32.1, change: -8.7, relation: "negative" },
      { name: "Session Duration", value: 145, change: 22.1, relation: "positive" }
    ]
  };

  const data = drillDownData || mockData;
  data.insights = generateContextualInsights(data);

  const getInsightIcon = (type: string) => {
    switch (type) {
      case "opportunity": return <Lightbulb className="h-4 w-4 text-green-500" />;
      case "risk": return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case "trend": return <TrendingUp className="h-4 w-4 text-blue-500" />;
      case "anomaly": return <Zap className="h-4 w-4 text-yellow-500" />;
      default: return <Target className="h-4 w-4 text-gray-500" />;
    }
  };

  const getChangeIcon = (change: number) => {
    if (change > 0) return <ArrowUpRight className="h-4 w-4 text-green-500" />;
    if (change < 0) return <ArrowDownRight className="h-4 w-4 text-red-500" />;
    return <div className="h-4 w-4" />;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <BarChart3 className="h-5 w-5" />
            <span>{metric} Analysis</span>
            <Badge variant="outline">{agentName}</Badge>
          </DialogTitle>
          <DialogDescription>
            Deep dive into {metric} with contextual insights and actionable recommendations
          </DialogDescription>
        </DialogHeader>

        <div className="flex space-x-4 mb-6">
          {["24h", "7d", "30d", "90d"].map((range) => (
            <Button
              key={range}
              variant={selectedTimeRange === range ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedTimeRange(range)}
            >
              {range}
            </Button>
          ))}
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="segments">Segments</TabsTrigger>
            <TabsTrigger value="correlations">Correlations</TabsTrigger>
            <TabsTrigger value="insights">Insights</TabsTrigger>
          </TabsList>

          <ScrollArea className="h-[600px] mt-4">
            <TabsContent value="overview" className="space-y-6">
              {/* Key Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Current Value</p>
                          <p className="text-3xl font-bold">{data.value.toLocaleString()}</p>
                        </div>
                        <DollarSign className="h-8 w-8 text-primary" />
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Change</p>
                          <div className="flex items-center space-x-1">
                            <p className={`text-3xl font-bold ${data.change && data.change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {data.change && data.change > 0 ? '+' : ''}{data.change?.toFixed(1)}%
                            </p>
                            {data.change && getChangeIcon(data.change)}
                          </div>
                        </div>
                        <TrendingUp className="h-8 w-8 text-green-500" />
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Previous Period</p>
                          <p className="text-3xl font-bold">{data.previousValue?.toLocaleString()}</p>
                        </div>
                        <Calendar className="h-8 w-8 text-blue-500" />
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Insights</p>
                          <p className="text-3xl font-bold">{data.insights.length}</p>
                        </div>
                        <Lightbulb className="h-8 w-8 text-yellow-500" />
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>

              {/* Related Metrics */}
              <Card>
                <CardHeader>
                  <CardTitle>Related Metrics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {data.relatedMetrics.map((related, index) => (
                      <motion.div
                        key={related.name}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 * index }}
                        className="p-4 border rounded-lg"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{related.name}</p>
                            <p className="text-2xl font-bold">{related.value}</p>
                          </div>
                          <div className="text-right">
                            <div className="flex items-center space-x-1">
                              <span className={`text-sm font-medium ${related.change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {related.change > 0 ? '+' : ''}{related.change.toFixed(1)}%
                              </span>
                              {getChangeIcon(related.change)}
                            </div>
                            <Badge variant={related.relation === "positive" ? "default" : "secondary"} className="text-xs">
                              {related.relation}
                            </Badge>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="segments" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Segment Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {data.breakdown.segments.map((segment, index) => (
                      <motion.div
                        key={segment.name}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 * index }}
                        className="space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{segment.name}</span>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-muted-foreground">
                              {segment.value.toLocaleString()} ({segment.percentage}%)
                            </span>
                            <Badge variant={segment.trend === "up" ? "default" : segment.trend === "down" ? "destructive" : "secondary"}>
                              {segment.trend}
                            </Badge>
                          </div>
                        </div>
                        <Progress value={segment.percentage} className="h-2" />
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="correlations" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Metric Correlations</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {data.breakdown.correlations.map((correlation, index) => (
                      <motion.div
                        key={correlation.metric}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 * index }}
                        className="p-4 border rounded-lg"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{correlation.metric}</p>
                            <p className="text-sm text-muted-foreground">
                              {Math.abs(correlation.correlation * 100).toFixed(0)}% correlation
                            </p>
                          </div>
                          <div className="text-right">
                            <Badge variant={correlation.impact === "high" ? "default" : correlation.impact === "medium" ? "secondary" : "outline"}>
                              {correlation.impact} impact
                            </Badge>
                            <div className="mt-1">
                              <Progress value={Math.abs(correlation.correlation) * 100} className="h-2 w-20" />
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="insights" className="space-y-6">
              <div className="space-y-4">
                {data.insights.map((insight, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * index }}
                  >
                    <Card>
                      <CardContent className="p-6">
                        <div className="space-y-4">
                          <div className="flex items-start space-x-3">
                            {getInsightIcon(insight.type)}
                            <div className="flex-1">
                              <div className="flex items-center space-x-2">
                                <h4 className="font-semibold">{insight.title}</h4>
                                <Badge variant={insight.type === "opportunity" ? "default" : insight.type === "risk" ? "destructive" : "secondary"}>
                                  {insight.type}
                                </Badge>
                                {insight.actionable && (
                                  <Badge variant="outline" className="text-xs">
                                    Actionable
                                  </Badge>
                                )}
                              </div>
                              <p className="text-muted-foreground mt-1">{insight.description}</p>
                              {insight.recommendation && (
                                <div className="mt-3 p-3 bg-muted/50 rounded-lg">
                                  <p className="text-sm font-medium">Recommendation:</p>
                                  <p className="text-sm text-muted-foreground">{insight.recommendation}</p>
                                </div>
                              )}
                            </div>
                            <div className="text-right">
                              <div className="text-sm text-muted-foreground">Confidence</div>
                              <div className="text-lg font-bold">{insight.confidence}%</div>
                              <Progress value={insight.confidence} className="h-2 w-16 mt-1" />
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </TabsContent>
          </ScrollArea>
        </Tabs>

        <div className="flex justify-end space-x-2 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button>
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}