Number.prototype.toMMSS = function () {
    var seconds = Math.floor(this);
    var minutes = Math.floor(seconds / 60);
    seconds -= minutes*60;

    if (minutes < 10) {minutes = "0"+minutes;}
    if (seconds < 10) {seconds = "0"+seconds;}
    return minutes+':'+seconds;
}

const wavesurfer = WaveSurfer.create({
    container: '#waveform',
    waveColor: '#540F91',
    progressColor: '#971AFE',
    url: 'assets/audio.mp3',
    barWidth: 4,
    resposive: true,
    height: 120,
    barRadius: 8,
    volume: 25,
    normalize: false,
    dragToSeek: false,
    hideScrollbar: true,
    autoCenter: false
});

let zoomLevel = 0;
let interval;
// const zoomSlider = document.getElementById("zoom");
const waveFormWrapper = document.getElementById("waveform");
const waveFormContainer = document.querySelector(".waveform-container");
const playerControls = document.querySelector("#player-controls");
const playButton = document.querySelector(".player-button.play-pause");
const stopButton = document.querySelector(".player-button.stop");
const totalTime = document.querySelector(".track-lenght");
const volumeSlider = document.getElementById("volume");
const volumeControls = document.querySelector(".volume-controls");
const volumeValue = document.getElementById("volume-value");
const muteButton = document.querySelector(".volume-controls .mute");
const currentTime = document.querySelector(".time.track-time");
const slider = wavesurfer.renderer.scrollContainer;
const progress = wavesurfer.renderer.progressWrapper;

function atakkePlayPause() {
    wavesurfer.playPause();
    if (playerControls.classList.contains("paused")) {
        playerControls.classList.remove("paused");
        interval = setInterval(atakkeShowTime,100);
    } else {
        playerControls.classList.add("paused");
        clearInterval(interval);
    }
}
function atakkeFinish() {
    playerControls.classList.add("paused");
    clearInterval(interval);
}
function atakkeStop() {
    playerControls.classList.add("paused");
    wavesurfer.stop();
    atakkeShowTime();
}
function atakkeGetLength() {
    return wavesurfer.getDuration().toMMSS();
}
function atakkeInitLength() {
    totalTime.textContent = atakkeGetLength();
}
function atakkeSetVolume() {
    wavesurfer.setVolume(volumeSlider.value/100);
    volumeValue.textContent = volumeSlider.value;
    if (volumeControls.classList.contains("muted")) {
        volumeControls.classList.remove("muted");
    }
}
function atakkeMute() {
    if (volumeControls.classList.contains("muted")) {
        atakkeSetVolume();
        volumeControls.classList.remove("muted");
    } else {
        wavesurfer.setVolume(0);
        volumeControls.classList.add("muted");
    }
}
function atakkeSetZoom(zoomLvl) {
    waveFormWrapper.classList.add("transparent");
    waveFormContainer.classList.add("glow");
    setTimeout(()=> {
        wavesurfer.zoom(zoomLvl);
        slider.scrollLeft = progress.offsetWidth;
    }, 100)
    setTimeout(()=> {
        waveFormWrapper.classList.remove("transparent");
    },200);
    setTimeout(()=> {
        waveFormContainer.classList.remove("glow");
    },500);

}
function atakkeShowTime() {
    currentTime.textContent = wavesurfer.getCurrentTime().toMMSS();
}
function atakkeInit() {
    atakkeInitLength();
    atakkeSetVolume();
}

playButton.onclick = atakkePlayPause;
stopButton.onclick = atakkeStop;
muteButton.onclick = atakkeMute;

//zoomSlider.addEventListener("change", atakkeSetZoom);

wavesurfer.on("ready", atakkeInit);
wavesurfer.on("click", atakkeShowTime);
wavesurfer.on("finish", atakkeFinish);

// More responsive volume
let volumeIsDown = false;
volumeSlider.addEventListener("mousedown", (e) => {
    volumeIsDown = true;
    volumeSlider.classList.add("active");
});
volumeSlider.addEventListener("mouseleave", (e) => {
    volumeIsDown = false;
    volumeSlider.classList.remove("active");
});
volumeSlider.addEventListener("mouseup", (e) => {
    volumeIsDown = false;
    volumeSlider.classList.remove("active");
    atakkeSetVolume();
});
volumeSlider.addEventListener("mousemove", (e) => {
    if(!volumeIsDown) return;
    atakkeSetVolume();
});

// Drag scrolling on the waveform
let isDown = false;
let startX;
let scrollLeft;
slider.addEventListener('mousedown', (e) => {
    isDown = true;
    slider.classList.add('active');
    wavesurfer.toggleInteraction(false);
    wavesurfer.pause();
    startX = e.pageX - slider.offsetLeft;
    scrollLeft = slider.scrollLeft;
});
slider.addEventListener('mouseleave', () => {
    isDown = false;
    waveFormContainer.classList.remove("glow");
    wavesurfer.toggleInteraction(true);
    slider.classList.remove('active');
});
slider.addEventListener('mouseup', () => {
    isDown = false;
    wavesurfer.toggleInteraction(true);
    waveFormContainer.classList.remove("glow");
    if (!playerControls.classList.contains("paused")) wavesurfer.play();
    
});
slider.addEventListener('mousemove', (e) => {
    if(!isDown) return;
    e.preventDefault();
    waveFormContainer.classList.add("glow");
    const x = e.pageX - slider.offsetLeft;
    const walk = (x - startX) * 3; //scroll-fast
    slider.scrollLeft = scrollLeft - walk;
    //console.log(walk);
});
// Zooming via scrollwheel
slider.addEventListener("wheel", (e) => {
    e.preventDefault();
    zoomLevel = zoomLevel-(e.deltaY/10);
    if (zoomLevel > 500) {
        zoomLevel = 500;
        return;
    } else if (zoomLevel < 0) {
        zoomLevel = 0;
        return;
    }
    atakkeSetZoom(zoomLevel);
    //console.log([e, zoomLevel]);
});

// Icon init
feather.replace();