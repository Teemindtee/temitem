import { Badge } from "@/components/ui/badge";

interface SeverityBadgeProps {
  level: number;
  showIcon?: boolean;
  showName?: boolean;
  variant?: 'default' | 'compact' | 'detailed';
  className?: string;
}

export function SeverityBadge({ 
  level, 
  showIcon = true, 
  showName = true, 
  variant = 'default',
  className = "" 
}: SeverityBadgeProps) {
  
  const getSeverityConfig = (level: number) => {
    switch (level) {
      case 1:
        return {
          color: "bg-yellow-100 text-yellow-800 border-yellow-200",
          icon: "⚠️",
          name: "Minor Warning",
          description: "First-time or minor policy violations"
        };
      case 2:
        return {
          color: "bg-orange-100 text-orange-800 border-orange-200",
          icon: "🔶",
          name: "Serious Violation",
          description: "Repeated violations or moderate policy breaches"
        };
      case 3:
        return {
          color: "bg-red-100 text-red-800 border-red-200",
          icon: "🔴",
          name: "Major Offense",
          description: "Serious misconduct that threatens platform integrity"
        };
      case 4:
        return {
          color: "bg-gray-900 text-white border-gray-800",
          icon: "⚫",
          name: "Critical Violation",
          description: "Severe violations requiring immediate action"
        };
      default:
        return {
          color: "bg-gray-100 text-gray-800 border-gray-200",
          icon: "❓",
          name: "Unknown",
          description: "Severity level not determined"
        };
    }
  };

  const config = getSeverityConfig(level);

  if (variant === 'compact') {
    return (
      <Badge className={`${config.color} ${className}`}>
        {showIcon && <span className="mr-1">{config.icon}</span>}
        Level {level}
      </Badge>
    );
  }

  if (variant === 'detailed') {
    return (
      <div className={`flex items-center gap-2 p-2 rounded-lg ${config.color} ${className}`}>
        {showIcon && <span className="text-lg">{config.icon}</span>}
        <div className="flex flex-col">
          <Badge className={`mb-1 ${config.color} border-0`}>
            Level {level}
          </Badge>
          {showName && (
            <span className="text-sm font-medium">{config.name}</span>
          )}
          <span className="text-xs opacity-80">{config.description}</span>
        </div>
      </div>
    );
  }

  return (
    <Badge className={`${config.color} ${className}`}>
      {showIcon && <span className="mr-1">{config.icon}</span>}
      {showName ? config.name : `Level ${level}`}
    </Badge>
  );
}

export function SeverityIndicator({ level, className = "" }: { level: number; className?: string }) {
  const config = getSeverityConfig(level);
  
  return (
    <div className={`inline-flex items-center gap-1 ${className}`}>
      <span>{config.icon}</span>
      <span className="text-sm font-medium">{config.name}</span>
    </div>
  );
}

// Helper function to get severity configuration (can be used elsewhere)
export function getSeverityConfig(level: number) {
  switch (level) {
    case 1:
      return {
        color: "bg-yellow-100 text-yellow-800 border-yellow-200",
        icon: "⚠️",
        name: "Minor Warning",
        description: "First-time or minor policy violations requiring attention"
      };
    case 2:
      return {
        color: "bg-orange-100 text-orange-800 border-orange-200",
        icon: "🔶",
        name: "Serious Violation",
        description: "Repeated violations or moderate policy breaches"
      };
    case 3:
      return {
        color: "bg-red-100 text-red-800 border-red-200",
        icon: "🔴",
        name: "Major Offense",
        description: "Serious misconduct that threatens platform integrity"
      };
    case 4:
      return {
        color: "bg-gray-900 text-white border-gray-800",
        icon: "⚫",
        name: "Critical Violation",
        description: "Severe violations requiring immediate action"
      };
    default:
      return {
        color: "bg-gray-100 text-gray-800 border-gray-200",
        icon: "❓",
        name: "Unknown",
        description: "Severity level not determined"
      };
  }
}