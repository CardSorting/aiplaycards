import { Router, Request, Response } from "express";
import { db } from "../db";
import { collections, collectionCards } from "../db/schema";
import { eq, and } from "drizzle-orm";

const router = Router();

// GET /api/collections - List all collections
router.get("/", async (req: Request, res: Response) => {
    try {
        const { userId, isPublic } = req.query;

        let query = db.select().from(collections);

        if (userId) {
            query = query.where(eq(collections.userId, userId as string));
        }

        if (isPublic !== undefined) {
            query = query.where(eq(collections.isPublic, isPublic === "true"));
        }

        const allCollections = await query;

        res.json({
            success: true,
            data: allCollections,
        });
    } catch (error) {
        console.error("Error fetching collections:", error);
        res.status(500).json({
            success: false,
            error: "Failed to fetch collections",
        });
    }
});

// GET /api/collections/:id - Get a single collection
router.get("/:id", async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const collection = await db
            .select()
            .from(collections)
            .where(eq(collections.id, parseInt(id, 10)))
            .limit(1);

        if (!collection.length) {
            return res.status(404).json({
                success: false,
                error: "Collection not found",
            });
        }

        // Get cards in collection
        const cards = await db
            .select()
            .from(collectionCards)
            .where(eq(collectionCards.collectionId, parseInt(id, 10)));

        res.json({
            success: true,
            data: {
                ...collection[0],
                cards,
            },
        });
    } catch (error) {
        console.error("Error fetching collection:", error);
        res.status(500).json({
            success: false,
            error: "Failed to fetch collection",
        });
    }
});

// POST /api/collections - Create a new collection
router.post("/", async (req: Request, res: Response) => {
    try {
        const { name, description, isPublic, userId } = req.body;

        if (!name) {
            return res.status(400).json({
                success: false,
                error: "Name is required",
            });
        }

        const newCollection = await db
            .insert(collections)
            .values({
                name,
                description,
                isPublic: isPublic ?? true,
                userId,
            })
            .returning();

        res.status(201).json({
            success: true,
            data: newCollection[0],
        });
    } catch (error) {
        console.error("Error creating collection:", error);
        res.status(500).json({
            success: false,
            error: "Failed to create collection",
        });
    }
});

// PUT /api/collections/:id - Update a collection
router.put("/:id", async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { name, description, isPublic } = req.body;

        const updated = await db
            .update(collections)
            .set({
                name,
                description,
                isPublic,
                updatedAt: new Date(),
            })
            .where(eq(collections.id, parseInt(id, 10)))
            .returning();

        if (!updated.length) {
            return res.status(404).json({
                success: false,
                error: "Collection not found",
            });
        }

        res.json({
            success: true,
            data: updated[0],
        });
    } catch (error) {
        console.error("Error updating collection:", error);
        res.status(500).json({
            success: false,
            error: "Failed to update collection",
        });
    }
});

// DELETE /api/collections/:id - Delete a collection
router.delete("/:id", async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        await db
            .delete(collectionCards)
            .where(eq(collectionCards.collectionId, parseInt(id, 10)));

        const deleted = await db
            .delete(collections)
            .where(eq(collections.id, parseInt(id, 10)))
            .returning();

        if (!deleted.length) {
            return res.status(404).json({
                success: false,
                error: "Collection not found",
            });
        }

        res.json({
            success: true,
            message: "Collection deleted successfully",
        });
    } catch (error) {
        console.error("Error deleting collection:", error);
        res.status(500).json({
            success: false,
            error: "Failed to delete collection",
        });
    }
});

export default router;
