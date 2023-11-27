import express from "express";
import http from "http";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import compression from "compression";
import cors from "cors";
import mongoose from "mongoose";
import router from "./router";
import "dotenv/config";

const app = express();

const PORT: number = 3001 || process.env.PORT;

app.use(
  cors({
    credentials: true,
  })
);

app.use(compression());
app.use(cookieParser());
app.use(bodyParser.json());

const server = http.createServer(app);

server.listen(PORT, () => {
  console.log(`server is running on port http://localhost:${PORT}/`);
});

const mongodbUri: any = process.env.DATABASEURI;

mongoose.Promise = Promise;
mongoose.connect(mongodbUri);
mongoose.connection.on("error", (error: Error) => console.log(error));

app.use("/", router());
