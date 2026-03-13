"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ChevronLeft, 
  ChevronRight, 
  Copy, 
  Check, 
  Sparkles,
  Lightbulb,
  Target,
  TrendingUp,
  X
} from "lucide-react";
import { toast } from "react-hot-toast";

interface AnalysisModalProps {
  open: boolean;
  onClose: () => void;
  content: string;
}

const categoryIcons: Record<string, React.ReactNode> = {
  skills: <Target className="w-5 h-5" />,
  experience: <TrendingUp className="w-5 h-5" />,
  format: <Lightbulb className="w-5 h-5" />,
  default: <Sparkles className="w-5 h-5" />,
};

export default function AnalysisModal({
  open,
  onClose,
  content,
}: AnalysisModalProps) {
  // Parse suggestions with categories
  const parseSuggestions = (text: string) => {
    const lines = text.split('\n').filter(line => line.trim());
    const suggestions: { category: string; title: string; content: string }[] = [];
    
    let currentSuggestion: { category: string; title: string; content: string } | null = null;
    
    for (const line of lines) {
      const trimmed = line.trim();
      // Check if line starts with number (new suggestion)
      if (/^\d+[\.\)]/.test(trimmed)) {
        if (currentSuggestion) {
          suggestions.push(currentSuggestion);
        }
        const cleanLine = trimmed.replace(/^\d+[\.\)]\s*/, '');
        // Try to extract category from title
        let category = 'default';
        const lowerLine = cleanLine.toLowerCase();
        if (lowerLine.includes('skill')) category = 'skills';
        else if (lowerLine.includes('experience') || lowerLine.includes('work')) category = 'experience';
        else if (lowerLine.includes('format') || lowerLine.includes('layout') || lowerLine.includes('structure')) category = 'format';
        
        currentSuggestion = {
          category,
          title: cleanLine,
          content: ''
        };
      } else if (currentSuggestion) {
        currentSuggestion.content += (currentSuggestion.content ? ' ' : '') + trimmed;
      }
    }
    
    if (currentSuggestion) {
      suggestions.push(currentSuggestion);
    }
    
    return suggestions.length > 0 ? suggestions : [{
      category: 'default',
      title: 'AI Analysis',
      content: text
    }];
  };

  const suggestions = parseSuggestions(content);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : prev));
  };

  const handleNext = () => {
    setCurrentIndex((prev) =>
      prev < suggestions.length - 1 ? prev + 1 : prev
    );
  };

  const handleCopy = async (index: number) => {
    try {
      const textToCopy = `${suggestions[index].title}\n\n${suggestions[index].content}`;
      await navigator.clipboard.writeText(textToCopy);
      setCopiedIndex(index);
      toast.success("Copied to clipboard!");
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch (err) {
      toast.error("Failed to copy");
    }
  };

  const handleCopyAll = async () => {
    try {
      const allText = suggestions.map((s, i) => 
        `${i + 1}. ${s.title}\n${s.content}`
      ).join('\n\n');
      await navigator.clipboard.writeText(allText);
      toast.success("All suggestions copied!");
    } catch (err) {
      toast.error("Failed to copy");
    }
  };

  const currentSuggestion = suggestions[currentIndex];
  const Icon = categoryIcons[currentSuggestion?.category || 'default'] || categoryIcons.default;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden p-0 gap-0">
        {/* Header */}
        <DialogHeader className="p-6 pb-4 border-b border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <DialogTitle className="text-xl font-semibold">AI Resume Analysis</DialogTitle>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  Powered by Groq AI • {suggestions.length} suggestions
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-zinc-500" />
            </button>
          </div>
        </DialogHeader>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              {/* Category Badge */}
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 rounded-lg flex items-center justify-center">
                  {Icon}
                </div>
                <span className="text-xs font-medium px-2 py-1 bg-zinc-100 dark:bg-zinc-800 rounded-full text-zinc-600 dark:text-zinc-400 uppercase tracking-wide">
                  {currentSuggestion?.category}
                </span>
              </div>

              {/* Title */}
              <h3 className="text-lg font-semibold text-zinc-800 dark:text-zinc-100">
                {currentSuggestion?.title}
              </h3>

              {/* Content */}
              <div className="bg-zinc-50 dark:bg-zinc-900/50 rounded-xl p-4 border border-zinc-200 dark:border-zinc-800">
                <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed whitespace-pre-wrap">
                  {currentSuggestion?.content}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <Button
                  onClick={() => handleCopy(currentIndex)}
                  variant="outline"
                  size="sm"
                  className="flex-1"
                >
                  {copiedIndex === currentIndex ? (
                    <>
                      <Check className="w-4 h-4 mr-2 text-green-600" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 mr-2" />
                      Copy Suggestion
                    </>
                  )}
                </Button>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* All Suggestions Preview */}
          <div className="mt-6 pt-6 border-t border-zinc-200 dark:border-zinc-800">
            <h4 className="text-sm font-medium text-zinc-600 dark:text-zinc-400 mb-3">
              All Suggestions
            </h4>
            <div className="space-y-2">
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`w-full text-left p-3 rounded-lg transition-all text-sm ${
                    index === currentIndex
                      ? "bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800"
                      : "bg-zinc-50 dark:bg-zinc-900/30 hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-transparent"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-medium ${
                      index === currentIndex
                        ? "bg-indigo-600 text-white"
                        : "bg-zinc-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-400"
                    }`}>
                      {index + 1}
                    </span>
                    <span className={`truncate ${
                      index === currentIndex
                        ? "text-indigo-700 dark:text-indigo-300 font-medium"
                        : "text-zinc-600 dark:text-zinc-400"
                    }`}>
                      {suggestion.title}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 pt-4 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50">
          <div className="flex items-center justify-between">
            <Button
              onClick={handlePrev}
              disabled={currentIndex === 0}
              variant="outline"
              size="sm"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Previous
            </Button>

            <div className="flex items-center gap-1">
              {suggestions.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    index === currentIndex
                      ? "w-6 bg-indigo-600"
                      : "bg-zinc-300 dark:bg-zinc-700 hover:bg-zinc-400"
                  }`}
                />
              ))}
            </div>

            <Button
              onClick={handleNext}
              disabled={currentIndex === suggestions.length - 1}
              variant="outline"
              size="sm"
            >
              Next
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>

          <div className="mt-4 flex gap-2">
            <Button
              onClick={handleCopyAll}
              variant="secondary"
              className="flex-1"
            >
              <Copy className="w-4 h-4 mr-2" />
              Copy All Suggestions
            </Button>
            <Button
              onClick={onClose}
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
            >
              Done
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
