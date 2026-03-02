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

		emailButton.addEventListener('mouseenter', function() {
			hint.textContent = 'Click to copy';
		});

		emailButton.addEventListener('mouseleave', function() {
			hint.textContent = 'Hover to copy';
		});

		emailButton.addEventListener('click', async function() {
			try {
				await navigator.clipboard.writeText(emailText);
				hint.textContent = 'Copied';
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
		document.body.appendChild(cursor);

		document.addEventListener('mousemove', function(event) {
			cursor.style.left = event.clientX + 'px';
			cursor.style.top = event.clientY + 'px';
		});

		document.addEventListener('mouseleave', function() {
			cursor.style.opacity = '0';
		});

		document.addEventListener('mouseenter', function() {
			cursor.style.opacity = '1';
		});
	} catch (e) {
		console.error('setupCustomCursor error', e);
	}
}

function setupNavToggle() {
	try {
		var toggleBtn = document.getElementById('nav-collapse-btn');
		var header = document.getElementById('header');
		var wrapper = document.querySelector('.wrapper');
		
		if (!toggleBtn || !header || !wrapper) return;

		var isCollapsed = localStorage.getItem('nav-collapsed') === 'true';
		if (isCollapsed) {
			header.classList.add('collapsed');
			wrapper.classList.add('nav-collapsed');
		}

		toggleBtn.addEventListener('click', function() {
			header.classList.toggle('collapsed');
			wrapper.classList.toggle('nav-collapsed');
			localStorage.setItem('nav-collapsed', header.classList.contains('collapsed'));
		});
	} catch (e) {
		console.error('setupNavToggle error', e);
	}
}

window.addEventListener('load', function() {
	setupEmailCopy();
	setupCustomCursor();
	setupNavToggle();
});
