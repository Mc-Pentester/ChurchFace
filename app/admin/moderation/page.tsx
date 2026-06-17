"use client";

import { useEffect, useState } from "react";
import { Shield, AlertTriangle, MessageSquare, Users, FileText, Clock, CheckCircle, XCircle } from "lucide-react";
import type { ModerationStats } from "@/types/moderation";

export default function ModerationPage() {
  const [stats, setStats] = useState<ModerationStats>({
    pendingReports: 0,
    reportedPosts: 0,
    reportedComments: 0,
    reportedStories: 0,
    reportedUsers: 0,
    hiddenPosts: 0,
    hiddenComments: 0,
    suspendedUsers: 0,
    bannedUsers: 0,
  });
  const [activeTab, setActiveTab] = useState("reports");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await fetch("/api/admin/moderation/stats");
      const data = await res.json();
      setStats(data);
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const tabs = [
    { id: "reports", label: "Signalements", icon: AlertTriangle, count: stats.pendingReports },
    { id: "posts", label: "Publications", icon: FileText, count: stats.reportedPosts },
    { id: "comments", label: "Commentaires", icon: MessageSquare, count: stats.reportedComments },
    { id: "stories", label: "Stories", icon: Clock, count: stats.reportedStories },
    { id: "users", label: "Utilisateurs", icon: Users, count: stats.reportedUsers },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 bg-emerald-500/10" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-emerald-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-r from-emerald-500 to-purple-500 text-white">
              <Shield size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Modération</h1>
              <p className="text-sm text-gray-500">Gérer le contenu et les utilisateurs</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard
            title="Signalements en attente"
            value={stats.pendingReports}
            icon={AlertTriangle}
            color="from-amber-500 to-orange-500"
          />
          <StatCard
            title="Posts signalés"
            value={stats.reportedPosts}
            icon={FileText}
            color="from-blue-500 to-cyan-500"
          />
          <StatCard
            title="Utilisateurs suspendus"
            value={stats.suspendedUsers}
            icon={Users}
            color="from-purple-500 to-pink-500"
          />
          <StatCard
            title="Utilisateurs bannis"
            value={stats.bannedUsers}
            icon={XCircle}
            color="from-red-500 to-rose-500"
          />
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="flex border-b overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-4 font-medium transition whitespace-nowrap ${
                  activeTab === tab.id
                    ? "text-emerald-600 border-b-2 border-emerald-500 bg-emerald-50"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                }`}
              >
                <tab.icon size={18} />
                {tab.label}
                {tab.count > 0 && (
                  <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-gradient-to-r from-emerald-500 to-purple-500 text-white">
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === "reports" && <ReportsQueue />}
            {activeTab === "posts" && <PostsModeration />}
            {activeTab === "comments" && <CommentsModeration />}
            {activeTab === "stories" && <StoriesModeration />}
            {activeTab === "users" && <UsersModeration />}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, color }: { title: string; value: number; icon: any; color: string }) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg bg-gradient-to-r ${color} text-white`}>
          <Icon size={20} />
        </div>
        <span className="text-3xl font-bold text-gray-900">{value}</span>
      </div>
      <p className="text-sm text-gray-600">{title}</p>
    </div>
  );
}

function ReportsQueue() {
  const [reports, setReports] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const res = await fetch("/api/reports");
      const data = await res.json();
      setReports(data);
    } catch (error) {
      console.error("Error fetching reports:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResolve = async (reportId: string) => {
    try {
      await fetch(`/api/reports/${reportId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "RESOLVED", action: "resolve_report" }),
      });
      fetchReports();
    } catch (error) {
      console.error("Error resolving report:", error);
    }
  };

  const handleDismiss = async (reportId: string) => {
    try {
      await fetch(`/api/reports/${reportId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "DISMISSED", action: "dismiss_report" }),
      });
      fetchReports();
    } catch (error) {
      console.error("Error dismissing report:", error);
    }
  };

  if (isLoading) {
    return <div className="text-center py-8 text-gray-500">Chargement...</div>;
  }

  if (reports.length === 0) {
    return (
      <div className="text-center py-12">
        <CheckCircle size={48} className="mx-auto text-emerald-500 mb-4" />
        <p className="text-gray-600">Aucun signalement en attente</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {reports.map((report) => (
        <div key={report.id} className="p-4 bg-gray-50 rounded-xl">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-purple-400 flex items-center justify-center text-white font-bold">
                {report.reporter?.name?.[0] || "?"}
              </div>
              <div>
                <p className="font-semibold text-gray-900">{report.reporter?.name || "Anonyme"}</p>
                <p className="text-xs text-gray-500">{new Date(report.createdAt).toLocaleDateString("fr-FR")}</p>
              </div>
            </div>
            <span className="px-3 py-1 text-xs font-medium rounded-full bg-amber-100 text-amber-700">
              {report.reason}
            </span>
          </div>
          {report.description && (
            <p className="text-sm text-gray-600 mb-3">{report.description}</p>
          )}
          <div className="flex gap-2">
            <button
              onClick={() => handleResolve(report.id)}
              className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-purple-500 text-white rounded-lg text-sm font-medium hover:shadow-lg transition"
            >
              Résoudre
            </button>
            <button
              onClick={() => handleDismiss(report.id)}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-300 transition"
            >
              Rejeter
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

function PostsModeration() {
  return <div className="text-center py-12 text-gray-500">Modération des publications - À venir</div>;
}

function CommentsModeration() {
  return <div className="text-center py-12 text-gray-500">Modération des commentaires - À venir</div>;
}

function StoriesModeration() {
  return <div className="text-center py-12 text-gray-500">Modération des stories - À venir</div>;
}

function UsersModeration() {
  return <div className="text-center py-12 text-gray-500">Modération des utilisateurs - À venir</div>;
}
