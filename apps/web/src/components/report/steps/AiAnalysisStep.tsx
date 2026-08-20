"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Brain,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  RefreshCw,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card, CardContent } from "@/components/ui/Card";

export interface AiAnalysisResult {
  category: string;
  subcategory: string;
  confidence: number;
  severity: "low" | "medium" | "high" | "critical";
  evidence: string[];
  generatedTitle: string;
  generatedDescription: string;
}

interface AiAnalysisStepProps {
  images: File[];
  aiAnalysis: AiAnalysisResult | null;
  onAnalysisComplete: (result: AiAnalysisResult) => void;
  onAccept: () => void;
  onReject: () => void;
}

const severityConfig: Record<
  string,
  { label: string; color: string; variant: "success" | "warning" | "danger" | "info" }
> = {
  low: { label: "Low", color: "bg-emerald-500", variant: "success" },
  medium: { label: "Medium", color: "bg-amber-500", variant: "warning" },
  high: { label: "High", color: "bg-orange-500", variant: "warning" },
  critical: { label: "Critical", color: "bg-red-500", variant: "danger" },
};

const confidenceColor = (confidence: number): string => {
  if (confidence >= 80) return "bg-emerald-500";
  if (confidence >= 60) return "bg-amber-500";
  return "bg-red-500";
};

const categoryIcons: Record<string, string> = {
  "Waste Management": "trash-2",
  Roads: "construction",
  Traffic: "traffic-cone",
  Water: "droplets",
  Sewerage: "waves",
  "Street Lighting": "lightbulb",
  "Public Infrastructure": "building",
  Environment: "trees",
  Other: "more-horizontal",
};

// Mock AI analysis - in production this calls /api/complaints/analyze
async function mockAnalyze(_images: File[]): Promise<AiAnalysisResult> {
  await new Promise((resolve) => setTimeout(resolve, 2500));

  const analyses: AiAnalysisResult[] = [
    {
      category: "Waste Management",
      subcategory: "Garbage Not Collected",
      confidence: 87,
      severity: "medium",
      evidence: [
        "Visible accumulation of household waste",
        "Multiple garbage bags detected on roadside",
        "No waste collection bin visible in the area",
      ],
      generatedTitle: "Uncollected Garbage Pile on Roadside",
      generatedDescription:
        "There is an accumulation of uncollected household waste on the roadside. Multiple garbage bags and loose waste are visible, creating an unsanitary condition. The area appears to have missed recent garbage collection cycles. This poses health risks and is causing a foul odor in the neighborhood.",
    },
    {
      category: "Roads",
      subcategory: "Potholes",
      confidence: 92,
      severity: "high",
      evidence: [
        "Large pothole detected on road surface",
        "Visible road damage with exposed gravel",
        "Water accumulation indicating depth of damage",
      ],
      generatedTitle: "Large Pothole on Main Road",
      generatedDescription:
        "A significant pothole has formed on the road surface, approximately 2-3 feet in diameter. The damage is deep enough to accumulate water and poses a serious risk to vehicles and pedestrians. The surrounding asphalt shows signs of further deterioration that may worsen without immediate repair.",
    },
    {
      category: "Street Lighting",
      subcategory: "Non-functional Light",
      confidence: 78,
      severity: "medium",
      evidence: [
        "Street light pole identified in image",
        "Light fixture appears damaged or non-functional",
        "Area around the light appears dark",
      ],
      generatedTitle: "Non-functional Street Light",
      generatedDescription:
        "A street light at the reported location is not functioning, leaving the area poorly illuminated during evening and nighttime hours. This creates safety concerns for pedestrians and motorists. The light fixture may need repair or bulb replacement.",
    },
  ];

  return analyses[Math.floor(Math.random() * analyses.length)];
}

