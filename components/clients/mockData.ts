export type ClientStatus = "Active" | "Pending Review" | "Inactive";
export type ClientIndustry =
  | "Infrastructure"
  | "Residential"
  | "Public Works"
  | "Commercial"
  | "Industrial"
  | "Healthcare";

export interface Client {
  id: number;
  initials: string;
  avatarBg: string;
  name: string;
  company: string;
  industry: ClientIndustry;
  status: ClientStatus;
  projects: number;
  /** Raw numeric value in NGN for sorting */
  valueRaw: number;
}

export const mockClients: Client[] = [
  {
    id: 1,
    initials: "AN",
    avatarBg: "bg-orange-100 text-orange-700",
    name: "Ahmed Nasser",
    company: "Global Build Co.",
    industry: "Infrastructure",
    status: "Active",
    projects: 12,
    valueRaw: 32_211_240_000,
  },
  {
    id: 2,
    initials: "SM",
    avatarBg: "bg-violet-100 text-violet-700",
    name: "Sarah Miller",
    company: "Metro Developers Ltd.",
    industry: "Residential",
    status: "Active",
    projects: 8,
    valueRaw: 132_211_240_000,
  },
  {
    id: 3,
    initials: "DH",
    avatarBg: "bg-slate-100 text-slate-700",
    name: "David Hughes",
    company: "Public Works Dept.",
    industry: "Public Works",
    status: "Pending Review",
    projects: 3,
    valueRaw: 332_211_240_000,
  },
  {
    id: 4,
    initials: "LJ",
    avatarBg: "bg-rose-100 text-rose-700",
    name: "Lisa Johnson",
    company: "Urban Core Design",
    industry: "Commercial",
    status: "Active",
    projects: 21,
    valueRaw: 12_132_211_240_000,
  },
  {
    id: 5,
    initials: "MK",
    avatarBg: "bg-emerald-100 text-emerald-700",
    name: "Michael Kim",
    company: "Nexus Infrastructure Ltd.",
    industry: "Infrastructure",
    status: "Active",
    projects: 17,
    valueRaw: 8_500_000_000,
  },
  {
    id: 6,
    initials: "FA",
    avatarBg: "bg-amber-100 text-amber-700",
    name: "Fatima Al-Rashid",
    company: "Al-Rashid Construction",
    industry: "Commercial",
    status: "Active",
    projects: 9,
    valueRaw: 4_200_000_000,
  },
  {
    id: 7,
    initials: "TC",
    avatarBg: "bg-sky-100 text-sky-700",
    name: "Thomas Chen",
    company: "Pacific Residential Group",
    industry: "Residential",
    status: "Pending Review",
    projects: 5,
    valueRaw: 1_850_000_000,
  },
  {
    id: 8,
    initials: "RP",
    avatarBg: "bg-teal-100 text-teal-700",
    name: "Rachel Patel",
    company: "Healthcore Builders",
    industry: "Healthcare",
    status: "Active",
    projects: 6,
    valueRaw: 22_700_000_000,
  },
  {
    id: 9,
    initials: "OB",
    avatarBg: "bg-indigo-100 text-indigo-700",
    name: "Oluwaseun Bello",
    company: "Bello Industrial Co.",
    industry: "Industrial",
    status: "Active",
    projects: 14,
    valueRaw: 55_000_000_000,
  },
  {
    id: 10,
    initials: "KW",
    avatarBg: "bg-pink-100 text-pink-700",
    name: "Karen Walsh",
    company: "Walsh & Partners",
    industry: "Commercial",
    status: "Inactive",
    projects: 2,
    valueRaw: 980_000_000,
  },
  {
    id: 11,
    initials: "JO",
    avatarBg: "bg-lime-100 text-lime-700",
    name: "James Okafor",
    company: "Federal Roads Authority",
    industry: "Public Works",
    status: "Active",
    projects: 30,
    valueRaw: 210_000_000_000,
  },
  {
    id: 12,
    initials: "NM",
    avatarBg: "bg-cyan-100 text-cyan-700",
    name: "Nadia Moreira",
    company: "Moreira Homes",
    industry: "Residential",
    status: "Active",
    projects: 11,
    valueRaw: 6_300_000_000,
  },
  {
    id: 13,
    initials: "PW",
    avatarBg: "bg-fuchsia-100 text-fuchsia-700",
    name: "Paul Williams",
    company: "Williams Industrial Corp.",
    industry: "Industrial",
    status: "Pending Review",
    projects: 4,
    valueRaw: 18_400_000_000,
  },
  {
    id: 14,
    initials: "AS",
    avatarBg: "bg-orange-100 text-orange-700",
    name: "Amira Suleiman",
    company: "Suleiman Health Projects",
    industry: "Healthcare",
    status: "Active",
    projects: 7,
    valueRaw: 34_000_000_000,
  },
  {
    id: 15,
    initials: "GB",
    avatarBg: "bg-slate-100 text-slate-700",
    name: "Greg Barnes",
    company: "Barnes Civil Engineering",
    industry: "Infrastructure",
    status: "Inactive",
    projects: 1,
    valueRaw: 450_000_000,
  },
];

export const INDUSTRY_COLORS: Record<ClientIndustry, string> = {
  Infrastructure: "bg-blue-50 text-blue-700",
  Residential: "bg-purple-50 text-purple-700",
  "Public Works": "bg-yellow-50 text-yellow-700",
  Commercial: "bg-green-50 text-green-700",
  Industrial: "bg-orange-50 text-orange-700",
  Healthcare: "bg-rose-50 text-rose-700",
};

export const STATUS_COLORS: Record<ClientStatus, string> = {
  Active: "bg-green-500",
  "Pending Review": "bg-yellow-500",
  Inactive: "bg-slate-400",
};

export function formatValue(raw: number): string {
  return raw.toLocaleString("en-NG");
}
