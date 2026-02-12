import { Router, Request, Response } from "express";
import { db } from "../db";
import { marketplace, cards } from "../db/schema";
import { eq, desc, gte, lte, sql } from "drizzle-orm";

const router = Router();

// GET /api/marketplace - List marketplace items
router.get("/", async (req: Request, res: Response) => {
    try {
        const { status, minPrice, maxPrice, cardId, sellerId, limit, offset } = req.query;

        let query = db
            .select({
                listing: marketplace,
                card: cards,
            })
            .from(marketplace)
            .leftJoin(cards, eq(marketplace.cardId, cards.id))
            .orderBy(desc(marketplace.createdAt));

        if (status) {
            query = query.where(eq(marketplace.status, status as string));
        }

        if (cardId) {
            query = query.where(eq(marketplace.cardId, parseInt(cardId as string, 10)));
        }

        if (sellerId) {
            query = query.where(eq(marketplace.sellerId, sellerId as string));
        }

        if (minPrice) {
            query = query.where(gte(marketplace.price, parseFloat(minPrice as string)));
        }

        if (maxPrice) {
            query = query.where(lte(marketplace.price, parseFloat(maxPrice as string)));
        }

        const items = await query.limit(parseInt((limit as string) || "50", 10));

        res.json({
            success: true,
            data: items,
        });
    } catch (error) {
        console.error("Error fetching marketplace:", error);
        res.status(500).json({
            success: false,
            error: "Failed to fetch marketplace items",
        });
    }
});

// GET /api/marketplace/:id - Get a single marketplace item
router.get("/:id", async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const item = await db
            .select({
                listing: marketplace,
                card: cards,
            })
            .from(marketplace)
            .leftJoin(cards, eq(marketplace.cardId, cards.id))
            .where(eq(marketplace.id, parseInt(id, 10)))
            .limit(1);

        if (!item.length) {
            return res.status(404).json({
                success: false,
                error: "Item not found",
            });
        }

        res.json({
            success: true,
            data: item[0],
        });
    } catch (error) {
        console.error("Error fetching marketplace item:", error);
        res.status(500).json({
            success: false,
            error: "Failed to fetch item",
        });
    }
});

// POST /api/marketplace - Create a listing
router.post("/", async (req: Request, res: Response) => {
    try {
        const { cardId, price, sellerId } = req.body;

        if (!cardId || !price) {
            return res.status(400).json({
                success: false,
                error: "Card ID and price are required",
            });
        }

        const newListing = await db
            .insert(marketplace)
            .values({
                cardId,
                price,
                sellerId,
                status: "active",
            })
            .returning();

        res.status(201).json({
            success: true,
            data: newListing[0],
        });
    } catch (error) {
        console.error("Error creating listing:", error);
        res.status(500).json({
            success: false,
            error: "Failed to create listing",
        });
    }
});

// PATCH /api/marketplace/:id - Update listing status
router.patch("/:id", async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const updated = await db
            .update(marketplace)
            .set({ status, updatedAt: new Date() })
            .where(eq(marketplace.id, parseInt(id, 10)))
            .returning();

        if (!updated.length) {
            return res.status(404).json({
                success: false,
                error: "Item not found",
            });
        }

        res.json({
            success: true,
            data: updated[0],
        });
    } catch (error) {
        console.error("Error updating listing:", error);
        res.status(500).json({
            success: false,
            error: "Failed to update listing",
        });
    }
});

export default router;
