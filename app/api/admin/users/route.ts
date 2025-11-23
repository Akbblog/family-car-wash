// app/api/admin/users/route.ts
import { NextResponse, NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/lib/models/User";

// Admin users endpoint with pagination support.
// Query params: ?page=1&limit=25
export async function GET(req: NextRequest) {
  await connectDB();

  const url = new URL(req.url);
  const page = Math.max(1, Number(url.searchParams.get("page") || "1"));
  const limit = Math.max(1, Math.min(200, Number(url.searchParams.get("limit") || "25")));
  const skip = (page - 1) * limit;

  // Projection to avoid sending sensitive fields (password) and mongoose internals
  const projection = { password: 0, __v: 0 };

  const [total, users] = await Promise.all([
    User.countDocuments(),
    User.find({}, projection).skip(skip).limit(limit).lean(),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / limit));

  return NextResponse.json({ data: users, meta: { total, page, totalPages, limit } });
}