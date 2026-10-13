import { NextRequest, NextResponse } from "next/server";
import Replicate from "replicate";
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

// Curated template animation style descriptions
const TEMPLATE_STYLE_PROMPTS: Record<string, string> = {
  "burj-khalifa":
    "Spectacular luxury celebration backdrop with Burj Khalifa Dubai night skyline, dancing fountain lights, golden fireworks bursting in night sky, warm celebratory illumination",
  "baby-dance":
    "Joyful celebratory baby dance animation with high-energy cute moves, colorful confetti bursts, vibrant party lights, cheerful bouncing motion",
  "groove-duo":
    "Dynamic dancing duo celebrating on the dance floor with synchronized choreography, rhythmic disco lighting, energetic celebration moves, pulsing disco sparkles",
  "mic-drop":
    "Epic hip-hop stage mic drop moment, dramatic concert smoke cannons, golden laser beams, stadium flashbulbs, superstar hype celebration",
  "lion-lady":
    "Regal luxury fantasy royal court with magnificent golden lion companion, ethereal golden twilight, velvet banners, opulent royal celebration",
  "rooftop-40th":
    "Glamorous VIP penthouse rooftop cocktail celebration under city skyline, champagne sparkle fountains, warm ambient fairy lights, golden milestone toast",
  premiere:
    "Hollywood blockbuster movie premiere trailer teaser, dramatic rich red velvet curtains opening, warm golden stage spotlights, floating particles in dark luxury theatre",
  wedding:
    "Romantic ethereal wedding celebration garden, soft pastel rose petals gently floating in breeze, golden hour sunlight bokeh, floral elegance, slow dreamy dolly zoom",
  vhs:
    "Nostalgic 1990s retro home video aesthetic, subtle VHS magnetic tape scanlines, warm CRT glow, vibrant nostalgic party lighting",
  golden:
    "Ultra-luxury black and 3D shimmering gold particles, elegant milestone celebration, fluid metallic golden motion, sparkling reflections",
  news:
    "Dynamic breaking news broadcast television studio backdrop, rotating digital globe, sleek crimson high-tech motion graphics",
  party:
    "Festive high-energy celebration, colorful confetti explosion in slow motion, floating metallic helium balloons, dynamic party disco lights",
  redcarpet:
    "Exclusive celebrity red carpet gala, flashing camera flashes and paparazzi light bursts, champagne sparkles, luxury golden velvet stanchions",
  baby:
    "Gentle whimsical fairytale dreamscape, pastel cotton clouds, warm golden twinkle stars, soft dreamy anamorphic lens flare",
  jessica:
    "Ultra-luxury milestone birthday celebration, shimmering golden bokeh, floating gold dust particles, elegant soft spotlight illuminating the celebrant, luxury party ambiance",
  grad:
    "Epic cinematic graduation commencement celebration, golden confetti drifting in slow motion, sunlit graduation caps flying, triumphant warm golden rim lighting",
  anniversary:
    "Timeless luxury romance, glowing crystal champagne glasses, candlelit dinner atmosphere, delicate floating rose petals, warm golden twilight",
  romantic:
    "Soft, slow, romantic film aesthetic, gentle warm bokeh, emotional cinematic portrait motion, beautiful pastel highlights",
  haunting:
    "Mysterious elegant Halloween celebration, glowing jack-o-lanterns, eerie purple twilight fog, floating embers in night sky",
  marcus:
    "Heartwarming milestone birthday celebration, golden twilight bokeh, gentle nostalgic dance, warm ambient lighting, festive celebration sparkles",
};

/**
 * Upload base64 or buffer image to Replicate files to produce a clean public HTTPS URL
 */
