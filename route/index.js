// ...existing code...
"use strict";

const express = require("express");
const router  = express.Router();
const fs = require('fs');
const path = require('path');

const sitename = "| limbow";

// Load pre-built image metadata (aspect ratio + avg color)
const metaCachePath = path.join(__dirname, '..', 'data', 'image-meta.json');
let imageMetaCache = {};
try { imageMetaCache = JSON.parse(fs.readFileSync(metaCachePath, 'utf8')); } catch (e) {}

function getImageMeta(absPath) {
    const rel = path.relative(path.join(__dirname, '..'), absPath).replace(/\\/g, '/');
    return imageMetaCache[rel] || { aspectRatio: '1/1', avgColor: '#e8e8e8' };
}

function toSlug(name) {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function getHeroImages() {
    const recentDir = path.join(__dirname, '..', 'images', 'recent-work');
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];

    try {
        if (!fs.existsSync(recentDir)) return [];

        const folders = fs.readdirSync(recentDir, { withFileTypes: true })
            .filter(d => d.isDirectory())
            .map(d => d.name)
            .sort();

        const results = [];
        for (const folder of folders) {
            const folderPath = path.join(recentDir, folder);

            // Read project.json for title and workType
            let projectData = { title: folder, workType: '3D Artwork' };
            const projectJsonPath = path.join(folderPath, 'project.json');
            if (fs.existsSync(projectJsonPath)) {
                try { projectData = JSON.parse(fs.readFileSync(projectJsonPath, 'utf8')); } catch(e) {}
            }

            // Check for thumbnail/ subfolder first
            const thumbDir = path.join(folderPath, 'thumbnail');
            let thumbFile = null;
            if (fs.existsSync(thumbDir)) {
                const thumbFiles = fs.readdirSync(thumbDir)
                    .filter(f => imageExtensions.includes(path.extname(f).toLowerCase()))
                    .sort();
                if (thumbFiles.length > 0) thumbFile = thumbFiles[0];
            }

            if (thumbFile) {
                const imgPath = path.join(thumbDir, thumbFile);
                const meta = getImageMeta(imgPath);
                results.push({
                    filename: thumbFile,
                    name: projectData.title || folder,
                    slug: folder,
                    path: `/images/recent-work/${folder}/thumbnail/${thumbFile}`,
                    workType: projectData.workType || '3D Artwork',
                    aspectRatio: meta.aspectRatio,
                    avgColor: meta.avgColor
                });
            } else {
                const files = fs.readdirSync(folderPath)
                    .filter(f => imageExtensions.includes(path.extname(f).toLowerCase()))
                    .filter(f => {
                        try { return fs.statSync(path.join(folderPath, f)).isFile(); } catch(e) { return false; }
                    })
                    .sort();
                if (files.length > 0) {
                    const imgPath = path.join(folderPath, files[0]);
                    const meta = getImageMeta(imgPath);
                    results.push({
                        filename: files[0],
                        name: projectData.title || folder,
                        slug: folder,
                        path: `/images/recent-work/${folder}/${files[0]}`,
                        workType: projectData.workType || '3D Artwork',
                        aspectRatio: meta.aspectRatio,
                        avgColor: meta.avgColor
                    });
                }
            }
        }

        return results;
    } catch (error) {
        console.error('Error reading recent-work images:', error);
        return [];
    }
}

function getImagesWithLayout() {
    const galleryDir = path.join(__dirname, '..', 'images', 'gallery');
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
        if (!fs.existsSync(galleryDir)) return [];

        const folders = fs.readdirSync(galleryDir, { withFileTypes: true })
            .filter(d => d.isDirectory())
            .map(d => d.name)
            .sort();

        const result = [];

        for (const slug of folders) {
            const folderPath = path.join(galleryDir, slug);
            const files = fs.readdirSync(folderPath)
                .filter(f => {
                    if (!imageExtensions.includes(path.extname(f).toLowerCase())) return false;
                    return fs.statSync(path.join(folderPath, f)).isFile();
                })
                .sort();

            if (files.length === 0) continue;

            // Check for thumbnail/ subfolder first
            const thumbDir = path.join(folderPath, 'thumbnail');
            let baseFile;
            if (fs.existsSync(thumbDir)) {
                const thumbFiles = fs.readdirSync(thumbDir)
                    .filter(f => imageExtensions.includes(path.extname(f).toLowerCase()))
                    .sort();
                if (thumbFiles.length > 0) {
                    baseFile = {
                        filename: thumbFiles[0],
                        name: path.parse(thumbFiles[0]).name,
                        path: `/images/gallery/${slug}/thumbnail/${thumbFiles[0]}`
                    };
                }
            }
            if (!baseFile) {
                baseFile = {
                    filename: files[0],
                    name: path.parse(files[0]).name,
                    path: `/images/gallery/${slug}/${files[0]}`
                };
            }

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
                    path: `/images/gallery/${slug}/viewer/${f}`
                }));
            }

            // Read project.json
            let projectData = { title: baseFile.name, workType: '3D Artwork' };
            const projectJsonPath = path.join(folderPath, 'project.json');
            if (fs.existsSync(projectJsonPath)) {
                try { projectData = JSON.parse(fs.readFileSync(projectJsonPath, 'utf8')); } catch(e) {}
            }

            // Resolve the actual file path for aspect ratio
            const actualFilePath = baseFile.path.startsWith('/images/gallery/')
                ? path.join(__dirname, '..', baseFile.path)
                : path.join(galleryDir, slug, baseFile.filename);
            const meta = getImageMeta(actualFilePath);

            result.push({
                filename: baseFile.filename,
                name: projectData.title || baseFile.name,
                path: baseFile.path,
                workType: projectData.workType || '3D Artwork',
                slug: slug,
                cssClass: '',
                variants: allVariants,
                aspectRatio: meta.aspectRatio,
                avgColor: meta.avgColor
            });
        }
        
        // Sort by filename and apply layout patterns
        result.sort((a, b) => a.filename.localeCompare(b.filename));
        result.forEach((img, index) => {
            img.cssClass = layoutPatterns[index % layoutPatterns.length] || 'span-1col span-1row';
        });
        
        return result;
        
    } catch (error) {
        console.error('Error reading gallery images:', error);
        return [];
    }
}

