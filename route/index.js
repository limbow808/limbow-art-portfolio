// ...existing code...
"use strict";

const express = require("express");
const router  = express.Router();
const fs = require('fs');
const path = require('path');

const sitename = "| limbow";

function getImagesWithLayout() {
    const imagesDir = path.join(__dirname, '..', 'images', 'index');
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
    
    const layoutPatterns = [
        'span-2col span-1row',
        'span-1col span-1row',
        'span-1col span-1row',
        'span-1col span-1row',
        'span-1col span-1row',
        'span-2col span-1row',
        'span-2col span-1row',
        'span-2col span-1row',
        'span-1col span-1row',
        'span-1col span-1row',
        'span-2col span-2row',
        'span-2col span-1row',
        'span-1col span-1row',
        'span-1col span-1row',
        'span-1col span-1row',
        'span-1col span-1row',
        'span-4col span-1row',
        'span-2col span-2row',
        'span-2col span-2row',
        '',
        'span-3col span-2row',
        'span-1col span-1row'
    ];
    
    try {
        const files = fs.readdirSync(imagesDir);
        const imageFiles = files
            .filter(file => imageExtensions.includes(path.extname(file).toLowerCase()))
            .filter(file => file !== 'hero.png')
            .sort();
        
        return imageFiles.map((file, index) => ({
            filename: file,
            name: path.parse(file).name,
            path: `/images/index/${file}`,
            workType: '3D Artwork',
            cssClass: layoutPatterns[index % layoutPatterns.length] || 'span-1col span-1row'
        }));
        
    } catch (error) {
        console.error('Error reading images directory:', error);
        return [];
    }
}

// Add a route for the path /
router.get("/", (req, res) => {
    const images = getImagesWithLayout();
    let data = {
        title: `Overview ${sitename}`,
        images: images
    };

    res.render("portfolio/index", {...data, currentURL: req.originalUrl });
});

// (old /about rendering removed) - /about will redirect to /info for compatibility

// Info page (new - replaces About in navigation)
router.get("/info", (req, res) => {
    let data = {
        title: `Info ${sitename}`
    };

    res.render("portfolio/info", {...data, currentURL: req.originalUrl });
});

// Contact page
router.get("/contact", (req, res) => {
    let data = { title: `Contact ${sitename}` };
    res.render("portfolio/contact", {...data, currentURL: req.originalUrl });
});

// Impressum page
router.get("/impressum", (req, res) => {
    let data = { title: `Impressum ${sitename}` };
    res.render("portfolio/impressum", {...data, currentURL: req.originalUrl });
});

// Keep /about route for compatibility but render the info page
router.get("/about", (req, res) => {
    res.redirect(301, '/info');
});

/*
 * commission page
 */
router.get("/commissions", (req, res) => {
    let data = {
        title: `Commissions ${sitename}`
    };

    res.render("portfolio/commissions", {...data, currentURL: req.originalUrl });
});

/*
 * discography page
 */
router.get("/discography", (req, res) => {
    let data = {
        title: `Discography ${sitename}`
    };

    res.render("portfolio/discography", {...data, currentURL: req.originalUrl });
});

module.exports = router;
// ...existing code...