"use client";

import React, { useCallback, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Camera,
  MapPin,
  Brain,
  Tag,
  FileText,
  Send,
  Check,
  ArrowLeft,
  ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { ImageUploadStep } from "./steps/ImageUploadStep";
import { LocationStep } from "./steps/LocationStep";
import {
  AiAnalysisStep,
  type AiAnalysisResult,
} from "./steps/AiAnalysisStep";
import { CategorySelectionStep } from "./steps/CategorySelectionStep";
import { DescriptionStep } from "./steps/DescriptionStep";
import { ReviewSubmitStep } from "./steps/ReviewSubmitStep";

interface LocationData {
  latitude: number;
  longitude: number;
  address: string;
  source: "browser" | "manual";
}

type Severity = "low" | "medium" | "high" | "critical";

const steps = [
  { id: 1, label: "Upload", icon: Camera },
  { id: 2, label: "Location", icon: MapPin },
  { id: 3, label: "Analysis", icon: Brain },
  { id: 4, label: "Category", icon: Tag },
  { id: 5, label: "Description", icon: FileText },
  { id: 6, label: "Submit", icon: Send },
];

export function ReportWizard() {
  const [currentStep, setCurrentStep] = useState(1);

  // Step 1: Images
  const [images, setImages] = useState<File[]>([]);

  // Step 2: Location
  const [location, setLocation] = useState<LocationData | null>(null);

  // Step 3: AI Analysis
  const [aiAnalysis, setAiAnalysis] = useState<AiAnalysisResult | null>(null);
  const [aiAccepted, setAiAccepted] = useState(false);

  // Step 4: Category
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedSubcategory, setSelectedSubcategory] = useState("");

  // Step 5: Description
  const [complaintTitle, setComplaintTitle] = useState("");
  const [complaintDescription, setComplaintDescription] = useState("");
  const [severity, setSeverity] = useState<Severity>("medium");
  const [originalTitle, setOriginalTitle] = useState("");
  const [originalDescription, setOriginalDescription] = useState("");
  const [isAiGenerated, setIsAiGenerated] = useState(false);

  // Step 6: Submit
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Skip category selection flag (when AI is accepted)
  const [skipCategory, setSkipCategory] = useState(false);

  const canGoNext = (): boolean => {
    switch (currentStep) {
      case 1:
        return images.length > 0;
      case 2:
        return location !== null;
      case 3:
        return aiAccepted || false; // handled by buttons in step
      case 4:
        return selectedCategory !== "" && selectedSubcategory !== "";
      case 5:
        return complaintTitle.trim().length > 0 && complaintDescription.trim().length > 0;
      case 6:
        return true;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (currentStep === 3) return; // Step 3 has its own navigation
    if (currentStep === 4 && skipCategory) return; // shouldn't happen but safety

    let nextStep = currentStep + 1;

    // If AI was accepted and we're going from step 3, skip step 4
    if (currentStep === 3 && aiAccepted && skipCategory) {
      nextStep = 5;
    }

    // Skip category step if already set from AI acceptance
    if (nextStep === 4 && skipCategory) {
      nextStep = 5;
    }

    setCurrentStep(Math.min(nextStep, 6));
  };

  const handleBack = () => {
    let prevStep = currentStep - 1;

    // If going back from step 5 and category was skipped, go to step 3
    if (currentStep === 5 && skipCategory) {
      prevStep = 3;
    }

    setCurrentStep(Math.max(prevStep, 1));
  };

  const handleAiAccept = () => {
    if (!aiAnalysis) return;
    setAiAccepted(true);
    setSkipCategory(true);
    setSelectedCategory(aiAnalysis.category);
    setSelectedSubcategory(aiAnalysis.subcategory);
    setSeverity(aiAnalysis.severity);
    setComplaintTitle(aiAnalysis.generatedTitle);
    setComplaintDescription(aiAnalysis.generatedDescription);
    setOriginalTitle(aiAnalysis.generatedTitle);
    setOriginalDescription(aiAnalysis.generatedDescription);
    setIsAiGenerated(true);
    setCurrentStep(5);
  };

  const handleAiReject = () => {
    setAiAccepted(false);
    setSkipCategory(false);
    // Clear title/description so they get regenerated when the user picks a new category
    setComplaintTitle("");
    setComplaintDescription("");
    setOriginalTitle("");
    setOriginalDescription("");
    // Keep AI severity as a reasonable default
    if (aiAnalysis) {
      setSeverity(aiAnalysis.severity);
    }
    setIsAiGenerated(false);
    setCurrentStep(4);
  };

  const handleCategorySelect = (category: string, subcategory: string) => {
    setSelectedCategory(category);
    setSelectedSubcategory(subcategory);

    // Always regenerate title/description to match the selected category
    const newTitle = `${subcategory} Issue — ${category}`;

    // Build a description that incorporates AI evidence (what was seen in the image)
    // but frames it under the newly chosen category
    let newDescription: string;
    if (aiAnalysis?.evidence?.length) {
      const evidenceLines = aiAnalysis.evidence.map((e) => `• ${e}`).join("\n");
      newDescription =
        `Reporting a ${subcategory.toLowerCase()} issue under the ${category.toLowerCase()} category.\n\n` +
        `Observations from the uploaded image:\n${evidenceLines}\n\n` +
        `Please investigate and take appropriate action.`;
    } else {
      newDescription = `Reporting a ${subcategory.toLowerCase()} issue in the ${category.toLowerCase()} category. Please investigate and take appropriate action.`;
    }

    setComplaintTitle(newTitle);
    setOriginalTitle(newTitle);
    setComplaintDescription(newDescription);
    setOriginalDescription(newDescription);
  };

  const handleRegenerate = () => {
    if (aiAccepted && aiAnalysis) {
      // AI was accepted — restore the AI's original text
      setComplaintTitle(aiAnalysis.generatedTitle);
      setComplaintDescription(aiAnalysis.generatedDescription);
    } else {
      // Category was manually changed — regenerate based on current category
      setComplaintTitle(originalTitle);
      setComplaintDescription(originalDescription);
    }
  };

  const handleReset = () => {
    setComplaintTitle(originalTitle);
    setComplaintDescription(originalDescription);
  };

  const handleAnalysisComplete = useCallback((result: AiAnalysisResult) => {
    setAiAnalysis(result);
  }, []);

  const handleSubmit = () => {
    setIsSubmitting(true);
    // The ReviewSubmitStep handles the rest internally
  };

  // Determine effective step for progress indicator
  const getEffectiveSteps = () => {
    if (skipCategory) {
      return steps.filter((s) => s.id !== 4);
    }
    return steps;
  };

  const effectiveSteps = getEffectiveSteps();

  return (
    <div className="mx-auto max-w-2xl">
      {/* Step Progress Indicator */}
      <div className="mb-8 px-2">
        <div className="flex items-center justify-between">
          {effectiveSteps.map((step, index) => {
            const isCompleted = currentStep > step.id;
            const isCurrent = currentStep === step.id;
            const StepIcon = step.icon;

            return (
              <React.Fragment key={step.id}>
                <div className="flex flex-col items-center gap-1.5">
                  <div
                    className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all duration-300",
                      isCompleted
                        ? "border-emerald-500 bg-emerald-500 text-white"
                        : isCurrent
                        ? "border-blue-500 bg-blue-500 text-white shadow-lg shadow-blue-200"
                        : "border-gray-300 bg-white text-gray-400"
                    )}
                  >
                    {isCompleted ? (
                      <Check className="h-5 w-5" />
                    ) : (
                      <StepIcon className="h-5 w-5" />
                    )}
                  </div>
                  <span
                    className={cn(
                      "text-[11px] font-medium hidden sm:block",
                      isCompleted
                        ? "text-emerald-600"
                        : isCurrent
                        ? "text-blue-600"
                        : "text-gray-400"
                    )}
                  >
                    {step.label}
                  </span>
                </div>

                {/* Connecting line */}
                {index < effectiveSteps.length - 1 && (
                  <div className="flex-1 px-2 self-start mt-5">
                    <div className="h-0.5 w-full rounded-full bg-gray-200 overflow-hidden">
                      <motion.div
                        className="h-full bg-emerald-500"
                        initial={{ width: "0%" }}
                        animate={{
                          width: isCompleted ? "100%" : "0%",
                        }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Step Content */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-8 shadow-sm min-h-[400px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
          >
            {currentStep === 1 && (
              <ImageUploadStep images={images} onImagesChange={setImages} />
            )}
            {currentStep === 2 && (
              <LocationStep
                location={location}
                onLocationChange={setLocation}
              />
            )}
            {currentStep === 3 && (
              <AiAnalysisStep
                images={images}
                aiAnalysis={aiAnalysis}
                onAnalysisComplete={handleAnalysisComplete}
                onAccept={handleAiAccept}
                onReject={handleAiReject}
              />
            )}
            {currentStep === 4 && (
              <CategorySelectionStep
                selectedCategory={selectedCategory}
                selectedSubcategory={selectedSubcategory}
                onSelect={handleCategorySelect}
              />
            )}
            {currentStep === 5 && (
              <DescriptionStep
                title={complaintTitle}
                description={complaintDescription}
                severity={severity}
                category={selectedCategory}
                subcategory={selectedSubcategory}
                isAiGenerated={isAiGenerated}
                originalTitle={originalTitle}
                originalDescription={originalDescription}
                onTitleChange={setComplaintTitle}
                onDescriptionChange={setComplaintDescription}
                onSeverityChange={setSeverity}
                onRegenerate={handleRegenerate}
                onReset={handleReset}
              />
            )}
            {currentStep === 6 && location && (
              <ReviewSubmitStep
                images={images}
                location={location}
                category={selectedCategory}
                subcategory={selectedSubcategory}
                severity={severity}
                title={complaintTitle}
                description={complaintDescription}
                aiAnalysis={aiAnalysis}
                isSubmitting={isSubmitting}
                onSubmit={handleSubmit}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation buttons */}
      {currentStep !== 3 && (
        <div className="mt-6 flex items-center justify-between">
          <Button
            variant="ghost"
            size="md"
            onClick={handleBack}
            disabled={currentStep === 1}
            className={cn(currentStep === 1 && "invisible")}
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>

          {currentStep < 6 && (
            <Button
              variant="primary"
              size="md"
              onClick={handleNext}
              disabled={!canGoNext()}
            >
              Next
              <ArrowRight className="h-4 w-4" />
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
