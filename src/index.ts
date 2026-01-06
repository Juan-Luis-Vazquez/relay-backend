import "dotenv/config";
import express from "express";
import { connectDB } from "./config/db.js";
import authRoutes from "./routes/auth.routes.js";

const app = express();
app.use(express.json());

app.use("/auth", authRoutes);

const PORT = Number(process.env.PORT) || 3000;

const start = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`Server in http://localhost:${PORT}`);
  });
};

start();
