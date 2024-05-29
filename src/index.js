const express = require('express')

const nodemailer = require("nodemailer");
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.163.com",
  port: process.env.SMTP_PORT || 465,
  secure: !process.env.SMTP_PORT || process.env.SMTP_PORT == 465,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const https = require('https');
const url = require('url');

const requiredEnvVars = ['EMAIL_USER', 'EMAIL_PASS', 'SENDER'];

const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length) {
  const errorMessage = `Missing required environment variables: ${missingEnvVars.join(', ')}`;
  console.error(errorMessage);
  process.exit(1);
}

const app = express()
const port = 3000
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

app.use(express.json())

app.get('/', (req, res) => {
  res.send(`${process.env.SENDER}`)
})

app.get('/health', (req, res) => {
  res.send("Healthy")
})

app.get('/version', (req, res) => {
  res.send(require('../package.json').version)
})

app.post('/send', async (req, res) => {
  if (!req.body.to) {
    res.status(400).send("Must have 'to' property which includes receivers' addresses.")
    return
  }

  console.log(`Got book name: ${req.body.path}, size: ${req.body.size}, sha: ${req.body.sha}`)
  await doSend(req.body)
  res.send("done")
})

async function doSend(req) {
  let mesg = await consMesg(req)
  const result = await transporter.sendMail(mesg);
  console.log("Message sent: %s", result.messageId);
}

async function consMesg(req) {
  let data = JSON.parse(await getData(req.url, req.size));

  let mesg = {
    from: process.env.SENDER,
    to: req.to,
    subject: req.path,
    attachments: [
      {
        filename: req.path,
        content: data.content,
        encoding: 'base64',
      }
    ]
  }

  return mesg
}

function getData(urlStr, size) {
  return new Promise((resolve, reject) => {
    let parsedUrl = url.parse(urlStr, true);
    const options = {
      host: parsedUrl.hostname,
      path: parsedUrl.pathname,
      port: parsedUrl.port,
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
      },
    };

    let request = https.get(options, (res) => {
      if (res.statusCode !== 200) {
        console.error(`Did not get an OK from the server. Code: ${res.statusCode}`);
        res.resume();
        return;
      }
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        console.log(`Retrieved all data, length: ${data.length}`);
        resolve(data);
      });
    });

    request.on('error', (err) => {
      console.error(err)
      reject(err);
    });
  })
}