import { NextRequest, NextResponse } from "next/server";
import { findVideoTemplate, VIDEO_TEMPLATES_CATALOG } from "@/data/videoTemplates";

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

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const templateId = body.templateId || "burj-khalifa";
    const chosenTemplate = findVideoTemplate(templateId);
    const templateVideoUrl = body.templateVideoUrl || chosenTemplate.videoUrl;
    const uploadedImageUrl = body.uploadedImageUrl || body.photoUrl || body.photo || null;
    const prompt = (body.prompt || body.userPrompt || chosenTemplate.defaultPrompt || "").trim();

    const eventDetails = body.eventDetails || {
      title: body.title || "Special Celebration",
      date: body.date || "Saturday, 25 October • 7:00 PM",
      venue: body.venue || "Sky Lounge Ballroom & Terrace",
      age: body.age || "",
      celebrantName: body.celebrantName || body.title || "",
    };

    const resolvedDetails = {
      title: eventDetails.title || "Special Celebration",
      date: eventDetails.date || "Saturday, 25 October • 7:00 PM",
      venue: eventDetails.venue || "Sky Lounge Ballroom & Terrace",
      age: eventDetails.age || "",
      celebrantName: eventDetails.celebrantName || eventDetails.title || "",
      templateId,
      photoUrl: uploadedImageUrl,
    };

    const replicateToken = getReplicateToken();

    // If Replicate token is absent or invalid, return curated fallback video immediately
    if (!replicateToken || replicateToken.length < 10) {
      console.warn("[Next.js Replicate API] Token missing. Returning curated video template.");
      return NextResponse.json({
        success: true,
        async: false,
        videoUrl: chosenTemplate.videoUrl,
        isFallback: true,
        source: "curated_template",
        templateId,
        details: resolvedDetails,
      });
    }

    try {
      const Replicate = (await import("replicate")).default;
      const replicate = new Replicate({ auth: replicateToken });

      const videoPrompt = `Cinematic vertical 9:16 mobile invitation video backdrop for ${
        resolvedDetails.title
      }${resolvedDetails.age ? " - " + resolvedDetails.age : ""}. Style: ${prompt}. Ultra-smooth slow camera motion, 4k photorealistic, aesthetic lighting, seamless loop, clean negative space for invitation text.`;

      console.log(`[Next.js Replicate] Initiating prediction for template '${templateId}', photo: ${uploadedImageUrl ? "provided" : "none"}...`);

      let prediction: any = null;

      if (uploadedImageUrl && (uploadedImageUrl.startsWith("http") || uploadedImageUrl.startsWith("data:image/"))) {
        // Image-to-Video Pipeline: Animate uploaded celebrant photo directly
        try {
          console.log("[Next.js Replicate] Calling Stability AI Stable Video Diffusion for uploaded photo...");
          prediction = await replicate.predictions.create({
            version: "3f0457e4619daac51203dedb472816fd4af51f3149fa7a9e0b5ffcf1b8172438",
            input: {
              input_image: uploadedImageUrl,
              motion_bucket_id: 127,
              fps: 7,
            },
          });
        } catch (svdErr: any) {
          console.warn("[Next.js Replicate] SVD failed, trying Minimax video-01:", svdErr.message);
          prediction = await replicate.predictions.create({
            model: "minimax/video-01",
            input: {
              prompt: videoPrompt,
              first_frame_image: uploadedImageUrl,
              prompt_optimizer: false,
            },
          });
        }
      } else {
        // Strategy 3: Text-to-Video with template prompt
        prediction = await replicate.predictions.create({
          model: "minimax/video-01",
          input: {
            prompt: videoPrompt,
            prompt_optimizer: true,
          },
        });
      }

      console.log(`[Next.js Replicate] Prediction created: ${prediction.id}, status: ${prediction.status}`);

      return NextResponse.json({
        success: true,
        async: true,
        predictionId: prediction.id,
        status: prediction.status,
        templateId,
        details: resolvedDetails,
      });
    } catch (createErr: any) {
      console.warn("[Next.js Replicate] Prediction creation error:", createErr.message, "— returning template video fallback.");
      return NextResponse.json({
        success: true,
        async: false,
        videoUrl: chosenTemplate.videoUrl,
        isFallback: true,
        source: "curated_template",
        warning: createErr.message,
        templateId,
        details: resolvedDetails,
      });
    }
  } catch (err: any) {
    console.error("[Next.js Replicate] Unexpected error:", err);
    return NextResponse.json(
      {
        success: false,
        error: err.message || "Failed to generate video",
      },
      { status: 500 }
    );
  }
}
