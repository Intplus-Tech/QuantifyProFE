export interface Client {
  _id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  industry: string;
  status: "active" | "inactive";
  companyId: string;
  contactPerson?: string;
  website?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
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

