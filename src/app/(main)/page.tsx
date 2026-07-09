import { HomeFeed } from "@/components/home-feed";

export default function HomePage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <HomeFeed feedType="home" />
    </div>
  );
}