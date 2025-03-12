"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Modal from '@/components/Modal';

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  gender: string;
  dob: string;
  avatar?: {
    id: string;
    url: string;
  };
}

interface Profile {
  id: string;
  user: User;
  phone: string;
  address: string;
  gender: string;
  dob: string;
}

export default function ProfilesPage() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchProfiles = async () => {
      try {
        const res = await fetch("/api/profiles");
        if (!res.ok) throw new Error("Failed to fetch profiles");
        const data = await res.json();
        setProfiles(data?.docs || []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProfiles();
  }, []);

  const handleDelete = async (id: string) => {
    if (confirm("Bạn có chắc chắn muốn xóa hồ sơ này?")) {
      try {
        const res = await fetch(`/api/profiles/${id}`, {
          method: "DELETE",
        });
        if (!res.ok) throw new Error("Failed to delete profile");
        setProfiles(profiles.filter(profile => profile.id !== id));
      } catch (err: any) {
        setError(err.message);
      }
    }
  };

  const handleEdit = (user: User, profile: Profile) => {
    // Chuyển đổi định dạng ngày từ ISO string sang YYYY-MM-DD
    const formattedDate = profile.dob ? new Date(profile.dob).toISOString().split('T')[0] : '';
    
    setEditingUser({
      ...user,
      name: user.name || '',
      email: user.email || '',
      phone: profile.phone || '',
      address: profile.address || '',
      gender: profile.gender || '',
      dob: formattedDate  // Sử dụng ngày đã được format
    });
  };

  const handleAvatarUpload = async (file: File) => {
    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/media', {
        method: 'POST',
        credentials: 'include',
        body: formData
      })

      if (!response.ok) {
        throw new Error('Failed to upload avatar')
      }
      
      const media = await response.json()
      if (!media?.doc?.id) {
        throw new Error('Invalid response from server')
      }

      return { id: media.doc.id }
    } catch (error) {
      console.error('Avatar upload error:', error)
      throw error
    }
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    try {
      const profile = profiles.find(p => p.user.id === editingUser.id);
      if (!profile) {
        throw new Error('Profile not found');
      }

      // Cập nhật thông tin user
      const userRes = await fetch(`/api/users/${editingUser.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          name: editingUser.name,
          email: editingUser.email,
        }),
      });

      if (!userRes.ok) {
        throw new Error('Failed to update user');
      }

      // Cập nhật thông tin profile
      const profileRes = await fetch(`/api/profiles/${profile.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          phone: editingUser.phone,
          address: editingUser.address,
          gender: editingUser.gender,
          dob: editingUser.dob,
        }),
      });

      if (!profileRes.ok) {
        throw new Error('Failed to update profile');
      }

      const updatedProfile = await profileRes.json();

      // Cập nhật state với dữ liệu mới
      setProfiles(profiles.map(p => {
        if (p.id === profile.id) {
          return {
            ...p,
            ...updatedProfile.doc,
            user: {
              ...p.user,
              name: editingUser.name,
              email: editingUser.email,
            }
          };
        }
        return p;
      }));
      
      setEditingUser(null);
    } catch (err: any) {
      setError(err.message);
      console.error('Update error:', err);
    }
  };

  if (loading)
    return <p className="text-center text-gray-500 mt-6 text-lg">Đang tải...</p>;
  if (error)
    return <p className="text-center text-red-500 mt-6 text-lg">Lỗi: {error}</p>;
  if (profiles.length === 0)
    return <p className="text-center text-gray-600 mt-6 text-lg">Không có hồ sơ nào.</p>;

  return (
    <div className="max-w-3xl mx-auto p-8">
      <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">Hồ sơ của bạn</h1>
      
      {profiles.map((profile) => (
        <div
          key={profile.id}
          className="bg-white shadow-lg rounded-2xl p-8 border hover:shadow-xl transition"
        >
          <div className="flex flex-col items-center mb-6">
            {/* Avatar lớn hơn */}
            <div className="w-24 h-24 relative group">
              <div className="w-full h-full rounded-full overflow-hidden">
                {profile.user?.avatar ? (
                  <img 
                    src={profile.user.avatar?.url}
                    alt={profile.user?.name} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-300 text-gray-700 text-4xl font-bold">
                    {profile.user?.name ? profile.user.name.charAt(0) : "?"}
                  </div>
                )}
                
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <label htmlFor={`avatar-upload-${profile.id}`} className="cursor-pointer">
                    <div className="bg-white p-2 rounded-full">
                      <span className="text-xl">📷</span>
                    </div>
                  </label>
                  <input
                    id={`avatar-upload-${profile.id}`}
                    type="file"
                    accept="image/*"
                    onChange={async (e) => {
                      if (e.target.files && e.target.files.length > 0) {
                        const file = e.target.files[0];
                        try {
                          // Upload avatar
                          const updatedAvatar = await handleAvatarUpload(file);
                          
                          // Update user with new avatar
                          const userRes = await fetch(`/api/users/${profile.user.id}`, {
                            method: 'PATCH',
                            headers: {
                              'Content-Type': 'application/json',
                            },
                            credentials: 'include',
                            body: JSON.stringify({
                              avatar: updatedAvatar
                            }),
                          });

                          if (!userRes.ok) {
                            throw new Error('Failed to update avatar');
                          }

                          const updatedUser = await userRes.json();

                          // Update local state
                          setProfiles(profiles.map(p => {
                            if (p.id === profile.id) {
                              return {
                                ...p,
                                user: {
                                  ...p.user,
                                  avatar: updatedUser.doc.avatar
                                }
                              };
                            }
                            return p;
                          }));
                        } catch (err: any) {
                          setError(err.message);
                          console.error('Avatar update error:', err);
                        }
                      }
                    }}
                    className="hidden"
                  />
                </div>
              </div>
            </div>
            <h2 className="text-2xl font-semibold text-gray-800 text-center">{profile.user?.name || "Không có"}</h2>
            <p className="text-lg text-gray-600">{profile.user?.email || "Không có email"}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="space-y-3">
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-lg">
                  <span className="inline-block w-8">📞</span>
                  <span className="font-medium">Số điện thoại:</span>
                  <br />
                  <span className="ml-8 text-gray-700">{profile.phone || "Không có số điện thoại"}</span>
                </p>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-lg">
                  <span className="inline-block w-8">📍</span>
                  <span className="font-medium">Địa chỉ:</span>
                  <br />
                  <span className="ml-8 text-gray-700">{profile.address || "Không có địa chỉ"}</span>
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-lg">
                  <span className="inline-block w-8">🏳️</span>
                  <span className="font-medium">Giới tính:</span>
                  <br />
                  <span className="ml-8 text-gray-700">
                    {profile.gender === "male" ? "Nam" : profile.gender === "female" ? "Nữ" : "Khác"}
                  </span>
                </p>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-lg">
                  <span className="inline-block w-8">🎂</span>
                  <span className="font-medium">Ngày sinh:</span>
                  <br />
                  <span className="ml-8 text-gray-700">
                    {profile.dob ? new Date(profile.dob).toLocaleDateString("vi-VN") : "Không có"}
                  </span>
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-center gap-4 mt-8">
            <button
              onClick={() => handleEdit(profile.user, profile)}
              className="bg-blue-500 text-white rounded-lg px-6 py-3 hover:bg-blue-600 transition flex items-center gap-2"
            >
              <span className="text-xl">✏️</span>
              Chỉnh sửa thông tin
            </button>
            <button
              onClick={() => handleDelete(profile.id)}
              className="bg-red-500 text-white rounded-lg px-6 py-3 hover:bg-red-600 transition flex items-center gap-2"
            >
              <span className="text-xl">🗑️</span>
              Xóa hồ sơ
            </button>
          </div>
        </div>
      ))}

      <Modal isOpen={!!editingUser} onClose={() => setEditingUser(null)}>
        {editingUser && (
          <form onSubmit={handleUpdate} className="bg-white p-6 rounded-lg w-full max-w-2xl mx-auto">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">Chỉnh sửa {editingUser.name}</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Tên</label>
                <input
                  type="text"
                  value={editingUser.name}
                  onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                  placeholder="Tên"
                  className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  value={editingUser.email}
                  onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                  placeholder="Email"
                  className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Số điện thoại</label>
                <input
                  type="tel"
                  value={editingUser.phone}
                  onChange={(e) => setEditingUser({ ...editingUser, phone: e.target.value })}
                  placeholder="Số điện thoại"
                  className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Địa chỉ</label>
                <input
                  type="text"
                  value={editingUser.address}
                  onChange={(e) => setEditingUser({ ...editingUser, address: e.target.value })}
                  placeholder="Địa chỉ"
                  className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Giới tính</label>
                <select
                  value={editingUser.gender}
                  onChange={(e) => setEditingUser({ ...editingUser, gender: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                >
                  <option value="">Chọn giới tính</option>
                  <option value="male">Nam</option>
                  <option value="female">Nữ</option>
                  <option value="other">Khác</option>
                </select>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Ngày sinh</label>
                <input
                  type="date"
                  value={editingUser.dob}
                  onChange={(e) => setEditingUser({ ...editingUser, dob: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                />
              </div>
            </div>

            <div className="flex justify-end mt-6 gap-4">
              <button 
                type="submit" 
                className="bg-green-500 text-white px-6 py-2 rounded hover:bg-green-600 transition"
              >
                Cập nhật
              </button>
              <button 
                type="button" 
                onClick={() => setEditingUser(null)} 
                className="bg-gray-300 text-gray-700 px-6 py-2 rounded hover:bg-gray-400 transition"
              >
                Hủy
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