// Add a route for the path /
router.get("/", (req, res) => {
    const heroImages = getHeroImages();
    const images = getImagesWithLayout();
    
    let data = {
        title: `Overview ${sitename}`,
        heroImages: heroImages,
        images: images
    };

    res.render("portfolio/index", {...data, currentURL: req.originalUrl });
});

// About page
router.get("/about", (req, res) => {
    let data = {
        title: `About ${sitename}`
    };

    res.render("portfolio/info", {...data, currentURL: req.originalUrl });
});

// Keep /info route for compatibility
router.get("/info", (req, res) => {
    res.redirect(301, '/about');
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

// Keep old /about redirect removed — /about is now canonical

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
    
    // Search for the project folder in both recent-work/ and gallery/
    const recentDir = path.join(__dirname, '..', 'images', 'recent-work', slug);
    const galleryDirPath = path.join(__dirname, '..', 'images', 'gallery', slug);
    let projectDir;
    let imageBase; // 'recent-work' or 'gallery'
    
    if (fs.existsSync(path.join(recentDir, 'project.json'))) {
        projectDir = recentDir;
        imageBase = 'recent-work';
    } else if (fs.existsSync(path.join(galleryDirPath, 'project.json'))) {
        projectDir = galleryDirPath;
        imageBase = 'gallery';
    } else {
        return res.status(404).render('portfolio/index', {
            title: `Not Found ${sitename}`,
            heroImages: [],
            images: [],
            currentURL: req.originalUrl
        });
    }

    const projectJsonPath = path.join(projectDir, 'project.json');

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
        const heroMatch = heroImages.find(h => h.slug === slug);
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
                path: `/images/${imageBase}/${slug}/${vDir}/${f}`
            }));

        if (images.length > 0) {
            // Use a label.txt inside the viewer folder, or default to "Variants" / "Variants 2" etc.
            let label = viewerDirs.length === 1 ? '' : (vDir === 'viewer' ? 'Variants' : 'Variants ' + vDir.split('-')[1]);
            const labelFile = path.join(vPath, 'label.txt');
            if (fs.existsSync(labelFile)) {
                label = fs.readFileSync(labelFile, 'utf8').trim();
            }

            // Optional description.txt for a panel-style caption below the viewer
            let description = '';
            const descFile = path.join(vPath, 'description.txt');
            if (fs.existsSync(descFile)) {
                description = fs.readFileSync(descFile, 'utf8').trim();
            }

            viewerSections.push({ label, description, images });
        }
    }

    // Read GALLERY items — supports gallery.json for ordering + notes, or auto-reads images
    const galleryDir = path.join(projectDir, 'gallery');
    let galleryItems = [];
    let galleryLabel = '';
    if (fs.existsSync(galleryDir)) {
        // Read optional label
        const galleryLabelFile = path.join(galleryDir, 'label.txt');
        if (fs.existsSync(galleryLabelFile)) {
            galleryLabel = fs.readFileSync(galleryLabelFile, 'utf8').trim();
        }

        const galleryJsonPath = path.join(galleryDir, 'gallery.json');
        if (fs.existsSync(galleryJsonPath)) {
            try {
                const entries = JSON.parse(fs.readFileSync(galleryJsonPath, 'utf8'));
                galleryItems = entries.map(entry => {
                    if (entry.image) {
                        return { type: 'image', src: `/images/${imageBase}/${slug}/gallery/${entry.image}` };
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
                .map(f => ({ type: 'image', src: `/images/${imageBase}/${slug}/gallery/${f}` }));
        }
    }

    // Read WORKFLOW images from workflow/ subfolder
    const workflowDir = path.join(projectDir, 'workflow');
    let workflowImages = [];
    let workflowLabel = 'Process';
    if (fs.existsSync(workflowDir)) {
        const workflowLabelFile = path.join(workflowDir, 'label.txt');
        if (fs.existsSync(workflowLabelFile)) {
            workflowLabel = fs.readFileSync(workflowLabelFile, 'utf8').trim();
        }
        workflowImages = fs.readdirSync(workflowDir)
            .filter(f => exts.includes(path.extname(f).toLowerCase()))
            .sort()
            .map(f => `/images/${imageBase}/${slug}/workflow/${f}`);
    }

    res.render('portfolio/project', {
        title: `${projectData.title || slug} ${sitename}`,
        project: projectData,
        slug: slug,
        mainImagePath: mainImagePath,
        viewerSections: viewerSections,
        galleryItems: galleryItems,
        galleryLabel: galleryLabel,
        workflowImages: workflowImages,
        workflowLabel: workflowLabel,
        currentURL: req.originalUrl
    });
});

module.exports = router;