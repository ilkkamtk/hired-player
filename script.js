let currentTab = 'kitara';
let isPlaying = false;

function setDrumsMixerVisible(isVisible) {
  const mixer = document.getElementById('drums-mixer');
  if (!mixer) return;
  mixer.hidden = !isVisible;
}

// Tab switching
document.querySelectorAll('.tab-button').forEach((button) => {
  button.addEventListener('click', () => {
    resetPlayer();

    // Remove active class from all buttons and contents
    document
      .querySelectorAll('.tab-button')
      .forEach((btn) => btn.classList.remove('active'));
    document
      .querySelectorAll('.tab-content')
      .forEach((content) => content.classList.remove('active'));

    // Add active to clicked button and corresponding content
    button.classList.add('active');
    const tabId = button.getAttribute('data-tab') + '-tab';
    document.getElementById(tabId).classList.add('active');
    currentTab = button.getAttribute('data-tab');

    setDrumsMixerVisible(currentTab === 'rummut');

    if (currentTab !== 'rummut') {
      setOutputMode('stereo');
    }
  });
});

// Audio player
const audio = document.getElementById('audio');
const playPauseBtn = document.getElementById('play-pause');
const playPauseIcon = document.getElementById('play-pause-icon');
const rewindBtn = document.getElementById('rewind');
const forwardBtn = document.getElementById('forward');
const progress = document.getElementById('progress');
const currentTimeSpan = document.getElementById('current-time');
const durationSpan = document.getElementById('duration');

function setPlayPauseUi(playing) {
  if (playPauseIcon) {
    playPauseIcon.setAttribute('name', playing ? 'pause' : 'play');
  }
  if (playPauseBtn) {
    playPauseBtn.setAttribute('aria-label', playing ? 'Pause' : 'Play');
  }
}

function resetPlayer() {
  console.log('reset called');
  try {
    audio.pause();
  } catch {}

  isPlaying = false;
  setPlayPauseUi(false);

  // Clear the current track and reset UI
  audio.removeAttribute('src');
  audio.load();

  audio.currentTime = 0;
  progress.value = 0;
  progress.max = 0;
  currentTimeSpan.textContent = '0:00';
  durationSpan.textContent = '0:00';
}

// Web Audio variables
let audioContext;
let source;
let splitter;
let leftGain;
let rightGain;
let stereoMerger;
let monoSum;
let leftSlider;
let rightSlider;

function ensureAudioGraph() {
  if (audioContext) return;

  audioContext = new AudioContext();

  source = audioContext.createMediaElementSource(audio);
  splitter = audioContext.createChannelSplitter(2);
  leftGain = audioContext.createGain();
  rightGain = audioContext.createGain();
  stereoMerger = audioContext.createChannelMerger(2);
  monoSum = audioContext.createGain();

  source.connect(splitter);
  splitter.connect(leftGain, 0);
  splitter.connect(rightGain, 1);

  // Default output mode: stereo passthrough
  leftGain.connect(stereoMerger, 0, 0);
  rightGain.connect(stereoMerger, 0, 1);
  stereoMerger.connect(audioContext.destination);

  leftSlider = document.getElementById('left-volume');
  rightSlider = document.getElementById('right-volume');

  if (leftSlider) {
    leftSlider.addEventListener('input', () => {
      if (!leftGain) return;
      leftGain.gain.value = parseFloat(leftSlider.value);
    });
  }
  if (rightSlider) {
    rightSlider.addEventListener('input', () => {
      if (!rightGain) return;
      rightGain.gain.value = parseFloat(rightSlider.value);
    });
  }
}

function setOutputMode(mode) {
  if (!audioContext || !leftGain || !rightGain || !stereoMerger || !monoSum)
    return;

  // Clear existing routing
  try {
    leftGain.disconnect();
  } catch {}
  try {
    rightGain.disconnect();
  } catch {}
  try {
    monoSum.disconnect();
  } catch {}

  if (mode === 'mono') {
    // Sum L+R into monoSum, then feed BOTH stereo channels equally
    leftGain.connect(monoSum);
    rightGain.connect(monoSum);
    monoSum.connect(stereoMerger, 0, 0);
    monoSum.connect(stereoMerger, 0, 1);

    if (leftSlider) leftGain.gain.value = parseFloat(leftSlider.value);
    if (rightSlider) rightGain.gain.value = parseFloat(rightSlider.value);
  } else {
    // Normal stereo playback with unity gains
    leftGain.gain.value = 1;
    rightGain.gain.value = 1;
    leftGain.connect(stereoMerger, 0, 0);
    rightGain.connect(stereoMerger, 0, 1);
  }
}

function startPlayback(src) {
  if (!src) return;

  audio.src = src;
  audio.load();

  if (currentTab === 'rummut') {
    ensureAudioGraph();
    setOutputMode('mono');
    audioContext.resume().then(() => {
      audio.play();
      isPlaying = true;
      setPlayPauseUi(true);
    });
    return;
  }

  // If we've ever created a Web Audio graph (e.g., after using drums), keep routing audio through it.
  if (audioContext) {
    setOutputMode('stereo');
    audioContext.resume().then(() => {
      audio.play();
      isPlaying = true;
      setPlayPauseUi(true);
    });
    return;
  }

  audio.play();
  isPlaying = true;
  setPlayPauseUi(true);
}

document.querySelectorAll('.file-select').forEach((select) => {
  select.addEventListener('change', () => {
    startPlayback(select.value);
  });
});

document.querySelectorAll('.play-file').forEach((link) => {
  link.addEventListener('click', (e) => {
    resetPlayer();

    e.preventDefault();
    startPlayback(link.getAttribute('data-src'));
  });
});

playPauseBtn.addEventListener('click', () => {
  if (isPlaying) {
    audio.pause();
    setPlayPauseUi(false);
  } else {
    const play = () => {
      audio.play();
      setPlayPauseUi(true);
    };

    if (audioContext) {
      audioContext.resume().then(play);
    } else {
      play();
    }
  }
  isPlaying = !isPlaying;
});

audio.addEventListener('ended', () => {
  isPlaying = false;
  setPlayPauseUi(false);
});

audio.addEventListener('loadedmetadata', () => {
  if (isFinite(audio.duration) && audio.duration > 0) {
    durationSpan.textContent = formatTime(audio.duration);
    progress.max = audio.duration;
  }
});

audio.addEventListener('timeupdate', () => {
  progress.value = audio.currentTime;
  currentTimeSpan.textContent = formatTime(audio.currentTime);
});

rewindBtn.addEventListener('click', () => {
  if (!isFinite(audio.duration)) return;
  audio.currentTime = Math.max(0, audio.currentTime - 10);
});

forwardBtn.addEventListener('click', () => {
  if (!isFinite(audio.duration)) return;
  audio.currentTime = Math.min(audio.currentTime + 10, audio.duration);
});

progress.addEventListener('input', () => {
  if (!isFinite(audio.duration)) return;
  audio.currentTime = Number(progress.value);
});

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// Set first tab active by default (after all variables/functions are initialized)
document.querySelector('.tab-button').click();
