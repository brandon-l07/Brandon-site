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

      // Make clickable
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

// --- Playlist & Audio Setup ---

const playlist = [
  'Music-Site/Abba - Dancing Queen (Official Music Video Remastered).mp3',
  'Music-Site/Rick Astley - Together Forever (Official Video) [4K Remaster].mp3',
  'Music-Site/Dschinghis Khan - Moskau (Starparade 14.06.1979).mp3',
  'Music-Site/Redbone - Come and Get Your Love (Single Edit - Audio).mp3',
  'Music-Site/Earth, Wind & Fire - September.mp3',
  'Music-Site/Earth, Wind & Fire - Lets Groove (Official Audio).mp3',
  'Music-Site/Jackson 5 - I Want You Back (Lyric Video).mp3',
  'Music-Site/Bon Jovi - Living On A Prayer.mp3',
  'Music-Site/ABBA - Lay All Your Love On Me Lyrics.mp3',
  'Music-Site/Bla Bla Bla (Radio Cut).mp3',
  'Music-Site/Rixton - Me and My Broken Heart (Official Video).mp3'
];

let currentTrackIndex = 0;
const audio = new Audio();
audio.src = playlist[currentTrackIndex];
audio.loop = false;

// --- Audio analysis setup for beats and frequency ---

const audioContext = new (window.AudioContext || window.webkitAudioContext)();
const analyser = audioContext.createAnalyser();
analyser.fftSize = 256;

const source = audioContext.createMediaElementSource(audio);
source.connect(analyser);
analyser.connect(audioContext.destination);

const frequencyData = new Uint8Array(analyser.frequencyBinCount);

// --- Nav Elements continued ---

const musicBtn = document.getElementById("music-player-btn");
let isPlaying = false;
let cubeExpanding = false;

function startCubeExpansion() {
  cubeExpanding = true;
}

function stopCubeExpansion() {
  cubeExpanding = false;
}

// Update button text to show current track name nicely
function updateMusicBtnText() {
  const filename = playlist[currentTrackIndex].split('/').pop();
  musicBtn.textContent = (isPlaying ? "Pause" : "Play") + " - " + filename;
}

updateMusicBtnText();

// Play/pause button logic with playlist support
musicBtn.addEventListener("click", () => {
  // Resume AudioContext on user gesture first (required by browsers)
  audioContext.resume().then(() => {
    if (!isPlaying) {
      audio.play()
        .then(() => {
          isPlaying = true;
          updateMusicBtnText();
          startCubeExpansion();
        })
        .catch((error) => {
          console.error("Failed to play audio:", error);
        });
    } else {
      audio.pause();
      isPlaying = false;
      updateMusicBtnText();
      stopCubeExpansion();
    }
  }).catch(err => {
    console.error("Failed to resume audio context:", err);
  });
});

// When track ends, go to next track automatically
audio.addEventListener('ended', () => {
  currentTrackIndex = (currentTrackIndex + 1) % playlist.length;
  audio.src = playlist[currentTrackIndex];
  if (isPlaying) {
    audio.play();
  }
  updateMusicBtnText();
});

// --- Animation variables ---

let cubeScale = 1;

// --- Animate loop ---

function animate(time = performance.now()) {
  requestAnimationFrame(animate);

  // Get frequency data
  analyser.getByteFrequencyData(frequencyData);

  // Calculate average frequency for bass (lower frequencies)
  let bassSum = 0;
  for (let i = 0; i < frequencyData.length / 4; i++) {
    bassSum += frequencyData[i];
  }
  const bassAvg = bassSum / (frequencyData.length / 4);

  // Resize cube based on bass and cubeExpanding state
  if (cubeExpanding) {
    cubeScale += bassAvg / 1000; // scale growth influenced by bass average
    if (cubeScale > 1.5) cubeScale = 1.5;
  } else {
    cubeScale -= 0.01;
    if (cubeScale < 1) cubeScale = 1;
  }
  cube.scale.set(cubeScale, cubeScale, cubeScale);

  // Recolor cube based on overall frequency
  let freqSum = 0;
  for (let i = 0; i < frequencyData.length; i++) {
    freqSum += frequencyData[i];
  }
  const freqAvg = freqSum / frequencyData.length;

  // Map frequency average to color hue (0 to 360 degrees)
  const hue = (freqAvg / 255) * 360;
  const color = new THREE.Color(`hsl(${hue}, 100%, 50%)`);
  cube.material.color = color;

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



