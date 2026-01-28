import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import mongoose from "mongoose";

export const auth = betterAuth({
    
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