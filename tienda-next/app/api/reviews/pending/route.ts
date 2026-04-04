import { NextRequest, NextResponse } from "next/server";
import { getPendingReviews, approveReview, rejectReview } from "@/app/lib/reviews-db";

export async function GET() {
  try {
    const reviews = await getPendingReviews();
    return NextResponse.json(reviews);
  } catch (err) {
    console.error("/api/reviews/pending GET error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  const action = req.nextUrl.pathname.includes("approve") ? "approve" : "reject";
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  try {
    if (action === "approve") await approveReview(id);
    else await rejectReview(id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(`/api/reviews/pending POST ${action} error:`, err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
