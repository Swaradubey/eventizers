import { NextRequest, NextResponse } from "next/server";
import { triggerProcessNoShows } from "@/lib/cron/processNoShows";

export async function GET(req: NextRequest) {
  try {
    const result = await triggerProcessNoShows();
    return NextResponse.json(result, { status: result.success ? 200 : 500 });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error?.message || "Internal server error during no-shows processing",
      },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const result = await triggerProcessNoShows();
    return NextResponse.json(result, { status: result.success ? 200 : 500 });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error?.message || "Internal server error during no-shows processing",
      },
      { status: 500 }
    );
  }
}
