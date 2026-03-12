"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
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
} from "lucide-react";

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
  const [jobs, setJobs] = useState<Job[]>([]);
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isSignedIn) fetchDashboardData();
  }, [isSignedIn]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const jobsRes = await fetch("/api/jobs"); // Ensure this API returns jobs for the current user
      const jobsData = await jobsRes.json();

      const resumesRes = await fetch("/api/resume"); // Ensure this API returns resumes for current user
      const resumesData = await resumesRes.json();

      setJobs(Array.isArray(jobsData) ? jobsData : []);
      setResumes(Array.isArray(resumesData.resumes) ? resumesData.resumes : []);
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
    const allItems = [
      ...jobs.map((job) => ({
        ...job,
        type: "job",
        date: new Date(job.createdAt),
      })),
      ...resumes.map((resume) => ({
        ...resume,
        type: "resume",
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

    for (let i = 6; i >= 0; i--) {
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - i * 7);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);

      const weekJobs = jobs.filter((job) => {
        const jobDate = new Date(job.createdAt);
        return jobDate >= weekStart && jobDate <= weekEnd;
      }).length;

      weeks.push({
        week: `Week ${7 - i}`,
        applications: weekJobs,
      });
    }

    return weeks;
  };

  if (!isSignedIn) {
    return (
      <div className="flex flex-col items-center justify-center h-screen text-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md"
        >
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <Briefcase className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Welcome to JOB FLOW
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            Sign in to access your personalized job tracking dashboard with
            AI-powered insights.
          </p>
          <Link href="/login">
            <Button className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-lg">
              Sign In to Continue
            </Button>
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="p-6 max-w-7xl mx-auto space-y-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            JOB FLOW Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            Track your applications, analyze trends, and accelerate your career
            journey
          </p>
        </motion.div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{
                duration: 1,
                repeat: Number.POSITIVE_INFINITY,
                ease: "linear",
              }}
              className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full"
            />
          </div>
        ) : (
          <div className="space-y-8">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  title: "Total Applications",
                  value: jobs.length,
                  icon: Briefcase,
                  color: "from-blue-500 to-blue-600",
                  change:
                    jobs.length > 0
                      ? `${jobs.length} total`
                      : "No applications yet",
                },
                {
                  title: "Active Resumes",
                  value: resumes.length,
                  icon: FileText,
                  color: "from-green-500 to-green-600",
                  change:
                    resumes.length > 0
                      ? `${resumes.length} uploaded`
                      : "No resumes yet",
                },
                {
                  title: "Interview Rate",
                  value:
                    jobs.length > 0
                      ? `${Math.round(
                          (jobs.filter((j) => j.status === "interviewing")
                            .length /
                            jobs.length) *
                            100
                        )}%`
                      : "0%",
                  icon: Users,
                  color: "from-purple-500 to-purple-600",
                  change: `${
                    jobs.filter((j) => j.status === "interviewing").length
                  }/${jobs.length}`,
                },
                {
                  title: "Success Rate",
                  value:
                    jobs.length > 0
                      ? `${Math.round(
                          (jobs.filter((j) =>
                            ["offer", "hired", "interviewing"].includes(
                              j.status
                            )
                          ).length /
                            jobs.length) *
                            100
                        )}%`
                      : "0%",
                  icon: Target,
                  color: "from-orange-500 to-orange-600",
                  change:
                    jobs.length > 0 ? "Interviews + Offers" : "No data yet",
                },
              ].map((stat, index) => (
                <motion.div
                  key={stat.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="relative overflow-hidden border-0 shadow-lg bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                            {stat.title}
                          </p>
                          <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                            {stat.value}
                          </p>
                          <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                            {stat.change}
                          </p>
                        </div>
                        <div
                          className={`w-12 h-12 rounded-lg bg-gradient-to-r ${stat.color} flex items-center justify-center`}
                        >
                          <stat.icon className="w-6 h-6 text-white" />
                        </div>
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
                                    ? `Applied to ${
                                        (item as Job).position
                                      } at ${(item as Job).company}`
                                    : `Uploaded new resume`}
                                </p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  {item.date.toLocaleDateString()}
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
