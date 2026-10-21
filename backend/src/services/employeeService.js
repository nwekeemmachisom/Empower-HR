import bcrypt from "bcryptjs";
import prisma from "./prisma.js";

export async function createEmployee(data) {
  const email = data.email.trim().toLowerCase();

  return prisma.$transaction(async (tx) => {
    let user = await tx.user.findUnique({ where: { email } });

    if (user) {
      if (user.role !== "EMPLOYEE") {
        const error = new Error(
          "This email belongs to an administrator account and cannot be linked as an employee."
        );
        error.statusCode = 409;
        throw error;
      }

      const profile = await tx.employee.findUnique({
        where: { userId: user.id },
      });

      if (profile) {
        const error = new Error(
          "This account already has an employee profile."
        );
        error.statusCode = 409;
        throw error;
      }
    } else {
      if (typeof data.password !== "string" || data.password.length < 8) {
        const error = new Error(
          "No account was found for this email. Enter a password of at least 8 characters to create a new account."
        );
        error.statusCode = 400;
        throw error;
      }

      const passwordHash = await bcrypt.hash(data.password, 10);

      user = await tx.user.create({
        data: {
          email,
          passwordHash,
          role: "EMPLOYEE",
        },
      });
    }

    return tx.employee.create({
      data: {
        userId: user.id,
        firstName: data.firstName.trim(),
        lastName: data.lastName.trim(),
        phone: data.phone?.trim() || null,
        address: data.address?.trim() || null,
        jobTitle: data.jobTitle?.trim() || null,
        dateJoined: data.dateJoined ? new Date(data.dateJoined) : null,
        departmentId: data.departmentId
          ? Number(data.departmentId)
          : null,
      },
      include: {
        user: {
          select: { id: true, email: true, role: true },
        },
        department: true,
      },
    });
  });
}

export async function getAllEmployees() {
  return prisma.employee.findMany({
    include: {
      user: {
        select: {
          id: true,
          email: true,
          role: true,
        },
      },
      department: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function getEmployeeById(id) {
  return prisma.employee.findUnique({
    where: { id: Number(id) },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          role: true,
        },
      },
      department: true,
    },
  });
}

export async function getEmployeeByUserId(userId) {
  return prisma.employee.findUnique({
    where: { userId: Number(userId) },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          role: true,
        },
      },
      department: true,
    },
  });
}

export async function updateEmployee(id, data) {
  const employeeId = Number(id);

  const existingEmployee = await prisma.employee.findUnique({
    where: { id: employeeId },
  });

  if (!existingEmployee) {
    return null;
  }

  const updateData = {};

  for (const field of [
    "firstName",
    "lastName",
    "phone",
    "address",
    "jobTitle",
  ]) {
    if (data[field] !== undefined) {
      updateData[field] =
        typeof data[field] === "string"
          ? data[field].trim() || null
          : data[field];
    }
  }

  if (data.dateJoined !== undefined) {
    updateData.dateJoined = data.dateJoined
      ? new Date(data.dateJoined)
      : null;
  }

  if (data.departmentId !== undefined) {
    updateData.department = data.departmentId
      ? { connect: { id: Number(data.departmentId) } }
      : { disconnect: true };
  }

  return prisma.employee.update({
    where: { id: employeeId },
    data: updateData,
    include: {
      user: {
        select: {
          id: true,
          email: true,
          role: true,
        },
      },
      department: true,
    },
  });
}
