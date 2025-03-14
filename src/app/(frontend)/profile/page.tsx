'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

import MedicalHistory from './MedicalHistory'

interface User {
  id: string
  name: string
  email: string
  phone: string
  address: string
  gender: string
  dob: string
  avatar?: {
    id: string
    url: string
  }
}

interface Profile {
  id: string
  user: User
  phone: string
  address: string
  gender: string
  dob: string
}

export default function ProfilesPage() {
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  // Lấy danh sách hồ sơ
  useEffect(() => {
    const fetchProfiles = async () => {
      try {
        const res = await fetch('/api/profiles')
        if (!res.ok) throw new Error('Failed to fetch profiles')
        const data = await res.json()
        setProfiles(data?.docs || [])
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchProfiles()
  }, [])

  // Hàm cập nhật state của profile khi người dùng chỉnh sửa
  const handleInputChange = (index: number, field: string, value: string) => {
    const newProfiles = [...profiles]
    if (field === 'name' || field === 'email') {
      newProfiles[index].user = { ...newProfiles[index].user, [field]: value }
    } else {
      newProfiles[index] = { ...newProfiles[index], [field]: value }
    }
    setProfiles(newProfiles)
  }

  // Hàm upload avatar (giữ nguyên logic upload)
  const handleAvatarUpload = async (file: File, index: number) => {
    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/media', {
        method: 'POST',
        credentials: 'include',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Failed to upload avatar')
      }

      const media = await response.json()
      if (!media?.doc?.id) {
        throw new Error('Invalid response from server')
      }

      // Cập nhật avatar cho profile tương ứng
      const updatedAvatar = { id: media.doc.id, url: media.doc.url } 

      const newProfiles = [...profiles]
      newProfiles[index].user = {
        ...newProfiles[index].user,
        avatar: updatedAvatar,
      }
      setProfiles(newProfiles)
      return updatedAvatar
    } catch (error) {
      console.error('Avatar upload error:', error)
      throw error
    }
  }

  // Hàm gửi cập nhật thông tin lên server cho 1 hồ sơ
  const handleUpdateProfile = async (index: number) => {
    const profile = profiles[index]
    try {
      // Cập nhật thông tin user
      const userRes = await fetch(`/api/users/${profile.user.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          name: profile.user.name,
          email: profile.user.email,
        }),
      })
      if (!userRes.ok) {
        throw new Error('Failed to update user')
      }

      // Cập nhật thông tin profile
      const profileRes = await fetch(`/api/profiles/${profile.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          phone: profile.phone,
          address: profile.address,
          gender: profile.gender,
          dob: profile.dob,
        }),
      })
      if (!profileRes.ok) {
        throw new Error('Failed to update profile')
      }
      const updatedProfile = await profileRes.json()

      // Cập nhật state với dữ liệu mới trả về từ server
      const newProfiles = [...profiles]
      newProfiles[index] = {
        ...newProfiles[index],
        ...updatedProfile.doc,
        user: {
          ...newProfiles[index].user,
          name: profile.user.name,
          email: profile.user.email,
        },
      }
      setProfiles(newProfiles)
      alert('Cập nhật thành công!')
    } catch (err: any) {
      setError(err.message)
      console.error('Update error:', err)
    }
  }

  if (loading) return <p className="text-center text-gray-500 mt-6 text-lg">Đang tải...</p>
  if (error) return <p className="text-center text-red-500 mt-6 text-lg">Lỗi: {error}</p>
  if (profiles.length === 0)
    return <p className="text-center text-gray-600 mt-6 text-lg">Không có hồ sơ nào.</p>

  return (
    <div className=" mx-auto p-8">
      <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">Hồ sơ của bạn</h1>
      {profiles.map((profile, index) => (
        <div
          key={profile.id}
          className="bg-white shadow-lg rounded-2xl p-8 border hover:shadow-xl transition mb-8"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Cột Hồ sơ */}
            <div className="border-r pr-4">
              <div className="flex flex-col items-center mb-6">
                {/* Hiển thị avatar */}
                <div className="w-24 h-24 relative group">
                  <div className="w-full h-full rounded-full overflow-hidden">
                    {profile.user?.avatar ? (
                      <img
                        src={profile.user.avatar.url}
                        alt={profile.user.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-300 text-gray-700 text-4xl font-bold">
                        {profile.user?.name ? profile.user.name.charAt(0) : '?'}
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
                            const file = e.target.files[0]
                            try {
                              await handleAvatarUpload(file, index)
                            } catch (err: any) {
                              setError(err.message)
                            }
                          }
                        }}
                        className="hidden"
                      />
                    </div>
                  </div>
                </div>
                {/* Các input luôn hiển thị để chỉnh sửa thông tin */}
                <div className="w-full">
                  <label className="block text-sm font-medium text-gray-700">Tên</label>
                  <input
                    type="text"
                    value={profile.user.name}
                    onChange={(e) => handleInputChange(index, 'name', e.target.value)}
                    className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                  />
                </div>
                <div className="w-full mt-4">
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <input
                    type="email"
                    value={profile.user.email}
                    onChange={(e) => handleInputChange(index, 'email', e.target.value)}
                    className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="w-full">
                  <label className="block text-sm font-medium text-gray-700">Số điện thoại</label>
                  <input
                    type="tel"
                    value={profile.phone}
                    onChange={(e) => handleInputChange(index, 'phone', e.target.value)}
                    className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                  />
                </div>
                <div className="w-full">
                  <label className="block text-sm font-medium text-gray-700">Địa chỉ</label>
                  <input
                    type="text"
                    value={profile.address}
                    onChange={(e) => handleInputChange(index, 'address', e.target.value)}
                    className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                  />
                </div>
                <div className="w-full">
                  <label className="block text-sm font-medium text-gray-700">Giới tính</label>
                  <select
                    value={profile.gender}
                    onChange={(e) => handleInputChange(index, 'gender', e.target.value)}
                    className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                  >
                    <option value="">Chọn giới tính</option>
                    <option value="male">Nam</option>
                    <option value="female">Nữ</option>
                    <option value="other">Khác</option>
                  </select>
                </div>
                <div className="w-full">
                  <label className="block text-sm font-medium text-gray-700">Ngày sinh</label>
                  <input
                    type="date"
                    value={profile.dob}
                    onChange={(e) => handleInputChange(index, 'dob', e.target.value)}
                    className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                  />
                </div>
              </div>
              <div className="flex justify-center gap-4 mt-8">
                <button
                  onClick={() => handleUpdateProfile(index)}
                  className="bg-blue-500 text-white rounded-lg px-6 py-3 hover:bg-blue-600 transition"
                >
                  Cập nhật
                </button>
              </div>
            </div>
            {/* Cột Bệnh án */}
            <div className="pl-4">
             
            <MedicalHistory userId={profile.user.id} />

            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
// {profiles.map((profile, index) => (
//   <div key={profile.id} className="border rounded p-4 mb-4 shadow">

//     < MedicalHistory/> {/* Thêm form bệnh án */}
//   </div>
// ))}
//     <div className="max-w-3xl mx-auto p-8">

// </div>
