"use client";

import React from "react";
import Link from "next/link";
import {
  Camera,
  Brain,
  GitBranch,
  BarChart3,
  ArrowRight,
  CheckCircle2,
  Users,
  MapPin,
} from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { CategoryCard } from "@/components/home/CategoryCard";
import { Button } from "@/components/ui/Button";

const categories = [
  { name: "Roads & Potholes", slug: "roads-potholes", description: "Damaged roads, potholes, broken footpaths" },
  { name: "Garbage & Waste", slug: "garbage-waste", description: "Garbage dumps, missed collection, littering" },
  { name: "Street Lights", slug: "street-lights", description: "Non-functional, flickering, or broken lights" },
  { name: "Water Supply", slug: "water-supply", description: "Leaks, low pressure, contamination" },
  { name: "Drainage & Sewage", slug: "drainage-sewage", description: "Blocked drains, overflows, sewage leaks" },
  { name: "Public Safety", slug: "public-safety", description: "Unsafe structures, missing covers, hazards" },
];

const steps = [
  { icon: Camera, title: "Take a Photo", description: "Snap a picture of the civic issue with your phone" },
  { icon: Brain, title: "AI Analysis", description: "Our AI identifies the issue type and severity automatically" },
  { icon: GitBranch, title: "Auto-Route", description: "Complaint is routed to the right government department" },
  { icon: BarChart3, title: "Track Progress", description: "Get real-time updates until the issue is resolved" },
];

const stats = [
  { label: "Complaints Filed", value: "10,000+", icon: CheckCircle2 },
  { label: "Issues Resolved", value: "7,500+", icon: Users },
  { label: "Cities Covered", value: "50+", icon: MapPin },
];

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
          <div className="max-w-2xl">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              Report Civic Issues.{" "}
              <span className="text-blue-200">Track Progress.</span>{" "}
              Drive Change.
            </h1>
            <p className="mt-6 text-lg text-blue-100">
              CivicConnect India empowers citizens to report civic problems like
              potholes, garbage, broken lights, and more. Our AI-powered platform
              routes your complaint to the right authority and tracks it until
              resolution.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link href="/report">
                <Button size="lg" className="bg-white text-blue-700 hover:bg-blue-50">
                  Report an Issue <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
              <Link href="/track">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                  Track Complaint
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900">How It Works</h2>
            <p className="mt-3 text-gray-600">Four simple steps to report and resolve civic issues</p>
          </div>
          <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((step, i) => (
              <div key={step.title} className="text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                  <step.icon className="h-8 w-8" />
                </div>
                <div className="mt-1 text-xs font-semibold text-blue-600">Step {i + 1}</div>
                <h3 className="mt-2 text-lg font-semibold text-gray-900">{step.title}</h3>
                <p className="mt-2 text-sm text-gray-600">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 sm:py-20 bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900">Common Issues</h2>
            <p className="mt-3 text-gray-600">Select a category to quickly report a problem</p>
          </div>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((cat) => (
              <CategoryCard key={cat.slug} {...cat} />
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 sm:grid-cols-3">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <stat.icon className="mx-auto h-8 w-8 text-blue-600" />
                <p className="mt-3 text-4xl font-bold text-gray-900">{stat.value}</p>
                <p className="mt-1 text-sm text-gray-600">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
