import dotenv from 'dotenv'
import path from 'path'
import express from 'express'
// import { prisma } from './db/prisma.js'
import { fileURLToPath } from 'url'
import { routeHandler } from './routes/routes.js'
import cors from 'cors'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const app = express()
const PORT = process.env.PORT || 3001

dotenv.config()

// Configure CORS to allow requests from your React application's domain
const corsOptions = {
  origin: 'http://localhost:3000', // replace with your React app's URL
  optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}

app.use(cors(corsOptions))
app.use(express.static(path.join(__dirname, '../client/build')))

routeHandler(app)

// This serves the React app in production
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/build/index.html'))
})

app.listen(PORT, () => {
});
