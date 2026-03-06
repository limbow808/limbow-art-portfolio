// ========== Email copy ==========
function setupEmailCopy() {
	try {
		var emailButton = document.getElementById('email-copy');
		var hint = document.getElementById('email-copy-hint');
		if (!emailButton || !hint) return;

		var emailText = emailButton.textContent.trim();

		emailButton.addEventListener('click', async function() {
			try {
				await navigator.clipboard.writeText(emailText);
				hint.textContent = 'Copied';
				setTimeout(function() {
					hint.textContent = 'Click to copy';
				}, 2000);
			} catch (copyError) {
				hint.textContent = 'Copy failed';
				console.error('Failed to copy email:', copyError);
			}
		});
	} catch (e) {
		console.error('setupEmailCopy error', e);
	}
}

function setupCustomCursor() {
	try {
		var supportsFinePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
		if (!supportsFinePointer) return;

		var existingCursor = document.querySelector('.custom-cursor');
		if (existingCursor) return;

		var cursor = document.createElement('div');
		cursor.className = 'custom-cursor';
		// keep hidden until first movement so it doesn't appear at 0,0
		cursor.style.opacity = '0';
		document.body.appendChild(cursor);

		// Move the cursor element to mouse position using CSS custom properties
		document.addEventListener('mousemove', function(event) {
			cursor.style.setProperty('--cursor-x', event.clientX + 'px');
			cursor.style.setProperty('--cursor-y', event.clientY + 'px');
			cursor.style.opacity = '1';
		});

		// hide when leaving the document/page area
		document.addEventListener('mouseleave', function() {
			cursor.style.opacity = '0';
			cursor.classList.remove('clicked');
		});

		document.addEventListener('mouseenter', function() {
			cursor.style.opacity = '1';
		});

		// extra guard for leaving the browser viewport/window
		window.addEventListener('mouseout', function(event) {
			if (!event.relatedTarget && !event.toElement) {
				cursor.style.opacity = '0';
				cursor.classList.remove('clicked');
			}
		});

		window.addEventListener('blur', function() {
			cursor.style.opacity = '0';
			cursor.classList.remove('clicked');
		});

		// Keep the cursor enlarged while mouse button is held down
		document.addEventListener('mousedown', function() {
			cursor.classList.add('clicked');
		});

		document.addEventListener('mouseup', function() {
			cursor.classList.remove('clicked');
		});

		// Helper: walk up to find a non-transparent background color
		function getEffectiveBackgroundColor(el) {
			var node = el;
			while (node && node !== document.documentElement) {
				var cs = window.getComputedStyle(node);
				var bg = cs.backgroundColor;
				if (bg && bg !== 'rgba(0, 0, 0, 0)' && bg !== 'transparent') return bg;
				node = node.parentElement;
			}
			var bodyBg = window.getComputedStyle(document.body).backgroundColor;
			return (bodyBg && bodyBg !== 'rgba(0, 0, 0, 0)') ? bodyBg : 'rgb(255,255,255)';
		}

		function chooseContrastColor(rgbString) {
			var m = rgbString.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/i);
			if (!m) return '#000000';
			var r = parseInt(m[1], 10) / 255;
			var g = parseInt(m[2], 10) / 255;
			var b = parseInt(m[3], 10) / 255;
			[r, g, b] = [r, g, b].map(function(c) {
				return (c <= 0.03928) ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
			});
			var lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
			return (lum < 0.5) ? '#ffffff' : '#000000';
		}

		// Pointerover/leave to adapt cursor appearance based on hovered element
		document.addEventListener('pointerover', function(e) {
			try {
				var el = e.target;
				var imgTarget = el.closest('img, picture, .gallery-image');
				var interactiveTarget = el.closest('a, button, .nav-item, .card-meta');

				if (imgTarget) {
					// For images, keep blend-mode inversion so cursor doesn't become a flat color
					cursor.classList.remove('active');
					cursor.style.mixBlendMode = 'difference';
					cursor.style.backgroundColor = '#ffffff';
					return;
				}

				if (interactiveTarget) {
					var bg = getEffectiveBackgroundColor(interactiveTarget) || getEffectiveBackgroundColor(el) || 'rgb(255,255,255)';
					var contrast = chooseContrastColor(bg);
					cursor.style.backgroundColor = contrast;
					cursor.style.mixBlendMode = 'normal';
					cursor.classList.add('active');
				} else {
					cursor.classList.remove('active');
					cursor.style.backgroundColor = '#ffffff';
					cursor.style.mixBlendMode = 'difference';
				}
			} catch (err) {
				// ignore
			}
		});

		document.addEventListener('pointerout', function(e) {
			try {
				var related = e.relatedTarget;
				if (!related || !document.body.contains(related)) {
					cursor.classList.remove('active');
					cursor.style.backgroundColor = '#ffffff';
					cursor.style.mixBlendMode = 'difference';
				}
			} catch (err) {}
		});

	} catch (e) {
		console.error('setupCustomCursor error', e);
	}
}


// ========== Image load reveal ==========
function setupImageLoading() {
	var images = document.querySelectorAll('.gallery-image');
	images.forEach(function(image) {
		if (image.complete) {
			revealImage(image);
		} else {
			image.addEventListener('load', function() { revealImage(image); });
		}
	});
}

function revealImage(image) {
	image.classList.add('loaded');
	var overlay = image.closest('.hero-image, .gallery-card');
	if (!overlay) overlay = image.closest('picture');
	if (overlay) {
		var loadingEl = overlay.querySelector('.loading-overlay');
		if (loadingEl) loadingEl.style.display = 'none';
	}
}

window.addEventListener('load', function() {
	setupEmailCopy();
	setupCustomCursor();
	setupImageLoading();

	// Fade in the main content
	var main = document.getElementById('main');
	if (main) main.classList.add('fade-in');
});
