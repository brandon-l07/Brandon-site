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
  right: { corner: "top-left", text: "About" },
  front: { corner: "bottom-left", text: "Projects" },
  top: { corner: "top-right", text: "Blog" },
  back: { corner: "bottom-right", text: "Contact" },
  left: { corner: "top-left", text: "About" },
  bottom: { corner: "bottom-right", text: "Contact" }
};

const faceRotations = {
  right: { x: 0, y: -Math.PI / 2 },
  top: { x: Math.PI / 2, y: 0 },
  front: { x: 0, y: 0 },
  back: { x: 0, y: Math.PI },
};

function updateLinks(faceName) {
  for (const corner in navElems) {
    if (faceName in faceToNav && corner === faceToNav[faceName].corner) {
      navElems[corner].textContent = faceToNav[faceName].text;
      navElems[corner].classList.add("visible");
      navElems[corner].style.backgroundColor = "transparent";
      navElems[corner].style.color = "white";
    } else {
      navElems[corner].textContent = "";
      navElems[corner].classList.remove("visible");
      navElems[corner].style.backgroundColor = "black";
      navElems[corner].style.color = "black";
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

// Music Player
const playlist = [
  'Music-Site/Abba - Dancing Queen (Official Music Video Remastered).mp3',
  'Music-Site/Rick Astley - Together Forever (Official Video) [4K Remaster].mp3',
  'Music-Site/Dschinghis Khan - Moskau (Starparade 14.06.1979).mp3',
  'Music-Site/Redbone - Come and Get Your Love (Single Edit - Audio).mp3',
  'Music-Site/Earth, Wind & Fire - September.mp3',
  'Music-Site/Earth, Wind & Fire - Lets Groove (Official Audio).mp3',
  'Music-Site/Jackson 5 - I Want You Back (Lyric Video).mp3'
];

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}
shuffle(playlist);

let currentTrackIndex = 0;
const audio = new Audio();
audio.src = playlist[currentTrackIndex];
audio.preload = 'auto';
audio.volume = 0.3;

const btn = document.getElementById('music-player-btn');
const playIcon = document.getElementById('play-icon');
const pauseIcon = document.getElementById('pause-icon');

// Web Audio API setup
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
const source = audioCtx.createMediaElementSource(audio);
const analyser = audioCtx.createAnalyser();
source.connect(analyser);
analyser.connect(audioCtx.destination);
analyser.fftSize = 256;
const bufferLength = analyser.frequencyBinCount;
const dataArray = new Uint8Array(bufferLength);

// Play/pause toggle
function togglePlayPause() {
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }

  if (audio.paused) {
    audio.play();
    btn.textContent = 'Curated by Brandon';
    btn.prepend(pauseIcon);
    pauseIcon.style.display = 'inline';
    playIcon.style.display = 'none';
  } else {
    audio.pause();
    btn.textContent = 'Play';
    btn.prepend(playIcon);
    playIcon.style.display = 'inline';
    pauseIcon.style.display = 'none';
  }
}
btn.addEventListener('click', togglePlayPause);

// Track change
audio.addEventListener('ended', () => {
  currentTrackIndex = (currentTrackIndex + 1) % playlist.length;
  audio.src = playlist[currentTrackIndex];
  audio.play();
});

// Loading screen fade out
window.addEventListener("load", function () {
  const loadingScreen = document.getElementById("loading-screen");
  loadingScreen.classList.add("fade-out");

  setTimeout(() => {
    loadingScreen.style.display = "none";
  }, 10000);
});

// Animation loop
function animate(time = performance.now()) {
  requestAnimationFrame(animate);

  // Audio analysis
  analyser.getByteFrequencyData(dataArray);
  let sum = 0;
  for (let i = 0; i < bufferLength; i++) {
    sum += dataArray[i];
  }
  const avg = sum / bufferLength;
  const scale = 1 + avg / 256; // Adjust divisor to tune sensitivity
  cube.scale.set(scale, scale, scale);

  // Rotation logic
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
