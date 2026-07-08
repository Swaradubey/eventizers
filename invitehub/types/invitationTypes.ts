export interface Invitation {
  id: string;
  eventId: string;
  eventTitle?: string;
  title: string;
  subtitle?: string;
  mainText?: string;
  accentColor: string;
  backgroundColor: string;
  textColor: string;
  titleSize: number;
  fontWeight: string;
  fontFamily: string;
  textAlignment: string;
  imageUrl?: string;
  buttonText: string;
  buttonColor: string;
  buttonRadius: number;
  status: "draft" | "published";
  createdAt?: string;
  updatedAt?: string;
}

export interface InvitationPayload {
  id?: string;
  eventId: string;
  title: string;
  subtitle?: string;
  mainText?: string;
  accentColor?: string;
  backgroundColor?: string;
  textColor?: string;
  titleSize?: number;
  fontWeight?: string;
  fontFamily?: string;
  textAlignment?: string;
  imageUrl?: string;
  buttonText?: string;
  buttonColor?: string;
  buttonRadius?: number;
  status?: "draft" | "published";
}

export interface InvitationResponse {
  success: boolean;
  message?: string;
  invitation: Invitation;
}

export interface InvitationsResponse {
  success: boolean;
  message?: string;
  invitations: Invitation[];
}

export interface SendInvitationResponse {
  success: boolean;
  message: string;
}
