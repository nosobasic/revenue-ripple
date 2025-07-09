import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { ScrollArea } from "./ui/scroll-area";
import { mockNotifications } from "../constants/data/mockNotifications";
import {
  Bell,
  AlertTriangle,
  TrendingDown,
  TrendingUp,
  X,
  Eye,
  EyeOff,
} from "lucide-react";

export function NotificationSystem({ className }) {
  const [notifications, setNotifications] = useState([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showOnlyUnread, setShowOnlyUnread] = useState(false);

  const { data: criticalAlerts } = useQuery({
    queryKey: ["/api/notifications/critical"],
    refetchInterval: 5000,
  });

  const { data: systemAlerts } = useQuery({
    queryKey: ["/api/notifications/system"],
    refetchInterval: 10000,
  });

  useEffect(() => {
    setNotifications(mockNotifications);
  }, []);

  const unreadCount = notifications.filter((n) => !n.acknowledged).length;
  const criticalCount = notifications.filter(
    (n) => n.type === "critical" && !n.acknowledged
  ).length;
  const filteredNotifications = showOnlyUnread
    ? notifications.filter((n) => !n.acknowledged)
    : notifications;

  const getNotificationIcon = (type) => {
    switch (type) {
      case "critical":
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case "warning":
        return <TrendingDown className="h-4 w-4 text-yellow-500" />;
      case "success":
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      default:
        return <Bell className="h-4 w-4 text-blue-500" />;
    }
  };

  const getNotificationBadgeVariant = (type) => {
    switch (type) {
      case "critical":
        return "destructive";
      case "warning":
        return "secondary";
      case "success":
        return "default";
      default:
        return "outline";
    }
  };

  const acknowledgeNotification = (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, acknowledged: true } : n))
    );
  };

  const formatTimeAgo = (date) => {
    const diffMins = Math.floor((Date.now() - date.getTime()) / (1000 * 60));
    if (diffMins < 1) return "just now";
    if (diffMins < 60) return `${diffMins}m ago`;

    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;

    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  return (
    <div className={`relative ${className}`}>
      {/* Notification Bell */}
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="relative"
      >
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="relative"
        >
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-2 -right-2 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center"
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </motion.div>
          )}
        </Button>
      </motion.div>

      {/* Critical Alert Banner */}
      <AnimatePresence>
        {criticalCount > 0 && !isExpanded && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-12 right-0 z-50"
          >
            <Card className="w-80 border-red-200 bg-red-50 dark:bg-red-950">
              <CardContent className="p-3">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="h-4 w-4 text-red-500 animate-pulse" />
                  <span className="text-sm font-medium text-red-700 dark:text-red-300">
                    {criticalCount} critical alert{criticalCount > 1 ? "s" : ""}{" "}
                    need attention
                  </span>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setIsExpanded(true)}
                    className="ml-auto text-red-600 hover:text-red-700"
                  >
                    View
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Notification Panel */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            className="absolute top-12 right-0 z-50"
          >
            <Card className="w-96 max-h-96">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center">
                    <Bell className="h-5 w-5 mr-2" />
                    Notifications
                  </CardTitle>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowOnlyUnread(!showOnlyUnread)}
                    >
                      {showOnlyUnread ? (
                        <Eye className="h-4 w-4" />
                      ) : (
                        <EyeOff className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsExpanded(false)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                {unreadCount > 0 && (
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <span>
                      {unreadCount} unread notification
                      {unreadCount > 1 ? "s" : ""}
                    </span>
                    {showOnlyUnread && (
                      <Badge variant="secondary" className="text-xs">
                        Unread only
                      </Badge>
                    )}
                  </div>
                )}
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-80">
                  <div className="space-y-2 p-4">
                    {filteredNotifications.map((notification) => (
                      <motion.div
                        key={notification.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className={`p-3 border rounded-lg space-y-2 ${
                          !notification.acknowledged
                            ? "bg-muted/50"
                            : "opacity-75"
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-2 flex-1">
                            {getNotificationIcon(notification.type)}
                            <div className="flex-1">
                              <div className="flex items-center space-x-2">
                                <span className="font-medium text-sm">
                                  {notification.title}
                                </span>
                                <Badge
                                  variant={getNotificationBadgeVariant(
                                    notification.type
                                  )}
                                  className="text-xs"
                                >
                                  {notification.type}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground mt-1">
                                {notification.message}
                              </p>
                              <div className="flex items-center justify-between mt-2">
                                <span className="text-xs text-muted-foreground">
                                  {notification.agentName} •{" "}
                                  {formatTimeAgo(notification.timestamp)}
                                </span>
                                {!notification.acknowledged && (
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() =>
                                      acknowledgeNotification(notification.id)
                                    }
                                    className="text-xs h-6"
                                  >
                                    Acknowledge
                                  </Button>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}

                    {filteredNotifications.length === 0 && (
                      <div className="text-center py-8 text-muted-foreground">
                        <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p>No notifications to show</p>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
