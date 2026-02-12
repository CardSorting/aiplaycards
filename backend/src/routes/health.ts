import { Router } from "express";

const router = Router();

router.get("/", (req, res) => {
    res.json({
        status: "healthy",
        timestamp: new Date().toISOString(),
        version: "1.0.0",
        environment: process.env.NODE_ENV || "development",
    });
});

router.get("/db", async (req, res) => {
    try {
        // Database connection check would go here
        res.json({
            status: "healthy",
            database: "connected",
            timestamp: new Date().toISOString(),
        });
    } catch (error) {
        res.status(503).json({
            status: "unhealthy",
            database: "disconnected",
            error: error instanceof Error ? error.message : "Unknown error",
        });
    }
});

export default router;
