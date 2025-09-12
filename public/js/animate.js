function main() {
  document.addEventListener("DOMContentLoaded", function () {
    siteWideFade()
    //navLoad()
    subMenuHandle()
    persistentMenu()
    loadImages()
    animateActive()
  })
}

function animateActive() {
  const li = document.getElementById("nav-alt")
  const url = urlEndpoint(window.location.href)
  //console.log(url)
  if (li) {
    const li = document.querySelector(".active")
    const a = li.querySelector(".nav-item")
    a.innerHTML = a.textContent
    .split('')
    .map((char, i) => `<span style="animation-delay: ${(i * 0.15).toFixed(2)}s;">${char}</span>`)
    .join('')
  }
}

function navLoad () {
  const nav = document.getElementById("outer-nav")
  const foot = document.getElementById("footer")
  nav.classList.add("loaded")
  foot.classList.add("loaded")
}

function siteWideFade() {
  const main = document.getElementById("main")
  currentUrlEndpoint = urlEndpoint(window.location.href)
  enableLoad = currentUrlEndpoint === "/" || 
               currentUrlEndpoint === ""  || 
               currentUrlEndpoint === "discography" || 
               currentUrlEndpoint === "index.php"
  //console.log(isMainPage)
  //console.log(currentUrlEndpoint)
  const links = document.querySelectorAll("#nav-link")
  for (const link of links) {
      link.addEventListener("click", (event) => {
        event.preventDefault()
        const href = link.getAttribute("href")
        const targetUrlEndpoint = urlEndpoint(link.href)
        if (currentUrlEndpoint === (targetUrlEndpoint + "/") || currentUrlEndpoint === targetUrlEndpoint)  {
          return
        }
        if (!enableLoad) {
          main.classList.add("fade-out")
          setTimeout(() => {
            window.location.href = href
          }, 350)
        } else {
          window.location.href = href
        }
      })
      //document.body.classList.add('fade-in');
  }
  if (!enableLoad) {
    window.addEventListener("load", () => {
      main.classList.add("fade-in")
    });
  } else {
    main.style.opacity = "1"
    main.style.transition = "none"
  }
}

function urlEndpoint (url) {
  return url.substring(url.lastIndexOf("/") + 1);
}

function subMenuHandle() {
  const currentUrl = window.location.href
  const endPoint = urlEndpoint(currentUrl)
  if (endPoint === "" || endPoint === "about" || endPoint === "index.php") {
    closeMenu()
  }
}

function toggleDropdown () {
  const dropdown = document.getElementById("highlight-dropdown")
  if (dropdown.style.display === "inline") {
    closeMenu(true)
  } else {
    openMenu(true)
  }
}

function openMenu(animated) {
  const dropdown = document.getElementById("highlight-dropdown")
  const caret = document.getElementById("highlight-caret")

  if (!caret) {
    return
  }

  if (animated) {
    caret.style.transition = "transform 0.2s ease-out"
  }
  caret.style.transform = "rotate(180deg)"
  dropdown.style.display = "inline"
  //dropdown.classList.add("open")
  sessionStorage.setItem("dropdownShow", true)
}

function closeMenu(animated) {
  const dropdown = document.getElementById("highlight-dropdown")
  const caret = document.getElementById("highlight-caret")

  if (!caret) {return}

  if (animated) {
    caret.style.transition = "transform 0.2s ease-out"
  }
  caret.style.transform = "rotate(0deg)"
  dropdown.style.display = "none"
  //dropdown.classList.remove("open")
  sessionStorage.setItem("dropdownShow", false)
}

function persistentMenu() {
    const navLink = document.getElementById("highlight-link")

    if (!navLink) {return}

    navLink.addEventListener("click", function (event) {
      event.preventDefault()
      toggleDropdown()
    })

    const savedState = sessionStorage.getItem("dropdownShow");
    if (savedState === "true") {
      openMenu(false)
    } else {
      closeMenu(false)
    }
}

function loadImages() {
  const images = document.querySelectorAll(".gallery-image")
  for (const image of images) {
    // check for cached images
    if (image.complete) {
      unhideImage(image)
    } else {
      image.onload = function () {
        unhideImage(image)
      }
    }
  }
}

function unhideImage(image) {
  image.classList.add("loaded")
  const overlay = image.nextElementSibling
  const pictureElement = image.closest("picture") // surrounding picture element
  pictureElement.style.height = "auto"
  if (overlay) {
    overlay.style.display = "none"
  }
}

function openPreview(imageSrc) {
    const overlay = document.getElementById("imageOverlay");
    const existingImage = overlay.querySelector("img");

    if (existingImage) {
        existingImage.remove();
    }

    const fullImage = document.createElement("img");

    fullImage.id = "fullImage";
    fullImage.src = imageSrc;
    overlay.appendChild(fullImage);
    overlay.style.display = "flex";
}

// Function to close the full-size image preview
function closePreview() {
    const overlay = document.getElementById("imageOverlay");
    overlay.style.display = "none";
}



main()
