"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { toast, Toaster } from "react-hot-toast";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { JobForm } from "@/types/job";
import AddJobModal from "./AddJobModal";
import MatchModal from "./MatchModal";
import { useSession } from "next-auth/react";
import {
  Plus,
  Search,
  Filter,
  Briefcase,
  MoreVertical,
  ExternalLink,
  Sparkles,
  Trash2,
  Edit3,
  Calendar,
  Building2,
  CheckCircle2,
  Clock,
  XCircle,
  Loader2,
  FileSearch
} from "lucide-react";

export default function JobsPage() {
  const [jobs, setJobs] = useState<JobForm[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<JobForm[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [showMatchModal, setShowMatchModal] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  const { status } = useSession();
  const isSignedIn = status === "authenticated";
  const isLoadingAuth = status === "loading";

  // Fetch jobs when user is signed in
  useEffect(() => {
    if (isSignedIn) {
      fetchJobs().finally(() => setLoading(false));
    } else if (!isLoadingAuth) {
      setLoading(false);
    }
  }, [isSignedIn, isLoadingAuth]);

  // Filter jobs based on status and search
  useEffect(() => {
    let filtered = jobs;

    if (statusFilter !== "all") {
      filtered = filtered.filter((job) => job.status === statusFilter);
    }

    if (searchTerm.trim()) {
      filtered = filtered.filter(
        (job) =>
          job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
          job.position.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredJobs(filtered);
  }, [jobs, statusFilter, searchTerm]);

  const fetchJobs = async () => {
    try {
      const res = await fetch("/api/jobs");
      const data = await res.json();
      // Map snake_case to camelCase
      const mappedJobs = Array.isArray(data) ? data.map(job => ({
        ...job,
        createdAt: job.created_at || job.createdAt || new Date().toISOString(),
      })) : [];
      setJobs(mappedJobs);
    } catch (error) {
      console.error("Failed to fetch jobs:", error);
    }
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "applied":
        return { 
          bg: "bg-blue-100 dark:bg-blue-900/30", 
          text: "text-blue-700 dark:text-blue-300",
          border: "border-blue-200 dark:border-blue-800",
          icon: CheckCircle2,
          color: "blue"
        };
      case "interviewing":
        return { 
          bg: "bg-amber-100 dark:bg-amber-900/30", 
          text: "text-amber-700 dark:text-amber-300",
          border: "border-amber-200 dark:border-amber-800",
          icon: Clock,
          color: "amber"
        };
      case "rejected":
        return { 
          bg: "bg-red-100 dark:bg-red-900/30", 
          text: "text-red-700 dark:text-red-300",
          border: "border-red-200 dark:border-red-800",
          icon: XCircle,
          color: "red"
        };
      case "offer":
        return { 
          bg: "bg-green-100 dark:bg-green-900/30", 
          text: "text-green-700 dark:text-green-300",
          border: "border-green-200 dark:border-green-800",
          icon: CheckCircle2,
          color: "green"
        };
      default:
        return { 
          bg: "bg-gray-100 dark:bg-gray-800", 
          text: "text-gray-700 dark:text-gray-300",
          border: "border-gray-200 dark:border-gray-700",
          icon: Briefcase,
          color: "gray"
        };
    }
  };

  const handleDeleteJob = async (jobId: string) => {
    if (!confirm("Are you sure you want to delete this job application?")) return;
    
    try {
      const res = await fetch(`/api/jobs?id=${jobId}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Job deleted successfully");
        fetchJobs();
      } else {
        toast.error("Failed to delete job");
      }
    } catch (error) {
      toast.error("Something went wrong");
    }
  };

  const handleMatchClick = (jobId: string) => {
    setSelectedJobId(jobId);
    setShowMatchModal(true);
  };

  if (loading || isLoadingAuth) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-zinc-50 via-blue-50/30 to-indigo-50/30 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-900 p-6">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Header Skeleton */}
          <div className="space-y-2">
            <div className="h-10 w-64 bg-zinc-200 dark:bg-zinc-800 rounded-lg animate-pulse" />
            <div className="h-5 w-96 bg-zinc-200 dark:bg-zinc-800 rounded-lg animate-pulse" />
          </div>
          
          {/* Quick Actions Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-zinc-200 dark:bg-zinc-800 rounded-xl animate-pulse" />
            ))}
          </div>
          
          {/* Stats Skeleton */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 bg-zinc-200 dark:bg-zinc-800 rounded-xl animate-pulse" />
            ))}
          </div>
          
          {/* Filter Skeleton */}
          <div className="flex gap-4">
            <div className="flex-1 h-10 bg-zinc-200 dark:bg-zinc-800 rounded-lg animate-pulse" />
            <div className="w-48 h-10 bg-zinc-200 dark:bg-zinc-800 rounded-lg animate-pulse" />
          </div>
          
          {/* Job Cards Skeleton */}
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-zinc-200 dark:bg-zinc-800 rounded-xl animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-zinc-50 via-blue-50/30 to-indigo-50/30 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-900 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-md"
        >
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-blue-500/25">
            <Briefcase className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100 mb-3">
            Access Required
          </h2>
          <p className="text-zinc-600 dark:text-zinc-400 mb-6">
            Sign in to track your job applications and get AI-powered resume matching.
          </p>
          <Link href="/login">
            <Button className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg shadow-lg shadow-blue-500/25">
              Sign In to Continue
            </Button>
          </Link>
        </motion.div>
      </div>
    );
  }

  const stats = {
    total: jobs.length,
    applied: jobs.filter(j => j.status === "applied").length,
    interviewing: jobs.filter(j => j.status === "interviewing").length,
    rejected: jobs.filter(j => j.status === "rejected").length,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-50 via-blue-50/30 to-indigo-50/30 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-900">
      <Toaster position="top-right" />
      <div className="p-6 max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
        >
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Job Applications
            </h1>
            <p className="text-zinc-600 dark:text-zinc-400 mt-1">
              Track and manage your job search journey
            </p>
          </div>
          <Button
            onClick={() => setShowModal(true)}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg shadow-blue-500/25"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Job
          </Button>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          {[
            { label: "Total", value: stats.total, icon: Briefcase, color: "blue" },
            { label: "Applied", value: stats.applied, icon: CheckCircle2, color: "emerald" },
            { label: "Interviewing", value: stats.interviewing, icon: Clock, color: "amber" },
            { label: "Rejected", value: stats.rejected, icon: XCircle, color: "red" },
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-zinc-600 dark:text-zinc-400">{stat.label}</p>
                      <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{stat.value}</p>
                    </div>
                    <div className={`w-10 h-10 rounded-lg bg-${stat.color}-100 dark:bg-${stat.color}-900/30 flex items-center justify-center`}>
                      <stat.icon className={`w-5 h-5 text-${stat.color}-600 dark:text-${stat.color}-400`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-col md:flex-row gap-4"
        >
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <Input
              placeholder="Search by company or position..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select
            onValueChange={(val) => setStatusFilter(val)}
            defaultValue="all"
          >
            <SelectTrigger className="w-full md:w-48">
              <Filter className="w-4 h-4 mr-2 text-zinc-400" />
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="applied">Applied</SelectItem>
              <SelectItem value="interviewing">Interviewing</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
              <SelectItem value="offer">Offer</SelectItem>
            </SelectContent>
          </Select>
        </motion.div>

        {/* Job List */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="space-y-4"
        >
          <AnimatePresence mode="popLayout">
            {filteredJobs.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="text-center py-16"
              >
                <div className="w-24 h-24 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileSearch className="w-12 h-12 text-zinc-400" />
                </div>
                <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
                  No jobs found
                </h3>
                <p className="text-zinc-600 dark:text-zinc-400 max-w-md mx-auto mb-6">
                  {searchTerm || statusFilter !== "all"
                    ? "Try adjusting your filters to see more results."
                    : "Start tracking your job applications by adding your first job!"}
                </p>
                {!searchTerm && statusFilter === "all" && (
                  <Button
                    onClick={() => setShowModal(true)}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Your First Job
                  </Button>
                )}
              </motion.div>
            ) : (
              filteredJobs.map((job, idx) => {
                const statusConfig = getStatusConfig(job.status);
                const StatusIcon = statusConfig.icon;
                return (
                  <motion.div
                    key={job.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: idx * 0.05 }}
                  >
                    <Card className="group border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 hover:shadow-lg transition-all duration-300">
                      <CardContent className="p-5">
                        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 flex-wrap">
                              <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                                {job.position}
                              </h2>
                              <span className="text-zinc-400">@</span>
                              <span className="text-lg font-medium text-zinc-700 dark:text-zinc-300">
                                {job.company}
                              </span>
                            </div>
                            <div className="flex items-center gap-4 mt-2 text-sm text-zinc-500 dark:text-zinc-400">
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3.5 h-3.5" />
                                {job.createdAt && !isNaN(new Date(job.createdAt).getTime())
                                  ? new Date(job.createdAt).toLocaleDateString()
                                  : "Recently added"}
                              </span>
                            </div>
                            <p className="mt-3 text-zinc-600 dark:text-zinc-400 line-clamp-2">
                              {job.description}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge 
                              className={`${statusConfig.bg} ${statusConfig.text} ${statusConfig.border} border font-medium flex items-center gap-1.5 px-2.5 py-1`}
                            >
                              <StatusIcon className="w-3.5 h-3.5" />
                              {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                            </Badge>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                  <MoreVertical className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleMatchClick(job.id)}>
                                  <Sparkles className="w-4 h-4 mr-2 text-purple-500" />
                                  Match Resume
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleDeleteJob(job.id)} className="text-red-600 focus:text-red-600">
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                        <div className="mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleMatchClick(job.id)}
                            className="text-purple-600 border-purple-200 hover:bg-purple-50 dark:border-purple-800 dark:hover:bg-purple-900/30"
                          >
                            <Sparkles className="w-4 h-4 mr-2" />
                            Match with Resume
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })
            )}
          </AnimatePresence>
        </motion.div>

        {/* Add Job Modal */}
        {showModal && (
          <AddJobModal
            onClose={() => setShowModal(false)}
            onJobAdded={fetchJobs}
            open={showModal}
          />
        )}

        {/* Match Modal */}
        {showMatchModal && selectedJobId && (
          <MatchModal
            open={showMatchModal}
            onClose={() => setShowMatchModal(false)}
            jobId={selectedJobId}
          />
        )}
      </div>
    </div>
  );
}
