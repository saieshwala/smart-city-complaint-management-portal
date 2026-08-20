"use client";

import React from "react";
import { motion } from "framer-motion";
import { Sparkles, RotateCcw, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Badge } from "@/components/ui/Badge";

type Severity = "low" | "medium" | "high" | "critical";

interface DescriptionStepProps {
  title: string;
  description: string;
  severity: Severity;
  category: string;
  subcategory: string;
  isAiGenerated: boolean;
  originalTitle: string;
  originalDescription: string;
  onTitleChange: (title: string) => void;
  onDescriptionChange: (description: string) => void;
  onSeverityChange: (severity: Severity) => void;
  onRegenerate: () => void;
  onReset: () => void;
}

const severityOptions: {
  value: Severity;
  label: string;
  color: string;
  activeColor: string;
  description: string;
}[] = [
  {
    value: "low",
    label: "Low",
    color: "border-gray-200 text-gray-600",
    activeColor: "border-emerald-500 bg-emerald-50 text-emerald-700 ring-2 ring-emerald-200",
    description: "Minor inconvenience",
  },
  {
    value: "medium",
    label: "Medium",
    color: "border-gray-200 text-gray-600",
    activeColor: "border-amber-500 bg-amber-50 text-amber-700 ring-2 ring-amber-200",
    description: "Needs attention",
  },
  {
    value: "high",
    label: "High",
    color: "border-gray-200 text-gray-600",
    activeColor: "border-orange-500 bg-orange-50 text-orange-700 ring-2 ring-orange-200",
    description: "Urgent issue",
  },
  {
    value: "critical",
    label: "Critical",
    color: "border-gray-200 text-gray-600",
    activeColor: "border-red-500 bg-red-50 text-red-700 ring-2 ring-red-200",
    description: "Safety hazard",
  },
];

export function DescriptionStep({
  title,
  description,
  severity,
  category,
  subcategory,
  isAiGenerated,
  originalTitle,
  originalDescription,
  onTitleChange,
  onDescriptionChange,
  onSeverityChange,
  onRegenerate,
  onReset,
}: DescriptionStepProps) {
  const hasEdited =
    title !== originalTitle || description !== originalDescription;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div className="text-center space-y-2">
        <h2 className="text-xl font-semibold text-gray-900">
          Review Description
        </h2>
        <p className="text-sm text-gray-500">
          Edit the complaint details before submitting.
        </p>
      </div>

      {/* Category badges */}
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="info">{category}</Badge>
        {subcategory && <Badge variant="default">{subcategory}</Badge>}
        {isAiGenerated && (
          <Badge variant="success">
            <Sparkles className="h-3 w-3" />
            AI-Generated
          </Badge>
        )}
      </div>

      {/* Title */}
      <Input
        label="Complaint Title"
        value={title}
        onChange={(e) => onTitleChange(e.target.value)}
        placeholder="Brief title describing the problem"
        helperText={`${title.length}/120 characters`}
      />

      {/* Description */}
      <Textarea
        label="Complaint Description"
        value={description}
        onChange={(e) => onDescriptionChange(e.target.value)}
        placeholder="Detailed description of the problem..."
        maxLength={2000}
        showCount
        className="min-h-[150px]"
        helperText="Include relevant details like duration of issue, impact on daily life, etc."
      />

      {/* Severity selector */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-700">
          <div className="flex items-center gap-1.5">
            <AlertTriangle className="h-4 w-4" />
            Severity Level
          </div>
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {severityOptions.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => onSeverityChange(opt.value)}
              className={cn(
                "rounded-lg border-2 px-3 py-2.5 text-center transition-all duration-150",
                "hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
                severity === opt.value ? opt.activeColor : opt.color
              )}
            >
              <p className="text-sm font-semibold">{opt.label}</p>
              <p className="text-[11px] opacity-70">{opt.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex flex-wrap gap-2 pt-2">
        {isAiGenerated && (
          <Button variant="outline" size="sm" onClick={onRegenerate}>
            <Sparkles className="h-4 w-4" />
            Regenerate
          </Button>
        )}
        {hasEdited && (
          <Button variant="ghost" size="sm" onClick={onReset}>
            <RotateCcw className="h-4 w-4" />
            Reset
          </Button>
        )}
      </div>
    </motion.div>
  );
}
