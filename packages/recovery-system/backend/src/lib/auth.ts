import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import mongoose from "mongoose";

let authInstance: any = null;

export const getAuth = () => {
    if (!authInstance) {
        authInstance = betterAuth({
            secret: process.env.BETTER_AUTH_SECRET || "super-secret-key-change-this-in-production-min-32-chars",
            baseURL: process.env.BETTER_AUTH_URL || "http://localhost:5000",
            
            database: mongodbAdapter(mongoose.connection.db as any),
            
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
    }
    return authInstance;
};

export const auth = getAuth();