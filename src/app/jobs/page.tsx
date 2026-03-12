"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { JobForm } from "@/types/job";
import AddJobModal from "./AddJobModal";
import MatchModal from "./MatchModal";
import { useSession } from "next-auth/react";

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

  // Fetch jobs when user is signed in
  useEffect(() => {
    if (isSignedIn) {
      fetchJobs().finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [isSignedIn]);

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
      setJobs(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to fetch jobs:", error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "applied":
        return "bg-green-600";
      case "interviewing":
        return "bg-amber-500";
      case "rejected":
        return "bg-red-600";
      default:
        return "bg-gray-400";
    }
  };

  const handleMatchClick = (jobId: string) => {
    setSelectedJobId(jobId);
    setShowMatchModal(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-green-600"></div>
        <span className="ml-4 text-lg text-zinc-700 dark:text-zinc-300">
          Loading...
        </span>
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="flex flex-col items-center justify-center h-screen text-center px-4">
        <h2 className="text-2xl font-semibold text-zinc-800 dark:text-zinc-100 mb-2">
          Access Denied
        </h2>
        <p className="text-zinc-600 dark:text-zinc-400">
          You must be logged in to view this page.
        </p>
        <Link href="/login">
          <Button className="mt-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition">
            Login
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <h1 className="text-3xl font-bold text-zinc-800 dark:text-zinc-100">
          Submitted Job Applications
        </h1>
        <Button
          onClick={() => setShowModal(true)}
          className="bg-green-600 hover:bg-green-700 text-white"
        >
          Add Job
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <Input
          placeholder="Search by company or position..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full md:w-1/2"
        />
        <Select
          onValueChange={(val) => setStatusFilter(val)}
          defaultValue="all"
        >
          <SelectTrigger className="w-full md:w-48">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="applied">Applied</SelectItem>
            <SelectItem value="interviewing">Interviewing</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Job List */}
      <div className="space-y-4">
        {filteredJobs.length === 0 ? (
          <div className="text-center py-12 text-zinc-600 dark:text-zinc-300 border rounded-lg">
            <p className="text-lg font-medium">No job applications found.</p>
            <p className="mt-2">
              Try adjusting your filters or click &quot;Add Job&quot; to submit
              your first application!
            </p>
          </div>
        ) : (
          filteredJobs.map((job, idx) => (
            <div
              key={idx}
              className="border border-zinc-300 dark:border-zinc-700 p-5 rounded-xl shadow-sm transition hover:shadow-md bg-white dark:bg-zinc-900"
            >
              <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-2">
                <h2 className="text-lg md:text-xl font-semibold text-zinc-900 dark:text-zinc-100">
                  {job.position} @ {job.company}
                </h2>
                <Badge className={`${getStatusColor(job.status)} text-white`}>
                  {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                </Badge>
              </div>
              <p className="mt-3 text-zinc-700 dark:text-zinc-300">
                {job.description}
              </p>
              <div className="mt-4 flex justify-end">
                <Button
                  onClick={() => handleMatchClick(job.id)}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Match Resume
                </Button>
              </div>
            </div>
          ))
        )}
      </div>

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
  );
}
