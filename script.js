const bgMusic = document.getElementById("bgMusic");
const pauseBtn = document.getElementById("pauseMusicBtn");
const card = document.getElementById("card");
const cardBtn = document.getElementById("cardBtn");
const galleryBtn = document.getElementById("galleryBtn");
const gallery = document.querySelector(".gallery");
const galleryWrapper = document.querySelector(".gallery-wrapper");
const lightbox = document.getElementById("lightbox");
const lightboxImg = document.getElementById("lightboxImg");
const closeLightbox = document.getElementById("closeLightbox");
const photoIndexDisplay = document.getElementById("photoIndexDisplay");
const lightboxPrev = document.getElementById("lightboxPrev");
const lightboxNext = document.getElementById("lightboxNext");
const photoCounter = document.getElementById("photoCounter");

let totalPhotos = 279;
let photosPerBatch = 20;
let loadedPhotos = 0;
let currentPhotoIndex = 0;
let isZoomed = false;

function loadPhotos(start, count) {
  for (let i = start; i < Math.min(start + count, totalPhotos); i++) {
    const img = document.createElement("img");
    img.src = `images/${i + 1}.jpg`;
    img.alt = `Memory ${i + 1}`;
    img.dataset.index = i;
    img.addEventListener("click", () => openLightbox(i));
    gallery.appendChild(img);
  }
  loadedPhotos += count;
  updatePhotoCounter();
}

function updatePhotoCounter() {
  if (photoCounter) {
    photoCounter.textContent = `Showing ${loadedPhotos} of ${totalPhotos}`;
  }
}

function openLightbox(index) {
  currentPhotoIndex = index;
  lightbox.style.display = "flex";
  document.body.style.overflow = "hidden"; // prevent background scroll
  updateLightbox();
}

function updateLightbox() {
  lightboxImg.src = `images/${currentPhotoIndex + 1}.jpg`;
  photoIndexDisplay.textContent = `${currentPhotoIndex + 1} of ${totalPhotos}`;
}

function closeViewer() {
  lightbox.style.display = "none";
  isZoomed = false;
  lightbox.classList.remove("zoomed");
  lightboxImg.style.transform = "scale(1)";
  document.body.style.overflow = ""; // re-enable scroll
}

closeLightbox.onclick = closeViewer;

lightbox.addEventListener("click", (e) => {
  if (e.target === lightbox) closeViewer();
});

lightboxImg.addEventListener("click", () => {
  if (window.innerWidth > 600) {
    isZoomed = !isZoomed;
    lightbox.classList.toggle("zoomed");
  }
});

// Scroll-to-zoom on desktop
lightbox.addEventListener("wheel", (e) => {
  if (window.innerWidth <= 600) return;
  e.preventDefault();
  let scale = parseFloat(lightboxImg.style.transform.replace("scale(", "").replace(")", "")) || 1;
  scale += e.deltaY * -0.0015;
  scale = Math.min(Math.max(1, scale), 3);
  lightboxImg.style.transform = `scale(${scale})`;
}, { passive: false });

// Pinch-to-zoom on mobile
let initialDistance = null;
lightbox.addEventListener("touchstart", (e) => {
  if (e.touches.length === 2) {
    initialDistance = Math.hypot(
      e.touches[0].clientX - e.touches[1].clientX,
      e.touches[0].clientY - e.touches[1].clientY
    );
  }
});

lightbox.addEventListener("touchmove", (e) => {
  if (e.touches.length === 2 && initialDistance !== null) {
    const currentDistance = Math.hypot(
      e.touches[0].clientX - e.touches[1].clientX,
      e.touches[0].clientY - e.touches[1].clientY
    );
    let scale = currentDistance / initialDistance;
    scale = Math.min(Math.max(1, scale), 3);
    lightboxImg.style.transform = `scale(${scale})`;
  }
}, { passive: false });

lightbox.addEventListener("touchend", () => {
  initialDistance = null;
});

// Swipe gestures
let startX = 0;
lightbox.addEventListener("touchstart", (e) => {
  startX = e.touches[0].clientX;
});

lightbox.addEventListener("touchend", (e) => {
  const endX = e.changedTouches[0].clientX;
  if (endX - startX > 50 && currentPhotoIndex > 0) {
    currentPhotoIndex--;
    updateLightbox();
  } else if (startX - endX > 50 && currentPhotoIndex < totalPhotos - 1) {
    currentPhotoIndex++;
    updateLightbox();
  }
});

// Music toggle
pauseBtn.onclick = () => {
  if (bgMusic.paused) {
    bgMusic.play();
    pauseBtn.textContent = "⏸️ Pause Music";
  } else {
    bgMusic.pause();
    pauseBtn.textContent = "▶️ Play Music";
  }
};

// Toggle birthday card view
cardBtn.onclick = () => {
  card.classList.add("active");
  galleryWrapper.style.display = "none";
  window.scrollTo({ top: 0, behavior: "smooth" });
   bgMusic.play(); // force play when card is shown
};

// Toggle gallery view
galleryBtn.onclick = () => {
  card.classList.remove("active");
  galleryWrapper.style.display = "block";
  window.scrollTo({ top: 0, behavior: "smooth" });
   bgMusic.play(); // force play when card is shown
};

// Infinite scroll
window.addEventListener("scroll", () => {
  if (
    window.innerHeight + window.scrollY >= document.body.offsetHeight - 100 &&
    loadedPhotos < totalPhotos
  ) {
    loadPhotos(loadedPhotos, photosPerBatch);
  }
});

// Arrow key navigation
document.addEventListener("keydown", (e) => {
  if (lightbox.style.display === "flex") {
    if (e.key === "ArrowRight" && currentPhotoIndex < totalPhotos - 1) {
      currentPhotoIndex++;
      updateLightbox();
    } else if (e.key === "ArrowLeft" && currentPhotoIndex > 0) {
      currentPhotoIndex--;
      updateLightbox();
    } else if (e.key === "Escape") {
      closeViewer();
    }
  }
});

// Prev/Next button click
lightboxPrev.onclick = () => {
  if (currentPhotoIndex > 0) {
    currentPhotoIndex--;
    updateLightbox();
  }
};

lightboxNext.onclick = () => {
  if (currentPhotoIndex < totalPhotos - 1) {
    currentPhotoIndex++;
    updateLightbox();
  }
};

// Initial load
window.onload = () => {
  loadPhotos(0, photosPerBatch);
  galleryWrapper.style.display = "none";
};
