export interface InvitationDetails {
  id: string;
  email: string;
  role: "OWNER" | "ADMIN" | "CASHIER" | "DELIVERY";
  store: {
    id: string;
    name: string;
    logo: string | null;
  };
  invitedBy: string;
  expiresAt: string;
  userExists: boolean;
}

export interface AcceptInvitationResponse {
  user: {
    id: string;
    email: string;
    name: string;
  };
  store: {
    id: string;
    name: string;
    slug: string;
  };
  role: string;
  token: string;
}

export interface AcceptExistingResponse {
  message: string;
  store: {
    id: string;
    name: string;
    slug: string;
  };
}
