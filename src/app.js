import express, { json } from "express";
// import cron from "node-cron";

import { sendMiddleware } from "./sendMiddleware.js";
import { checkBooksAndSend } from "./cronService.js";

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
const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

process.on("SIGTERM", () => {
  console.debug("SIGTERM signal received: closing HTTP server");
  server.close(() => {
    console.debug("HTTP server closed");
  });
});

app.use(json());

app.post("/send", sendMiddleware);
app.post("/manual-send", async (req, res) => {
  await checkBooksAndSend();
  res.send("done");
});

app.get("/health", (req, res) => {
  res.send("Healthy");
});

app.get("/version", (req, res) => {
  res.send(require("../package.json").version);
});

// cron.schedule("* * * * *", async () => {
//   await checkBooksAndSend();
// });
