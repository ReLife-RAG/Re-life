import { Request, Response } from "express";
import User from "../models/User";

/**
 * Get saved resources for the authenticated user
 * @route GET /api/resources/saved
 */
export const getSavedResources = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    if (!user) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const doc = await User.findById(user.id).select("savedResources");
    if (!doc) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.json({ savedResources: doc.savedResources || [] });
  } catch (error) {
    return res.status(500).json({ error: "Failed to get saved resources" });
  }
};

/**
 * Toggle saved status for one resource
 * @route POST /api/resources/saved/:resourceId
 */
export const toggleSavedResource = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    if (!user) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const { resourceId } = req.params;
    if (!resourceId) {
      return res.status(400).json({ error: "resourceId is required" });
    }

    const doc = await User.findById(user.id).select("savedResources");
    if (!doc) {
      return res.status(404).json({ error: "User not found" });
    }

    const current = new Set(doc.savedResources || []);
    let isSaved = false;

    if (current.has(resourceId)) {
      current.delete(resourceId);
      isSaved = false;
    } else {
      current.add(resourceId);
      isSaved = true;
    }

    doc.savedResources = Array.from(current);
    await doc.save();

    return res.json({
      message: isSaved ? "Resource saved" : "Resource unsaved",
      isSaved,
      savedResources: doc.savedResources,
    });
  } catch (error) {
    return res.status(500).json({ error: "Failed to update saved resources" });
  }
};
