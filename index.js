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
const apiRouter = require("./route/api.js");
const middleware = require("./middleware/index.js");
const fs = require("fs");

app.set("view engine", "ejs");

app.use(middleware.logIncomingToConsole);

// API routes (for React frontend)
app.use("/api", apiRouter);

// Serve React build (production)
const distPath = path.join(__dirname, "dist");
if (fs.existsSync(distPath)) {
    app.use(express.static(distPath));
}

app.use(express.static(path.join(__dirname, "public")));
app.use("/", routeIndex);

// Image optimization route — handles any nested path under /images/
// Supports ?w= for resize and automatic WebP conversion when browser supports it
app.get("/images/*", async (req, res, next) => {
    const width = parseInt(req.query.w, 10) || null;

    // If no resize requested, fall through to static serving
    if (!width) return next();

    try {
        const relativePath = req.params[0]; // everything after /images/
        const imagePath = path.join(__dirname, "images", relativePath);

        if (!fs.existsSync(imagePath)) {
            return next(); // let static handler 404
        }

        const metadata = await sharp(imagePath).metadata();
        let image = sharp(imagePath).resize({ width, withoutEnlargement: true });

        // Convert to WebP if the browser supports it
        const acceptHeader = req.headers.accept || '';
        if (acceptHeader.includes('image/webp')) {
            image = image.webp({ quality: 82 });
            res.type('image/webp');
        } else {
            // Serve in original format
            res.type(`image/${metadata.format === 'jpg' ? 'jpeg' : metadata.format}`);
        }

        const buffer = await image.toBuffer();
        // Cache optimized images for 7 days
        res.set('Cache-Control', 'public, max-age=604800, immutable');
        res.send(buffer);
    } catch (error) {
        console.error('Image processing error:', error.message);
        next(); // fall through to static on error
    }
});

app.use("/images", express.static("images"));

// Sitemap route
app.get("/sitemap.xml", (req, res) => {
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const recentDir = path.join(__dirname, 'images', 'recent-work');
    const galleryDir = path.join(__dirname, 'images', 'gallery');
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];

    let projectSlugs = [];
    if (fs.existsSync(recentDir)) {
        projectSlugs = projectSlugs.concat(
            fs.readdirSync(recentDir, { withFileTypes: true })
                .filter(d => d.isDirectory())
                .map(d => d.name)
        );
    }
    if (fs.existsSync(galleryDir)) {
        projectSlugs = projectSlugs.concat(
            fs.readdirSync(galleryDir, { withFileTypes: true })
                .filter(d => d.isDirectory())
                .map(d => d.name)
        );
    }

    const staticPages = ['/', '/info', '/contact', '/impressum'];
    const urls = staticPages.map(p => `  <url><loc>${baseUrl}${p}</loc><changefreq>monthly</changefreq></url>`);
    projectSlugs.forEach(slug => {
        urls.push(`  <url><loc>${baseUrl}/project/${slug}</loc><changefreq>monthly</changefreq></url>`);
    });

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>`;

    res.header('Content-Type', 'application/xml');
    res.send(sitemap);
});

// SPA catch-all — serve React index.html for client-side routes
const reactIndex = path.join(__dirname, "dist", "index.html");
if (fs.existsSync(reactIndex)) {
    app.get("*", (req, res) => {
        res.sendFile(reactIndex);
    });
}

app.listen(port, '0.0.0.0', () => {
    console.info(`Server is listening on port ${port}.`);
});
