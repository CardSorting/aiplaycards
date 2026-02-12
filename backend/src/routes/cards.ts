import { Router, Request, Response } from "express";
import { cardQueries } from "../db/queries";
import { dbUtils } from "../db/utils";
import type { CardFilters, CreateCardRequest } from "../db/types";

const router = Router();

// GET /api/cards - List all cards
router.get("/", async (req: Request, res: Response) => {
    try {
        dbUtils.validateEnv();

        const {
            userId,
            type,
            supertype,
            rarity,
            limit,
            offset,
            search,
            isPublic,
            source,
            view,
        } = req.query;

        const filters: CardFilters = {
            userId: userId as string | undefined,
            type: type as string | undefined,
            supertype: supertype as string | undefined,
            rarity: rarity as string | undefined,
            limit: limit ? parseInt(limit as string, 10) : 50,
            offset: offset ? parseInt(offset as string, 10) : 0,
            isPublic: isPublic === "true" ? true : isPublic === "false" ? false : undefined,
            source: source as string | undefined,
        };

        const cards =
            view === "summary"
                ? await cardQueries.getAllSummary(filters)
                : await cardQueries.getAll(filters);

        const isUserScoped = Boolean(userId);
        const explicitlyPublic = isPublic === "true";

        // Set cache headers
        if (!isUserScoped && explicitlyPublic) {
            res.setHeader(
                "Cache-Control",
                "public, max-age=300, s-maxage=600, stale-while-revalidate=1200"
            );
        } else {
            res.setHeader("Cache-Control", "no-store");
        }

        res.json({
            success: true,
            data: cards,
            count: cards.length,
        });
    } catch (error) {
        console.error("Error fetching cards:", error);
        res.status(500).json({
            success: false,
            data: [],
            count: 0,
            error: "Failed to fetch cards",
            message: error instanceof Error ? error.message : "Unknown error",
        });
    }
});

// GET /api/cards/:id - Get a single card
router.get("/:id", async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const card = await cardQueries.getById(parseInt(id, 10));

        if (!card) {
            return res.status(404).json({
                success: false,
                error: "Card not found",
            });
        }

        res.json({
            success: true,
            data: card,
        });
    } catch (error) {
        console.error("Error fetching card:", error);
        res.status(500).json({
            success: false,
            error: "Failed to fetch card",
            message: error instanceof Error ? error.message : "Unknown error",
        });
    }
});

// POST /api/cards - Create a new card
router.post("/", async (req: Request, res: Response) => {
    try {
        const cardData: CreateCardRequest = req.body;

        // Basic validation
        if (!cardData.name || !cardData.type || !cardData.supertype) {
            return res.status(400).json({
                error: "Missing required fields",
                required: ["name", "type", "supertype"],
            });
        }

        // Enhanced content validation
        const contentValidation = validateCardContent(cardData);
        if (!contentValidation.isValid) {
            return res.status(400).json({
                error: "Content validation failed",
                details: contentValidation.errors,
            });
        }

        // Sanitize content
        cardData.name = dbUtils.sanitizeString(cardData.name);
        if (cardData.description) {
            cardData.description = dbUtils.sanitizeString(cardData.description, 1000);
        }

        const newCard = await cardQueries.create(cardData as any);

        res.status(201).json({
            success: true,
            data: newCard,
        });
    } catch (error) {
        console.error("Error creating card:", error);
        res.status(500).json({
            error: "Failed to create card",
            message: error instanceof Error ? error.message : "Unknown error",
        });
    }
});

// PUT /api/cards/:id - Update a card
router.put("/:id", async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const cardData = req.body;

        const updatedCard = await cardQueries.update(parseInt(id, 10), cardData);

        if (!updatedCard) {
            return res.status(404).json({
                success: false,
                error: "Card not found",
            });
        }

        res.json({
            success: true,
            data: updatedCard,
        });
    } catch (error) {
        console.error("Error updating card:", error);
        res.status(500).json({
            success: false,
            error: "Failed to update card",
            message: error instanceof Error ? error.message : "Unknown error",
        });
    }
});

// DELETE /api/cards/:id - Delete a card
router.delete("/:id", async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const deleted = await cardQueries.delete(parseInt(id, 10));

        if (!deleted) {
            return res.status(404).json({
                success: false,
                error: "Card not found",
            });
        }

        res.json({
            success: true,
            message: "Card deleted successfully",
        });
    } catch (error) {
        console.error("Error deleting card:", error);
        res.status(500).json({
            success: false,
            error: "Failed to delete card",
            message: error instanceof Error ? error.message : "Unknown error",
        });
    }
});

// Card content validation helper
function validateCardContent(cardData: CreateCardRequest): {
    isValid: boolean;
    errors: string[];
} {
    const errors: string[] = [];

    if (cardData.name) {
        const name = cardData.name.trim();
        if (name.length < 2) {
            errors.push("Card name must be at least 2 characters long");
        }
        if (name.length > 50) {
            errors.push("Card name must be 50 characters or less");
        }
    }

    if (cardData.description) {
        const description = cardData.description.trim();
        if (description.length < 10) {
            errors.push("Description must be at least 10 characters long");
        }
        if (description.length > 1000) {
            errors.push("Description must be 1000 characters or less");
        }
    }

    return {
        isValid: errors.length === 0,
        errors,
    };
}

export default router;
