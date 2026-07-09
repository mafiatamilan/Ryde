import Link from "next/link";
import { db } from "@/db";
import { communities } from "@/db/schema";
import { SidebarClient } from "./sidebar-client";

export async function Sidebar() {
  const allCommunities = await db.select().from(communities).all();

  return <SidebarClient communities={allCommunities} />;
}
