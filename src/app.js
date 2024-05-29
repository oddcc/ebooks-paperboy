import express, { json } from "express";
import { sendMiddleware } from "./sendMiddleware.js";

const requiredEnvVars = ["EMAIL_USER", "EMAIL_PASS", "SENDER"];
const missingEnvVars = requiredEnvVars.filter((envVar) => !process.env[envVar]);
if (missingEnvVars.length) {
  const errorMessage = `Missing required environment variables: ${missingEnvVars.join(
    ", "
  )}`;
  console.error(errorMessage);
  process.exit(1);
}

const app = express();
const port = 3000;
const server = app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

process.on("SIGTERM", () => {
  console.debug("SIGTERM signal received: closing HTTP server");
  server.close(() => {
    console.debug("HTTP server closed");
  });
});

app.use(json());

app.post("/send", sendMiddleware);

app.get("/health", (req, res) => {
  res.send("Healthy");
});

app.get("/version", (req, res) => {
  res.send(require("../package.json").version);
});
