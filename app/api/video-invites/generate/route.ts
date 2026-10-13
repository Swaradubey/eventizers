import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:5000";

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get("content-type") || "";
    const authHeader = req.headers.get("authorization") || "";

    const headers: Record<string, string> = {};
    if (authHeader) headers["authorization"] = authHeader;

    let bodyData: any;
    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      bodyData = formData;
    } else {
      headers["content-type"] = "application/json";
      const json = await req.json();
      bodyData = JSON.stringify(json);
    }

    const backendRes = await fetch(`${BACKEND_URL}/api/video-invites/generate`, {
      method: "POST",
      headers,
      body: bodyData,
    });

    const data = await backendRes.json();
    return NextResponse.json(data, { status: backendRes.status });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to forward request to backend" },
      { status: 500 }
    );
  }
}
