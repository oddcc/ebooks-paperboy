import express, { json } from "express";

import { checkBooksAndSend } from "./cronService.js";
import logger from "./logger.js";

const requiredEnvVars = [
  "EMAIL_USER",
  "EMAIL_PASS",
  "SENDER",
  "BOOKS",
  "RECEIVER",
];
const missingEnvVars = requiredEnvVars.filter((envVar) => !process.env[envVar]);
if (missingEnvVars.length) {
  const errorMessage = `Missing required environment variables: ${missingEnvVars.join(
    ", "
  )}`;
  logger.error(errorMessage);
  process.exit(1);
}

const app = express();
const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
  logger.info(`Server is running on port ${PORT}`);
});

process.on("SIGTERM", () => {
  logger.debug("SIGTERM signal received: closing HTTP server");
  server.close(() => {
    logger.debug("HTTP server closed");
  });
});

app.use(json());
app.use((req, res, next) => {
  logger.info(`Received a ${req.method} request for ${req.url}`);
  next();
});

app.post("/manual-send", async (req, res) => {
  try {
    await checkBooksAndSend();
  } catch (err) {
    logger.error(`manual send failed, err: ${err}`);
    res.status(500).send();
    return;
  }
  res.send("done");
});

app.get("/health", (req, res) => {
  res.send("Healthy");
});

app.get("/version", (req, res) => {
  res.send(require("../package.json").version);
});

import cron from "node-cron";

const CRONSTRING = process.env.CRONSTRING || "0 0 * * *";

if (process.env.NODE_ENV == "production") {
  cron.schedule(CRONSTRING, async () => {
    try {
      await checkBooksAndSend();
    } catch (err) {
      logger.error(`Cron job failed, err: ${err}`);
    }
  });
}
