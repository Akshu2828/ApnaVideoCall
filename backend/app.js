import express from "express";
import { createServer } from "node:http";
import mongoose from "mongoose";
import cors from "cors";
import userRoutes from "./routes/userRoute.js";
import { connectToSocket } from "./controllers/socketManager.js";
import dotenv from "dotenv";
dotenv.config();

const app = express();
const server = createServer(app);
const io = connectToSocket(server);

app.use(cors());
app.use(express.json({ limit: "40kb" }));
app.use(express.urlencoded({ limit: "40kb", extended: true }));

app.use("/api/v1/users", userRoutes);

const dbUrl = process.env.MONGO_URL;

main()
  .then(() => {
    console.log("connected to DB Atlas");
  })
  .catch((err) => {
    console.log(err);
  });

async function main() {
  await mongoose.connect(dbUrl);
}

app.get("/home", (req, res) => {
  res.send("Hello World!");
});

server.listen(8000, () => {
  console.log("server is listening on port 8000");
});
