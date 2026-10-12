import { NextRequest, NextResponse } from "next/server";

const FALLBACK_REPLICATE_TOKEN = Buffer.from(
  "cjhfNzI4bDd6cU1SeTVXRk5GMm54bEtZTW9uTHNUSkgxbzFoc2RtdA==",
  "base64"
).toString("utf8");

function getReplicateToken() {
  const token = process.env.REPLICATE_API_TOKEN;
  if (token && token.trim().length > 10 && token !== "your_replicate_api_token") {
    return token.trim();
  }
  return FALLBACK_REPLICATE_TOKEN;
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ predictionId: string }> | { predictionId: string } }
) {
  try {
    const resolvedParams = await Promise.resolve(params);
    const predictionId = resolvedParams.predictionId;

    if (!predictionId) {
      return NextResponse.json({ success: false, error: "Prediction ID required" }, { status: 400 });
    }

    const replicateToken = getReplicateToken();
    if (!replicateToken) {
      return NextResponse.json({ success: false, error: "Replicate token not configured" }, { status: 500 });
    }

    const Replicate = (await import("replicate")).default;
    const replicate = new Replicate({ auth: replicateToken });

    const prediction = await replicate.predictions.get(predictionId);
    console.log(`[Next.js Replicate Status] ${predictionId}: ${prediction.status}`);

    let videoUrl = null;
    if (prediction.status === "succeeded") {
      if (typeof prediction.output === "string") {
        videoUrl = prediction.output;
      } else if (Array.isArray(prediction.output) && prediction.output.length > 0) {
        videoUrl = prediction.output[0];
      }
    }

    return NextResponse.json({
      success: true,
      status: prediction.status,
      videoUrl,
      error: prediction.error || null,
    });
  } catch (err: any) {
    console.error("[Next.js Replicate Status] Error:", err.message);
    return NextResponse.json(
      {
        success: false,
        error: err.message || "Failed to fetch status",
      },
      { status: 500 }
    );
  }
}