export function AiAnalysisStep({
  images,
  aiAnalysis,
  onAnalysisComplete,
  onAccept,
  onReject,
}: AiAnalysisStepProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(!aiAnalysis);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (aiAnalysis || !isAnalyzing) return;

    let cancelled = false;

    async function analyze() {
      try {
        const result = await mockAnalyze(images);
        if (!cancelled) {
          onAnalysisComplete(result);
          setIsAnalyzing(false);
        }
      } catch {
        if (!cancelled) {
          setFailed(true);
          setIsAnalyzing(false);
        }
      }
    }

    analyze();
    return () => {
      cancelled = true;
    };
  }, [images, aiAnalysis, isAnalyzing, onAnalysisComplete]);

  const handleRetry = () => {
    setFailed(false);
    setIsAnalyzing(true);
  };

  // Loading state
  if (isAnalyzing) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col items-center gap-6 py-12"
      >
        <div className="relative">
          <div className="h-20 w-20 rounded-full bg-blue-100 flex items-center justify-center">
            <Brain className="h-10 w-10 text-blue-600" />
          </div>
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-blue-400"
            animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-blue-300"
            animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0, 0.3] }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.5,
            }}
          />
        </div>

        <div className="text-center space-y-2">
          <p className="text-lg font-semibold text-gray-900">
            Analyzing your report...
          </p>
          <p className="text-sm text-gray-500 max-w-sm">
            Our AI is examining the uploaded photos to identify the type of
            problem, severity, and recommended category.
          </p>
        </div>

        <div className="flex gap-1.5">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="h-2 w-2 rounded-full bg-blue-500"
              animate={{ y: [0, -8, 0] }}
              transition={{
                duration: 0.8,
                repeat: Infinity,
                delay: i * 0.15,
              }}
            />
          ))}
        </div>
      </motion.div>
    );
  }

  // Failed state
  if (failed) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col items-center gap-6 py-12"
      >
        <div className="h-16 w-16 rounded-full bg-amber-100 flex items-center justify-center">
          <AlertCircle className="h-8 w-8 text-amber-600" />
        </div>
        <div className="text-center space-y-2">
          <p className="text-lg font-semibold text-gray-900">
            Analysis Unavailable
          </p>
          <p className="text-sm text-gray-500 max-w-sm">
            We couldn&apos;t analyze the image automatically. Please select a
            category manually.
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={handleRetry}>
            <RefreshCw className="h-4 w-4" />
            Try Again
          </Button>
          <Button variant="primary" onClick={onReject}>
            Select Category
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </motion.div>
    );
  }

  // Result state
  if (!aiAnalysis) return null;

  const severityInfo = severityConfig[aiAnalysis.severity];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div className="text-center space-y-2">
        <h2 className="text-xl font-semibold text-gray-900">
          AI Analysis Complete
        </h2>
        <p className="text-sm text-gray-500">
          Review the detected problem details below.
        </p>
      </div>

      <Card className="overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20">
              <Brain className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-blue-100">
                Detected Problem
              </p>
              <p className="text-lg font-bold text-white">
                {aiAnalysis.category}
              </p>
            </div>
          </div>
        </div>

        <CardContent className="p-6 space-y-5">
          {/* Category & Subcategory */}
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="info">{aiAnalysis.category}</Badge>
            <Badge variant="default">{aiAnalysis.subcategory}</Badge>
          </div>

          {/* Confidence */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-gray-700">Confidence</span>
              <span className="font-semibold text-gray-900">
                {aiAnalysis.confidence}%
              </span>
            </div>
            <div className="h-2.5 w-full rounded-full bg-gray-100 overflow-hidden">
              <motion.div
                className={cn(
                  "h-full rounded-full",
                  confidenceColor(aiAnalysis.confidence)
                )}
                initial={{ width: 0 }}
                animate={{ width: `${aiAnalysis.confidence}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              />
            </div>
          </div>

          {/* Severity */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Severity</span>
            <Badge variant={severityInfo.variant}>
              <span
                className={cn("h-2 w-2 rounded-full", severityInfo.color)}
              />
              {severityInfo.label}
            </Badge>
          </div>

          {/* Evidence */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700">
              Evidence Detected
            </p>
            <ul className="space-y-1.5">
              {aiAnalysis.evidence.map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Confirmation */}
      <div className="rounded-xl border border-gray-200 bg-gray-50 p-5 space-y-4">
        <p className="text-sm font-medium text-gray-900 text-center">
          Is this analysis correct?
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            variant="primary"
            size="lg"
            className="flex-1"
            onClick={onAccept}
          >
            <CheckCircle2 className="h-5 w-5" />
            Yes, Continue
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="flex-1"
            onClick={onReject}
          >
            Change Category
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
