"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import {
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";
import {
  Briefcase,
  FileText,
  TrendingUp,
  Users,
  Calendar,
  Target,
  Plus,
  Sparkles,
  ArrowRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  Zap,
  BarChart3,
  ChevronRight
} from "lucide-react";
import { toast, Toaster } from "react-hot-toast";

interface Job {
  id: string;
  position: string;
  company: string;
  status: string;
  createdAt: string;
}

interface Resume {
  id: string;
  createdAt: string;
}

export default function DashboardPage() {
  const { status } = useSession();
  const isSignedIn = status === "authenticated";
  const isLoadingAuth = status === "loading";
  const [jobs, setJobs] = useState<Job[]>([]);
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isSignedIn) {
      fetchDashboardData();
    } else if (!isLoadingAuth) {
      setLoading(false);
    }
  }, [isSignedIn, isLoadingAuth]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const jobsRes = await fetch("/api/jobs");
      const jobsData = await jobsRes.json();

      const resumesRes = await fetch("/api/resume");
      const resumesData = await resumesRes.json();

      // Map snake_case to camelCase for jobs
      const mappedJobs = Array.isArray(jobsData) ? jobsData.map(job => ({
        ...job,
        createdAt: job.created_at || job.createdAt || new Date().toISOString(),
      })) : [];

      // Map snake_case to camelCase for resumes
      const mappedResumes = Array.isArray(resumesData.resumes) ? resumesData.resumes.map((resume: any) => ({
        ...resume,
        createdAt: resume.created_at || resume.createdAt || new Date().toISOString(),
      })) : [];

      setJobs(mappedJobs);
      setResumes(mappedResumes);
    } catch (err: any) {
      setMessage(err.message || "Failed to load dashboard data.");
    } finally {
      setLoading(false);
    }
  };

  const getJobStatusData = () => {
    const statusCounts = jobs.reduce((acc, job) => {
      acc[job.status] = (acc[job.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(statusCounts).map(([status, count]) => ({
      name: status.charAt(0).toUpperCase() + status.slice(1),
      value: count,
      color: getStatusColor(status),
    }));
  };

  const getStatusColor = (status: string) => {
    const colors = {
      applied: "#3b82f6",
      interviewing: "#f59e0b",
      rejected: "#ef4444",
      offer: "#10b981",
      hired: "#059669",
      pending: "#8b5cf6",
    };
    return colors[status as keyof typeof colors] || "#6b7280";
  };

  const getRecentActivity = () => {
    type ActivityItem = 
      | (Job & { type: "job"; date: Date })
      | (Resume & { type: "resume"; date: Date });
    
    const allItems: ActivityItem[] = [
      ...jobs.map((job) => ({
        ...job,
        type: "job" as const,
        date: new Date(job.createdAt),
      })),
      ...resumes.map((resume) => ({
        ...resume,
        type: "resume" as const,
        date: new Date(resume.createdAt),
      })),
    ];

    return allItems
      .sort((a, b) => b.date.getTime() - a.date.getTime())
      .slice(0, 5);
  };

  const getWeeklyStats = () => {
    const weeks = [];
    const now = new Date();
    
    // Get the start of current week (Sunday)
    const currentWeekStart = new Date(now);
    currentWeekStart.setDate(now.getDate() - now.getDay());
    currentWeekStart.setHours(0, 0, 0, 0);

    for (let i = 6; i >= 0; i--) {
      // Calculate week start (Sunday)
      const weekStart = new Date(currentWeekStart);
      weekStart.setDate(currentWeekStart.getDate() - i * 7);
      
      // Calculate week end (Saturday)
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      weekEnd.setHours(23, 59, 59, 999);

      const weekJobs = jobs.filter((job) => {
        const jobDate = new Date(job.createdAt);
        return jobDate >= weekStart && jobDate <= weekEnd;
      }).length;

      // Format week label
      const weekLabel = i === 0 
        ? "This Week" 
        : i === 1 
        ? "Last Week" 
        : `${weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;

      weeks.push({
        week: weekLabel,
        applications: weekJobs,
      });
    }

    return weeks;
  };

  // Wait for auth check to complete
  if (isLoadingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-zinc-50 via-blue-50/30 to-indigo-50/30 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-900">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-200 dark:border-blue-800 rounded-full" />
          <div className="absolute w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-zinc-600 dark:text-zinc-400">Loading...</span>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isSignedIn) {
    if (typeof window !== 'undefined') {
      window.location.href = '/login?callbackUrl=/dashboard';
    }
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-50 via-blue-50/30 to-indigo-50/30 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-900">
      <Toaster position="top-right" />
      <div className="p-6 max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
        >
          <div>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Dashboard
            </h1>
            <p className="text-zinc-600 dark:text-zinc-400 mt-1">
              Track your applications, analyze trends, and accelerate your career
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-zinc-500 dark:text-zinc-400">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </span>
          </div>
        </motion.div>

        {loading || isLoadingAuth ? (
          <div className="space-y-8">
            {/* Quick Actions Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-24 bg-zinc-200 dark:bg-zinc-800 rounded-xl animate-pulse" />
              ))}
            </div>
            
            {/* Stats Skeleton */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-28 bg-zinc-200 dark:bg-zinc-800 rounded-xl animate-pulse" />
              ))}
            </div>
            
            {/* Charts Skeleton */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="h-80 bg-zinc-200 dark:bg-zinc-800 rounded-xl animate-pulse" />
              <div className="h-80 bg-zinc-200 dark:bg-zinc-800 rounded-xl animate-pulse" />
            </div>
            
            {/* Recent Activity Skeleton */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="h-96 bg-zinc-200 dark:bg-zinc-800 rounded-xl animate-pulse" />
              <div className="h-96 bg-zinc-200 dark:bg-zinc-800 rounded-xl animate-pulse" />
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-4"
            >
              <Link href="/jobs">
                <Card className="group cursor-pointer border-0 shadow-lg bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/25 hover:-translate-y-1">
                  <CardContent className="p-6 flex items-center gap-4">
                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                      <Plus className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-white">Add Job Application</h3>
                      <p className="text-blue-100 text-sm">Track a new job opportunity</p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-white/60 group-hover:text-white group-hover:translate-x-1 transition-all" />
                  </CardContent>
                </Card>
              </Link>

              <Link href="/resumes">
                <Card className="group cursor-pointer border-0 shadow-lg bg-gradient-to-br from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 transition-all duration-300 hover:shadow-xl hover:shadow-green-500/25 hover:-translate-y-1">
                  <CardContent className="p-6 flex items-center gap-4">
                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                      <FileText className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-white">Upload Resume</h3>
                      <p className="text-green-100 text-sm">Add or update your resume</p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-white/60 group-hover:text-white group-hover:translate-x-1 transition-all" />
                  </CardContent>
                </Card>
              </Link>

              <Link href="/resumes">
                <Card className="group cursor-pointer border-0 shadow-lg bg-gradient-to-br from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/25 hover:-translate-y-1">
                  <CardContent className="p-6 flex items-center gap-4">
                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                      <Sparkles className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-white">AI Resume Analysis</h3>
                      <p className="text-purple-100 text-sm">Get AI-powered feedback</p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-white/60 group-hover:text-white group-hover:translate-x-1 transition-all" />
                  </CardContent>
                </Card>
              </Link>
            </motion.div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                {
                  title: "Applications",
                  value: jobs.length,
                  icon: Briefcase,
                  color: "bg-blue-500",
                  trend: jobs.length > 0 ? "+" + jobs.length : "Start applying",
                  trendUp: true,
                },
                {
                  title: "Resumes",
                  value: resumes.length,
                  icon: FileText,
                  color: "bg-green-500",
                  trend: resumes.length > 0 ? `${resumes.length} active` : "Upload now",
                  trendUp: resumes.length > 0,
                },
                {
                  title: "Interviews",
                  value: jobs.filter(j => j.status === "interviewing").length,
                  icon: Users,
                  color: "bg-purple-500",
                  trend: jobs.length > 0 ? `${Math.round((jobs.filter(j => j.status === "interviewing").length / jobs.length) * 100)}% rate` : "No data",
                  trendUp: jobs.filter(j => j.status === "interviewing").length > 0,
                },
                {
                  title: "Success Rate",
                  value: jobs.length > 0 ? `${Math.round((jobs.filter(j => ["offer", "hired"].includes(j.status)).length / jobs.length) * 100)}%` : "0%",
                  icon: Target,
                  color: "bg-orange-500",
                  trend: "Offers + Hired",
                  trendUp: jobs.filter(j => ["offer", "hired"].includes(j.status)).length > 0,
                },
              ].map((stat, index) => (
                <motion.div
                  key={stat.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors">
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                            {stat.title}
                          </p>
                          <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mt-1">
                            {stat.value}
                          </p>
                        </div>
                        <div className={`w-10 h-10 rounded-lg ${stat.color} flex items-center justify-center`}>
                          <stat.icon className="w-5 h-5 text-white" />
                        </div>
                      </div>
                      <div className="flex items-center gap-1 mt-3">
                        {stat.trendUp ? (
                          <TrendingUp className="w-3 h-3 text-green-500" />
                        ) : (
                          <AlertCircle className="w-3 h-3 text-zinc-400" />
                        )}
                        <span className={`text-xs ${stat.trendUp ? 'text-green-600 dark:text-green-400' : 'text-zinc-500 dark:text-zinc-400'}`}>
                          {stat.trend}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Job Status Pie Chart */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-blue-500" />
                      Application Status Distribution
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {jobs.length > 0 ? (
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={getJobStatusData()}
                            cx="50%"
                            cy="50%"
                            outerRadius={100}
                            dataKey="value"
                            label={({ name, percent }) =>
                              `${name} ${(percent * 100).toFixed(0)}%`
                            }
                          >
                            {getJobStatusData().map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-[300px] flex items-center justify-center text-gray-500">
                        No application data available
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>

              {/* Weekly Trend Line Chart */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-green-500" />
                      Weekly Application Trend
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={getWeeklyStats()}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="week" />
                        <YAxis />
                        <Tooltip />
                        <Line
                          type="monotone"
                          dataKey="applications"
                          stroke="#3b82f6"
                          strokeWidth={3}
                          dot={{ fill: "#3b82f6", strokeWidth: 2, r: 6 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Recent Applications & Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Recent Applications */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Briefcase className="w-5 h-5 text-blue-500" />
                      Recent Applications ({jobs.length})
                    </CardTitle>
                    <Button
                      size="sm"
                      className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg"
                      onClick={() => (window.location.href = "/jobs")}
                    >
                      Add Application
                    </Button>
                  </CardHeader>
                  <CardContent>
                    {jobs.length === 0 ? (
                      <div className="text-center py-8">
                        <Briefcase className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500">
                          No applications yet. Start tracking your job search!
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3 max-h-80 overflow-y-auto">
                        {jobs.slice(0, 5).map((job, index) => (
                          <motion.div
                            key={job.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="p-4 rounded-lg bg-gray-50 dark:bg-slate-700/50 border border-gray-200 dark:border-slate-600"
                          >
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                                  {job.position}
                                </h4>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  {job.company}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                                  {new Date(job.createdAt).toLocaleDateString()}
                                </p>
                              </div>
                              <span
                                className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  job.status === "interviewing"
                                    ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                                    : job.status === "rejected"
                                    ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                                    : job.status === "offer" ||
                                      job.status === "hired"
                                    ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                    : "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                                }`}
                              >
                                {job.status.charAt(0).toUpperCase() +
                                  job.status.slice(1)}
                              </span>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>

              {/* Recent Activity */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-purple-500" />
                      Recent Activity
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {getRecentActivity().length === 0 ? (
                      <div className="text-center py-8">
                        <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500">
                          No recent activity. Start by adding jobs or uploading
                          resumes!
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3 max-h-80 overflow-y-auto">
                        {getRecentActivity().map((item, index) => (
                          <motion.div
                            key={`${item.type}-${item.id}`}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="p-4 rounded-lg bg-gray-50 dark:bg-slate-700/50 border border-gray-200 dark:border-slate-600"
                          >
                            <div className="flex items-center gap-3">
                              <div
                                className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                                  item.type === "job"
                                    ? "bg-gradient-to-r from-blue-500 to-blue-600"
                                    : "bg-gradient-to-r from-green-500 to-green-600"
                                }`}
                              >
                                {item.type === "job" ? (
                                  <Briefcase className="w-5 h-5 text-white" />
                                ) : (
                                  <FileText className="w-5 h-5 text-white" />
                                )}
                              </div>
                              <div>
                                <p className="font-medium text-gray-900 dark:text-gray-100">
                                  {item.type === "job"
                                    ? `Applied to ${item.position} at ${item.company}`
                                    : `Uploaded new resume`}
                                </p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  {!isNaN(item.date.getTime()) 
                                    ? item.date.toLocaleDateString() 
                                    : "Recently"}
                                </p>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Resume Library */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
                <CardHeader className="flex justify-between items-center">
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-green-500" />
                    Resume Library ({resumes.length})
                  </CardTitle>
                  <Button
                    size="sm"
                    className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg"
                    onClick={() => (window.location.href = "/resumes")}
                  >
                    Add Resume
                  </Button>
                </CardHeader>
                <CardContent>
                  {resumes.length === 0 ? (
                    <div className="text-center py-8">
                      <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">
                        No resumes uploaded yet. Add your resumes to track
                        applications.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-80 overflow-y-auto">
                      {resumes.slice(0, 5).map((resume, index) => (
                        <motion.div
                          key={resume.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="p-4 rounded-lg bg-gray-50 dark:bg-slate-700/50 border border-gray-200 dark:border-slate-600 flex justify-between items-center"
                        >
                          <p className="text-gray-900 dark:text-gray-100">
                            Resume uploaded on{" "}
                            {new Date(resume.createdAt).toLocaleDateString()}
                          </p>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              alert("Download functionality not implemented")
                            }
                          >
                            Download
                          </Button>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>
        )}

        {message && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <p className="text-red-500 bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border border-red-200 dark:border-red-800">
              {message}
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
