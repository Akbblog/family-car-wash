// app/api/admin/cars/route.ts
import { NextResponse, NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import Car from "@/lib/models/Car";

export async function GET() {
  await connectDB();
  const cars = await Car.find({}).populate("userId", "name email").lean();
  return NextResponse.json(cars);
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();
    const { userId, make, model, licensePlate, color } = body;
    if (!userId || !make || !model || !licensePlate) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const existing = await Car.findOne({ licensePlate }).lean();
    if (existing) {
      return NextResponse.json({ error: "License plate already exists" }, { status: 409 });
    }

    const car = await Car.create({ userId, make, model, licensePlate, color });
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
    const car = await Car.findByIdAndDelete(id);
    if (!car) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Failed to delete car", err);
    return NextResponse.json({ error: err.message || String(err) }, { status: 500 });
  }
}