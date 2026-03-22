import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import mongoose from "mongoose";

const baseURL =
    process.env.BETTER_AUTH_URL ||
    process.env.BACKEND_URL ||
    "http://localhost:5000";

const trustedOrigins = Array.from(
    new Set(
        [
            baseURL,
            process.env.FRONTEND_URL,
            process.env.CORS_ORIGINS,
            "http://localhost:3000",
            "http://localhost:5173",
        ]
            .filter(Boolean)
            .flatMap((value) => String(value).split(","))
            .map((value) => value.trim())
            .filter(Boolean)
    )
);

export const auth = betterAuth({
    
    database: mongodbAdapter(mongoose.connection.db as any),
    
    baseURL,
    trustedOrigins,
    
    emailAndPassword: {  
        enabled: true,
    },
    
    user: {
        modelName: "users", 
    },
    session: {
        modelName: "sessions",
    },
    verification: {
        modelName: "verifications",
    }
});