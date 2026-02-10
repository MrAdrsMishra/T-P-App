import express from 'express'
import cookieParser from 'cookie-parser';
import cors from "cors"
import path from 'path'
import { fileURLToPath } from 'url'
const app = express();

const __dirname = path.dirname(fileURLToPath(import.meta.url))
// cors config
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))
// for limit of data transfer
app.use(express.json({
    limit: "16kb"
}))
// for reading data on encoded url of text
app.use(express.urlencoded({
    extended: true,
    limit: "16kb"
}))
// for static assets usage
app.use("/accessstatic", express.static(path.join(__dirname, 'public')))
// for cookies handling
app.use(cookieParser())


import commonRouter from "./routes/common-routes/common.routes.js";
import adminRouter from "./routes/admin-routes/admin.routes.js";
import studentRouter from "./routes/student-routes/student.routes.js";
import testRouter from "./routes/test-routes/test.routes.js";
import practiceSolutionRouter from "./routes/practice-routes/practice-solution.routes.js";

// starting of any api
app.use('/api/v1/admin', adminRouter)
app.use('/api/v1/student', studentRouter)
app.use('/api/v1/user', commonRouter)
app.use('/api/v1/practice', practiceSolutionRouter)
app.use('/api/v1/test', testRouter)
export { app }
