export interface SupportTicket {
  id: string;
  subject: string;
  status: string;
  [key: string]: any;
}

export interface CreateTicketInput {
  fullName: string;
  email: string;
  subject: string;
  description: string;
  category?: string;
}
