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
  X,
  Wand2,
  Award,
  Zap,
  FileCheck,
  Quote
} from "lucide-react";
import { toast } from "react-hot-toast";

interface AnalysisModalProps {
  open: boolean;
  onClose: () => void;
  content: string;
}

interface Suggestion {
  category: string;
  title: string;
  content: string;
  impact: 'high' | 'medium' | 'low';
}

const categoryConfig: Record<string, { icon: React.ReactNode; color: string; bgColor: string; label: string }> = {
  skills: { 
    icon: <Target className="w-5 h-5" />, 
    color: "text-blue-600 dark:text-blue-400",
    bgColor: "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800",
    label: "Skills Enhancement"
  },
  experience: { 
    icon: <TrendingUp className="w-5 h-5" />, 
    color: "text-emerald-600 dark:text-emerald-400",
    bgColor: "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800",
    label: "Experience Impact"
  },
  format: { 
    icon: <FileCheck className="w-5 h-5" />, 
    color: "text-purple-600 dark:text-purple-400",
    bgColor: "bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800",
    label: "Format & Structure"
  },
  keywords: { 
    icon: <Zap className="w-5 h-5" />, 
    color: "text-amber-600 dark:text-amber-400",
    bgColor: "bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800",
    label: "Keywords & ATS"
  },
  default: { 
    icon: <Sparkles className="w-5 h-5" />, 
    color: "text-indigo-600 dark:text-indigo-400",
    bgColor: "bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800",
    label: "AI Insight"
  },
};

const impactConfig = {
  high: { color: "bg-red-500", label: "High Impact", icon: <Award className="w-3 h-3" /> },
  medium: { color: "bg-amber-500", label: "Medium Impact", icon: <Zap className="w-3 h-3" /> },
  low: { color: "bg-green-500", label: "Quick Win", icon: <Check className="w-3 h-3" /> },
};

