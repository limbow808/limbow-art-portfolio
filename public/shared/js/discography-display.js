
const options = ["all", "EPs", "singles"]

const epsContent = `
    <div class = "embedd-ep">
        <iframe src="https://open.spotify.com/embed/album/4wnRh8FdUP4NVr6ys4Swms?utm_source=generator" frameBorder="0" allowfullscreen="" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy"></iframe>
    </div>
    <div class = "embedd-ep">
        <iframe src="https://open.spotify.com/embed/album/7hXPTs64jYlZDlmR2Dfm6o?utm_source=generator" frameBorder="0" allowfullscreen="" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy"></iframe>
    </div>
    <div class = "embedd-ep">
        <iframe src="https://open.spotify.com/embed/album/07enOfs2glyJaVYHsIMqzI?utm_source=generator" frameBorder="0" allowfullscreen="" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy"></iframe>
    </div>
    <div class = "embedd-ep">
        <iframe src="https://open.spotify.com/embed/album/02e7MeJ2DxZxPJDL0WDQCZ?utm_source=generator" frameBorder="0" allowfullscreen="" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy"></iframe>
    </div>
`

const singlesContent = `
    <div class = "embedd">
        <iframe src="https://open.spotify.com/embed/track/2dmbjpARV2v8651OBTUwJr?utm_source=generator" frameBorder="0" allowfullscreen="" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy"></iframe>
    </div>
    <div class = "embedd">
        <iframe src="https://open.spotify.com/embed/track/3vKdi0B6R9OwcxPkEHbT1k?utm_source=generator" frameBorder="0" allowfullscreen="" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy"></iframe>
    </div>
    <div class = "embedd">
        <iframe src="https://open.spotify.com/embed/track/3TvzyOLt8MhNVJQGSYvuNH?utm_source=generator" frameBorder="0" allowfullscreen="" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy"></iframe>
    </div>
    <div class = "embedd">
        <iframe src="https://open.spotify.com/embed/track/6OPR3qkqQ0l6hZNFaAVRmZ?utm_source=generator" frameBorder="0" allowfullscreen="" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy"></iframe>
    </div>
    <div class = "embedd">
        <iframe src="https://open.spotify.com/embed/track/7koIY3Up6wTAM50XVCbuwT?utm_source=generator" frameBorder="0" allowfullscreen="" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy"></iframe>
    </div>
    <div class = "embedd">
        <iframe src="https://open.spotify.com/embed/track/7sqSc0o48ZFBiyJ9X6VybE?utm_source=generator" frameBorder="0" allowfullscreen="" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy"></iframe>
    </div>
    <div class = "embedd">
        <iframe src="https://open.spotify.com/embed/track/4vk6VAY04BPwkwWU6seIaS?utm_source=generator" frameBorder="0" allowfullscreen="" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy"></iframe>
    </div>
    <div class = "embedd">
        <iframe src="https://open.spotify.com/embed/track/19s7TaytpK5qPnOovrhwXk?utm_source=generator" frameBorder="0" allowfullscreen="" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy"></iframe>
    </div>
    <div class = "embedd">
        <iframe src="https://open.spotify.com/embed/track/29piL8oyX4mIVVYxb94k02?utm_source=generator" frameBorder="0" allowfullscreen="" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy"></iframe>
    </div>
`

function getCurrent() {
    const list = document.querySelector(".discography-header-list")
    const items = list.querySelectorAll("li")
    return items[0]
}

function getCurrentOptions(shown) {
    const list = document.querySelector(".discography-header-list")
    const items = list.querySelectorAll("li")
    let availabeOptions = []
    for (const item of items) {
        if (item !== shown) {
            availabeOptions.push(item)
        }
    }
    return availabeOptions
}

function getOptions () {
    const list = document.querySelector(".discography-header-list")
    return list.querySelectorAll("li")
}

function selectedOptionEvent() {
    const options = getOptions()

    for (const option of options) {
        const link = option.querySelector("a")
        link.addEventListener("click", (event) => {
            event.preventDefault()
            handleOptions(event)
        })
    }
}

function displayOptions() {
    const options = getOptions()
    for (const option of options) {
        if(option !== options[0]) {
            option.style.display = option.style.display === "none" ? "inline" : "none"
        }
    }
}

function showDiscography() {
    const singles = document.getElementById("discography-singles")
    const eps = document.getElementById("discography-eps")
    const selectedOption = getOptions()[0].querySelector("a").textContent

    function hideElement(element) {
        element.style.opacity = "0"
        setTimeout(() => {            
            element.style.display = "none"
        }, 400); 
    }

    // Helper to show an element
    function showElement(element) {
        element.style.display = "grid"
        setTimeout(() => {
            element.classList.add("visible")
            //element.classList.remove("hidden")
            element.style.opacity = "1"
        }, 50)
    }

    /*
    function setOrder(element, order) {
        element.style.order = order;
    }
    */

    hideElement(singles)
    hideElement(eps)

    setTimeout(() => {
        if (selectedOption === "EPs") {
            showElement(eps)
            hideElement(singles)
            //setOrder(eps, 1)
            //setOrder(singles, 2)
        } else if (selectedOption === "singles") {
            showElement(singles)
            hideElement(eps)
            //setOrder(singles, 1)
            //setOrder(eps, 2)
        } else {
            showElement(singles)
            showElement(eps)
            //setOrder(singles, 1)
            //setOrder(eps, 2)
        }
    }, 500)
}

function handleOptions(event) {
    const options = getOptions()
    if (event.target.textContent !== options[0].querySelector("a").textContent) {
        const clicked = event.target.textContent
        for (let index = 0; index < options.length; index++) {
            const swap = options[index].querySelector("a").textContent
            if (clicked === options[index].querySelector("a").textContent) {
                options[index].querySelector("a").textContent = options[0].textContent
                options[0].querySelector("a").textContent = swap
            }
        }
        displayOptions()
        showDiscography()
    } else {
        displayOptions()
    }
}

// basically duplicate from animate.js
function loadFrames() {
    const frames = document.querySelectorAll(".iframe")
    //console.log(frames)
    for (const frame of frames) {
      // check for cached images
      if (frame.complete) {
        //console.log("cached")
        unhideImage(frame)
    } else {
        frame.onload = function () {
          //console.log("complete")
          unhideImage(frame)
        }
      }
    }
}
  
function unhideImage(frame) {
    frame.classList.add("loaded");
    const overlay = frame.nextElementSibling
    const iframeElement = frame.closest(".embedd-single") // surrounding div
    if (overlay) {
        overlay.style.display = "none"
    }
}

document.addEventListener("DOMContentLoaded", () => {
    selectedOptionEvent()
    loadFrames()
})