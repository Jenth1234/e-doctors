import type { PayloadRequest } from "payload";
import { getPayloadClient } from '../get-payload';

export const createDoctor = async (doctorData: any) => {
  try {
    const payload = await getPayloadClient();
    
    // 1. Tạo user trước với role doctor
    const newUser = await payload.create({
      collection: 'users',
      data: {
        name: doctorData.name,
        email: doctorData.email,
        password: doctorData.password,
        roles: ['doctor'],
      },
    });

    // 2. Tạo doctor và liên kết với user
    const newDoctor = await payload.create({
      collection: 'doctors',
      data: {
        user: newUser.id, // Liên kết với user vừa tạo
        specialization: doctorData.specialization,
        degree: doctorData.degree,
        experience: Number(doctorData.experience),
        location: doctorData.location,
        bio: doctorData.bio,
        phone: doctorData.phone,
      },
    });

    return { 
      user: newUser,
      doctor: newDoctor
    };
  } catch (error) {
    console.error('Error creating doctor:', error);
    throw error;
  }
};