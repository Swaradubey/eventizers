export interface TemplateOption {
  id: string;
  title: string;
  category: string;
  tier: "Included" | "Premium" | "Signature";
  thumbnail: string;
  stylePrefix: string;
  sampleDescription?: string;
  aspectRatio?: string;
}

export interface VideoInviteFormState {
  selectedTemplateId: string;
  eventDescription: string;
  isViral: boolean;
  viralModifiers: string[];
  eventTitle: string;
  eventDate: string;
  eventVenue: string;
  uploadedPhoto: File | null;
  uploadedPhotoPreview: string | null;
  uploadedPhotoUrl: string | null;
  designAsset: File | null;
  designAssetPreview: string | null;
  designUrl: string | null;
}

export interface CreateAiTemplateRequest {
  selectedTemplateId: string;
  userDescription?: string;
  prompt?: string;
  isViral?: boolean;
  viralModifiers?: string[];
  uploadedPhotoUrl?: string;
  designUrl?: string;
  eventTitle?: string;
  eventDate?: string;
  eventVenue?: string;
  waitForCompletion?: boolean;
}

export interface CreateAiTemplateResponse {
  success: boolean;
  videoUrl?: string;
  inviteId?: string;
  predictionId?: string;
  status?: "starting" | "processing" | "succeeded" | "failed" | "canceled";
  async?: boolean;
  prompt?: string;
  template?: {
    id: string;
    title: string;
    stylePrefix: string;
  };
  details?: {
    title: string;
    date: string;
    venue: string;
    photoUrl?: string;
  };
  warning?: string;
  error?: string;
}

export interface VideoStatusResponse {
  success: boolean;
  status: "starting" | "processing" | "succeeded" | "failed" | "canceled";
  videoUrl?: string | null;
  inviteId?: string;
  error?: string | null;
  progressPercentage?: number;
  stageMessage?: string;
  refunded?: boolean;
  remainingCredits?: number;
}

export type VideoCreationMode = "template" | "describe" | "upload";

export interface VideoInviteGenerateRequest {
  creationMode: "template" | "describe";
  templateId?: string;
  prompt?: string;
  userDescription?: string;
  uploadedPhotoUrl?: string;
  photo?: File;
  aspectRatio?: "9:16" | "16:9" | "1:1";
  eventTitle?: string;
  eventDate?: string;
  eventVenue?: string;
  isViral?: boolean;
  waitForCompletion?: boolean;
}

export interface VideoInviteGenerateResponse {
  success: boolean;
  async?: boolean;
  predictionId?: string;
  videoUrl?: string;
  remainingCredits: number;
  status?: "starting" | "processing" | "succeeded" | "failed" | "canceled";
  message?: string;
  error?: string;
  prompt?: string;
  requiresCredits?: boolean;
  requiresPhoto?: boolean;
  refunded?: boolean;
  isFallback?: boolean;
}

export interface BuyCreditsRequest {
  amount: number;
}

export interface BuyCreditsResponse {
  success: boolean;
  credits: number;
  addedAmount?: number;
  message?: string;
  error?: string;
}

export interface CreditsBalanceResponse {
  success: boolean;
  credits: number;
  error?: string;
}

export interface CreateEventModalProps {
  isOpen?: boolean;
  initialMode?: "video" | "ai" | "viral" | "photos" | "upload";
  initialTemplateId?: string;
  initialPhotoUrl?: string;
  onClose?: () => void;
  onSuccess?: (result: { videoUrl: string; inviteId: string; details: any }) => void;
}

