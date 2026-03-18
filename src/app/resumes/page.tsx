"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import AnalysisModal from "@/components/AnalysisModal/AnalysisModal";
import Link from "next/link";
import { 
  FileText, 
  Download, 
  RefreshCw, 
  Trash2, 
  Sparkles, 
  Upload,
  FileUp,
  Clock,
  MoreVertical,
  Search,
  X
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast, Toaster } from "react-hot-toast";

interface Resume {
  id: string;
  createdAt: string;
  url: string;
  name?: string;
}

export default function ResumeManagerPage() {
  const { data: session, status } = useSession();
  const isSignedIn = status === "authenticated";
  const isLoadingAuth = status === "loading";
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [uploading, setUploading] = useState<boolean>(false);
  const [analyzingId, setAnalyzingId] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isDragOver, setIsDragOver] = useState<boolean>(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState<string>("");

  useEffect(() => {
    if (isSignedIn) {
      fetchResumes();
    } else if (!isLoadingAuth) {
      setLoading(false);
    }
  }, [isSignedIn, isLoadingAuth]);

  const fetchResumes = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/resume");
      if (res.status === 401) {
        toast.error("Please sign in to view your resumes.");
        setResumes([]);
      } else {
        const data: { resumes: Resume[] } = await res.json();
        if (data.resumes) {
          // Add default names and map dates if not present
          const resumesWithNames = data.resumes.map((r: any, index: number) => ({
            ...r,
            name: r.name || `Resume ${index + 1}`,
            createdAt: r.createdAt || r.created_at || new Date().toISOString(),
          }));
          setResumes(resumesWithNames);
        }
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to fetch resumes.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (file: File) => {
    if (file.type !== "application/pdf") {
      toast.error("Please upload a PDF file");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be less than 5MB");
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/resume/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (data.url) {
        toast.success("Resume uploaded successfully!");
        fetchResumes();
      } else {
        toast.error(data.error || "Upload failed");
      }
    } catch (err: any) {
      toast.error(err.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const onFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const fileInput = form.querySelector('input[type="file"]') as HTMLInputElement;
    const file = fileInput.files?.[0];
    if (file) {
      await handleUpload(file);
      form.reset();
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      await handleUpload(file);
    }
  };

  const handleDelete = async (resumeId: string) => {
    const resume = resumes.find(r => r.id === resumeId);
    
    toast.custom((t) => (
      <div className="bg-white dark:bg-zinc-900 p-4 rounded-lg shadow-lg border border-zinc-200 dark:border-zinc-700">
        <p className="text-sm font-medium mb-3">Delete &quot;{resume?.name}&quot;?</p>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="destructive"
            onClick={async () => {
              toast.dismiss(t.id);
              try {
                const res = await fetch("/api/resume/delete", {
                  method: "POST",
                  body: JSON.stringify({ resumeId }),
                  headers: { "Content-Type": "application/json" },
                });
                const data = await res.json();
                if (data.success) {
                  setResumes(resumes.filter((r) => r.id !== resumeId));
                  toast.success("Resume deleted");
                } else {
                  toast.error(data.error || "Failed to delete");
                }
              } catch (err: any) {
                toast.error(err.message || "Failed to delete");
              }
            }}
          >
            Delete
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => toast.dismiss(t.id)}
          >
            Cancel
          </Button>
        </div>
      </div>
    ), { duration: Infinity });
  };

  const handleUpdate = async (resumeId: string) => {
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = "application/pdf";
    fileInput.onchange = async () => {
      if (!fileInput.files || fileInput.files.length === 0) return;
      const file = fileInput.files[0];
      
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size must be less than 5MB");
        return;
      }

      const formData = new FormData();
      formData.append("file", file);
      formData.append("resumeId", resumeId);

      try {
        const res = await fetch("/api/resume/update", {
          method: "POST",
          body: formData,
        });
        const data = await res.json();

        if (data.url) {
          toast.success("Resume updated successfully!");
          fetchResumes();
        } else {
          toast.error(data.error || "Update failed");
        }
      } catch (err: any) {
        toast.error(err.message || "Update failed");
      }
    };
    fileInput.click();
  };

  const handleAnalyze = async (resumeId: string) => {
    setAnalyzingId(resumeId);
    setAnalysisResult(null);
    try {
      const res = await fetch("/api/resume/analyze", {
        method: "POST",
        body: JSON.stringify({ resumeId }),
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      if (data.analysis) {
        setAnalysisResult(data.analysis);
        setModalOpen(true);
        toast.success("Analysis complete!");
      } else {
        toast.error(data.error || "Analysis failed");
      }
    } catch (err: any) {
      toast.error(err.message || "Analysis failed");
    } finally {
      setAnalyzingId(null);
    }
  };

  const handleRename = (resumeId: string, newName: string) => {
    setResumes(resumes.map(r => 
      r.id === resumeId ? { ...r, name: newName } : r
    ));
    setEditingId(null);
    toast.success("Resume renamed");
  };

  const filteredResumes = resumes.filter(r => 
    r.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading || isLoadingAuth) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-zinc-50 to-zinc-100 dark:from-zinc-900 dark:to-zinc-800 p-6">
        <div className="max-w-5xl mx-auto space-y-8">
          {/* Header Skeleton */}
          <div className="flex justify-between items-start">
            <div className="space-y-2">
              <div className="h-10 w-48 bg-zinc-200 dark:bg-zinc-800 rounded-lg animate-pulse" />
              <div className="h-5 w-72 bg-zinc-200 dark:bg-zinc-800 rounded-lg animate-pulse" />
            </div>
            <div className="h-10 w-32 bg-zinc-200 dark:bg-zinc-800 rounded-lg animate-pulse" />
          </div>
          
          {/* Upload Zone Skeleton */}
          <div className="h-48 bg-zinc-200 dark:bg-zinc-800 rounded-2xl animate-pulse" />
          
          {/* Search Skeleton */}
          <div className="h-12 bg-zinc-200 dark:bg-zinc-800 rounded-xl animate-pulse" />
          
          {/* Resume Cards Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-zinc-200 dark:bg-zinc-800 rounded-xl animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Wait for auth check to complete
  if (isLoadingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-zinc-50 to-zinc-100 dark:from-zinc-900 dark:to-zinc-800">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-green-200 dark:border-green-800 rounded-full" />
          <div className="absolute w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-zinc-600 dark:text-zinc-400">Loading...</span>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isSignedIn) {
    if (typeof window !== 'undefined') {
      window.location.href = '/login?callbackUrl=/resumes';
    }
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-50 to-zinc-100 dark:from-zinc-900 dark:to-zinc-800 p-6">
      <Toaster position="top-right" />
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
        >
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-zinc-800 to-zinc-600 dark:from-zinc-100 dark:to-zinc-300 bg-clip-text text-transparent">
              Your Resumes
            </h1>
            <p className="text-zinc-500 dark:text-zinc-400 mt-1">
              {resumes.length} {resumes.length === 1 ? "resume" : "resumes"} uploaded
            </p>
          </div>
          {resumes.length > 0 && (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <Input
                type="text"
                placeholder="Search resumes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-full md:w-64"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                >
                  <X className="w-4 h-4 text-zinc-400 hover:text-zinc-600" />
                </button>
              )}
            </div>
          )}
        </motion.div>

        {/* Upload Zone */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className={`border-2 border-dashed transition-all duration-300 ${
            isDragOver 
              ? "border-green-500 bg-green-50 dark:bg-green-900/20" 
              : "border-zinc-300 dark:border-zinc-700 hover:border-zinc-400 dark:hover:border-zinc-600"
          }`}>
            <CardContent className="p-8">
              <form onSubmit={onFormSubmit}>
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className="text-center"
                >
                  <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <FileUp className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-zinc-800 dark:text-zinc-100 mb-2">
                    Upload Your Resume
                  </h3>
                  <p className="text-zinc-500 dark:text-zinc-400 mb-4">
                    Drag and drop your PDF here, or click to browse
                  </p>
                  <p className="text-xs text-zinc-400 mb-4">
                    Maximum file size: 5MB • PDF only
                  </p>
                  <Input
                    type="file"
                    name="file"
                    accept="application/pdf"
                    className="hidden"
                    id="file-upload"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleUpload(file);
                    }}
                  />
                  <label htmlFor="file-upload">
                    <Button
                      type="button"
                      disabled={uploading}
                      className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg"
                      onClick={() => document.getElementById("file-upload")?.click()}
                    >
                      {uploading ? (
                        <>
                          <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload className="w-4 h-4 mr-2" />
                          Choose File
                        </>
                      )}
                    </Button>
                  </label>
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.div>

        {/* Resume List */}
        {filteredResumes.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <div className="w-24 h-24 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-12 h-12 text-zinc-400" />
            </div>
            <h3 className="text-xl font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
              {searchQuery ? "No resumes found" : "No resumes yet"}
            </h3>
            <p className="text-zinc-500 dark:text-zinc-400 max-w-md mx-auto">
              {searchQuery 
                ? "Try adjusting your search query" 
                : "Upload your first resume to get started with AI-powered analysis and job matching"}
            </p>
          </motion.div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence mode="popLayout">
              {filteredResumes.map((resume, index) => (
                <motion.div
                  key={resume.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="group hover:shadow-lg transition-all duration-300 border-zinc-200 dark:border-zinc-800">
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row md:items-center gap-4">
                        {/* File Icon & Info */}
                        <div className="flex items-center gap-4 flex-1 min-w-0">
                          <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-rose-600 rounded-xl flex items-center justify-center shadow-md flex-shrink-0">
                            <FileText className="w-6 h-6 text-white" />
                          </div>
                          <div className="min-w-0 flex-1">
                            {editingId === resume.id ? (
                              <div className="flex items-center gap-2">
                                <Input
                                  value={editName}
                                  onChange={(e) => setEditName(e.target.value)}
                                  className="h-8 w-48"
                                  autoFocus
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                      handleRename(resume.id, editName);
                                    } else if (e.key === "Escape") {
                                      setEditingId(null);
                                    }
                                  }}
                                />
                                <Button
                                  size="sm"
                                  className="h-8 px-2"
                                  onClick={() => handleRename(resume.id, editName)}
                                >
                                  Save
                                </Button>
                              </div>
                            ) : (
                              <h3 
                                className="font-semibold text-zinc-800 dark:text-zinc-100 truncate cursor-pointer hover:text-green-600 transition-colors"
                                onClick={() => {
                                  setEditingId(resume.id);
                                  setEditName(resume.name || "Resume");
                                }}
                                title="Click to rename"
                              >
                                {resume.name}
                              </h3>
                            )}
                            <div className="flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
                              <Clock className="w-3 h-3" />
                              <span>
                                {resume.createdAt && !isNaN(new Date(resume.createdAt).getTime())
                                  ? new Date(resume.createdAt).toLocaleDateString()
                                  : "Recently uploaded"}
                              </span>
                              <span>•</span>
                              <span>PDF</span>
                            </div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            asChild
                          >
                            <a
                              href={resume.url}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <Download className="w-4 h-4 mr-1" />
                              Download
                            </a>
                          </Button>

                          <Button
                            size="sm"
                            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white"
                            onClick={() => handleAnalyze(resume.id)}
                            disabled={analyzingId === resume.id}
                          >
                            {analyzingId === resume.id ? (
                              <RefreshCw className="w-4 h-4 mr-1 animate-spin" />
                            ) : (
                              <Sparkles className="w-4 h-4 mr-1" />
                            )}
                            {analyzingId === resume.id ? "Analyzing..." : "AI Analyze"}
                          </Button>

                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button size="sm" variant="ghost">
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => {
                                setEditingId(resume.id);
                                setEditName(resume.name || "Resume");
                              }}>
                                <RefreshCw className="w-4 h-4 mr-2" />
                                Rename
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleUpdate(resume.id)}>
                                <Upload className="w-4 h-4 mr-2" />
                                Replace
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => handleDelete(resume.id)}
                                className="text-red-600 focus:text-red-600"
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {analysisResult && (
          <AnalysisModal
            open={modalOpen}
            onClose={() => setModalOpen(false)}
            content={analysisResult}
          />
        )}
      </div>
    </div>
  );
}
