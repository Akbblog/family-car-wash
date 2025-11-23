import { NextResponse } from "next/server";
import User from "@/lib/models/User";
import Car from "@/lib/models/Car";
import { connectDB } from "@/lib/db";

// Returns a small set of KPIs for the admin dashboard. Kept lightweight.
export async function GET() {
  await connectDB();

  // Use parallel queries for speed
  const [userCount, carCount] = await Promise.all([
    User.countDocuments(),
    Car.countDocuments(),
  ]);

  // Calculate 'active users' over the last 30 days. Previously this used
  // a `lastLogin` field which doesn't exist in the schema; to keep the
  // metric useful we fall back to users created in the window. If you add
  // `lastLogin` later, change this filter to use it instead.
  const activePeriod = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const activeUsers = await User.countDocuments({ createdAt: { $gte: activePeriod } });

  return NextResponse.json({ userCount, activeUsers, carCount });
}