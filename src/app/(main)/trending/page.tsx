import { HomeFeed } from "@/components/home-feed";

export default function TrendingPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <h1 className="text-xl font-bold text-zinc-100 mb-4">Trending</h1>
      <HomeFeed feedType="trending" />
    </div>
  );
}