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

function setupLoadingScreen() {
	var emoticons = [':)', ':3', ':D', 'xD', ':]', '>:3', ':P', '<3', ':O', '( ͡° ͜ʖ ͡°)', '(>w<)', 'UwU'];
	var currentIndex = 0;
	var emoticonEl = document.querySelector('.loading-emoticon');
	var loadingScreen = document.getElementById('siteLoadingScreen');
	
	if (!loadingScreen || !emoticonEl) return;
	
	// Cycle emoticons every 300ms
	var emoticonInterval = setInterval(function() {
		currentIndex = (currentIndex + 1) % emoticons.length;
		emoticonEl.textContent = emoticons[currentIndex];
	}, 300);
	
	// Hide loading screen when page is fully loaded
	function hideLoadingScreen() {
		clearInterval(emoticonInterval);
		loadingScreen.classList.add('fade-out');
		setTimeout(function() {
			loadingScreen.style.display = 'none';
		}, 500);
	}
	
	// Always show briefly, then fade out
	setTimeout(hideLoadingScreen, 200);
}

function setupImageVariants() {
	try {
		var pictures = document.querySelectorAll('picture[data-variants]');
		console.log('setupImageVariants: Found pictures with variants:', pictures.length);
		
		pictures.forEach(function(picture, index) {
			try {
				var variantsAttr = picture.getAttribute('data-variants');
				console.log('Picture', index, 'raw attribute:', variantsAttr);
				
				if (!variantsAttr) {
					console.log('Picture', index, 'has no variants attribute');
					return;
				}
				
				var variants = JSON.parse(variantsAttr);
				console.log('Picture', index, 'parsed variants:', variants);
				
				if (!variants || variants.length === 0) {
					console.log('Picture', index, 'has no variants');
					return;
				}
			
				var currentIndex = 0;
				var img = picture.querySelector('.gallery-image');
				var sources = picture.querySelectorAll('source');
				
				console.log('Picture', index, 'creating navigation for', variants.length, 'variants');
				
				// Create navigation arrows
				var navContainer = document.createElement('div');
				navContainer.className = 'variant-nav';
				console.log('Created nav container:', navContainer);
			
			var prevBtn = document.createElement('button');
			prevBtn.className = 'variant-btn variant-prev';
			prevBtn.innerHTML = '<span class="arrow-icon">‹</span>';
			prevBtn.setAttribute('aria-label', 'Previous variant');
			
			var nextBtn = document.createElement('button');
			nextBtn.className = 'variant-btn variant-next';
			nextBtn.innerHTML = '<span class="arrow-icon">›</span>';
			nextBtn.setAttribute('aria-label', 'Next variant');
			
				navContainer.appendChild(prevBtn);
				navContainer.appendChild(nextBtn);
				picture.appendChild(navContainer);
				console.log('Picture', index, 'nav container appended to picture');
			
			function updateImage(index) {
				var variant = variants[index];
				if (!variant) return;
				
				// Update all sources
				sources.forEach(function(source) {
					var media = source.getAttribute('media');
					var srcset = source.getAttribute('srcset');
					if (srcset) {
						var width = srcset.match(/\?w=(\d+)/);
						if (width) {
							source.setAttribute('srcset', variant.path + '?w=' + width[1]);
						}
					}
				});
				
				// Update main image
				var currentSrc = img.getAttribute('src');
				var width = currentSrc.match(/\?w=(\d+)/);
				if (width) {
					img.setAttribute('src', variant.path + '?w=' + width[1]);
				}
				
				// Update onclick preview
				img.setAttribute('onclick', "openPreview('" + variant.path + "?w=1000')");
				
				// Update meta title if present
				var titleEl = picture.querySelector('.card-title');
				if (titleEl) {
					titleEl.textContent = variant.name;
				}
			}
			
			prevBtn.addEventListener('click', function(e) {
				e.stopPropagation();
				currentIndex = (currentIndex - 1 + variants.length) % variants.length;
				updateImage(currentIndex);
			});
			
				nextBtn.addEventListener('click', function(e) {
					e.stopPropagation();
					currentIndex = (currentIndex + 1) % variants.length;
					updateImage(currentIndex);
				});
			} catch (innerError) {
				console.error('Error processing picture', index, ':', innerError);
			}
		});
	} catch (e) {
		console.error('setupImageVariants error', e);
	}
}

window.addEventListener('load', function() {
	setupLoadingScreen();
	setupEmailCopy();
	setupCustomCursor();
	// setupImageVariants();
});
