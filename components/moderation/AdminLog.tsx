"use client";

import { useEffect, useState } from "react";
import { Shield, Clock, User as UserIcon, FileText, MessageSquare, RadioIcon, CheckCircle, XCircle } from "lucide-react";
import type { AdminLog } from "@/types/moderation";

export default function AdminLog() {
  const [logs, setLogs] = useState<AdminLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const res = await fetch("/api/admin/logs");
      const data = await res.json();
      setLogs(data);
    } catch (error) {
      console.error("Error fetching logs:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getActionLabel = (action: string): string => {
    const labels: Record<string, string> = {
      approve_post: "Post approuvé",
      hide_post: "Post masqué",
      delete_post: "Post supprimé",
      restore_post: "Post restauré",
      pin_post: "Post épinglé",
      hide_comment: "Commentaire masqué",
      delete_comment: "Commentaire supprimé",
      restore_comment: "Commentaire restauré",
      suspend_user: "Utilisateur suspendu",
      ban_user: "Utilisateur banni",
      reactivate_user: "Utilisateur réactivé",
      delete_story: "Story supprimée",
      hide_story: "Story masquée",
      resolve_report: "Signalement résolu",
      dismiss_report: "Signalement rejeté",
    };
    return labels[action] || action;
  };

  const getActionIcon = (action: string) => {
    if (action.includes("delete") || action.includes("ban")) return XCircle;
    if (action.includes("approve") || action.includes("resolve") || action.includes("reactivate")) return CheckCircle;
    return Shield;
  };

  const getTargetIcon = (targetType: string) => {
    switch (targetType) {
      case "post": return FileText;
      case "comment": return MessageSquare;
      case "user": return UserIcon;
      case "story": return RadioIcon;
      default: return Shield;
    }
  };

  if (isLoading) {
    return <div className="text-center py-8 text-gray-500">Chargement...</div>;
  }

  if (logs.length === 0) {
    return (
      <div className="text-center py-12">
        <Clock size={48} className="mx-auto text-gray-300 mb-4" />
        <p className="text-gray-500">Aucun journal d'administration</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {logs.map((log) => {
        const ActionIcon = getActionIcon(log.action);
        const TargetIcon = getTargetIcon(log.targetType || "");

        return (
          <div key={log.id} className="p-4 bg-gray-50 rounded-xl">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-gradient-to-r from-emerald-500 to-purple-500 text-white">
                <ActionIcon size={18} />
              </div>
              
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-semibold text-gray-900">
                    {log.admin?.name || "Admin"}
                  </p>
                  <span className="text-gray-400">•</span>
                  <p className="text-sm text-gray-600">
                    {getActionLabel(log.action)}
                  </p>
                </div>
                
                {log.targetType && (
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <TargetIcon size={14} />
                    <span className="capitalize">{log.targetType}</span>
                    {log.targetId && <span>• {log.targetId.slice(0, 8)}...</span>}
                  </div>
                )}
                
                <p className="text-xs text-gray-400 mt-1">
                  {new Date(log.createdAt).toLocaleString("fr-FR")}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
