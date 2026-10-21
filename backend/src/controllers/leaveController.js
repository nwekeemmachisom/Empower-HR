import {
  submitLeave,
  getLeaves,
  reviewLeave,
} from "../services/leaveService.js";

export async function createLeave(req, res) {
  const { leaveType, startDate, endDate, reason } = req.body;

  if (
    typeof leaveType !== "string" ||
    !leaveType.trim() ||
    !/^\d{4}-\d{2}-\d{2}$/.test(startDate || "") ||
    !/^\d{4}-\d{2}-\d{2}$/.test(endDate || "")
  ) {
    return res.status(400).json({
      success: false,
      message: "Leave type and valid start/end dates are required",
    });
  }

  const start = new Date(`${startDate}T00:00:00.000Z`);
  const end = new Date(`${endDate}T00:00:00.000Z`);

  if (
    Number.isNaN(start.getTime()) ||
    Number.isNaN(end.getTime()) ||
    start.toISOString().slice(0, 10) !== startDate ||
    end.toISOString().slice(0, 10) !== endDate ||
    end < start
  ) {
    return res.status(400).json({
      success: false,
      message: "Please provide valid leave dates; the end date must not precede the start date",
    });
  }

  try {
    const leave = await submitLeave(req.user.userId, {
      leaveType, startDate, endDate, reason,
    });
    return res.status(201).json({ success: true, leave });
  } catch (error) {
    return res.status(error.status || 500).json({
      success: false,
      message: error.status ? error.message : "Could not submit leave request",
    });
  }
}

export async function listLeaves(req, res) {
  try {
    const leaves = await getLeaves(req.user);
    return res.json({ success: true, leaves });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Could not retrieve leave requests",
    });
  }
}

export async function decideLeave(req, res) {
  const id = req.params.id;
  const { status } = req.body;

  if (!/^\d+$/.test(id) || Number(id) < 1) {
    return res.status(400).json({ success: false, message: "Invalid leave ID" });
  }

  if (!["APPROVED", "REJECTED"].includes(status)) {
    return res.status(400).json({
      success: false,
      message: "Status must be APPROVED or REJECTED",
    });
  }

  try {
    const leave = await reviewLeave(id, status);
    return res.json({ success: true, leave });
  } catch (error) {
    if (error.code === "P2025") {
      return res.status(404).json({ success: false, message: "Leave request not found" });
    }
    console.error(error);
    return res.status(500).json({ success: false, message: "Could not review leave request" });
  }
}
