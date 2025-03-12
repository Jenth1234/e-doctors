import type { PayloadRequest } from "payload";

export const createProfile = async ({ doc, req }: { doc: any; req: PayloadRequest }) => {
  const payload = req.payload;

  if (!doc.profile) {
    try {
      const profile = await payload.create({
        collection: "profiles",
        data: {
          user: doc.id, // Liên kết với user
          phone: doc.phone || "0000000000", // Mặc định nếu thiếu
          address: doc.address || "Chưa cập nhật",
          gender: doc.gender || "other",
          dob: doc.dob || "2000-01-01",
        },
      });

      // Cập nhật user với profile mới
      await payload.update({
        collection: "users",
        id: doc.id,
        data: { profileId: profile.id },
      });

    } catch (error) {
      console.error("Lỗi tạo profile:", error);
    }
  }
};
