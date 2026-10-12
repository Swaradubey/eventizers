import { NextRequest, NextResponse } from "next/server";
import { GET as getHandler } from "@/app/api/video-status/[predictionId]/route";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ predictionId: string }> | { predictionId: string } }
) {
  return getHandler(req, context);
}
