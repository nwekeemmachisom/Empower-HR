import prisma from "./prisma.js";

export async function getAllAttendance() {
  return prisma.attendance.findMany({
    include: {
      employee: {
        select: { id: true, firstName: true, lastName: true, jobTitle: true },
      },
    },
    orderBy: { date: "desc" },
  });
}

export async function getMyAttendance(userId) {
  return prisma.attendance.findMany({
    where: { employee: { userId } },
    orderBy: { date: "desc" },
  });
}

export async function recordAttendance({ employeeId, date, status, checkIn, checkOut }) {
  const attendanceDate = new Date(`${date}T00:00:00.000Z`);

  return prisma.attendance.upsert({
    where: {
      employeeId_date: { employeeId: Number(employeeId), date: attendanceDate },
    },
    update: {
      status,
      ...(checkIn !== undefined && { checkIn: checkIn ? new Date(checkIn) : null }),
      ...(checkOut !== undefined && { checkOut: checkOut ? new Date(checkOut) : null }),
    },
    create: {
      employeeId: Number(employeeId),
      date: attendanceDate,
      status,
      checkIn: checkIn ? new Date(checkIn) : null,
      checkOut: checkOut ? new Date(checkOut) : null,
    },
    include: { employee: true },
  });
}
