import prisma from "./prisma.js";

export async function createDepartment(name) {
  return prisma.department.create({
    data: { name: name.trim() },
    include: {
      _count: { select: { employees: true } },
    },
  });
}

export async function getAllDepartments() {
  return prisma.department.findMany({
    include: {
      _count: { select: { employees: true } },
    },
    orderBy: { name: "asc" },
  });
}

export async function getDepartmentById(id) {
  return prisma.department.findUnique({
    where: { id: Number(id) },
    include: {
      _count: { select: { employees: true } },
    },
  });
}

export async function updateDepartment(id, name) {
  return prisma.department.update({
    where: { id: Number(id) },
    data: { name: name.trim() },
    include: {
      _count: { select: { employees: true } },
    },
  });
}

export async function deleteDepartment(id) {
  const departmentId = Number(id);

  const department = await prisma.department.findUnique({
    where: { id: departmentId },
    include: {
      _count: { select: { employees: true } },
    },
  });

  if (!department) return { notFound: true };

  if (department._count.employees > 0) {
    return { hasEmployees: true };
  }

  await prisma.department.delete({
    where: { id: departmentId },
  });

  return { deleted: true };
}
