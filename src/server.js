import dotenv from "dotenv"
import connectDB from "./db/index.js"
import { app } from "./app.js"
import { initBatchScheduler } from "./services/batchScheduler.service.js"

dotenv.config({
    path:"./.env",
    origin:"*"
})
// connect database
connectDB().then(()=>{
    app.listen(process.env.PORT||3000,()=>{
        console.log(`server is running at: ${process.env.PORT}`)
    });
    app.get("/", (req, res) => {
        res.send("hey are u there!");
    });
    // Initialize background batch scheduler for metric calculations and rankings
    initBatchScheduler();
})
.catch((error)=>{
    console.error(`database connection failed error:${error}`);
    process.exit(0);
})