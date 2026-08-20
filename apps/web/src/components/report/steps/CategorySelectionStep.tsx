"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Trash2,
  Construction,
  TrafficCone,
  Droplets,
  Waves,
  Lightbulb,
  Building,
  Trees,
  MoreHorizontal,
  ChevronDown,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface CategorySelectionStepProps {
  selectedCategory: string;
  selectedSubcategory: string;
  onSelect: (category: string, subcategory: string) => void;
}

interface Category {
  name: string;
  icon: React.ReactNode;
  subcategories: string[];
}

const categories: Category[] = [
  {
    name: "Waste Management",
    icon: <Trash2 className="h-6 w-6" />,
    subcategories: [
      "Garbage Not Collected",
      "Overflowing Bin",
      "Illegal Dumping",
      "Hazardous Waste",
      "Recycling Issue",
    ],
  },
  {
    name: "Roads",
    icon: <Construction className="h-6 w-6" />,
    subcategories: [
      "Potholes",
      "Road Damage",
      "Missing Road Markings",
      "Speed Breaker Issue",
      "Road Construction Delay",
    ],
  },
  {
    name: "Traffic",
    icon: <TrafficCone className="h-6 w-6" />,
    subcategories: [
      "Signal Malfunction",
      "Missing Signal",
      "Congestion",
      "Parking Violation",
      "Sign Damaged",
    ],
  },
  {
    name: "Water",
    icon: <Droplets className="h-6 w-6" />,
    subcategories: [
      "Water Supply Issue",
      "Water Leakage",
      "Contaminated Water",
      "Low Pressure",
      "No Water Supply",
    ],
  },
  {
    name: "Sewerage",
    icon: <Waves className="h-6 w-6" />,
    subcategories: [
      "Blocked Drain",
      "Sewage Overflow",
      "Manhole Issue",
      "Bad Odor",
      "Drain Cleaning Required",
    ],
  },
  {
    name: "Street Lighting",
    icon: <Lightbulb className="h-6 w-6" />,
    subcategories: [
      "Non-functional Light",
      "Dim Light",
      "Flickering Light",
      "Broken Pole",
      "New Light Required",
    ],
  },
  {
    name: "Public Infrastructure",
    icon: <Building className="h-6 w-6" />,
    subcategories: [
      "Broken Footpath",
      "Damaged Bus Stop",
      "Park Maintenance",
      "Public Toilet Issue",
      "Bench/Furniture Damage",
    ],
  },
  {
    name: "Environment",
    icon: <Trees className="h-6 w-6" />,
    subcategories: [
      "Fallen Tree",
      "Air Pollution",
      "Noise Pollution",
      "Water Body Pollution",
      "Unauthorized Construction",
    ],
  },
  {
    name: "Other",
    icon: <MoreHorizontal className="h-6 w-6" />,
    subcategories: [
      "General Complaint",
      "Encroachment",
      "Stray Animals",
      "Mosquito Menace",
      "Other Issue",
    ],
  },
];

export function CategorySelectionStep({
  selectedCategory,
  selectedSubcategory,
  onSelect,
}: CategorySelectionStepProps) {
  const [expandedCategory, setExpandedCategory] = useState<string>(
    selectedCategory || ""
  );

  const handleCategoryClick = (categoryName: string) => {
    setExpandedCategory(
      expandedCategory === categoryName ? "" : categoryName
    );
  };

  const handleSubcategoryClick = (category: string, subcategory: string) => {
    onSelect(category, subcategory);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div className="text-center space-y-2">
        <h2 className="text-xl font-semibold text-gray-900">
          Select Problem Category
        </h2>
        <p className="text-sm text-gray-500">
          Choose the category that best describes the issue you are reporting.
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {categories.map((cat) => {
          const isSelected = selectedCategory === cat.name;
          const isExpanded = expandedCategory === cat.name;

          return (
            <div
              key={cat.name}
              className={cn(
                "col-span-1",
                isExpanded && "col-span-2 sm:col-span-3"
              )}
            >
              <button
                type="button"
                onClick={() => handleCategoryClick(cat.name)}
                className={cn(
                  "w-full rounded-xl border-2 p-4 text-left transition-all duration-200",
                  "hover:shadow-md hover:border-blue-300",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
                  isSelected
                    ? "border-blue-500 bg-blue-50 shadow-sm"
                    : "border-gray-200 bg-white"
                )}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg transition-colors",
                      isSelected
                        ? "bg-blue-100 text-blue-600"
                        : "bg-gray-100 text-gray-600"
                    )}
                  >
                    {cat.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      className={cn(
                        "text-sm font-semibold truncate",
                        isSelected ? "text-blue-900" : "text-gray-900"
                      )}
                    >
                      {cat.name}
                    </p>
                  </div>
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 shrink-0 text-gray-400 transition-transform duration-200",
                      isExpanded && "rotate-180"
                    )}
                  />
                </div>
              </button>

              {/* Subcategories */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="mt-2 rounded-lg border border-gray-200 bg-gray-50 p-2 space-y-1">
                      {cat.subcategories.map((sub) => {
                        const isSubSelected =
                          selectedCategory === cat.name &&
                          selectedSubcategory === sub;

                        return (
                          <button
                            key={sub}
                            type="button"
                            onClick={() =>
                              handleSubcategoryClick(cat.name, sub)
                            }
                            className={cn(
                              "w-full flex items-center gap-2 rounded-md px-3 py-2.5 text-sm transition-colors text-left",
                              "hover:bg-blue-50 active:bg-blue-100",
                              isSubSelected
                                ? "bg-blue-100 text-blue-800 font-medium"
                                : "text-gray-700"
                            )}
                          >
                            {isSubSelected ? (
                              <Check className="h-4 w-4 text-blue-600 shrink-0" />
                            ) : (
                              <div className="h-4 w-4 shrink-0" />
                            )}
                            {sub}
                          </button>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      {selectedCategory && selectedSubcategory && (
        <motion.div
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-lg bg-blue-50 border border-blue-200 px-4 py-3 flex items-center gap-2"
        >
          <Check className="h-5 w-5 text-blue-600 shrink-0" />
          <p className="text-sm text-blue-800">
            Selected: <span className="font-semibold">{selectedCategory}</span>{" "}
            &rarr; <span className="font-medium">{selectedSubcategory}</span>
          </p>
        </motion.div>
      )}
    </motion.div>
  );
}
