import mongoose from 'mongoose'

const connectDB = async () => {
    try {                                                                           //try
        const conn = await mongoose.connect(process.env.MONGO_URI)                      //connect to db
        console.log(`MongoDB connected: ${conn.connection.host}`.cyan.underline)        //log success message
    } catch (error) {                                                               //catch
        console.log(error.message)                                                      //log error
        process.exit(1)                                                                 //exit process
    }
}

export default connectDB