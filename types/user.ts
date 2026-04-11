export interface Certification {
  name: string;
  membershipNumber: string;
}

export interface ProfessionalDetails {
  professionalTitle: string;
  certifications: Certification[];
  yearsOfExperience: number;
  industrySpecialization: string;
  specializedSkills: string[];
}

export interface SecurityPreferences {
  emailAlertsEnabled: boolean;
  sessionTimeoutEnabled: boolean;
}

export interface UpdateUserInput {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  address?: string;
  title?: string;
}

export interface UpdateProfessionalDetailsInput {
  certifications: Certification[];
  yearsOfExperience: number;
  industrySpecialization: string;
  specializedSkills: string[];
}

export interface UpdateSecurityPreferencesInput {
  emailAlertsEnabled: boolean;
  sessionTimeoutEnabled: boolean;
}
