"use client";

import { Suspense } from "react";
import { SearchResults } from "@/components/search-results";

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="max-w-4xl mx-auto px-4 py-12 text-center text-zinc-500">Searching...</div>}>
      <SearchResults />
    </Suspense>
  );
}