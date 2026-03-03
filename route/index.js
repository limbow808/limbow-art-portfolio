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
    const projectsDir = path.join(__dirname, '..', 'images', 'projects');
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
    const heroPattern = /^hero(\d+)$/i;

    try {
        const folders = fs.readdirSync(projectsDir, { withFileTypes: true })
            .filter(d => d.isDirectory())
            .map(d => d.name);

        const heroFolders = folders
            .map(folder => {
                const match = folder.match(heroPattern);
                if (!match) return null;
                return { folder, number: parseInt(match[1], 10) };
            })
            .filter(Boolean)
            .sort((a, b) => a.number - b.number);

        const results = [];
        for (const hero of heroFolders) {
            const folderPath = path.join(projectsDir, hero.folder);
            const files = fs.readdirSync(folderPath)
                .filter(f => imageExtensions.includes(path.extname(f).toLowerCase()))
                .filter(f => !/_v\d+/i.test(path.parse(f).name))
                .sort();
            if (files.length > 0) {
                const file = files[0];
                results.push({
                    filename: file,
                    name: hero.folder,
                    number: hero.number,
                    path: `/images/projects/${hero.folder}/${file}`,
                    workType: '3D Artwork'
                });
            }
        }

        return results;
    } catch (error) {
        console.error('Error reading hero images:', error);
        return [];
    }
}

function getImagesWithLayout() {
    const projectsDir = path.join(__dirname, '..', 'images', 'projects');
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
        const folders = fs.readdirSync(projectsDir, { withFileTypes: true })
            .filter(d => d.isDirectory())
            .map(d => d.name)
            .filter(name => !heroNamePattern.test(name))
            .sort();

        const result = [];

        for (const slug of folders) {
            const folderPath = path.join(projectsDir, slug);
            const files = fs.readdirSync(folderPath)
                .filter(f => imageExtensions.includes(path.extname(f).toLowerCase()))
                .sort();

            if (files.length === 0) continue;

            // Group into base + variants
            let baseFile = null;
            const variants = [];

            files.forEach(file => {
                const baseName = path.parse(file).name;
                const variantMatch = baseName.match(variantPattern);
                if (variantMatch) {
                    variants.push({
                        filename: file,
                        name: baseName,
                        path: `/images/projects/${slug}/${file}`,
                        variantNum: parseInt(variantMatch[2])
                    });
                } else if (!baseFile) {
                    baseFile = {
                        filename: file,
                        name: baseName,
                        path: `/images/projects/${slug}/${file}`
                    };
                }
            });

            if (!baseFile) continue;

            variants.sort((a, b) => a.variantNum - b.variantNum);

            const allVariants = [
                { filename: baseFile.filename, name: baseFile.name, path: baseFile.path },
                ...variants.map(v => ({ filename: v.filename, name: v.name, path: v.path }))
            ];

            // Read project.json
            let projectData = { title: baseFile.name, workType: '3D Artwork' };
            const projectJsonPath = path.join(folderPath, 'project.json');
            if (fs.existsSync(projectJsonPath)) {
                try { projectData = JSON.parse(fs.readFileSync(projectJsonPath, 'utf8')); } catch(e) {}
            }

            result.push({
                filename: baseFile.filename,
                name: projectData.title || baseFile.name,
                path: baseFile.path,
                workType: projectData.workType || '3D Artwork',
                slug: slug,
                cssClass: '',
                variants: allVariants
            });
        }
        
        // Sort by filename and apply layout patterns
        result.sort((a, b) => a.filename.localeCompare(b.filename));
        result.forEach((img, index) => {
            img.cssClass = layoutPatterns[index % layoutPatterns.length] || 'span-1col span-1row';
        });
        
        return result;
        
    } catch (error) {
        console.error('Error reading project images:', error);
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

    // Find the main gallery image matching this slug (check gallery + hero images)
    const allImages = getImagesWithLayout();
    let match = allImages.find(img => img.slug === slug);
    
    // If not found in gallery, check hero images
    if (!match) {
        const heroImages = getHeroImages();
        const heroMatch = heroImages.find(h => toSlug(h.name) === slug);
        if (heroMatch) {
            match = { path: heroMatch.path, variants: [] };
        }
    }
    
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
    // Exclude the main image and its variants so they don't appear twice
    const exts = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
    const mainAndVariantFiles = new Set();
    if (variants && variants.length > 0) {
        variants.forEach(v => { if (v.filename) mainAndVariantFiles.add(v.filename); });
    }
    // Also exclude the main image filename itself
    if (match && match.filename) mainAndVariantFiles.add(match.filename);
    // Fallback: derive filename from mainImagePath
    if (mainImagePath) {
        const mainFilename = path.basename(mainImagePath);
        mainAndVariantFiles.add(mainFilename);
    }

    let extraImages = [];
    if (fs.existsSync(projectDir)) {
        extraImages = fs.readdirSync(projectDir)
            .filter(f => exts.includes(path.extname(f).toLowerCase()))
            .filter(f => !mainAndVariantFiles.has(f))
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