export default function AnalysisModal({
  open,
  onClose,
  content,
}: AnalysisModalProps) {
  // Enhanced parser that extracts structured suggestions
  const parseSuggestions = (text: string): Suggestion[] => {
    const lines = text.split('\n').filter(line => line.trim());
    const suggestions: Suggestion[] = [];
    
    let current: Partial<Suggestion> = {};
    
    for (const line of lines) {
      const trimmed = line.trim();
      
      // Check for numbered items (new suggestion)
      if (/^\d+[\.\)]/.test(trimmed)) {
        if (current.title) {
          suggestions.push(current as Suggestion);
        }
        
        const cleanLine = trimmed.replace(/^\d+[\.\)]\s*/, '');
        let category = 'default';
        let impact: 'high' | 'medium' | 'low' = 'medium';
        
        const lowerLine = cleanLine.toLowerCase();
        
        // Detect category
        if (lowerLine.includes('skill') || lowerLine.includes('technical') || lowerLine.includes('competency')) {
          category = 'skills';
        } else if (lowerLine.includes('experience') || lowerLine.includes('work') || lowerLine.includes('project') || lowerLine.includes('achievement')) {
          category = 'experience';
        } else if (lowerLine.includes('format') || lowerLine.includes('layout') || lowerLine.includes('structure') || lowerLine.includes('design')) {
          category = 'format';
        } else if (lowerLine.includes('keyword') || lowerLine.includes('ats') || lowerLine.includes('search')) {
          category = 'keywords';
        }
        
        // Detect impact based on keywords
        if (lowerLine.includes('critical') || lowerLine.includes('essential') || lowerLine.includes('must') || lowerLine.includes('important')) {
          impact = 'high';
        } else if (lowerLine.includes('minor') || lowerLine.includes('small') || lowerLine.includes('quick')) {
          impact = 'low';
        }
        
        current = {
          category,
          title: cleanLine,
          content: '',
          impact
        };
      } else if (current.title) {
        current.content += (current.content ? ' ' : '') + trimmed;
      }
    }
    
    if (current.title) {
      suggestions.push(current as Suggestion);
    }
    
    // If no structured suggestions found, create one from entire text
    if (suggestions.length === 0) {
      return [{
        category: 'default',
        title: 'Resume Analysis',
        content: text,
        impact: 'medium'
      }];
    }
    
    return suggestions;
  };

  const suggestions = parseSuggestions(content);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'suggestion' | 'all'>('suggestion');

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
  const config = categoryConfig[currentSuggestion?.category || 'default'];
  const impact = impactConfig[currentSuggestion?.impact || 'medium'];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[95vh] overflow-hidden p-0 gap-0 bg-gradient-to-b from-white to-zinc-50 dark:from-zinc-900 dark:to-zinc-950">
        {/* Header */}
        <DialogHeader className="p-6 pb-4 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/25">
                  <Wand2 className="w-7 h-7 text-white" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center border-2 border-white dark:border-zinc-900">
                  <Sparkles className="w-3 h-3 text-white" />
                </div>
              </div>
              <div>
                <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  AI Resume Analysis
                </DialogTitle>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                  Powered by Groq AI • {suggestions.length} personalized insights
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-colors"
            >
              <X className="w-5 h-5 text-zinc-500" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mt-4">
            <button
              onClick={() => setActiveTab('suggestion')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'suggestion'
                  ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300'
                  : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
              }`}
            >
              Current Suggestion
            </button>
            <button
              onClick={() => setActiveTab('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'all'
                  ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300'
                  : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
              }`}
            >
              All Suggestions ({suggestions.length})
            </button>
          </div>
        </DialogHeader>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {activeTab === 'suggestion' ? (
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-5"
              >
                {/* Category & Impact Badge */}
                <div className="flex items-center gap-3 flex-wrap">
                  <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${config.bgColor}`}>
                    <span className={config.color}>{config.icon}</span>
                    <span className={`text-sm font-medium ${config.color}`}>{config.label}</span>
                  </div>
                  
                  <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full ${impact.color} bg-opacity-10`}>
                    <span className="text-white">{impact.icon}</span>
                    <span className="text-sm font-medium text-white">{impact.label}</span>
                  </div>
                </div>

                {/* Title */}
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-white font-bold text-sm">{currentIndex + 1}</span>
                  </div>
                  <h3 className="text-xl font-semibold text-zinc-800 dark:text-zinc-100 leading-tight">
                    {currentSuggestion?.title}
                  </h3>
                </div>

                {/* Content Card */}
                <div className="relative">
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-indigo-500 to-purple-600 rounded-full" />
                  <div className="ml-6 bg-white dark:bg-zinc-900 rounded-xl p-5 border border-zinc-200 dark:border-zinc-800 shadow-sm">
                    <div className="flex items-start gap-3">
                      <Quote className="w-5 h-5 text-indigo-400 flex-shrink-0 mt-0.5" />
                      <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed text-base">
                        {currentSuggestion?.content}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <Button
                    onClick={() => handleCopy(currentIndex)}
                    variant="outline"
                    className="flex-1 h-11 border-zinc-300 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800"
                  >
                    {copiedIndex === currentIndex ? (
                      <>
                        <Check className="w-4 h-4 mr-2 text-green-600" />
                        <span className="text-green-600">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4 mr-2" />
                        Copy This Tip
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={handleCopyAll}
                    variant="secondary"
                    className="flex-1 h-11"
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Copy All Tips
                  </Button>
                </div>
              </motion.div>
            </AnimatePresence>
          ) : (
            /* All Suggestions View */
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-3"
            >
              {suggestions.map((suggestion, index) => {
                const sConfig = categoryConfig[suggestion.category];
                const sImpact = impactConfig[suggestion.impact];
                return (
                  <motion.button
                    key={index}
                    onClick={() => {
                      setCurrentIndex(index);
                      setActiveTab('suggestion');
                    }}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`w-full text-left p-4 rounded-xl transition-all border ${
                      index === currentIndex
                        ? 'bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 border-indigo-300 dark:border-indigo-700 shadow-md'
                        : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 hover:shadow-sm'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                        index === currentIndex
                          ? 'bg-indigo-600 text-white'
                          : 'bg-zinc-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-400'
                      }`}>
                        {index + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={sConfig.color}>{sConfig.icon}</span>
                          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${sImpact.color} bg-opacity-10 text-white`}>
                            {sImpact.label}
                          </span>
                        </div>
                        <p className={`font-medium truncate ${
                          index === currentIndex
                            ? 'text-indigo-900 dark:text-indigo-100'
                            : 'text-zinc-700 dark:text-zinc-300'
                        }`}>
                          {suggestion.title}
                        </p>
                      </div>
                      <ChevronRight className={`w-5 h-5 flex-shrink-0 ${
                        index === currentIndex ? 'text-indigo-600' : 'text-zinc-400'
                      }`} />
                    </div>
                  </motion.button>
                );
              })}
            </motion.div>
          )}
        </div>

        {/* Footer */}
        {activeTab === 'suggestion' && (
          <div className="p-6 pt-4 border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
            <div className="flex items-center justify-between">
              <Button
                onClick={handlePrev}
                disabled={currentIndex === 0}
                variant="outline"
                className="h-11 px-6"
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                Previous
              </Button>

              <div className="flex items-center gap-2">
                {suggestions.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentIndex(index)}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      index === currentIndex
                        ? 'w-8 bg-gradient-to-r from-indigo-600 to-purple-600'
                        : 'w-2 bg-zinc-300 dark:bg-zinc-700 hover:bg-zinc-400'
                    }`}
                  />
                ))}
              </div>

              <Button
                onClick={handleNext}
                disabled={currentIndex === suggestions.length - 1}
                variant="outline"
                className="h-11 px-6"
              >
                Next
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </div>

            <div className="mt-4 flex gap-3">
              <Button
                onClick={handleCopyAll}
                variant="outline"
                className="flex-1 h-11 border-zinc-300 dark:border-zinc-700"
              >
                <Copy className="w-4 h-4 mr-2" />
                Copy All Suggestions
              </Button>
              <Button
                onClick={onClose}
                className="flex-1 h-11 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg shadow-indigo-500/25"
              >
                <Check className="w-4 h-4 mr-2" />
                Done
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
