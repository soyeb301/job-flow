"use client";

import { useState } from "react";
import { toast } from "react-hot-toast";
import { JobForm } from "@/types/job";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Briefcase, Building2, FileText, Loader2 } from "lucide-react";

export interface JobInput {
  company: string;
  position: string;
  status: "applied" | "interviewing" | "rejected";
  description: string;
}

export default function AddJobModal({
  open,
  onClose,
  onJobAdded,
}: {
  open: boolean;
  onClose: () => void;
  onJobAdded: () => void;
}) {
  const [formData, setFormData] = useState<JobInput>({
    position: "",
    company: "",
    status: "applied",
    description: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (key: keyof JobForm, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        toast.success("Job application added successfully!");
        onJobAdded();
        onClose();
        setFormData({ position: "", company: "", status: "applied", description: "" });
      } else {
        toast.error("Failed to add job application");
      }
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg bg-white dark:bg-zinc-900">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <Briefcase className="w-4 h-4 text-white" />
            </div>
            Add New Job Application
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-2">
            <Label htmlFor="position" className="flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-zinc-400" />
              Position
            </Label>
            <Input
              id="position"
              placeholder="e.g. Senior Frontend Developer"
              value={formData.position}
              onChange={(e) => handleChange("position", e.target.value)}
              required
              className="focus-visible:ring-blue-500"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="company" className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-zinc-400" />
              Company Name
            </Label>
            <Input
              id="company"
              placeholder="e.g. Google"
              value={formData.company}
              onChange={(e) => handleChange("company", e.target.value)}
              required
              className="focus-visible:ring-blue-500"
            />
          </div>
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full border-2 border-zinc-400" />
              Status
            </Label>
            <Select
              value={formData.status}
              onValueChange={(value) => handleChange("status", value)}
            >
              <SelectTrigger className="focus:ring-blue-500">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="applied">
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-500" />
                    Applied
                  </span>
                </SelectItem>
                <SelectItem value="interviewing">
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-amber-500" />
                    Interviewing
                  </span>
                </SelectItem>
                <SelectItem value="rejected">
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-red-500" />
                    Rejected
                  </span>
                </SelectItem>
                <SelectItem value="offer">
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-500" />
                    Offer
                  </span>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="description" className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-zinc-400" />
              Job Description
            </Label>
            <Textarea
              id="description"
              placeholder="Paste the job description here for better AI matching..."
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
              required
              className="h-32 resize-none overflow-auto focus-visible:ring-blue-500"
            />
          </div>
          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Adding...
                </>
              ) : (
                "Add Job"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
