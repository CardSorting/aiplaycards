import { Router, Request, Response } from "express";
import { db } from "../db";
import { notifications } from "../db/schema";
import { eq, desc, and } from "drizzle-orm";

const router = Router();

// GET /api/notifications - Get user notifications
router.get("/", async (req: Request, res: Response) => {
    try {
        const { userId, unreadOnly = "false", limit = "50" } = req.query;

        if (!userId) {
            return res.status(400).json({
                success: false,
                error: "User ID is required",
            });
        }

        let query = db
            .select()
            .from(notifications)
            .where(eq(notifications.userId, userId as string))
            .orderBy(desc(notifications.createdAt))
            .limit(parseInt(limit as string, 10));

        if (unreadOnly === "true") {
            query = query.where(eq(notifications.isRead, false));
        }

        const userNotifications = await query;

        res.json({
            success: true,
            data: userNotifications,
        });
    } catch (error) {
        console.error("Error fetching notifications:", error);
        res.status(500).json({
            success: false,
            error: "Failed to fetch notifications",
        });
    }
});

// GET /api/notifications/count - Get unread notification count
router.get("/count", async (req: Request, res: Response) => {
    try {
        const { userId } = req.query;

        if (!userId) {
            return res.status(400).json({
                success: false,
                error: "User ID is required",
            });
        }

        const result = await db
            .select({ count: sql<number>`count(*)` })
            .from(notifications)
            .where(and(
                eq(notifications.userId, userId as string),
                eq(notifications.isRead, false)
            ));

        res.json({
            success: true,
            data: {
                unreadCount: result[0]?.count || 0,
            },
        });
    } catch (error) {
        console.error("Error fetching notification count:", error);
        res.status(500).json({
            success: false,
            error: "Failed to fetch notification count",
        });
    }
});

// PATCH /api/notifications/:id/read - Mark notification as read
router.patch("/:id/read", async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const updated = await db
            .update(notifications)
            .set({ isRead: true })
            .where(eq(notifications.id, parseInt(id, 10)))
            .returning();

        if (!updated.length) {
            return res.status(404).json({
                success: false,
                error: "Notification not found",
            });
        }

        res.json({
            success: true,
            data: updated[0],
        });
    } catch (error) {
        console.error("Error marking notification as read:", error);
        res.status(500).json({
            success: false,
            error: "Failed to update notification",
        });
    }
});

// Import sql for count query
import { sql } from "drizzle-orm";

export default router;
