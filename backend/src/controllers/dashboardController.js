import { getDashboardStats } from "../services/dashboardService.js";

export async function dashboardStats(req, res) {
  try {
    const stats = await getDashboardStats(req.user);

    return res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error("Dashboard statistics error:", error.message);

    return res.status(error.status || 500).json({
      success: false,
      message:
        error.status === 404
          ? error.message
          : "Unable to load dashboard statistics",
    });
  }
}
