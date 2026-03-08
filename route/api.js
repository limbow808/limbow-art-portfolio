"use strict";

const express = require("express");
const router = express.Router();
const fs = require("fs");
const path = require("path");

const metaCachePath = path.join(__dirname, "..", "data", "image-meta.json");
let imageMetaCache = {};
try {
  imageMetaCache = JSON.parse(fs.readFileSync(metaCachePath, "utf8"));
} catch (e) {}

const imageExtensions = [".jpg", ".jpeg", ".png", ".gif", ".webp"];

function getImageMeta(absPath) {
  const rel = path
    .relative(path.join(__dirname, ".."), absPath)
    .replace(/\\/g, "/");
  return imageMetaCache[rel] || { aspectRatio: "1/1", avgColor: "#e8e8e8" };
}

function getHeroImages() {
  const recentDir = path.join(__dirname, "..", "images", "recent-work");
  try {
    if (!fs.existsSync(recentDir)) return [];

    const folders = fs
      .readdirSync(recentDir, { withFileTypes: true })
      .filter((d) => d.isDirectory())
      .map((d) => d.name)
      .sort();

    const results = [];
    for (const folder of folders) {
      const folderPath = path.join(recentDir, folder);

      let projectData = { title: folder, workType: "3D Artwork" };
      const pjPath = path.join(folderPath, "project.json");
      if (fs.existsSync(pjPath)) {
        try {
          projectData = JSON.parse(fs.readFileSync(pjPath, "utf8"));
        } catch (e) {}
      }

      const thumbDir = path.join(folderPath, "thumbnail");
      let thumbFile = null;
      if (fs.existsSync(thumbDir)) {
        const thumbFiles = fs
          .readdirSync(thumbDir)
          .filter((f) => imageExtensions.includes(path.extname(f).toLowerCase()))
          .sort();
        if (thumbFiles.length > 0) thumbFile = thumbFiles[0];
      }

      if (thumbFile) {
        const imgPath = path.join(thumbDir, thumbFile);
        const meta = getImageMeta(imgPath);
        results.push({
          name: projectData.title || folder,
          slug: folder,
          path: `/images/recent-work/${folder}/thumbnail/${thumbFile}`,
          workType: projectData.workType || "3D Artwork",
          aspectRatio: meta.aspectRatio,
          avgColor: meta.avgColor,
        });
      } else {
        const files = fs
          .readdirSync(folderPath)
          .filter((f) => {
            if (!imageExtensions.includes(path.extname(f).toLowerCase())) return false;
            try { return fs.statSync(path.join(folderPath, f)).isFile(); } catch { return false; }
          })
          .sort();
        if (files.length > 0) {
          const imgPath = path.join(folderPath, files[0]);
          const meta = getImageMeta(imgPath);
          results.push({
            name: projectData.title || folder,
            slug: folder,
            path: `/images/recent-work/${folder}/${files[0]}`,
            workType: projectData.workType || "3D Artwork",
            aspectRatio: meta.aspectRatio,
            avgColor: meta.avgColor,
          });
        }
      }
    }
    return results;
  } catch (error) {
    console.error("Error reading recent-work images:", error);
    return [];
  }
}

function getGalleryImages() {
  const galleryDir = path.join(__dirname, "..", "images", "gallery");
  try {
    if (!fs.existsSync(galleryDir)) return [];

    const folders = fs
      .readdirSync(galleryDir, { withFileTypes: true })
      .filter((d) => d.isDirectory())
      .map((d) => d.name)
      .sort();

    const result = [];

    for (const slug of folders) {
      const folderPath = path.join(galleryDir, slug);
      const files = fs
        .readdirSync(folderPath)
        .filter((f) => {
          if (!imageExtensions.includes(path.extname(f).toLowerCase())) return false;
          return fs.statSync(path.join(folderPath, f)).isFile();
        })
        .sort();

      if (files.length === 0) continue;

      const thumbDir = path.join(folderPath, "thumbnail");
      let baseFile;
      if (fs.existsSync(thumbDir)) {
        const thumbFiles = fs
          .readdirSync(thumbDir)
          .filter((f) => imageExtensions.includes(path.extname(f).toLowerCase()))
          .sort();
        if (thumbFiles.length > 0) {
          baseFile = {
            filename: thumbFiles[0],
            name: path.parse(thumbFiles[0]).name,
            path: `/images/gallery/${slug}/thumbnail/${thumbFiles[0]}`,
          };
        }
      }
      if (!baseFile) {
        baseFile = {
          filename: files[0],
          name: path.parse(files[0]).name,
          path: `/images/gallery/${slug}/${files[0]}`,
        };
      }

      let projectData = { title: baseFile.name, workType: "3D Artwork" };
      const pjPath = path.join(folderPath, "project.json");
      if (fs.existsSync(pjPath)) {
        try {
          projectData = JSON.parse(fs.readFileSync(pjPath, "utf8"));
        } catch (e) {}
      }

      const actualFilePath = baseFile.path.startsWith("/images/gallery/")
        ? path.join(__dirname, "..", baseFile.path)
        : path.join(galleryDir, slug, baseFile.filename);
      const meta = getImageMeta(actualFilePath);

      result.push({
        filename: baseFile.filename,
        name: projectData.title || baseFile.name,
        path: baseFile.path,
        workType: projectData.workType || "3D Artwork",
        slug: slug,
        aspectRatio: meta.aspectRatio,
        avgColor: meta.avgColor,
      });
    }

    result.sort((a, b) => a.filename.localeCompare(b.filename));
    return result;
  } catch (error) {
    console.error("Error reading gallery images:", error);
    return [];
  }
}

