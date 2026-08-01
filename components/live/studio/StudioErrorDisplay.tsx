"use client";

import { useState, useEffect } from "react";
import { errorHandler, StudioError, ErrorSeverity } from "@/lib/livekit/ErrorHandler";
import { X, AlertTriangle, Info, AlertCircle, XCircle } from "lucide-react";

export default function StudioErrorDisplay() {
  const [errors, setErrors] = useState<StudioError[]>([]);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  useEffect(() => {
    const unsubscribe = errorHandler.subscribe((error) => {
      setErrors(prev => [...prev, error]);
    });

    // Load initial errors
    setErrors(errorHandler.getUnresolvedErrors());

    return unsubscribe;
  }, []);

  const handleDismiss = (errorId: string) => {
    setDismissed(prev => new Set(prev).add(errorId));
    errorHandler.resolveError(errorId);
  };

  const getSeverityIcon = (severity: ErrorSeverity) => {
    switch (severity) {
      case "critical":
        return <XCircle size={16} className="text-red-500" />;
      case "error":
        return <AlertCircle size={16} className="text-red-500" />;
      case "warning":
        return <AlertTriangle size={16} className="text-yellow-500" />;
      case "info":
        return <Info size={16} className="text-blue-500" />;
    }
  };

  const getSeverityColor = (severity: ErrorSeverity) => {
    switch (severity) {
      case "critical":
      case "error":
        return "border-red-500/50 bg-red-500/10";
      case "warning":
        return "border-yellow-500/50 bg-yellow-500/10";
      case "info":
        return "border-blue-500/50 bg-blue-500/10";
    }
  };

  const visibleErrors = errors.filter(e => !dismissed.has(e.id));

  if (visibleErrors.length === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2 max-w-md">
      {visibleErrors.map(error => (
        <div
          key={error.id}
          className={`p-4 rounded-lg border ${getSeverityColor(error.severity)} backdrop-blur-sm`}
        >
          <div className="flex items-start gap-3">
            <div className="mt-0.5">
              {getSeverityIcon(error.severity)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-medium">
                {error.message}
              </p>
              {error.details && (
                <p className="text-gray-400 text-xs mt-1">
                  {error.details}
                </p>
              )}
              {error.action && (
                <p className="text-gray-300 text-xs mt-2 italic">
                  💡 {error.action}
                </p>
              )}
            </div>
            <button
              onClick={() => handleDismiss(error.id)}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
