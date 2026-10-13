import API from "./api";
import {
  VideoInviteGenerateRequest,
  VideoInviteGenerateResponse,
  VideoStatusResponse,
  BuyCreditsResponse,
  CreditsBalanceResponse,
} from "@/types/videoInvite";

export const videoInviteService = {
  /**
   * Generates a video invite via ByteDance Seedance model on Replicate
   * Checks balance and deducts 2 credits atomically on backend
   */
  async generateVideo(
    data: VideoInviteGenerateRequest
  ): Promise<VideoInviteGenerateResponse> {
    const formData = new FormData();
    formData.append("creationMode", data.creationMode);
    if (data.templateId) formData.append("selectedTemplateId", data.templateId);
    if (data.prompt) formData.append("prompt", data.prompt);
    if (data.userDescription) formData.append("userDescription", data.userDescription);
    if (data.eventTitle) formData.append("eventTitle", data.eventTitle);
    if (data.eventDate) formData.append("eventDate", data.eventDate);
    if (data.eventVenue) formData.append("eventVenue", data.eventVenue);
    if (data.aspectRatio) formData.append("aspectRatio", data.aspectRatio);
    if (data.isViral) formData.append("isViral", "true");
    if (data.waitForCompletion) formData.append("waitForCompletion", "true");

    if (data.photo) {
      formData.append("photo", data.photo);
    } else if (data.uploadedPhotoUrl) {
      formData.append("uploadedPhotoUrl", data.uploadedPhotoUrl);
    }

    const response = await API.post<VideoInviteGenerateResponse>(
      "/video-invites/generate",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        timeout: 90_000,
      }
    );
    return response.data;
  },

  /**
   * Polls Replicate prediction status and handles rollback on failure
   */
  async checkStatus(predictionId: string): Promise<VideoStatusResponse> {
    const response = await API.get<VideoStatusResponse>(
      `/video-invites/status/${predictionId}`
    );
    return response.data;
  },

  /**
   * Fetches current credit balance for the user or guest session
   */
  async getCredits(): Promise<CreditsBalanceResponse> {
    const response = await API.get<CreditsBalanceResponse>(
      "/video-invites/credits"
    );
    return response.data;
  },

  /**
   * Purchases/adds credits to the account
   */
  async buyCredits(amount: number = 20): Promise<BuyCreditsResponse> {
    const response = await API.post<BuyCreditsResponse>(
      "/video-invites/buy-credits",
      { amount }
    );
    return response.data;
  },
};

export default videoInviteService;
