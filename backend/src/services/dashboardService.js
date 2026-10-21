import prisma from "./prisma.js";

export async function getDashboardStats(user) {
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  const tomorrow = new Date(today);
  tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);

  if (user.role === "ADMIN") {
    const [
      totalEmployees,
      totalDepartments,
      todayAttendance,
      pendingLeaves,
      recentLeaves,
    ] = await Promise.all([
      prisma.employee.count(),
      prisma.department.count(),
      prisma.attendance.count({
        where: { date: { gte: today, lt: tomorrow } },
      }),
      prisma.leave.count({ where: { status: "PENDING" } }),
      prisma.leave.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: {
          employee: {
            select: { firstName: true, lastName: true },
          },
        },
      }),
    ]);

    return {
      role: "ADMIN",
      totalEmployees,
      totalDepartments,
      todayAttendance,
      pendingLeaves,
      recentLeaves,
    };
  }

  const employee = await prisma.employee.findUnique({
    where: { userId: user.userId },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      jobTitle: true,
      department: { select: { name: true } },
    },
  });

  if (!employee) {
    const error = new Error("Employee profile not found");
    error.status = 404;
    throw error;
  }

  const [myAttendance, pendingLeaves, approvedLeaves] = await Promise.all([
    prisma.attendance.count({ where: { employeeId: employee.id } }),
    prisma.leave.count({
      where: { employeeId: employee.id, status: "PENDING" },
    }),
    prisma.leave.count({
      where: { employeeId: employee.id, status: "APPROVED" },
    }),
  ]);

  return {
    role: "EMPLOYEE",
    employee,
    myAttendance,
    pendingLeaves,
    approvedLeaves,
  };
}
