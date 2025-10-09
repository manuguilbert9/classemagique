
const {onRequest} = require("firebase-functions/v2/https");
const {setGlobalOptions} = require("firebase-functions/v2");
const next = require("next");

const dev = process.env.NODE_ENV !== "production";

// We can't use shared state between invocations of the same function,
// so we need to initialize the Next.js app every time.
const app = next({ dev, conf: { distDir: ".next" } });
const handle = app.getRequestHandler();

exports.nextServer = onRequest({ region: "us-central1" }, async (req, res) => {
    try {
        console.log("File: " + req.originalUrl);
        await app.prepare();
        return await handle(req, res);
    } catch (err) {
        console.error("Error handling Next.js request", err);
        res.status(500).send("Internal Server Error");
    }
});

setGlobalOptions({ region: "us-central1" });
