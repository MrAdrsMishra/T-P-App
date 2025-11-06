import mongoose, { connect } from "mongoose"
import {DATABASE_NAME} from '../constant.js'

const connectDB = async()=>{
   try {
     const connectionInsatce = await mongoose.connect(`${process.env.MONGODB_URL}/${DATABASE_NAME}`)
     console.log(`Database connected successfully${connectionInsatce.connection.host}`)
 }
   catch (error) {
    console.log("error found in databse connection",error)
    process.exit(1);
   }
}
export default connectDB;