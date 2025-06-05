import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AgentCard } from "./AgentCard";
import { DrillDownTrigger } from "./DrillDownTrigger";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Progress } from "./ui/progress";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { 
  Users, 
  DollarSign, 
  TrendingUp, 
  Activity,
  ArrowUp,
  ArrowDown,
  Minus
} from "lucide-react";

interface KPITrackerAgentProps {
  agentId: number;
}

interface KPIOverview {
  timestamp: string;
  summary: {
    totalUsers: number;
    totalRevenue: number;
    totalCommissions: number;
    userGrowthRate: number;
    revenueGrowthRate: number;
    commissionGrowthRate: number;
  };
  trends: {
    userTrend: 'up' | 'down' | 'stable';
    revenueTrend: 'up' | 'down' | 'stable';
    commissionTrend: 'up' | 'down' | 'stable';
  };
}

interface KPIDetails {
  users: {
    totalUsers: number;
    activeUsers: number;
    newUsersToday: number;
    newUsersThisMonth: number;
    userGrowthRate: number;
    churnRate: number;
    userStatus: {
      active: number;
      inactive: number;
      trial: number;
      suspended: number;
    };
  };
  revenue: {
    totalRevenue: number;
    monthlyRecurringRevenue: number;
    revenueToday: number;
    revenueThisMonth: number;
    revenueGrowthRate: number;
    averageRevenuePerUser: number;
    subscriptionBreakdown: {
      basic: { count: number; revenue: number };
      pro: { count: number; revenue: number };
      enterprise: { count: number; revenue: number };
    };
  };
  commissions: {
    totalCommissions: number;
    commissionsToday: number;
    commissionsThisMonth: number;
    commissionGrowthRate: number;
    topPerformers: Array<{
      userId: string;
      name: string;
      commissions: number;
      conversionRate: number;
    }>;
    commissionsByType: {
      referral: number;
      sales: number;
      affiliate: number;
    };
  };
  activity: {
    recentActivities: Array<{
      id: string;
      type: 'signup' | 'payment' | 'commission' | 'cancellation' | 'upgrade';
      userId: string;
      amount?: number;
      timestamp: string;
      description: string;
    }>;
    activityCounts: {
      signups: number;
      payments: number;
      commissions: number;
      cancellations: number;
    };
  };
}

