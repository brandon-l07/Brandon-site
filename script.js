// Scene Setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 3;

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Cube
const geometry = new THREE.BoxGeometry();
const material = new THREE.MeshStandardMaterial({ color: 0x00aaff });
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);

// Light
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(5, 5, 5).normalize();
scene.add(light);

// Resize
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// Nav Elements
const navElems = {
  "top-left": document.getElementById("top-left"),
  "top-right": document.getElementById("top-right"),
  "bottom-left": document.getElementById("bottom-left"),
  "bottom-right": document.getElementById("bottom-right"),
};

const faceToNav = {
  right: { corner: "top-left", text: "About", href: "about.html" },
  front: { corner: "bottom-left", text: "Projects", href: "projects.html" },
  top: { corner: "top-right", text: "Blog", href: "blog.html" },
  back: { corner: "bottom-right", text: "Contact", href: "contact.html" },
  left: { corner: "top-left", text: "About", href: "about.html" },
  bottom: { corner: "bottom-right", text: "Contact", href: "contact.html" }
};

const faceRotations = {
  right: { x: 0, y: -Math.PI / 2 },
  top: { x: Math.PI / 2, y: 0 },
  front: { x: 0, y: 0 },
  back: { x: 0, y: Math.PI },
};

function updateLinks(faceName) {
  for (const corner in navElems) {
    const elem = navElems[corner];
    if (faceName in faceToNav && corner === faceToNav[faceName].corner) {
      const info = faceToNav[faceName];
      elem.textContent = info.text;
      elem.classList.add("visible");
      elem.style.backgroundColor = "transparent";
      elem.style.color = "white";

      elem.style.cursor = "pointer";
      elem.onclick = () => {
        window.location.href = info.href;
      };
    } else {
      elem.textContent = "";
      elem.classList.remove("visible");
      elem.style.backgroundColor = "black";
      elem.style.color = "black";
      elem.style.cursor = "default";
      elem.onclick = null;
    }
  }
}

const sequence = [
  { face: "right", label: "About" },
  { face: "top", label: "News" },
  { face: "front", label: "Projects" },
  { face: "back", label: "Contact" },
];

let currentIndex = 0;
const rotationDuration = 6000;
let rotationStartTime = performance.now();

function lerp(a, b, t) {
  return a + (b - a) * t;
}

// ... (rest of your code unchanged, including music player, animation, etc.)

function animate(time = performance.now()) {
  requestAnimationFrame(animate);

  // Rotation
  const elapsed = time - rotationStartTime;
  const t = Math.min(elapsed / rotationDuration, 1);
  const nextIndex = (currentIndex + 1) % sequence.length;
  const fromRot = faceRotations[sequence[currentIndex].face];
  const toRot = faceRotations[sequence[nextIndex].face];
  cube.rotation.x = lerp(fromRot.x, toRot.x, t);
  cube.rotation.y = lerp(fromRot.y, toRot.y, t);

  if (t === 1) {
    currentIndex = nextIndex;
    rotationStartTime = time;
  }

  updateLinks(sequence[currentIndex].face);
  renderer.render(scene, camera);
}

animate();


// ====== Loading Screen Fade Out Logic ======

const loadingScreen = document.getElementById("loading-screen");
const mainContent = document.getElementById("main-content");

if (loadingScreen && mainContent) {
  loadingScreen.classList.add("fade-out");
  loadingScreen.addEventListener("transitionend", () => {
    loadingScreen.style.display = "none";
    mainContent.style.display = "block";
  }, { once: true });
}


