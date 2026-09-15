import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const eventId = params.id;
    const token = request.headers.get("authorization");
    const cookie = request.headers.get("cookie");

    const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
    const res = await fetch(`${backendUrl}/events/${eventId}/rsvp-settings`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: token } : {}),
        ...(cookie ? { Cookie: cookie } : {}),
      },
      cache: "no-store",
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error: any) {
    console.error("Next.js API get-rsvp-settings error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const eventId = params.id;
    const body = await request.json();
    const token = request.headers.get("authorization");
    const cookie = request.headers.get("cookie");

    const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
    const res = await fetch(`${backendUrl}/events/${eventId}/rsvp-settings`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: token } : {}),
        ...(cookie ? { Cookie: cookie } : {}),
      },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error: any) {
    console.error("Next.js API update-rsvp-settings (PUT) error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const eventId = params.id;
    const body = await request.json();
    const token = request.headers.get("authorization");
    const cookie = request.headers.get("cookie");

    const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
    const res = await fetch(`${backendUrl}/events/${eventId}/rsvp-settings`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: token } : {}),
        ...(cookie ? { Cookie: cookie } : {}),
      },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error: any) {
    console.error("Next.js API update-rsvp-settings (PATCH) error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