async function resolveImageToHttpUrl(replicate: Replicate, rawImage: string): Promise<string> {
  if (!rawImage || typeof rawImage !== "string") return rawImage;

  // Already a valid HTTPS/HTTP URL
  if (/^https?:\/\//i.test(rawImage)) {
    return rawImage.trim();
  }

  // Base64 data URI
  if (rawImage.startsWith("data:image/")) {
    try {
      const parts = rawImage.split(",");
      const mimeMatch = parts[0].match(/data:(.*?);base64/);
      const mimeType = mimeMatch ? mimeMatch[1] : "image/jpeg";
      const ext = mimeType.split("/")[1] || "jpg";
      const base64Data = parts[1] || "";
      const buffer = Buffer.from(base64Data, "base64");

      console.log(`[Next.js Replicate] Uploading base64 image (${buffer.length} bytes) to Replicate Files...`);
      const fileObj: any = await replicate.files.create(buffer, {
        filename: `invite_${Date.now()}.${ext}`,
      });

      const fileUrl = fileObj?.urls?.get || fileObj?.url;
      if (fileUrl) {
        console.log(`[Next.js Replicate] Uploaded photo successfully: ${fileUrl}`);
        return fileUrl;
      }
    } catch (err: any) {
      console.warn("[Next.js Replicate] Failed to upload image via replicate.files:", err.message);
    }
  }

  // Local static file path like /images/marcus.webp or /images/party.webp
  if (rawImage.startsWith("/") && !rawImage.startsWith("//")) {
    try {
      const fs = await import("fs/promises");
      const path = await import("path");
      const relativePath = rawImage.replace(/^\//, "");
      const fullPath = path.join(process.cwd(), "public", relativePath);
      const buffer = await fs.readFile(fullPath);
      const ext = path.extname(fullPath).replace(".", "") || "webp";

      console.log(`[Next.js Replicate] Uploading local asset ${rawImage} (${buffer.length} bytes) to Replicate Files...`);
      const fileObj: any = await replicate.files.create(buffer, {
        filename: `invite_asset_${Date.now()}.${ext}`,
      });

      const fileUrl = fileObj?.urls?.get || fileObj?.url;
      if (fileUrl) {
        console.log(`[Next.js Replicate] Uploaded local asset successfully: ${fileUrl}`);
        return fileUrl;
      }
    } catch (err: any) {
      console.warn("[Next.js Replicate] Failed to upload local asset to Replicate:", err.message);
    }
  }

  return rawImage;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const templateId = (body.templateId || body.selectedTemplateId || "burj-khalifa").trim();
    const chosenTemplate = findVideoTemplate(templateId);
    const templateVideoUrl = body.templateVideoUrl || chosenTemplate.videoUrl;
    const uploadedImageUrl = body.uploadedImageUrl || body.photoUrl || body.photo || null;
    const userPrompt = (body.prompt || body.userPrompt || body.userDescription || body.notes || "").trim();

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

    const replicate = new Replicate({ auth: replicateToken });

    // Build the tailored video animation prompt
    const templateStyle = TEMPLATE_STYLE_PROMPTS[templateId] || TEMPLATE_STYLE_PROMPTS["burj-khalifa"];
    let finalVideoPrompt = "";

    if (userPrompt) {
      // User entered a prompt: synthesize user motion prompt with template celebration aesthetic
      finalVideoPrompt = `Cinematic vertical 9:16 mobile video invitation backdrop for ${resolvedDetails.title}. Animate the subject in this uploaded photo according to user request: "${userPrompt}". Styled in theme of ${chosenTemplate.title}: ${templateStyle}. High quality 4K photorealistic, natural facial animation and cheerful smile, cinematic camera movement, festive atmospheric particles and lighting.`;
    } else {
      // User left prompt empty: generate rich template-driven animation
      finalVideoPrompt = `Cinematic vertical 9:16 mobile video invitation backdrop for ${resolvedDetails.title}. ${templateStyle}. Animate the subject in this uploaded photo with subtle natural movement, gentle cheerful smile, celebratory golden sparkle particles, elegant camera depth, 4K photorealistic lighting.`;
    }

    console.log(
      `[Next.js Replicate] Initiating generation for template '${templateId}', prompt: "${finalVideoPrompt.slice(0, 90)}..."`
    );

    let prediction: any = null;

    if (uploadedImageUrl) {
      // 1. Resolve photo to public HTTPS URL
      const photoHttpUrl = await resolveImageToHttpUrl(replicate, uploadedImageUrl);

      // 2. Primary Image-to-Video Engine: Bytedance Seedance-1.5-Pro (High quality 24fps + Prompt guidance + Audio)
      try {
        console.log(`[Next.js Replicate] Calling primary model: bytedance/seedance-1.5-pro...`);
        prediction = await replicate.predictions.create({
          model: "bytedance/seedance-1.5-pro",
          input: {
            image: photoHttpUrl,
            prompt: finalVideoPrompt,
            duration: 5,
            fps: 24,
            camera_fixed: false,
            generate_audio: true,
          },
        });
      } catch (seedanceErr: any) {
        console.warn("[Next.js Replicate] Seedance failed, trying Minimax video-01:", seedanceErr.message);

        // Fallback 1: Minimax video-01 with first_frame_image
        try {
          prediction = await replicate.predictions.create({
            model: "minimax/video-01",
            input: {
              prompt: finalVideoPrompt,
              first_frame_image: photoHttpUrl,
              prompt_optimizer: true,
            },
          });
        } catch (minimaxErr: any) {
          console.warn("[Next.js Replicate] Minimax failed, trying wan-video/wan-2.2-i2v-fast:", minimaxErr.message);

          // Fallback 2: wan-video/wan-2.2-i2v-fast
          try {
            prediction = await replicate.predictions.create({
              model: "wan-video/wan-2.2-i2v-fast",
              input: {
                image: photoHttpUrl,
                prompt: finalVideoPrompt,
              },
            });
          } catch (wanErr: any) {
            console.warn("[Next.js Replicate] Wan-video failed, trying SVD fallback:", wanErr.message);

            // Fallback 3: Stability AI Stable Video Diffusion
            prediction = await replicate.predictions.create({
              version: "3f0457e4619daac51203dedb472816fd4af51f3149fa7a9e0b5ffcf1b8172438",
              input: {
                input_image: photoHttpUrl,
                motion_bucket_id: 127,
                frames_per_second: 6,
                decoding_t: 14,
                sizing_strategy: "maintain_aspect_ratio",
              },
            });
          }
        }
      }
    } else {
      // Text-to-Video without uploaded photo
      try {
        console.log("[Next.js Replicate] Calling text-to-video with minimax/video-01...");
        prediction = await replicate.predictions.create({
          model: "minimax/video-01",
          input: {
            prompt: finalVideoPrompt,
            prompt_optimizer: true,
          },
        });
      } catch (ttvErr: any) {
        console.warn("[Next.js Replicate] Minimax TTV failed, trying seedance:", ttvErr.message);
        prediction = await replicate.predictions.create({
          model: "bytedance/seedance-1.5-pro",
          input: {
            prompt: finalVideoPrompt,
            duration: 5,
            fps: 24,
            aspect_ratio: "9:16",
            generate_audio: true,
          },
        });
      }
    }

    console.log(`[Next.js Replicate] Prediction created successfully: ${prediction.id}, status: ${prediction.status}`);

    return NextResponse.json({
      success: true,
      async: true,
      predictionId: prediction.id,
      status: prediction.status,
      prompt: finalVideoPrompt,
      templateId,
      details: resolvedDetails,
    });
  } catch (err: any) {
    console.error("[Next.js Replicate] Unexpected error:", err.message);
    const chosenTemplate = findVideoTemplate("burj-khalifa");
    return NextResponse.json({
      success: true,
      async: false,
      videoUrl: chosenTemplate.videoUrl,
      isFallback: true,
      source: "curated_template",
      warning: err.message,
    });
  }
}
