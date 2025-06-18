import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const Loader = ({ 
  size = "default", 
  text = "Loading...", 
  className = "",
  variant = "default",
  fullScreen = false,
  showProgress = false,
  progress = 0,
  estimatedTime = null
}) => {
  const sizeClasses = {
    sm: "w-4 h-4",
    default: "w-8 h-8", 
    lg: "w-12 h-12",
    xl: "w-16 h-16"
  };

  const variantClasses = {
    default: "text-gray-600",
    primary: "text-blue-600",
    secondary: "text-gray-500",
    success: "text-green-600",
    warning: "text-amber-600",
    error: "text-red-600"
  };

  const textSizes = {
    sm: "text-sm",
    default: "text-base",
    lg: "text-lg",
    xl: "text-xl"
  };

  const LoaderContent = () => (
    <div className={cn(
      "flex flex-col items-center justify-center gap-3",
      className
    )}>
      <Loader2 className={cn(
        "animate-spin",
        sizeClasses[size],
        variantClasses[variant]
      )} />
      {text && (
        <span className={cn(
          "font-medium text-center",
          textSizes[size],
          variantClasses[variant]
        )}>
          {text}
        </span>
      )}
      
      {showProgress && (
        <div className="w-full max-w-xs">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={cn(
                "h-2 rounded-full transition-all duration-300",
                variantClasses[variant].replace('text-', 'bg-')
              )}
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
          {progress > 0 && (
            <p className="text-xs text-gray-500 mt-1 text-center">
              {Math.round(progress)}% complete
            </p>
          )}
        </div>
      )}
      
      {estimatedTime && (
        <p className="text-xs text-gray-500 text-center">
          Estimated time: {estimatedTime}
        </p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center">
        <LoaderContent />
      </div>
    );
  }

  return <LoaderContent />;
};

// Inline loader for buttons and small areas
export const InlineLoader = ({ size = "sm", className = "" }) => (
  <Loader2 className={cn(
    "animate-spin",
    size === "sm" ? "w-4 h-4" : "w-6 h-6",
    "text-current",
    className
  )} />
);

// Page loader for full page loading states
export const PageLoader = ({ text = "Loading page...", className = "", showProgress, progress, estimatedTime }) => (
  <div className={cn(
    "flex items-center justify-center min-h-screen bg-gray-50",
    className
  )}>
    <Loader 
      size="lg" 
      text={text} 
      variant="primary" 
      showProgress={showProgress}
      progress={progress}
      estimatedTime={estimatedTime}
    />
  </div>
);

// Section loader for component loading states
export const SectionLoader = ({ text = "Loading...", className = "", showProgress, progress, estimatedTime }) => (
  <div className={cn(
    "flex items-center justify-center p-8",
    className
  )}>
    <Loader 
      text={text} 
      variant="default" 
      showProgress={showProgress}
      progress={progress}
      estimatedTime={estimatedTime}
    />
  </div>
);

// Table loader for data table loading states
export const TableLoader = ({ text = "Loading data...", className = "", showProgress, progress, estimatedTime }) => (
  <div className={cn(
    "flex items-center justify-center p-8 border-t",
    className
  )}>
    <Loader 
      text={text} 
      variant="secondary" 
      showProgress={showProgress}
      progress={progress}
      estimatedTime={estimatedTime}
    />
  </div>
);

// Card loader for card component loading states
export const CardLoader = ({ text = "Loading...", className = "", showProgress, progress, estimatedTime }) => (
  <div className={cn(
    "flex items-center justify-center p-6 rounded-lg border-2 border-dashed border-gray-200",
    className
  )}>
    <Loader 
      text={text} 
      variant="secondary" 
      showProgress={showProgress}
      progress={progress}
      estimatedTime={estimatedTime}
    />
  </div>
);

// Full screen loader with progress for long operations
export const FullScreenLoader = ({ 
  text = "Processing...", 
  className = "", 
  showProgress = true, 
  progress = 0, 
  estimatedTime = null 
}) => (
  <div className={cn(
    "fixed inset-0 bg-white/90 backdrop-blur-sm z-50 flex items-center justify-center",
    className
  )}>
    <Loader 
      size="xl" 
      text={text} 
      variant="primary" 
      showProgress={showProgress}
      progress={progress}
      estimatedTime={estimatedTime}
    />
  </div>
);

export default Loader; 