console.log("test")

// Autoscale the Info bio text so it fits typical viewports without vertical scroll.
function autoscaleInfoBio() {
	try {
		var bio = document.querySelector('.content.about .i-bio');
		if (!bio) return;
	// Always run autoscale for .i-bio
	// Reset any inline sizing so we measure natural flow
	bio.style.fontSize = '';

		// Get available vertical space inside the main area (excluding header/footer)
		var main = document.getElementById('main') || document.querySelector('.main');
		var header = document.querySelector('.header');
		var footer = document.querySelector('.footer');

		var viewportH = window.innerHeight;
		var headerH = header ? header.getBoundingClientRect().height : 0;
		var footerH = footer ? footer.getBoundingClientRect().height : 0;

	// Compute available height as the distance from the bio's top to the footer's top
	// This is more reliable when layout uses absolute/positioned footer elements.
	var breathingRoom = 0; // set to 0 to fill exactly to the footer; change if you want a small gap
	var bioRect = bio.getBoundingClientRect();
	var footerTop = footer ? footer.getBoundingClientRect().top : viewportH;
	var availableH = Math.max(120, Math.floor(footerTop - bioRect.top - breathingRoom));

		// Measure current bio height at base font size
		var computed = window.getComputedStyle(bio);
		var baseFontSize = parseFloat(computed.fontSize) || 16;

		// Increase/decrease font size to fit within availableH, but clamp it to reasonable bounds
		var low = 8;
		var high = 120;
		var best = baseFontSize;

		// Binary-search-like adjustment for quick convergence (more iterations)
		for (var i = 0; i < 16; i++) {
			var mid = Math.round((low + high) / 2);
			bio.style.setProperty('font-size', mid + 'px', 'important');
			var h = bio.getBoundingClientRect().height;
			if (h > availableH) {
				high = mid - 1;
			} else {
				best = mid;
				low = mid + 1;
			}
		}

		// Try to grow to fill any remaining gap up to a reasonable limit
		var growLimit = Math.min(160, best + 60);
		var candidate = best;
		for (var s = best; s <= growLimit; s++) {
			bio.style.setProperty('font-size', s + 'px', 'important');
			var h2 = bio.getBoundingClientRect().height;
			if (h2 <= availableH) {
				candidate = s;
			} else {
				break;
			}
		}

		// Apply the chosen size with !important so it wins over stylesheet
		var finalSize = Math.max(10, Math.min(candidate, 160));
		bio.style.setProperty('font-size', finalSize + 'px', 'important');

		// Final safety: if overflow due to rounding/font load, step down until it fits
		var finalH = bio.getBoundingClientRect().height;
		while (finalH > availableH && finalSize > 8) {
			finalSize -= 1;
			bio.style.setProperty('font-size', finalSize + 'px', 'important');
			finalH = bio.getBoundingClientRect().height;
		}
	} catch (e) {
		console.error('autoscaleInfoBio error', e);
	}
}

window.addEventListener('load', function() {
	autoscaleInfoBio();
	// re-run shortly after load to allow fonts/images to settle
	setTimeout(autoscaleInfoBio, 500);
});
window.addEventListener('resize', function() {
	autoscaleInfoBio();
});

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
		// ensure initial visibility
		cursor.style.opacity = '1';
		document.body.appendChild(cursor);

		// Move the cursor element to mouse position using CSS custom properties
		document.addEventListener('mousemove', function(event) {
			cursor.style.setProperty('--cursor-x', event.clientX + 'px');
			cursor.style.setProperty('--cursor-y', event.clientY + 'px');
		});

		// hide when leaving the window
		document.addEventListener('mouseleave', function() {
			cursor.style.opacity = '0';
		});

		document.addEventListener('mouseenter', function() {
			cursor.style.opacity = '1';
		});

		// Subtle kick animation on any click
		document.addEventListener('click', function() {
			cursor.classList.remove('clicked');
			// Trigger reflow to restart animation
			void cursor.offsetWidth;
			cursor.classList.add('clicked');
			// Remove the class after animation completes
			setTimeout(function() {
				cursor.classList.remove('clicked');
			}, 300);
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

window.addEventListener('load', function() {
	setupEmailCopy();
	setupCustomCursor();
});
