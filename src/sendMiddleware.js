import { doSend } from "./emailService.js";

export async function sendMiddleware(req, res) {
  if (!req.body.to) {
    res
      .status(400)
      .send("Must have 'to' property which includes receivers' addresses.");
    return;
  }

  console.log(
    `Got book name: ${req.body.path}, size: ${req.body.size}, sha: ${req.body.sha}`
  );
  await doSend(req.body, req.body.to);
  res.send("done");
}
