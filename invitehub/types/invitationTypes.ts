export interface Invitation {
  id: string;
  eventId: string;
  templateId?: string;
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
  // User-editable event detail overrides
  eventDate?: string;
  eventTime?: string;
  eventVenue?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface InvitationPayload {
  id?: string;
  eventId: string;
  templateId?: string;
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
  // User-editable event detail overrides
  eventTitle?: string;
  eventDate?: string;
  eventTime?: string;
  eventVenue?: string;
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
