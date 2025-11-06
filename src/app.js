 import express from'express'
 import cookieParser from 'cookie-parser';
 import cors from "cors"
 import path from 'path'
 import { fileURLToPath } from 'url'
 const app = express();

const __dirname = path.dirname(fileURLToPath(import.meta.url))
// cors config
app.use(cors({
    origin:process.env.CORS_ORIGIN,
    credentials:true
}))
// for limit of data transfer
app.use(express.json({
    limit:"16kb"
}))
// for reading data on encoded url of text
app.use(express.urlencoded({
    extended:true,
    limit:"16kb"
}))
// for static assets usage
app.use("/accessstatic",express.static(path.join(__dirname,'public')))
// for cookies handling
app.use(cookieParser())

// starting of any api
import userRouter from './routes/user.routes.js'
import { link }from 'fs';
import testRouter from './routes/test.routes.js';
app.use("/v1/user/auth",userRouter)
app.use("/v1/user/test",testRouter)
export {app}
