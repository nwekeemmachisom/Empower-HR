import prisma from "./prisma.js";

export async function getDocuments(user) {
  const where =
    user.role === "ADMIN"
      ? {}
      : { employee: { userId: Number(user.userId) } };

  return prisma.document.findMany({
    where,
    include: {
      employee: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          jobTitle: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function createDocument({ employeeId, name, fileUrl }) {
  return prisma.document.create({
    data: {
      employeeId: Number(employeeId),
      name: name.trim(),
      fileUrl: fileUrl.trim(),
    },
    include: {
      employee: {
        select: { id: true, firstName: true, lastName: true },
      },
    },
  });
}

export async function deleteDocument(id) {
  return prisma.document.delete({
    where: { id: Number(id) },
  });
}
