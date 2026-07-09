"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function CreateCommunityPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState("public");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/communities", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, description, type }),
    });

    if (res.ok) {
      const data = await res.json();
      router.push(`/r/${data.slug}`);
    } else {
      const data = await res.json();
      setError(data.message || "Something went wrong");
      setLoading(false);
    }
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Create a Community</CardTitle>
          <CardDescription>
            A community is a space for discussion on a specific topic
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm text-zinc-400">Name</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 text-sm">
                  r/
                </span>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="pl-8"
                  placeholder="community_name"
                  maxLength={21}
                  required
                />
              </div>
              <p className="text-xs text-zinc-500">
                3-21 characters, lowercase, no spaces
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-sm text-zinc-400">Description</label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What is this community about?"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm text-zinc-400">Community Type</label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="public">Public — Anyone can view and post</SelectItem>
                  <SelectItem value="restricted">Restricted — Anyone can view, only approved can post</SelectItem>
                  <SelectItem value="private">Private — Only approved members can view and post</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {error && <p className="text-sm text-red-400">{error}</p>}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Creating..." : "Create Community"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}