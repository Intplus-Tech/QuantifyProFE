export interface CompanyProfile {
  id: string;
  _id?: string;
  name?: string;
  legalName?: string;
  email: string;
  ownerId: string;
  type?: string;
  industry?: string;
  companySize?: string;
  address?: string;
  addresses?: any[];
  phone?: string;
  logo?: string;
  [key: string]: any;
}

export interface TeamMemberUser {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  profilePicture?: string;
}

export interface TeamMember {
  _id: string;
  id?: string;
  userId: TeamMemberUser;
  role: string;
  status: string;
  permissions?: string[];
}

}

export interface InviteMemberInput {
  email: string;
  fullName: string;
  permissions?: string[];
  role: string;
}

export interface UpdateTeamMemberInput {
  role: string;
  permissions: string[];
}

export interface AddLocationInput {
  name: string;
  address: string;
  city: string;
  state: string;
  country: string;
}

export interface UpdateCompanyInput {
  name?: string;
  legalName?: string;
  email?: string;
  phone?: string;
  address?: string;
  logo?: string;
  type?: string;
  industry?: string;
  companySize?: string;
}
