import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ guestId: string }> }
) {
  try {
    const { guestId } = await params;
    const searchParams = request.nextUrl.searchParams;
    const token = searchParams.get("token") || "";

    const backendBase = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api")
      .replace(/\/+$/, "")
      .replace(/\/api$/, "");

    const url = `${backendBase}/api/check-ins/verify/${encodeURIComponent(guestId)}?token=${encodeURIComponent(token)}`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error: any) {
    console.error("[Next.js CheckIn Route] Error:", error.message);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to reach check-in service." },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ guestId: string }> }
) {
  try {
    const { guestId } = await params;
    const body = await request.json().catch(() => ({}));
    const searchParams = request.nextUrl.searchParams;
    const token = body.token || searchParams.get("token") || "";

    const backendBase = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api")
      .replace(/\/+$/, "")
      .replace(/\/api$/, "");

    const url = `${backendBase}/api/check-ins/verify/${encodeURIComponent(guestId)}`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ token }),
      cache: "no-store",
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error: any) {
    console.error("[Next.js CheckIn Route POST] Error:", error.message);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to reach check-in service." },
      { status: 500 }
    );
  }
}
