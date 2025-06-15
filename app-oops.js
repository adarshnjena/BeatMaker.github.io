class DrumKit {
  constructor() {
    // DOM Elements
    this.pads = document.querySelectorAll(".pad");
    this.playBtn = document.querySelector(".play");
    this.selects = document.querySelectorAll("select");
    this.muteBtns = document.querySelectorAll(".mute");
    this.tempoSlider = document.querySelector("#inputRange");
    this.inputNum = document.querySelector("#inputNum");

    // Audio Elements
    this.kickAudio = document.querySelector(".kick-sound");
    this.snareAudio = document.querySelector(".snare-sound");
    this.hihatAudio = document.querySelector(".hihat-sound");

    // Default sound paths
    this.currentKick = "./sounds/kick-classic.wav";
    this.currentSnare = "./sounds/snare-acoustic01.wav";
    this.currentHihat = "./sounds/hihat.acoustic01.wav";

    // Playback state
    this.index = 0; // Current step in the sequence (0-7)
    this.bpm = 150; // Beats per minute
    this.isPlaying = null; // Holds the interval ID when playing

    // Bind methods that will be used as event handlers
    this.activePad = this.activePad.bind(this);
    this.repeat = this.repeat.bind(this);
    this.playSound = this.playSound.bind(this);
    this.start = this.start.bind(this);
    this.changeSound = this.changeSound.bind(this);
    this.mute = this.mute.bind(this);
    this.changeTempo = this.changeTempo.bind(this);
    this.updateTempo = this.updateTempo.bind(this);
    this.updateBtn = this.updateBtn.bind(this);

    // Initialize the drum machine
    this.initializeEventListeners();
  }
  /**
   * Toggles the 'active' class on a pad when clicked
   * This makes the pad look pressed and marks it to be played
   */
  activePad(e) {
    // 'this' is bound to the class instance, so we need to use the event target
    const pad = e ? e.currentTarget : this;
    pad.classList.toggle("active");
  }
  /**
   * Plays the current step in the sequence and moves to the next step
   * This is called repeatedly by the play interval
   */
  repeat() {
    // Get the current step (0-7)
    const step = this.index % 8;

    // Find all pads in the current step
    const activeBars = document.querySelectorAll(`.b${step}`);

    // Play each active pad in this step
    activeBars.forEach((bar) => {
      // Visual feedback
      bar.style.animation = `playTrack 0.3s alternate ease-in-out 2`;

      // Only play if the pad is active (clicked)
      if (bar.classList.contains("active")) {
        this.playSound(bar);
      }
    });

    // Move to next step, loop back to 0 after step 7
    this.index = (this.index + 1) % 8;
  }

  /**
   * Plays the appropriate sound based on the pad type
   * @param {HTMLElement} pad - The pad element that was clicked
   */
  playSound(pad) {
    // Map of pad classes to their corresponding audio elements
    const soundMap = {
      "kick-pad": this.kickAudio,
      "snare-pad": this.snareAudio,
      "hihat-pad": this.hihatAudio,
    };

    // Find which type of pad was clicked
    for (const [padClass, audioElement] of Object.entries(soundMap)) {
      if (pad.classList.contains(padClass)) {
        // Reset and play the sound
        audioElement.currentTime = 0;
        audioElement
          .play()
          .catch((e) => console.error("Error playing sound:", e));
        break;
      }
    }
  }
  /**
   * Starts or stops the playback of the drum sequence
   */
  start() {
    // Calculate the time between beats in milliseconds
    const interval = (60 / this.bpm) * 1000;

    if (this.isPlaying) {
      // Stop playback
      this.stopPlayback();
    } else {
      // Start playback
      this.startPlayback(interval);
    }
  }

  /**
   * Starts the playback with the given interval
   * @param {number} interval - Time between beats in milliseconds
   */
  startPlayback(interval) {
    // Clear any existing interval just to be safe
    this.stopPlayback();

    // Start a new interval that calls repeat() at the specified BPM
    this.isPlaying = setInterval(() => this.repeat(), interval);

    // Update the UI
    this.updatePlayButton(true);
  }

  /**
   * Stops the current playback
   */
  stopPlayback() {
    clearInterval(this.isPlaying);
    this.isPlaying = null;
    this.updatePlayButton(false);
  }

  /**
   * Updates the play button's appearance based on playback state
   * @param {boolean} isPlaying - Whether the playback is active
   */
  updatePlayButton(isPlaying) {
    this.playBtn.innerText = isPlaying ? "Stop" : "Play";
    this.playBtn.classList.toggle("active", isPlaying);
  }
  // This method is no longer needed as its functionality
  // has been moved to updatePlayButton()
  // It's kept here for backward compatibility with any existing code
  updateBtn() {
    this.updatePlayButton(!this.isPlaying);
  }
  /**
   * Changes the sound for an instrument based on the dropdown selection
   * @param {Event} e - The change event from the select element
   */
  changeSound(e) {
    const selectionName = e.target.name;
    const selectionValue = e.target.value;

    // Map of select names to their corresponding audio elements
    const soundMap = {
      "kick-select": this.kickAudio,
      "snare-select": this.snareAudio,
      "hihat-select": this.hihatAudio,
    };

    // Update the audio source if it exists in our map
    if (soundMap[selectionName]) {
      soundMap[selectionName].src = selectionValue;
    }
  }
  /**
   * Toggles mute state for a track
   * @param {Event} e - The click event from the mute button
   */
  mute(e) {
    const muteIndex = parseInt(e.target.getAttribute("data-track"));
    const isMuted = e.target.classList.toggle("active");

    // Array of all audio elements in order of their track numbers
    const tracks = [this.kickAudio, this.snareAudio, this.hihatAudio];

    // Set volume to 0 if muted, 1 if unmuted
    if (tracks[muteIndex]) {
      tracks[muteIndex].volume = isMuted ? 0 : 1;
    }
  }
  /**
   * Updates the tempo display when the slider is moved
   * @param {Event} e - The input event from the tempo slider
   */
  changeTempo(e) {
    // Update the numeric display to match the slider
    this.inputNum.value = e.target.value;
  }
  /**
   * Updates the playback tempo and restarts playback if currently playing
   * @param {Event} e - The change event from the tempo input
   */
  updateTempo(e) {
    // Update the BPM from the input
    this.bpm = parseInt(e.target.value, 10);

    // Update the display to ensure it's in sync
    if (this.inputNum) {
      this.inputNum.value = this.bpm;
    }
    if (this.tempoSlider) {
      this.tempoSlider.value = this.bpm;
      // Update the gradient
      const min = this.tempoSlider.min || 20;
      const max = this.tempoSlider.max || 400;
      const percent = ((this.bpm - min) / (max - min)) * 100;
      this.tempoSlider.style.background = `linear-gradient(90deg, #72ddf7 0%, #b388ff ${percent}%, rgba(255, 255, 255, 0.1) ${percent}%)`;
    }

    // If currently playing, restart playback with new tempo
    if (this.isPlaying) {
      clearInterval(this.isPlaying);
      this.isPlaying = null;
      this.start();
    }
  }

  /**
   * Sets up all event listeners for the drum machine
   */
  initializeEventListeners() {
    // Pad click and animation end events
    this.pads.forEach((pad) => {
      pad.addEventListener("click", (e) => this.activePad(e));
      pad.addEventListener("animationend", function () {
        this.style.animation = "";
      });
    });

    // Play button click
    this.playBtn.addEventListener("click", () => {
      this.updateBtn();
      this.start();
    });

    // Instrument selection changes
    this.selects.forEach((select) => {
      select.addEventListener("change", (e) => this.changeSound(e));
    });

    // Mute buttons
    this.muteBtns.forEach((btn) => {
      btn.addEventListener("click", (e) => this.mute(e));
    });

    // Tempo controls
    this.tempoSlider.addEventListener("input", (e) => this.changeTempo(e));
    this.tempoSlider.addEventListener("change", (e) => this.updateTempo(e));
    this.inputNum.addEventListener("change", (e) => this.updateTempo(e));
  }
}