// GET /api/home
router.get("/home", (req, res) => {
  res.json({
    heroImages: getHeroImages(),
    galleryImages: getGalleryImages(),
  });
});

// GET /api/project/:slug
router.get("/project/:slug", (req, res) => {
  const slug = req.params.slug;
  const recentDir = path.join(__dirname, "..", "images", "recent-work", slug);
  const galleryDirPath = path.join(__dirname, "..", "images", "gallery", slug);
  let projectDir;
  let imageBase;

  if (fs.existsSync(path.join(recentDir, "project.json"))) {
    projectDir = recentDir;
    imageBase = "recent-work";
  } else if (fs.existsSync(path.join(galleryDirPath, "project.json"))) {
    projectDir = galleryDirPath;
    imageBase = "gallery";
  } else {
    return res.status(404).json({ error: "Project not found" });
  }

  let projectData;
  try {
    projectData = JSON.parse(
      fs.readFileSync(path.join(projectDir, "project.json"), "utf8")
    );
  } catch (e) {
    return res.status(500).json({ error: "Error reading project data" });
  }

  // Find main image path
  const allGallery = getGalleryImages();
  let match = allGallery.find((img) => img.slug === slug);
  if (!match) {
    const heroImages = getHeroImages();
    const heroMatch = heroImages.find((h) => h.slug === slug);
    if (heroMatch) match = { path: heroMatch.path };
  }
  const mainImagePath = match ? match.path : "";

  // Viewer sections
  const viewerSections = [];
  const allEntries = fs.readdirSync(projectDir, { withFileTypes: true });
  const viewerDirs = allEntries
    .filter((d) => d.isDirectory() && /^viewer(-\d+)?$/i.test(d.name))
    .map((d) => d.name)
    .sort((a, b) => {
      const numA = a === "viewer" ? 1 : parseInt(a.split("-")[1]);
      const numB = b === "viewer" ? 1 : parseInt(b.split("-")[1]);
      return numA - numB;
    });

  for (const vDir of viewerDirs) {
    const vPath = path.join(projectDir, vDir);
    const images = fs
      .readdirSync(vPath)
      .filter((f) => imageExtensions.includes(path.extname(f).toLowerCase()))
      .sort()
      .map((f) => ({
        filename: f,
        name: path.parse(f).name,
        path: `/images/${imageBase}/${slug}/${vDir}/${f}`,
      }));

    if (images.length > 0) {
      let label =
        viewerDirs.length === 1
          ? ""
          : vDir === "viewer"
          ? "Variants"
          : "Variants " + vDir.split("-")[1];
      const labelFile = path.join(vPath, "label.txt");
      if (fs.existsSync(labelFile)) {
        label = fs.readFileSync(labelFile, "utf8").trim();
      }
      let description = "";
      const descFile = path.join(vPath, "description.txt");
      if (fs.existsSync(descFile)) {
        description = fs.readFileSync(descFile, "utf8").trim();
      }
      viewerSections.push({ label, description, images });
    }
  }

  // Gallery items
  const galleryDir = path.join(projectDir, "gallery");
  let galleryItems = [];
  let galleryLabel = "";
  if (fs.existsSync(galleryDir)) {
    const galleryLabelFile = path.join(galleryDir, "label.txt");
    if (fs.existsSync(galleryLabelFile)) {
      galleryLabel = fs.readFileSync(galleryLabelFile, "utf8").trim();
    }
    const galleryJsonPath = path.join(galleryDir, "gallery.json");
    if (fs.existsSync(galleryJsonPath)) {
      try {
        const entries = JSON.parse(fs.readFileSync(galleryJsonPath, "utf8"));
        galleryItems = entries
          .map((entry) => {
            if (entry.image)
              return {
                type: "image",
                src: `/images/${imageBase}/${slug}/gallery/${entry.image}`,
              };
            if (entry.note) return { type: "note", text: entry.note };
            return null;
          })
          .filter(Boolean);
      } catch (e) {
        console.error("Error reading gallery.json for", slug, e);
      }
    }
    if (galleryItems.length === 0) {
      galleryItems = fs
        .readdirSync(galleryDir)
        .filter((f) => imageExtensions.includes(path.extname(f).toLowerCase()))
        .sort()
        .map((f) => ({
          type: "image",
          src: `/images/${imageBase}/${slug}/gallery/${f}`,
        }));
    }
  }

  // Workflow images
  const workflowDir = path.join(projectDir, "workflow");
  let workflowImages = [];
  let workflowLabel = "Process";
  if (fs.existsSync(workflowDir)) {
    const workflowLabelFile = path.join(workflowDir, "label.txt");
    if (fs.existsSync(workflowLabelFile)) {
      workflowLabel = fs.readFileSync(workflowLabelFile, "utf8").trim();
    }
    workflowImages = fs
      .readdirSync(workflowDir)
      .filter((f) => imageExtensions.includes(path.extname(f).toLowerCase()))
      .sort()
      .map((f) => `/images/${imageBase}/${slug}/workflow/${f}`);
  }

  res.json({
    title: projectData.title || slug,
    category: projectData.category || "",
    workType: projectData.workType || "",
    date: projectData.date || "",
    notes: projectData.notes || "",
    software: projectData.software || projectData.tools || [],
    tools: projectData.tools || [],
    mainImagePath,
    viewerSections,
    galleryItems,
    galleryLabel,
    workflowImages,
    workflowLabel,
  });
});

module.exports = router;
