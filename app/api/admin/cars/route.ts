// app/api/admin/cars/route.ts
import { NextResponse, NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import Car from "@/lib/models/Car";

export async function GET(req: NextRequest) {
  // Return a lightweight list of cars with pagination support.
  await connectDB();

  const url = new URL(req.url);
  const page = Math.max(1, Number(url.searchParams.get("page") || "1"));
  const limit = Math.max(1, Math.min(200, Number(url.searchParams.get("limit") || "25")));
  const skip = (page - 1) * limit;

  const [total, cars] = await Promise.all([
    Car.countDocuments(),
    Car.find({})
      .populate("userId", "name email")
      .skip(skip)
      .limit(limit)
      .lean(),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / limit));
  return NextResponse.json({ data: cars, meta: { total, page, totalPages, limit } });
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();
    const { userId, make, model, licensePlate, color } = body;
    // Basic validation — server must always validate inputs even if
    // the client also validates. This prevents malformed records.
    if (!userId || !make || !model || !licensePlate) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Enforce uniqueness at the application level. The schema also
    // marks licensePlate as unique — a duplicate may still throw at
    // the DB level; handle that gracefully on the client.
    const existing = await Car.findOne({ licensePlate }).lean();
    if (existing) {
      return NextResponse.json({ error: "License plate already exists" }, { status: 409 });
    }

    const car = await Car.create({ userId, make, model, licensePlate, color });
    // Lean response — this is the newly created DB doc. The client will
    // generally call refresh endpoints to get a fresh list rather than
    // rely on this payload for heavy UI updates.
    return NextResponse.json(car, { status: 201 });
  } catch (err: any) {
    console.error("Failed to create car", err);
    return NextResponse.json({ error: err.message || String(err) }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();
    const { id } = body;
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
    // Delete by id; consider soft-deletes if you need history.
    const car = await Car.findByIdAndDelete(id);
    if (!car) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Failed to delete car", err);
    return NextResponse.json({ error: err.message || String(err) }, { status: 500 });
  }
}