// Create an instance of the DrumKit when the page loads
// This will automatically set up all event listeners
document.addEventListener("DOMContentLoaded", () => {
  const drumKit = new DrumKit();

  // Make drumKit available in the global scope for the inline HTML event handlers
  window.drumKit = drumKit;
});

// Update the tempo display and slider progress
function updateTempoDisplay(value) {
  const tempoDisplay = document.getElementById('current-tempo');
  if (tempoDisplay) {
    tempoDisplay.textContent = `${value} BPM`;
  }
  
  // Update the slider progress
  const slider = document.getElementById('inputRange');
  if (slider) {
    const min = parseFloat(slider.min);
    const max = parseFloat(slider.max);
    const percent = ((value - min) / (max - min)) * 100;
    slider.style.setProperty('--slider-progress', `${percent}%`);
  }
}

// Handle tempo input changes
function handleTempoChange(e) {
  let value = parseInt(e.target.value, 10);
  
  // Enforce min/max bounds
  if (isNaN(value)) value = 200;
  if (value < 20) value = 20;
  if (value > 400) value = 400;
  
  // Update the display
  updateTempoDisplay(value);
  
  // Update the other input
  if (e.target.id === 'inputRange') {
    document.getElementById('inputNum').value = value;
  } else {
    document.getElementById('inputRange').value = value;
  }
  
  // Update the drum kit tempo if available
  if (window.drumKit) {
    window.drumKit.updateTempo({ target: { value: value } });
  }
  
  return value;
}

// Initialize the tempo control when the page loads
document.addEventListener('DOMContentLoaded', () => {
  const rangeInput = document.getElementById('inputRange');
  const numInput = document.getElementById('inputNum');
  
  if (rangeInput && numInput) {
    // Set initial values
    const initialValue = rangeInput.value;
    numInput.value = initialValue;
    updateTempoDisplay(initialValue);
    
    // Add event listeners
    rangeInput.addEventListener('input', handleTempoChange);
    rangeInput.addEventListener('change', handleTempoChange);
    numInput.addEventListener('change', handleTempoChange);
    
    // Initialize the slider gradient
    const min = parseFloat(rangeInput.min);
    const max = parseFloat(rangeInput.max);
    const percent = ((initialValue - min) / (max - min)) * 100;
    rangeInput.style.setProperty('--slider-progress', `${percent}%`);
  }
});
