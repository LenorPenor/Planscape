//external
import express from 'express'
import colors from 'colors'
import cors from 'cors'
import dotenv from 'dotenv'
import cookieParser from 'cookie-parser'

//internal
import userRoutes from './routes/userRoutes.js'
import projectRoutes from './routes/projectRoutes.js'
import listRoutes from './routes/listRoutes.js'
import taskRoutes from './routes/taskRoutes.js'

import connectDB from './config/db.js'

dotenv.config()

//connect to db
connectDB()

//set port & express app
const PORT = process.env.PORT ?? 5000
const app = express()

//use middleware for body parsing
app.use(express.json())
app.use(express.urlencoded({extended: false}))

//use cors
app.use(cors({credentials: true, origin: 'http://localhost:3000'}))

//use cookieparser
app.use(cookieParser())

//use routes
app.use('/api/users', userRoutes)
app.use('/api/projects', projectRoutes)
app.use('/api/lists', listRoutes)
app.use('/api/tasks', taskRoutes)

app.get("/", (req, res) => {
   res.send("API running.")
})

//listen on PORT and log success message message on callback
app.listen(PORT, () => {
   console.log(`server running on port ${PORT}`.magenta.underline)
})
