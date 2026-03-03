// ...existing code...
"use strict";

const express = require("express");
const router  = express.Router();
const fs = require('fs');
const path = require('path');

const sitename = "| limbow";

function toSlug(name) {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function getHeroImages() {
    const imagesDir = path.join(__dirname, '..', 'images', 'index');
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
    const heroPattern = /^hero(\d+)$/i;

    try {
        const files = fs.readdirSync(imagesDir);

        const numberedHeroFiles = files
            .filter(file => imageExtensions.includes(path.extname(file).toLowerCase()))
            .map((file) => {
                const parsed = path.parse(file).name;
                const match = parsed.match(heroPattern);

                if (!match) {
                    return null;
                }

                return {
                    filename: file,
                    name: parsed,
                    number: parseInt(match[1], 10),
                    path: `/images/index/${file}`,
                    workType: '3D Artwork'
                };
            })
            .filter(Boolean)
            .sort((a, b) => a.number - b.number);

        if (numberedHeroFiles.length > 0) {
            return numberedHeroFiles;
        }

        const fallbackHero = files.find(file => /^hero\.[a-z0-9]+$/i.test(file));
        if (fallbackHero) {
            return [{
                filename: fallbackHero,
                name: path.parse(fallbackHero).name,
                number: 0,
                path: `/images/index/${fallbackHero}`,
                workType: '3D Artwork'
            }];
        }

        return [];
    } catch (error) {
        console.error('Error reading hero images directory:', error);
        return [];
    }
}

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
    
    const heroNamePattern = /^hero(\d+)?$/i;
    const variantPattern = /^(.+)_v(\d+)$/i;

    try {
        const files = fs.readdirSync(imagesDir);
        const imageFiles = files
            .filter(file => imageExtensions.includes(path.extname(file).toLowerCase()))
            .filter(file => !heroNamePattern.test(path.parse(file).name))
            .sort();
        
        // Group images by base name (handle variants)
        const imageGroups = new Map();
        
        imageFiles.forEach(file => {
            const parsed = path.parse(file);
            const baseName = parsed.name;
            const variantMatch = baseName.match(variantPattern);
            
            if (variantMatch) {
                // This is a variant (_v2, _v3, etc.)
                const baseImageName = variantMatch[1];
                const variantNum = parseInt(variantMatch[2]);
                
                if (!imageGroups.has(baseImageName)) {
                    imageGroups.set(baseImageName, {
                        base: null,
                        variants: []
                    });
                }
                
                imageGroups.get(baseImageName).variants.push({
                    filename: file,
                    name: baseName,
                    path: `/images/index/${file}`,
                    variantNum: variantNum
                });
            } else {
                // This is a base image (no variant suffix)
                if (!imageGroups.has(baseName)) {
                    imageGroups.set(baseName, {
                        base: null,
                        variants: []
                    });
                }
                
                imageGroups.get(baseName).base = {
                    filename: file,
                    name: baseName,
                    path: `/images/index/${file}`
                };
            }
        });
        
        // Build final image list with variants attached
        const result = [];
        imageGroups.forEach((group, baseName) => {
            if (group.base) {
                // Sort variants by number
                group.variants.sort((a, b) => a.variantNum - b.variantNum);
                
                // Include base image as first item in variants array for cycling
                const allVariants = [
                    {
                        filename: group.base.filename,
                        name: group.base.name,
                        path: group.base.path
                    },
                    ...group.variants.map(v => ({
                        filename: v.filename,
                        name: v.name,
                        path: v.path
                    }))
                ];
                
                const slug = toSlug(group.base.name);
                const projectDir = path.join(__dirname, '..', 'images', 'projects', slug);
                let projectData = { title: group.base.name, software: '', workType: '3D Artwork', notes: '' };
                const projectJsonPath = path.join(projectDir, 'project.json');
                if (fs.existsSync(projectJsonPath)) {
                    try { projectData = JSON.parse(fs.readFileSync(projectJsonPath, 'utf8')); } catch(e) {}
                }

                result.push({
                    filename: group.base.filename,
                    name: projectData.title || group.base.name,
                    path: group.base.path,
                    workType: projectData.workType || '3D Artwork',
                    slug: slug,
                    cssClass: '',
                    variants: allVariants
                });
            }
        });
        
        // Sort by filename and apply layout patterns
        result.sort((a, b) => a.filename.localeCompare(b.filename));
        result.forEach((img, index) => {
            img.cssClass = layoutPatterns[index % layoutPatterns.length] || 'span-1col span-1row';
        });
        
        return result;
        
    } catch (error) {
        console.error('Error reading images directory:', error);
        return [];
    }
}

// Add a route for the path /
router.get("/", (req, res) => {
    const heroImages = getHeroImages();
    const images = getImagesWithLayout();
    
    // Debug: log images with variants
    const imagesWithVariants = images.filter(img => img.variants && img.variants.length > 0);
    if (imagesWithVariants.length > 0) {
        console.log('Images with variants:', imagesWithVariants.map(img => ({
            name: img.name,
            variantCount: img.variants.length,
            variants: img.variants.map(v => v.name)
        })));
    }
    
    let data = {
        title: `Overview ${sitename}`,
        heroImages: heroImages,
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

/*
 * project detail page
 */
router.get("/project/:slug", (req, res) => {
    const slug = req.params.slug;
    const projectDir = path.join(__dirname, '..', 'images', 'projects', slug);
    const projectJsonPath = path.join(projectDir, 'project.json');

    if (!fs.existsSync(projectJsonPath)) {
        return res.status(404).render('portfolio/index', {
            title: `Not Found ${sitename}`,
            heroImages: [],
            images: [],
            currentURL: req.originalUrl
        });
    }

    let projectData;
    try {
        projectData = JSON.parse(fs.readFileSync(projectJsonPath, 'utf8'));
    } catch (e) {
        return res.status(500).send('Error reading project data');
    }

    // Find the main gallery image matching this slug
    const allImages = getImagesWithLayout();
    const match = allImages.find(img => img.slug === slug);
    const mainImagePath = match ? match.path : '';
    const variants = match && match.variants ? match.variants : [];

    // Read workflow images from project subfolder
    const workflowDir = path.join(projectDir, 'workflow');
    let workflowImages = [];
    if (fs.existsSync(workflowDir)) {
        const exts = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
        workflowImages = fs.readdirSync(workflowDir)
            .filter(f => exts.includes(path.extname(f).toLowerCase()))
            .sort()
            .map(f => `/images/projects/${slug}/workflow/${f}`);
    }

    // Read any extra images directly inside the project folder (not workflow)
    const exts = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
    let extraImages = [];
    if (fs.existsSync(projectDir)) {
        extraImages = fs.readdirSync(projectDir)
            .filter(f => exts.includes(path.extname(f).toLowerCase()))
            .sort()
            .map(f => `/images/projects/${slug}/${f}`);
    }

    res.render('portfolio/project', {
        title: `${projectData.title || slug} ${sitename}`,
        project: projectData,
        slug: slug,
        mainImagePath: mainImagePath,
        variants: variants,
        workflowImages: workflowImages,
        extraImages: extraImages,
        currentURL: req.originalUrl
    });
});

module.exports = router;