import { Router, Request, Response } from "express";
import { db } from "../db";
import { users, creditTransactions } from "../db/schema";
import { eq, desc, sql } from "drizzle-orm";

const router = Router();

// GET /api/credits - Get credit balance
router.get("/", async (req: Request, res: Response) => {
    try {
        const { userId } = req.query;

        if (!userId) {
            return res.status(400).json({
                success: false,
                error: "User ID is required",
            });
        }

        const user = await db
            .select({ credits: users.credits })
            .from(users)
            .where(eq(users.id, userId as string))
            .limit(1);

        if (!user.length) {
            return res.status(404).json({
                success: false,
                error: "User not found",
            });
        }

        res.json({
            success: true,
            data: {
                balance: user[0].credits,
            },
        });
    } catch (error) {
        console.error("Error fetching credits:", error);
        res.status(500).json({
            success: false,
            error: "Failed to fetch credits",
        });
    }
});

// GET /api/credits/transactions - Get transaction history
router.get("/transactions", async (req: Request, res: Response) => {
    try {
        const { userId, limit = "50", offset = "0" } = req.query;

        if (!userId) {
            return res.status(400).json({
                success: false,
                error: "User ID is required",
            });
        }

        const transactions = await db
            .select()
            .from(creditTransactions)
            .where(eq(creditTransactions.userId, userId as string))
            .orderBy(desc(creditTransactions.createdAt))
            .limit(parseInt(limit as string, 10))
            .offset(parseInt(offset as string, 10));

        res.json({
            success: true,
            data: transactions,
        });
    } catch (error) {
        console.error("Error fetching transactions:", error);
        res.status(500).json({
            success: false,
            error: "Failed to fetch transactions",
        });
    }
});

// POST /api/credits/purchase - Purchase credits
router.post("/purchase", async (req: Request, res: Response) => {
    try {
        const { userId, amount } = req.body;

        if (!userId || !amount || amount <= 0) {
            return res.status(400).json({
                success: false,
                error: "User ID and valid amount are required",
            });
        }

        // Update user credits
        await db
            .update(users)
            .set({
                credits: sql`${users.credits} + ${amount}`,
            })
            .where(eq(users.id, userId));

        // Record transaction
        const transaction = await db
            .insert(creditTransactions)
            .values({
                userId,
                amount,
                type: "purchase",
                description: "Credit purchase",
            })
            .returning();

        res.status(201).json({
            success: true,
            data: transaction[0],
        });
    } catch (error) {
        console.error("Error purchasing credits:", error);
        res.status(500).json({
            success: false,
            error: "Failed to purchase credits",
        });
    }
});

export default router;
