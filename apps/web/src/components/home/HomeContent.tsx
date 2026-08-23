"use client";

import React, { useEffect, useRef, useState } from "react";
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
  Zap,
  Shield,
  Globe,
  ChevronRight,
  Sparkles,
  ArrowUpRight,
} from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { CategoryCard } from "@/components/home/CategoryCard";

function formatNumber(n: number): string {
  return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function AnimatedCounter({ value, suffix = "" }: { value: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const duration = 2000;
          const totalSteps = 60;
          const increment = value / totalSteps;
          let current = 0;
          const timer = setInterval(() => {
            current += increment;
            if (current >= value) {
              setCount(value);
              clearInterval(timer);
            } else {
              setCount(Math.floor(current));
            }
          }, duration / totalSteps);
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [value]);

  return (
    <span ref={ref} className="tabular-nums">
      {formatNumber(count)}{suffix}
    </span>
  );
}

function FloatingParticles() {
  const [particles] = useState(() =>
    Array.from({ length: 20 }).map(() => ({
      w: Math.random() * 6 + 2,
      l: Math.random() * 100,
      t: Math.random() * 100,
      dur: Math.random() * 4 + 4,
      delay: Math.random() * 4,
    }))
  );

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((p, i) => (
        <div
          key={i}
          className="absolute rounded-full bg-blue-400/20"
          style={{
            width: `${p.w}px`,
            height: `${p.w}px`,
            left: `${p.l}%`,
            top: `${p.t}%`,
            animation: `float ${p.dur}s ease-in-out ${p.delay}s infinite`,
          }}
        />
      ))}
    </div>
  );
}

const categories = [
  { name: "Roads & Potholes", slug: "roads-potholes", description: "Damaged roads, potholes, broken footpaths" },
  { name: "Garbage & Waste", slug: "garbage-waste", description: "Garbage dumps, missed collection, littering" },
  { name: "Street Lights", slug: "street-lights", description: "Non-functional, flickering, or broken lights" },
  { name: "Water Supply", slug: "water-supply", description: "Leaks, low pressure, contamination" },
  { name: "Drainage & Sewage", slug: "drainage-sewage", description: "Blocked drains, overflows, sewage leaks" },
  { name: "Public Safety", slug: "public-safety", description: "Unsafe structures, missing covers, hazards" },
];

const steps = [
  {
    icon: Camera,
    title: "Capture",
    description: "Snap a photo of the civic issue — our smart camera detects location automatically",
    color: "from-blue-500 to-cyan-400",
  },
  {
    icon: Brain,
    title: "AI Analysis",
    description: "Neural networks classify the issue, assess severity, and extract key details",
    color: "from-violet-500 to-purple-400",
  },
  {
    icon: GitBranch,
    title: "Smart Routing",
    description: "Intelligent routing sends your complaint to the right government department instantly",
    color: "from-emerald-500 to-teal-400",
  },
  {
    icon: BarChart3,
    title: "Live Tracking",
    description: "Real-time status updates, notifications, and transparency until resolution",
    color: "from-orange-500 to-amber-400",
  },
];

const stats = [
  { label: "Complaints Filed", value: 10000, suffix: "+", icon: CheckCircle2 },
  { label: "Issues Resolved", value: 7500, suffix: "+", icon: Users },
  { label: "Cities Covered", value: 50, suffix: "+", icon: MapPin },
];

const features = [
  {
    icon: Zap,
    title: "Lightning Fast",
    description: "File a complaint in under 60 seconds with our streamlined process",
  },
  {
    icon: Shield,
    title: "Secure & Private",
    description: "End-to-end encryption protects your identity and personal data",
  },
  {
    icon: Globe,
    title: "Multi-Language",
    description: "Available in 12+ Indian languages for maximum accessibility",
  },
];

