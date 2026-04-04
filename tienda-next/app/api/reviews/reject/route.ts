import { NextRequest, NextResponse } from "next/server";
import { rejectReview } from "@/app/lib/reviews-db";

export async function POST(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  try {
    await rejectReview(id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("/api/reviews/reject POST error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
