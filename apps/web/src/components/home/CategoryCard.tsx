"use client";

import React from "react";
import Link from "next/link";
import { ArrowUpRight, Construction, Trash2, Lightbulb, Droplets, PipetteIcon, Shield } from "lucide-react";

const iconMap: Record<string, React.ReactNode> = {
  "roads-potholes": <Construction className="h-7 w-7" />,
  "garbage-waste": <Trash2 className="h-7 w-7" />,
  "street-lights": <Lightbulb className="h-7 w-7" />,
  "water-supply": <Droplets className="h-7 w-7" />,
  "drainage-sewage": <PipetteIcon className="h-7 w-7" />,
  "public-safety": <Shield className="h-7 w-7" />,
};

const gradients: Record<string, string> = {
  "roads-potholes": "from-orange-500 to-amber-400",
  "garbage-waste": "from-emerald-500 to-teal-400",
  "street-lights": "from-yellow-500 to-orange-400",
  "water-supply": "from-blue-500 to-cyan-400",
  "drainage-sewage": "from-violet-500 to-purple-400",
  "public-safety": "from-red-500 to-rose-400",
};

interface CategoryCardProps {
  name: string;
  slug: string;
  description: string;
}

export function CategoryCard({ name, slug, description }: CategoryCardProps) {
  const gradient = gradients[slug] || "from-blue-500 to-cyan-400";

  return (
    <Link href={`/report?category=${slug}`}>
      <div className="glow-card group rounded-2xl border border-gray-100 bg-white p-6 cursor-pointer">
        <div className="flex items-start justify-between">
          <div className={`flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br ${gradient} text-white shadow-lg transition-transform duration-300 group-hover:scale-110`}>
            {iconMap[slug] || <Construction className="h-7 w-7" />}
          </div>
          <ArrowUpRight className="h-5 w-5 text-gray-300 transition-all duration-300 group-hover:text-blue-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </div>
        <h3 className="mt-4 text-base font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{name}</h3>
        <p className="mt-1.5 text-sm text-gray-500 leading-relaxed">{description}</p>
      </div>
    </Link>
  );
}