export default function HomeContent() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />

      {/* ===== HERO ===== */}
      <section className="relative overflow-hidden hero-mesh text-white min-h-screen flex items-center pt-16">
        <div className="absolute inset-0 hero-grid" />
        <FloatingParticles />

        <div className="absolute top-20 right-1/4 w-72 h-72 bg-blue-500/20 rounded-full blur-[120px] animate-glow-pulse" />
        <div className="absolute bottom-20 left-1/4 w-96 h-96 bg-violet-500/15 rounded-full blur-[140px] animate-glow-pulse" style={{ animationDelay: "1.5s" }} />
        <div className="absolute top-1/2 right-10 w-64 h-64 bg-cyan-500/10 rounded-full blur-[100px] animate-float" />

        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 w-full">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full glass px-4 py-2 mb-8 animate-slide-up">
              <Sparkles className="h-4 w-4 text-blue-300" />
              <span className="text-sm text-blue-200 font-medium">AI-Powered Civic Platform</span>
              <ChevronRight className="h-3 w-3 text-blue-400" />
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1] animate-slide-up" style={{ animationDelay: "0.1s" }}>
              Report Issues.{" "}
              <span className="shimmer-text">Track Progress.</span>{" "}
              Drive Change.
            </h1>

            <p className="mt-6 text-lg sm:text-xl text-blue-100/80 max-w-2xl leading-relaxed animate-slide-up" style={{ animationDelay: "0.2s" }}>
              CivicConnect India empowers citizens to report civic problems. Our AI-powered platform
              automatically routes your complaint to the right authority and tracks it until resolution.
            </p>

            <div className="mt-10 flex flex-wrap gap-4 animate-slide-up" style={{ animationDelay: "0.3s" }}>
              <Link href="/report" className="group btn-gradient inline-flex items-center gap-2 rounded-xl px-8 py-4 text-base font-semibold text-white">
                Report an Issue
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link href="/track" className="group glass inline-flex items-center gap-2 rounded-xl px-8 py-4 text-base font-semibold text-white hover:bg-white/15 transition-all">
                Track Complaint
                <ArrowUpRight className="h-4 w-4 opacity-60 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </Link>
            </div>

            <div className="mt-16 flex flex-wrap gap-8 animate-slide-up" style={{ animationDelay: "0.5s" }}>
              {stats.map((stat) => (
                <div key={stat.label} className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg glass">
                    <stat.icon className="h-5 w-5 text-blue-300" />
                  </div>
                  <div>
                    <p className="text-xl font-bold text-white">{formatNumber(stat.value)}{stat.suffix}</p>
                    <p className="text-xs text-blue-300/80">{stat.label}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white to-transparent" />
      </section>

      {/* ===== HOW IT WORKS ===== */}
      <section className="py-20 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto">
            <span className="inline-block text-sm font-semibold text-blue-600 tracking-wider uppercase mb-3">How It Works</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
              From report to resolution in{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-violet-600">four steps</span>
            </h2>
            <p className="mt-4 text-gray-500 text-lg">Our AI-powered pipeline ensures your complaint reaches the right department instantly</p>
          </div>

          <div className="mt-16 relative">
            <div className="hidden lg:block absolute top-24 left-[12.5%] right-[12.5%] h-[2px]">
              <div className="w-full h-full bg-gradient-to-r from-blue-200 via-violet-200 via-emerald-200 to-amber-200 rounded-full" />
            </div>

            <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
              {steps.map((step, i) => (
                <div key={step.title} className="text-center relative">
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-[80px] font-black text-gray-100/60 select-none leading-none">
                    {i + 1}
                  </div>
                  <div className={`relative z-10 mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br ${step.color} text-white shadow-lg`}>
                    <step.icon className="h-9 w-9" />
                  </div>
                  <h3 className="mt-6 text-lg font-bold text-gray-900">{step.title}</h3>
                  <p className="mt-2 text-sm text-gray-500 leading-relaxed">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ===== CATEGORIES ===== */}
      <section className="py-20 bg-gray-50 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-blue-100/40 rounded-full blur-[120px]" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto">
            <span className="inline-block text-sm font-semibold text-blue-600 tracking-wider uppercase mb-3">Categories</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
              What issue are you facing?
            </h2>
            <p className="mt-4 text-gray-500 text-lg">Select a category to quickly report a problem in your area</p>
          </div>

          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((cat) => (
              <CategoryCard key={cat.slug} {...cat} />
            ))}
          </div>
        </div>
      </section>

      {/* ===== STATS ===== */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 hero-mesh" />
        <div className="absolute inset-0 hero-grid" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="inline-block text-sm font-semibold text-blue-300 tracking-wider uppercase mb-3">Our Impact</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-white">
              Making a difference across India
            </h2>
          </div>

          <div className="grid gap-8 sm:grid-cols-3">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl glass mb-5">
                  <stat.icon className="h-8 w-8 text-blue-300" />
                </div>
                <p className="text-5xl sm:text-6xl font-black text-white tracking-tight">
                  <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                </p>
                <p className="mt-2 text-blue-200/70 font-medium">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== FEATURES ===== */}
      <section className="py-20 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <span className="inline-block text-sm font-semibold text-blue-600 tracking-wider uppercase mb-3">Why CivicConnect</span>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
                Built for India&apos;s{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-violet-600">digital future</span>
              </h2>
              <p className="mt-4 text-gray-500 text-lg leading-relaxed">
                We combine cutting-edge AI with deep understanding of Indian civic infrastructure to deliver a platform that truly works.
              </p>
            </div>

            <div className="space-y-5">
              {features.map((feature) => (
                <div key={feature.title} className="glow-card group flex gap-5 rounded-2xl border border-gray-100 bg-white p-6">
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-violet-500 text-white shadow-md">
                    <feature.icon className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-gray-900">{feature.title}</h3>
                    <p className="mt-1 text-sm text-gray-500 leading-relaxed">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section className="py-20 bg-gray-50">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <div className="rounded-3xl bg-gradient-to-br from-blue-600 via-blue-700 to-violet-700 p-12 sm:p-16 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />

            <div className="relative">
              <h2 className="text-3xl sm:text-4xl font-bold text-white">
                Ready to make your city better?
              </h2>
              <p className="mt-4 text-lg text-blue-100/80 max-w-xl mx-auto">
                Join thousands of active citizens who are transforming their neighborhoods through CivicConnect.
              </p>
              <div className="mt-8 flex flex-wrap gap-4 justify-center">
                <Link href="/report" className="group inline-flex items-center gap-2 rounded-xl bg-white px-8 py-4 text-base font-semibold text-blue-700 hover:bg-blue-50 transition-all hover:translate-y-[-2px] hover:shadow-lg">
                  Report Now
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Link>
                <Link href="/register" className="group inline-flex items-center gap-2 rounded-xl border-2 border-white/30 px-8 py-4 text-base font-semibold text-white hover:bg-white/10 transition-all">
                  Create Account
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
