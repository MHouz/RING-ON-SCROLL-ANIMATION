const frameCount = 40;
const images = [];
const canvas = document.getElementById('animationCanvas');
const context = canvas.getContext('2d');

// Set canvas dimensions
function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resizeCanvas();

// Preload frames
for (let i = 1; i <= frameCount; i++) {
  const img = new Image();
  img.src = `frames/ezgif-frame-${String(i).padStart(3, '0')}.jpg`;
  images.push(img);
}

// Ensure we can draw once first frame is ready
images[0].onload = () => {
  context.drawImage(images[0], 0, 0, canvas.width, canvas.height);
};

// Fallback draw if cached
setTimeout(() => {
  if (images[0].complete && images[0].naturalHeight !== 0) {
    context.drawImage(images[0], 0, 0, canvas.width, canvas.height);
  }
}, 50);

// Smooth interpolation variables
let currentFrame = 0;
let targetFrame = 0;
let isAnimating = false;

function drawFrame(index) {
  if (!images[index]) return;
  if (!images[index].complete) return;
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.drawImage(images[index], 0, 0, canvas.width, canvas.height);
}

function rafUpdate() {
  const diff = targetFrame - currentFrame;
  if (Math.abs(diff) < 0.001) {
    currentFrame = targetFrame;
  } else {
    currentFrame += diff * 0.12; // smoothing factor (0-1)
  }

  const frameIndex = Math.min(frameCount - 1, Math.max(0, Math.round(currentFrame)));
  drawFrame(frameIndex);

  if (Math.abs(targetFrame - currentFrame) > 0.001) {
    requestAnimationFrame(rafUpdate);
  } else {
    isAnimating = false;
  }
}

// Update target frame on scroll and reveal h1s sequentially
window.addEventListener('scroll', () => {
  const scrollTop = window.scrollY;
  const hero = document.querySelector('.hero');
  const maxScroll = Math.max(1, (hero ? hero.offsetHeight - window.innerHeight : document.body.scrollHeight - window.innerHeight));
  const scrollFraction = Math.min(1, Math.max(0, scrollTop / maxScroll));
  targetFrame = Math.min(frameCount - 1, Math.floor(scrollFraction * frameCount));

  if (!isAnimating) {
    isAnimating = true;
    requestAnimationFrame(rafUpdate);
  }

  // Reveal h1s one by one based on scroll progress
  const scrollTexts = document.querySelectorAll('.scroll-text');
  scrollTexts.forEach((el) => {
    const index = parseInt(el.getAttribute('data-scroll'));
    const threshold = (index + 1) * (1 / 3); // 1/3, 2/3, 3/3
    if (scrollFraction >= threshold) {
      el.classList.add('visible');
    } else {
      el.classList.remove('visible');
    }
  });
});

// Make canvas responsive on resize
window.addEventListener('resize', () => {
  resizeCanvas();
  // redraw current frame after resize
  drawFrame(Math.min(frameCount - 1, Math.round(currentFrame)));
});