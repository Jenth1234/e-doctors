// src/app/(frontend)/doctors/page.tsx

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link'; // Import Link để sử dụng cho chuyển hướng
import Image from 'next/image'; // Add this import
import Modal from '@/components/Modal'; // Import modal component
import { Button } from '@/components/ui/button'; // Import button component
import { Calendar, MapPin, Phone, Award, BookOpen, Clock } from 'lucide-react';

interface Doctor {
  id: string;
  user?: {
    id: string;
    name: string;
    email: string;
    avatar?: {
      url: string;
    };
  };
  name?: string; // Cho trường hợp không có user
  email?: string;
  specialization: string;
  degree: string;
  experience: number;
  location: string;
  bio: string;
  phone: string;
}

export default function DoctorsPage() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>('all');

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const res = await fetch('/api/doctors');
        if (!res.ok) throw new Error('Không thể lấy thông tin bác sĩ');
        const data = await res.json();
        setDoctors(data.docs);
      } catch (err) {
        console.error('Error fetching doctors:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDoctors();
  }, []);

  const specialties = ['all', ...new Set(doctors.map(doctor => doctor.specialization))];
  
  const filteredDoctors = doctors.filter(doctor => {
    const matchesSearch = doctor.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doctor.specialization.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSpecialty = selectedSpecialty === 'all' || doctor.specialization === selectedSpecialty;
    return matchesSearch && matchesSpecialty;
  });

  // Thay đổi cách hiển thị tên và avatar
  const getDoctorName = (doctor: Doctor) => {
    return doctor.user?.name || doctor.name || 'Chưa có tên';
  };

  const getDoctorAvatar = (doctor: Doctor) => {
    if (doctor.user?.avatar?.url) {
      return doctor.user.avatar.url;
    }
    return null;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Đội ngũ Bác sĩ chuyên môn</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Đội ngũ bác sĩ giàu kinh nghiệm của chúng tôi luôn sẵn sàng chăm sóc sức khỏe cho bạn
        </p>
      </div>

      {/* Thanh tìm kiếm và lọc */}
      <div className="mb-8 flex flex-col md:flex-row gap-4 justify-between items-center">
        <input
          type="text"
          placeholder="Tìm kiếm theo tên bác sĩ hoặc chuyên khoa..."
          className="w-full md:w-96 px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select
          value={selectedSpecialty}
          onChange={(e) => setSelectedSpecialty(e.target.value)}
          className="w-full md:w-64 px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="all">Tất cả chuyên khoa</option>
          {specialties.filter(s => s !== 'all').map(specialty => (
            <option key={specialty} value={specialty}>{specialty}</option>
          ))}
        </select>
      </div>

      {/* Danh sách bác sĩ */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDoctors.map((doctor) => (
          <div
            key={doctor.id}
            className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden cursor-pointer"
            onClick={() => {
              setSelectedDoctor(doctor);
              setIsModalOpen(true);
            }}
          >
            <div className="relative">
              <div className="aspect-w-16 aspect-h-9 bg-gradient-to-b from-primary/20 to-primary/10">
                {getDoctorAvatar(doctor) ? (
                  <Image
                    src={getDoctorAvatar(doctor) || ''}
                    alt={getDoctorName(doctor)}
                    width={128}
                    height={128}
                    className="w-32 h-32 rounded-full mx-auto mt-6 border-4 border-white shadow-lg object-cover"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-full mx-auto mt-6 border-4 border-white shadow-lg bg-primary/10 flex items-center justify-center">
                    <span className="text-4xl font-bold text-primary">
                      {getDoctorName(doctor).charAt(0)}
                    </span>
                  </div>
                )}
              </div>
            </div>
            <div className="p-6">
              <h3 className="text-xl font-bold text-center text-gray-900 mb-2">
                {getDoctorName(doctor)}
              </h3>
              <p className="text-primary text-center font-medium mb-4">{doctor.specialization}</p>
              <div className="space-y-2 text-gray-600">
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4" />
                  <span>{doctor.degree}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>{doctor.experience} năm kinh nghiệm</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  <span>{doctor.location}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal chi tiết bác sĩ */}
      {selectedDoctor && (
        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
          <div className="p-6 max-w-2xl mx-auto">
            <div className="flex flex-col items-center mb-6">
              {getDoctorAvatar(selectedDoctor) ? (
                <Image
                  src={getDoctorAvatar(selectedDoctor) || ''}
                  alt={getDoctorName(selectedDoctor)}
                  width={160}
                  height={160}
                  className="w-40 h-40 rounded-full border-4 border-white shadow-lg mb-4"
                />
              ) : (
                <div className="w-40 h-40 rounded-full border-4 border-white shadow-lg mb-4 bg-primary/10 flex items-center justify-center">
                  <span className="text-5xl font-bold text-primary">
                    {getDoctorName(selectedDoctor).charAt(0)}
                  </span>
                </div>
              )}
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                {getDoctorName(selectedDoctor)}
              </h2>
              <p className="text-primary font-medium text-lg mb-4">
                {selectedDoctor.specialization}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Award className="w-5 h-5 text-primary" />
                  <div>
                    <p className="font-medium">Học vị</p>
                    <p className="text-gray-600">{selectedDoctor.degree}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-primary" />
                  <div>
                    <p className="font-medium">Kinh nghiệm</p>
                    <p className="text-gray-600">{selectedDoctor.experience} năm</p>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-primary" />
                  <div>
                    <p className="font-medium">Địa chỉ</p>
                    <p className="text-gray-600">{selectedDoctor.location}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-primary" />
                  <div>
                    <p className="font-medium">Liên hệ</p>
                    <p className="text-gray-600">{selectedDoctor.phone}</p>
                  </div>
                </div>
              </div>
            </div>

            {selectedDoctor.bio && (
              <div className="mb-6">
                <div className="flex items-center gap-3 mb-2">
                  <BookOpen className="w-5 h-5 text-primary" />
                  <h3 className="font-medium">Giới thiệu</h3>
                </div>
                <p className="text-gray-600 whitespace-pre-line">{selectedDoctor.bio}</p>
              </div>
            )}

            <div className="flex justify-end gap-4">
              <Button onClick={() => setIsModalOpen(false)}>Đóng</Button>
              <Button variant="default">Đặt lịch khám</Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}