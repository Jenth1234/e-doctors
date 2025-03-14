import { create } from 'zustand';

interface Avatar {
  id: string;
  url: string;
}

export  interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  gender: string;
  dob: string;
  avatar?: Avatar;
}

export  interface MedicalHistory {
  chronicDiseases: string[];
  allergies: string[];
  surgeries: string[];
  otherConditions?: string;
}

export  interface Profile {
  id: string;
  user: User;
  phone: string;
  address: string;
  gender: string;
  dob: string;
  medicalHistory?: MedicalHistory;
}

export interface UserStore {
  profiles: Profile[];
  setProfiles: (profiles: Profile[]) => void;
  updateProfile: (updatedProfile: Partial<Profile>) => void;
}

export const useUserStore = create<UserStore>((set) => ({
  profiles: [],
  setProfiles: (profiles) => set({ profiles }),

  updateProfile: (updatedProfile) =>
    set((state) => ({
      profiles: state.profiles.map((profile) =>
        profile.id === updatedProfile.id
          ? {
              ...profile,
              ...updatedProfile,
              user: { ...profile.user, ...updatedProfile.user },
              medicalHistory: {
                chronicDiseases: profile.medicalHistory?.chronicDiseases ?? [],
                allergies: profile.medicalHistory?.allergies ?? [],
                surgeries: profile.medicalHistory?.surgeries ?? [],
                otherConditions: profile.medicalHistory?.otherConditions ?? '',
                ...updatedProfile.medicalHistory,
              },
            }
          : profile
      ),
    })),
}));

// Định nghĩa Zustand store
export interface MedicalRecordState {
  recordId: string | null; 
  medicalHistory: {
    chronicDiseases: string[];
    allergies: string[];
    surgeries: string[];
    otherConditions: string;
  };
  examinationDate: string;
  setField: (field: keyof MedicalRecordState, value: any) => void;
}

export const useMedicalRecordStore = create<MedicalRecordState>((set) => ({
  recordId: null,
  medicalHistory: {
    chronicDiseases: [],
    allergies: [],
    surgeries: [],
    otherConditions: '',
  },
  examinationDate: '',
  setField: (field, value) => set((state) => ({ ...state, [field]: value })),
}));