export function KPITrackerAgent({ agentId }: KPITrackerAgentProps) {
  const [showDetails, setShowDetails] = useState(false);

  const { data: overview, isLoading: overviewLoading } = useQuery<KPIOverview>({
    queryKey: ['/api/agents/kpi-tracker', agentId, 'overview'],
    refetchInterval: 30000
  });

  const { data: details, isLoading: detailsLoading } = useQuery<KPIDetails>({
    queryKey: ['/api/agents/kpi-tracker', agentId, 'details'],
    enabled: showDetails,
    refetchInterval: showDetails ? 30000 : false
  });

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return <ArrowUp className="h-4 w-4 text-green-500" />;
      case 'down':
        return <ArrowDown className="h-4 w-4 text-red-500" />;
      default:
        return <Minus className="h-4 w-4 text-gray-500" />;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatGrowthRate = (rate: number) => {
    const sign = rate >= 0 ? '+' : '';
    return `${sign}${rate.toFixed(1)}%`;
  };

  return (
    <AgentCard
      agentId={agentId}
      icon={<TrendingUp className="h-5 w-5" />}
      title="KPI Tracker"
      description="Tracks users, revenue, commissions and activity metrics"
      status={overview ? "tracking" : "loading"}
      isLoading={overviewLoading}
      actions={
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => setShowDetails(!showDetails)}
        >
          {showDetails ? "Hide Details" : "View Details"}
        </Button>
      }
    >
      {overview && (
        <div className="space-y-4">
          {/* KPI Overview Cards */}
          <div className="grid grid-cols-2 gap-3">
            <Card className="p-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-blue-500" />
                    <span className="text-sm font-medium">Users</span>
                  </div>
                  <DrillDownTrigger
                    metric="Total Users"
                    value={overview.summary.totalUsers}
                    agentId={agentId}
                    agentName="KPI Tracker"
                    size="md"
                    showIcon={false}
                  />
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    {getTrendIcon(overview.trends.userTrend)}
                    <span>{formatGrowthRate(overview.summary.userGrowthRate)}</span>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-green-500" />
                    <span className="text-sm font-medium">Revenue</span>
                  </div>
                  <DrillDownTrigger
                    metric="Total Revenue"
                    value={formatCurrency(overview.summary.totalRevenue)}
                    agentId={agentId}
                    agentName="KPI Tracker"
                    size="md"
                    showIcon={false}
                  />
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    {getTrendIcon(overview.trends.revenueTrend)}
                    <span>{formatGrowthRate(overview.summary.revenueGrowthRate)}</span>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-purple-500" />
                    <span className="text-sm font-medium">Commissions</span>
                  </div>
                  <div className="text-lg font-bold">{formatCurrency(overview.summary.totalCommissions)}</div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    {getTrendIcon(overview.trends.commissionTrend)}
                    <span>{formatGrowthRate(overview.summary.commissionGrowthRate)}</span>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <Activity className="h-4 w-4 text-orange-500" />
                    <span className="text-sm font-medium">Activity</span>
                  </div>
                  <div className="text-lg font-bold">Live</div>
                  <div className="text-xs text-muted-foreground">Real-time tracking</div>
                </div>
              </div>
            </Card>
          </div>

          {/* Detailed View */}
          {showDetails && details && !detailsLoading && (
            <div className="space-y-4">
              {/* User Status Breakdown */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">User Status</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Active</span>
                    <div className="flex items-center gap-2">
                      <Badge variant="default" className="bg-green-100 text-green-800">
                        {details.users.userStatus.active}
                      </Badge>
                      <Progress 
                        value={(details.users.userStatus.active / details.users.totalUsers) * 100} 
                        className="w-16 h-2"
                      />
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Trial</span>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                        {details.users.userStatus.trial}
                      </Badge>
                      <Progress 
                        value={(details.users.userStatus.trial / details.users.totalUsers) * 100} 
                        className="w-16 h-2"
                      />
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Inactive</span>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">
                        {details.users.userStatus.inactive}
                      </Badge>
                      <Progress 
                        value={(details.users.userStatus.inactive / details.users.totalUsers) * 100} 
                        className="w-16 h-2"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Revenue Breakdown */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Subscription Revenue</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Basic</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{formatCurrency(details.revenue.subscriptionBreakdown.basic.revenue)}</span>
                      <Badge variant="outline">{details.revenue.subscriptionBreakdown.basic.count}</Badge>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Pro</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{formatCurrency(details.revenue.subscriptionBreakdown.pro.revenue)}</span>
                      <Badge variant="outline">{details.revenue.subscriptionBreakdown.pro.count}</Badge>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Enterprise</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{formatCurrency(details.revenue.subscriptionBreakdown.enterprise.revenue)}</span>
                      <Badge variant="outline">{details.revenue.subscriptionBreakdown.enterprise.count}</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {details.activity.recentActivities.slice(0, 5).map((activity) => (
                      <div key={activity.id} className="flex items-center justify-between py-1">
                        <div className="flex items-center gap-2">
                          <Badge 
                            variant={activity.type === 'signup' ? 'default' : 
                                   activity.type === 'payment' ? 'secondary' : 
                                   activity.type === 'commission' ? 'outline' : 'destructive'}
                            className="text-xs"
                          >
                            {activity.type}
                          </Badge>
                          <span className="text-sm">{activity.description}</span>
                        </div>
                        <div className="text-right">
                          {activity.amount && (
                            <div className="text-sm font-medium">{formatCurrency(activity.amount)}</div>
                          )}
                          <div className="text-xs text-muted-foreground">
                            {new Date(activity.timestamp).toLocaleTimeString()}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      )}
    </AgentCard>
  );
}