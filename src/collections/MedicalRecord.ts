import type { CollectionConfig } from 'payload';
import { checkRole } from '@/access/checkRole';
import { canViewOrEditOwn } from '@/access/canViewOrEditOwn';
import { admins } from '@/access/admin';
import { authenticated } from '@/access/authenticated';

import { checkMedicalRecord } from '@/hooks/checkMedicalRecord';

export const MedicalRecord: CollectionConfig = {
  slug: 'medical-records',

  labels: {
    singular: 'Hồ Sơ Bệnh Án',
    plural: 'Hồ Sơ Bệnh Án',
  },

  access: {
    create: authenticated, // Chỉ user đã đăng nhập mới tạo được
    read: canViewOrEditOwn, // Admin đọc tất cả, user chỉ đọc hồ sơ của mình
    update: authenticated, 
    delete: admins, // Chỉ admin được xóa
  },

  hooks: {
    beforeChange: [checkMedicalRecord],
  },

  fields: [
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      admin: {
        readOnly: true, // Không cho chỉnh sửa thủ công
      },
    },
    {
      name: 'medicalHistory',
      type: 'group',
      fields: [
        {
          name: 'chronicDiseases',
          type: 'array',
          label: 'Bệnh Mãn Tính',
          fields: [
            {
              name: 'disease',
              type: 'select',
              options: [
                { label: 'Bệnh Tim Mạch', value: 'heart' },
                { label: 'Huyết Áp Cao', value: 'high_blood_pressure' },
                { label: 'Tiểu Đường', value: 'diabetes' },
                { label: 'Hen Suyễn', value: 'asthma' },
                { label: 'Ung Thư', value: 'cancer' },
                { label: 'Viêm Khớp', value: 'arthritis' },
                { label: 'Loãng Xương', value: 'osteoporosis' },
                { label: 'Bệnh Thận', value: 'kidney_disease' },
                { label: 'Bệnh Gan', value: 'liver_disease' },
                { label: 'Rối Loạn Tiêu Hóa', value: 'digestive_disorder' },
                { label: 'Rối Loạn Thần Kinh', value: 'neurological_disorder' },
              ],
            },
          ],
        },
        {
          name: 'allergies',
          type: 'array',
          label: 'Dị Ứng',
          fields: [
            {
              name: 'allergy',
              type: 'select',
              options: [
                { label: 'Thực Phẩm', value: 'food' },
                { label: 'Thuốc', value: 'medicine' },
                { label: 'Phấn Hoa', value: 'pollen' },
                { label: 'Lông Động Vật', value: 'animal_hair' },
                { label: 'Môi Trường', value: 'environment' },
              ],
            },
          ],
        },
        {
          name: 'surgeries',
          type: 'array',
          label: 'Tiền Sử Phẫu Thuật',
          fields: [
            {
              name: 'surgery',
              type: 'select',
              options: [
                { label: 'Cắt Ruột Thừa', value: 'appendectomy' },
                { label: 'Phẫu Thuật Tim', value: 'heart_surgery' },
                { label: 'Phẫu Thuật Khớp', value: 'joint_surgery' },
                { label: 'Phẫu Thuật Dạ Dày', value: 'stomach_surgery' },
                { label: 'Sinh Mổ', value: 'cesarean_section' },
              ],
            },
          ],
        },
        {
          name: 'otherConditions',
          type: 'text',
          label: 'Các Bệnh Lý Khác (nếu có)',
        },
      ],
      admin: {
        description: 'Tiền sử bệnh án của bệnh nhân, vui lòng chọn các mục phù hợp',
      },
    },
    {
      name: 'examinationDate',
      type: 'date',
      required: true,
    },
  ],
};
