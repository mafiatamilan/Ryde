"use client";

import { Suspense } from "react";
import { SubmitForm } from "./submit-form";

export default function SubmitPage() {
  return (
    <Suspense fallback={<div className="max-w-2xl mx-auto px-4 py-6"><div className="h-96 bg-zinc-900 rounded-xl animate-pulse" /></div>}>
      <SubmitForm />
    </Suspense>
  );
}