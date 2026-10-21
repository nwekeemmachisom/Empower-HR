import prisma from "./prisma.js";

export async function submitLeave(userId, data) {
  const employee = await prisma.employee.findUnique({
    where: { userId },
  });

  if (!employee) {
    const error = new Error("Employee profile not found");
    error.status = 404;
    throw error;
  }

  return prisma.leave.create({
    data: {
      employeeId: employee.id,
      leaveType: data.leaveType.trim(),
      startDate: new Date(`${data.startDate}T00:00:00.000Z`),
      endDate: new Date(`${data.endDate}T00:00:00.000Z`),
      reason: data.reason?.trim() || null,
    },
  });
}

export async function getLeaves(user) {
  return prisma.leave.findMany({
    where: user.role === "ADMIN"
      ? {}
      : { employee: { userId: user.userId } },
    include: {
      employee: {
        select: { id: true, firstName: true, lastName: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function reviewLeave(id, status) {
  return prisma.leave.update({
    where: { id: Number(id) },
    data: { status },
  });
}
