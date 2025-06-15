// Global state
let state = {
  bpm: 150,
  isPlaying: false,
  playInterval: null,
  currentStep: 0,
  sounds: {
    kick: "./sounds/kick-classic.wav",
    snare: "./sounds/snare-acoustic01.wav",
    hihat: "./sounds/hihat.acoustic01.wav"
  },
  audioElements: {}
};

// DOM Elements
const elements = {
  pads: document.querySelectorAll(".pad"),
  playBtn: document.querySelector(".play"),
  selects: document.querySelectorAll("select"),
  muteBtns: document.querySelectorAll(".mute"),
  tempoSlider: document.querySelector("#inputRange"),
  tempoNumber: document.querySelector("#inputNum"),
  kickAudio: document.querySelector(".kick-sound"),
  snareAudio: document.querySelector(".snare-sound"),
  hihatAudio: document.querySelector(".hihat-sound")
};

// Initialize the application
function init() {
  setupAudioElements();
  setupEventListeners();
  updateTempoDisplay(state.bpm);
}

function setupAudioElements() {
  state.audioElements = {
    kick: elements.kickAudio,
    snare: elements.snareAudio,
    hihat: elements.hihatAudio
  };
  
  // Set initial audio sources
  Object.entries(state.audioElements).forEach(([key, element]) => {
    if (element) element.src = state.sounds[key];
  });
}

function setupEventListeners() {
  // Pad clicks
  elements.pads.forEach(pad => {
    pad.addEventListener("click", () => togglePad(pad));
    pad.addEventListener("animationend", (e) => {
      e.target.style.animation = "";
    });
  });

  // Play button
  elements.playBtn?.addEventListener("click", togglePlayback);

  // Sound selection
  elements.selects?.forEach(select => {
    select.addEventListener("change", handleSoundChange);
  });

  // Mute buttons
  elements.muteBtns?.forEach(btn => {
    btn.addEventListener("click", toggleMute);
  });

  // Tempo controls
  elements.tempoSlider?.addEventListener("input", handleTempoInput);
  elements.tempoNumber?.addEventListener("change", handleTempoInput);
}

function togglePad(pad) {
  pad.classList.toggle("active");
}

function playSound(type) {
  const audio = state.audioElements[type];
  if (!audio) return;
  
  audio.currentTime = 0;
  audio.play().catch(e => console.error("Error playing sound:", e));
}

function playStep(step) {
  const activePads = document.querySelectorAll(`.b${step}.active`);
  
  activePads.forEach(pad => {
    pad.style.animation = "playTrack 0.3s alternate ease-in-out 2";
    
    if (pad.classList.contains("kick-pad")) playSound("kick");
    else if (pad.classList.contains("snare-pad")) playSound("snare");
    else if (pad.classList.contains("hihat-pad")) playSound("hihat");
  });
}

function updatePlayback() {
  playStep(state.currentStep);
  state.currentStep = (state.currentStep + 1) % 8;
}

function togglePlayback() {
  if (state.isPlaying) {
    stopPlayback();
  } else {
    startPlayback();
  }
  updatePlayButton();
}

function startPlayback() {
  if (state.playInterval) clearInterval(state.playInterval);
  
  const interval = (60 / state.bpm) * 1000 / 2; // /2 for 8th notes
  state.playInterval = setInterval(updatePlayback, interval);
  state.isPlaying = true;
}

function stopPlayback() {
  clearInterval(state.playInterval);
  state.playInterval = null;
  state.isPlaying = false;
  state.currentStep = 0;
}

function updatePlayButton() {
  if (!elements.playBtn) return;
  elements.playBtn.textContent = state.isPlaying ? "Stop" : "Play";
  elements.playBtn.classList.toggle("active", state.isPlaying);
}

function handleSoundChange(e) {
  const type = e.target.name.replace("-select", "");
  if (state.audioElements[type]) {
    state.audioElements[type].src = e.target.value;
  }
}

function toggleMute(e) {
  const trackIndex = parseInt(e.target.getAttribute("data-track"));
  const tracks = ["kick", "snare", "hihat"];
  const track = tracks[trackIndex];
  
  if (!track || !state.audioElements[track]) return;
  
  const isMuted = e.target.classList.toggle("active");
  state.audioElements[track].volume = isMuted ? 0 : 1;
}

function handleTempoInput(e) {
  let newBpm = parseInt(e.target.value, 10);
  
  // Validate BPM range
  newBpm = Math.max(20, Math.min(400, newBpm || 150));
  
  // Update both inputs
  if (elements.tempoSlider) elements.tempoSlider.value = newBpm;
  if (elements.tempoNumber) elements.tempoNumber.value = newBpm;
  
  // Update display and state
  updateTempoDisplay(newBpm);
  state.bpm = newBpm;
  
  // Restart playback if currently playing
  if (state.isPlaying) {
    stopPlayback();
    startPlayback();
  }
}

function updateTempoDisplay(bpm) {
  const display = document.getElementById('current-tempo');
  if (display) display.textContent = `${bpm} BPM`;
  
  // Update slider gradient
  const slider = elements.tempoSlider;
  if (slider) {
    const min = parseFloat(slider.min) || 20;
    const max = parseFloat(slider.max) || 400;
    const percent = ((bpm - min) / (max - min)) * 100;
    slider.style.background = `linear-gradient(90deg, #72ddf7 0%, #b388ff ${percent}%, rgba(255, 255, 255, 0.1) ${percent}%)`;
  }
}

// Initialize when DOM is loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

// Make functions available globally for HTML event handlers if needed
window.drumKit = {
  togglePlayback,
  handleTempoInput,
  toggleMute
};
