export interface DashboardStats {
  totalProjectValue: number;
  projects: {
    count: number;
    limit: number;
  };
  boqCount: number;
  plan: {
    name: string;
    slug: string;
  };
  subscriptionStatus: string;
}

export interface DashboardStatsResponse {
  success: boolean;
  message: string;
  data: DashboardStats;
  timestamp: string;
}
