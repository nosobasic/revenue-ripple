import { useState } from "react";
import { motion } from "framer-motion";
import { BarChart3, TrendingUp, MousePointer } from "lucide-react";
import { DrillDownModal } from "./DrillDownModal";

interface DrillDownTriggerProps {
  metric: string;
  value: number | string;
  agentId: number;
  agentName: string;
  label?: string;
  className?: string;
  size?: "sm" | "md" | "lg";
  showIcon?: boolean;
}

export function DrillDownTrigger({
  metric,
  value,
  agentId,
  agentName,
  label,
  className = "",
  size = "md",
  showIcon = true
}: DrillDownTriggerProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const getSizeClasses = () => {
    switch (size) {
      case "sm":
        return "text-lg font-semibold";
      case "lg":
        return "text-4xl font-bold";
      default:
        return "text-2xl font-bold";
    }
  };

  const numericValue = typeof value === "string" ? parseFloat(value.replace(/[^0-9.-]/g, "")) : value;

  return (
    <>
      <motion.div
        className={`cursor-pointer transition-all duration-200 rounded-lg p-2 hover:bg-muted/50 ${className}`}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        onClick={() => setIsModalOpen(true)}
      >
        <div className="flex items-center space-x-2">
          {label && (
            <span className="text-sm text-muted-foreground">{label}:</span>
          )}
          <span className={`${getSizeClasses()} text-primary hover:text-primary/80`}>
            {typeof value === "string" ? value : value.toLocaleString()}
          </span>
          
          <motion.div
            initial={{ opacity: 0, x: -5 }}
            animate={{ 
              opacity: isHovered ? 1 : 0,
              x: isHovered ? 0 : -5
            }}
            transition={{ duration: 0.2 }}
            className="flex items-center space-x-1"
          >
            {showIcon && <BarChart3 className="h-4 w-4 text-muted-foreground" />}
            <span className="text-xs text-muted-foreground">Click to explore</span>
          </motion.div>
        </div>
        
        {isHovered && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-1 text-xs text-muted-foreground flex items-center space-x-1"
          >
            <MousePointer className="h-3 w-3" />
            <span>Deep dive into {metric} analysis</span>
          </motion.div>
        )}
      </motion.div>

      <DrillDownModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        agentId={agentId}
        agentName={agentName}
        metric={metric}
        initialValue={numericValue}
      />
    </>
  );
}