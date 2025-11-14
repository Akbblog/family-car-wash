import { NextRequest, NextResponse } from "next/server";
import { handlers as nextAuthHandlers } from "@/auth";

// Wrap NextAuth handlers to satisfy Next.js 16 types
export const GET = async (req: NextRequest, ctx: { params: Promise<{ nextauth: string[] }> }) => {
  return nextAuthHandlers.GET(req);
};

export const POST = async (req: NextRequest, ctx: { params: Promise<{ nextauth: string[] }> }) => {
  return nextAuthHandlers.POST(req);
};
