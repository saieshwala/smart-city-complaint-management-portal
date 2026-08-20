"use client";

import React from "react";
import Link from "next/link";
import {
  Construction,
  Trash2,
  Lightbulb,
  Droplets,
  PipetteIcon,
  Shield,
} from "lucide-react";

const iconMap: Record<string, React.ReactNode> = {
  "roads-potholes": <Construction className="h-8 w-8" />,
  "garbage-waste": <Trash2 className="h-8 w-8" />,
  "street-lights": <Lightbulb className="h-8 w-8" />,
  "water-supply": <Droplets className="h-8 w-8" />,
  "drainage-sewage": <PipetteIcon className="h-8 w-8" />,
  "public-safety": <Shield className="h-8 w-8" />,
};

interface CategoryCardProps {
  name: string;
  slug: string;
  description: string;
  icon?: string;
}

export function CategoryCard({ name, slug, description }: CategoryCardProps) {
  return (
    <Link href={`/report?category=${slug}`}>
      <div className="group rounded-xl border border-gray-200 bg-white p-6 text-center shadow-sm transition-all hover:border-blue-300 hover:shadow-md">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 text-blue-600 group-hover:bg-blue-100">
          {iconMap[slug] || <Construction className="h-8 w-8" />}
        </div>
        <h3 className="text-sm font-semibold text-gray-900">{name}</h3>
        <p className="mt-1 text-xs text-gray-500">{description}</p>
      </div>
    </Link>
  );
}
