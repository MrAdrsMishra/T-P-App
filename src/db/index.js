import mongoose, { connect } from "mongoose"


const connectDB = async()=>{
   try {
     const connectionInsatce = await mongoose.connect(`${process.env.MONGODB_URL}/${process.env.DATABASE_NAME}`)
     console.log(`Database connected successfully${connectionInsatce.connection.host}`)
 }
   catch (error) {
    console.log("error found in databse connection",error)
    process.exit(1);
   }
}
export default connectDB;