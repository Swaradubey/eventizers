import { NextRequest } from "next/server";
import { POST as postHandler } from "@/app/api/generate-video/route";

export async function POST(req: NextRequest) {
  return postHandler(req);
}
