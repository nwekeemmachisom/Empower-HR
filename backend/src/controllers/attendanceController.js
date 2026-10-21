import prisma from "../services/prisma.js";
import {
  getAllAttendance,
  getMyAttendance,
  recordAttendance,
} from "../services/attendanceService.js";

const statuses = ["PRESENT", "ABSENT", "LATE"];

export async function listAttendance(req, res) {
  try {
    const records = req.user.role === "ADMIN"
      ? await getAllAttendance()
      : await getMyAttendance(req.user.userId);

    res.json({ success: true, attendance: records });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Could not retrieve attendance" });
  }
}

export async function saveAttendance(req, res) {
  const { employeeId, date, status = "PRESENT", checkIn, checkOut } = req.body;

  if (!Number.isInteger(Number(employeeId)) || Number(employeeId) < 1) {
    return res.status(400).json({ success: false, message: "Valid employeeId is required" });
  }

  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date) || !statuses.includes(status)) {
    return res.status(400).json({ success: false, message: "Valid date and attendance status are required" });
  }

  for (const value of [checkIn, checkOut]) {
    if (value !== undefined && value !== null && value !== "" && Number.isNaN(Date.parse(value))) {
      return res.status(400).json({ success: false, message: "Invalid check-in or check-out time" });
    }
  }

  try {
    const employee = await prisma.employee.findUnique({
      where: { id: Number(employeeId) },
    });

    if (!employee) {
      return res.status(404).json({ success: false, message: "Employee not found" });
    }

    const record = await recordAttendance({
      employeeId, date, status, checkIn, checkOut,
    });

    res.status(200).json({ success: true, attendance: record });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Could not save attendance" });
  }
}
