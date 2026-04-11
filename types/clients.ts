export interface Client {
  _id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  clientCompanyName: string;
  industry: string;
  status: "active" | "inactive" | "pending_review";
  companyId: string;
  contactPerson?: string;
  website?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

/** Payload accepted by the PUT /clients/:id endpoint */
export interface UpdateClientPayload {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  clientCompanyName?: string;
  industry?: string;
  status?: Client["status"];
  contactPerson?: string;
  website?: string;
  notes?: string;
}

export interface ClientsStats {
  totalClients: number;
  activeClients: number;
  newClientsThisMonth: number;
  totalBoqValue: number;
  industryDistribution: {
    industry: string;
    count: number;
  }[];
}

