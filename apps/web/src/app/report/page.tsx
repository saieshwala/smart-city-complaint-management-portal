"use client";

import React from "react";
import { ReportWizard } from "@/components/report/ReportWizard";

export default function ReportPage() {
  return (
    <main className="min-h-screen bg-gray-50/50">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:py-12">
        {/* Page header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Report a Problem
          </h1>
          <p className="mt-2 text-base text-gray-500">
            Help improve your community by reporting civic issues. Our AI will
            assist in categorizing and routing your complaint.
          </p>
        </div>

        {/* Wizard */}
        <ReportWizard />
      </div>
    </main>
  );
}
