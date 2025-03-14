import type { PayloadRequest } from "payload";

export const checkMedicalRecord = async ({
  req,
  data,
  operation,
}: {
  req: PayloadRequest;
  data: Record<string, any>;
  operation: "create" | "update" | "delete";
}) => {
  if (!req.user) {
    throw new Error("Bạn cần đăng nhập để thực hiện thao tác này.");
  }

  if (operation === "create") {
    const existingRecord = await req.payload.find({
      collection: "medical-records",
      where: {
        user: { equals: req.user.id },
      },
    });

    if (existingRecord.docs.length > 0) {
      throw new Error("User này đã có hồ sơ bệnh án! Vui lòng cập nhật hồ sơ hiện có.");
    }

    data.user = req.user.id; // Gán user vào hồ sơ
  }

  return data;
};
