/**
 * Express server.
 */
"use strict";

const port    = process.env.PORT || 4000;
const sharp   = require("sharp");
const path    = require("path");
const express = require("express");
const app     = express();
const routeIndex = require("./route/index.js");
const middleware = require("./middleware/index.js");
const fs = require("fs");

app.set("view engine", "ejs");

app.use(middleware.logIncomingToConsole);
app.use(express.static(path.join(__dirname, "public")));
app.use("/", routeIndex);

app.listen(port, '0.0.0.0', () => {
  logStartUpDetailsToConsole();
  console.log(`Server is running on port ${port}`);
});

app.get("/images/:folder/:filename", async (req, res) => {
    try {
        console.log("Route hit")
        const { folder, filename } = req.params;
        const width = parseInt(req.query.w, 10) || null; // Get width from ?w=xxx
        const imagePath = path.join(__dirname, "images", folder, filename);

        // Check if file exists
        if (!fs.existsSync(imagePath)) {
            console.log("File does not exist: ", imagePath);
            return res.status(404).send("Image not found");
        }

        const metadata = await sharp(imagePath).metadata();
        const format = metadata.format; // Get image format (png, jpg, etc.)
        console.log("Original Image Metadata:", metadata);

        let image = sharp(imagePath);

        if (width) {
            image = image.resize({ width, withoutEnlargement: true }); // Resize with limit
        }

        const buffer = await image.toBuffer();

        res.type("image/png"); // Adjust the file type accordingly
        res.send(buffer);
    } catch (error) {
        console.error(error);
        res.status(500).send("Error processing image");
    }
});

app.use("/images", express.static("images"));

/**
 * Log app details to console when starting up.
 *
 * @return {void}
 */
function logStartUpDetailsToConsole() {
    let routes = [];

    // Find what routes are supported
    app._router.stack.forEach((middleware) => {
        if (middleware.route) {
            // Routes registered directly on the app
            routes.push(middleware.route);
        } else if (middleware.name === "router") {
            // Routes added as router middleware
            middleware.handle.stack.forEach((handler) => {
                let route;

                route = handler.route;
                route && routes.push(route);
            });
        }
    });

    console.info(`Server is listening on port ${port}.`);
    console.info("Available routes are:");
    console.info(routes);
}
