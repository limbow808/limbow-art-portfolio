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
                .filter(f => {
                    if (!imageExtensions.includes(path.extname(f).toLowerCase())) return false;
                    // Only include actual files (not directories)
                    return fs.statSync(path.join(folderPath, f)).isFile();
                })
                .sort();

            if (files.length === 0) continue;

            // The base/main image is the first non-variant image in the root
            const baseFile = {
                filename: files[0],
                name: path.parse(files[0]).name,
                path: `/images/projects/${slug}/${files[0]}`
            };

            // Read variants from viewer/ subfolder
            const viewerDir = path.join(folderPath, 'viewer');
            let allVariants = [];
            if (fs.existsSync(viewerDir)) {
                const viewerFiles = fs.readdirSync(viewerDir)
                    .filter(f => imageExtensions.includes(path.extname(f).toLowerCase()))
                    .sort();
                allVariants = viewerFiles.map(f => ({
                    filename: f,
                    name: path.parse(f).name,
                    path: `/images/projects/${slug}/viewer/${f}`
                }));
            }

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

    const exts = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];

    // Find the main gallery image (root of project folder, first non-variant)
    const allImages = getImagesWithLayout();
    let match = allImages.find(img => img.slug === slug);
    if (!match) {
        const heroImages = getHeroImages();
        const heroMatch = heroImages.find(h => toSlug(h.name) === slug);
        if (heroMatch) {
            match = { path: heroMatch.path, variants: [] };
        }
    }
    const mainImagePath = match ? match.path : '';

    // Read VIEWER sections — supports viewer/, viewer-2/, viewer-3/, etc.
    const viewerSections = [];
    const allEntries = fs.readdirSync(projectDir, { withFileTypes: true });
    const viewerDirs = allEntries
        .filter(d => d.isDirectory() && /^viewer(-\d+)?$/i.test(d.name))
        .map(d => d.name)
        .sort((a, b) => {
            const numA = a === 'viewer' ? 1 : parseInt(a.split('-')[1]);
            const numB = b === 'viewer' ? 1 : parseInt(b.split('-')[1]);
            return numA - numB;
        });

    for (const vDir of viewerDirs) {
        const vPath = path.join(projectDir, vDir);
        const images = fs.readdirSync(vPath)
            .filter(f => exts.includes(path.extname(f).toLowerCase()))
            .sort()
            .map(f => ({
                filename: f,
                name: path.parse(f).name,
                path: `/images/projects/${slug}/${vDir}/${f}`
            }));

        if (images.length > 0) {
            // Use a label.txt inside the viewer folder, or default to "Variants" / "Variants 2" etc.
            let label = viewerDirs.length === 1 ? '' : (vDir === 'viewer' ? 'Variants' : 'Variants ' + vDir.split('-')[1]);
            const labelFile = path.join(vPath, 'label.txt');
            if (fs.existsSync(labelFile)) {
                label = fs.readFileSync(labelFile, 'utf8').trim();
            }

            viewerSections.push({ label, images });
        }
    }

    // Read GALLERY items — supports gallery.json for ordering + notes, or auto-reads images
    const galleryDir = path.join(projectDir, 'gallery');
    let galleryItems = [];
    if (fs.existsSync(galleryDir)) {
        const galleryJsonPath = path.join(galleryDir, 'gallery.json');
        if (fs.existsSync(galleryJsonPath)) {
            try {
                const entries = JSON.parse(fs.readFileSync(galleryJsonPath, 'utf8'));
                galleryItems = entries.map(entry => {
                    if (entry.image) {
                        return { type: 'image', src: `/images/projects/${slug}/gallery/${entry.image}` };
                    } else if (entry.note) {
                        return { type: 'note', text: entry.note };
                    }
                    return null;
                }).filter(Boolean);
            } catch (e) {
                console.error('Error reading gallery.json for', slug, e);
            }
        }

        // Fallback: if no gallery.json or it was empty, auto-read all images
        if (galleryItems.length === 0) {
            galleryItems = fs.readdirSync(galleryDir)
                .filter(f => exts.includes(path.extname(f).toLowerCase()))
                .sort()
                .map(f => ({ type: 'image', src: `/images/projects/${slug}/gallery/${f}` }));
        }
    }

    // Read WORKFLOW images from workflow/ subfolder
    const workflowDir = path.join(projectDir, 'workflow');
    let workflowImages = [];
    if (fs.existsSync(workflowDir)) {
        workflowImages = fs.readdirSync(workflowDir)
            .filter(f => exts.includes(path.extname(f).toLowerCase()))
            .sort()
            .map(f => `/images/projects/${slug}/workflow/${f}`);
    }

    res.render('portfolio/project', {
        title: `${projectData.title || slug} ${sitename}`,
        project: projectData,
        slug: slug,
        mainImagePath: mainImagePath,
        viewerSections: viewerSections,
        galleryItems: galleryItems,
        workflowImages: workflowImages,
        currentURL: req.originalUrl
    });
});

module.exports = router;