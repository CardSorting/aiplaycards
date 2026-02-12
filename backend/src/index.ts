import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import morgan from "morgan";
import dotenv from "dotenv";
import rateLimit from "express-rate-limit";

// Import routes
import cardsRouter from "./routes/cards";
import collectionsRouter from "./routes/collections";
import marketplaceRouter from "./routes/marketplace";
import creditsRouter from "./routes/credits";
import boosterRouter from "./routes/booster";
import notificationsRouter from "./routes/notifications";
import uploadsRouter from "./routes/uploads";
import yugiohRouter from "./routes/yugioh";
import mtgRouter from "./routes/mtg";
import healthRouter from "./routes/health";

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
            fontSrc: ["'self'", "https://fonts.gstatic.com"],
            imgSrc: ["'self'", "data:", "blob:", "https:", "http:"],
            connectSrc: ["'self'"],
        },
    },
    crossOriginEmbedderPolicy: false,
}));

// CORS - allow all origins for API
app.use(cors({
    origin: process.env.CORS_ORIGIN || "*",
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
}));

// Compression
app.use(compression());

// Logging
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));

// Rate limiting
const limiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || "60000"),
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || "100"),
    message: {
        success: false,
        error: "Too many requests, please try again later.",
    },
    standardHeaders: true,
    legacyHeaders: false,
});
app.use(limiter);

// Body parsing
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Health check
app.use("/health", healthRouter);

// API Routes
app.use("/api/cards", cardsRouter);
app.use("/api/collections", collectionsRouter);
app.use("/api/marketplace", marketplaceRouter);
app.use("/api/credits", creditsRouter);
app.use("/api/booster", boosterRouter);
app.use("/api/notifications", notificationsRouter);
app.use("/api/uploads", uploadsRouter);
app.use("/api/yugioh", yugiohRouter);
app.use("/api/mtg", mtgRouter);

// 404 handler
app.use((req: Request, res: Response) => {
    res.status(404).json({
        success: false,
        error: "Route not found",
        path: req.path,
    });
});

// Error handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error("Error:", err);
    res.status(500).json({
        success: false,
        error: "Internal server error",
        message: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📚 API Documentation: http://localhost:${PORT}/health`);
    console.log(`🔧 Environment: ${process.env.NODE_ENV || "development"}`);
});

export default app;
