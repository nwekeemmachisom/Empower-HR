import {
  getDocuments,
  createDocument,
  deleteDocument,
} from "../services/documentService.js";

export async function listDocuments(req, res) {
  try {
    const documents = await getDocuments(req.user);
    return res.json({ success: true, documents });
  } catch (error) {
    console.error("List documents error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve documents",
    });
  }
}

export async function addDocument(req, res) {
  try {
    const { employeeId, name, fileUrl } = req.body;

    if (
      !Number.isInteger(Number(employeeId)) ||
      Number(employeeId) < 1 ||
      typeof name !== "string" ||
      !name.trim() ||
      typeof fileUrl !== "string" ||
      !fileUrl.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "A valid employee, document name and document URL are required",
      });
    }

    let parsedUrl;
    try {
      parsedUrl = new URL(fileUrl.trim());
    } catch {
      return res.status(400).json({
        success: false,
        message: "Enter a valid document URL",
      });
    }

    if (!["http:", "https:"].includes(parsedUrl.protocol)) {
      return res.status(400).json({
        success: false,
        message: "Document URL must begin with http:// or https://",
      });
    }

    const document = await createDocument({
      employeeId,
      name,
      fileUrl,
    });

    return res.status(201).json({
      success: true,
      message: "Document added successfully",
      document,
    });
  } catch (error) {
    console.error("Add document error:", error);

    if (error.code === "P2003" || error.code === "P2025") {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to add document",
    });
  }
}

export async function removeDocument(req, res) {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id < 1) {
      return res.status(400).json({
        success: false,
        message: "Invalid document ID",
      });
    }

    await deleteDocument(id);

    return res.json({
      success: true,
      message: "Document deleted successfully",
    });
  } catch (error) {
    if (error.code === "P2025") {
      return res.status(404).json({
        success: false,
        message: "Document not found",
      });
    }

    console.error("Delete document error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete document",
    });
  }
}
