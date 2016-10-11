window.addEventListener("load", init, false);

function controlSet(videoContainer) {

    var video = videoContainer.querySelector('video');
    var videoControls = videoContainer.querySelector('.controls');

    // Hide the default controls
    video.controls = false;
    // Display the user defined video controls
    videoControls.style.display = 'block';


    var playpause = videoControls.querySelector('.playpause');
    var stop = videoControls.querySelector('.stop');
    var mute = videoControls.querySelector('.mute');
    var volinc = videoControls.querySelector('.volinc');
    var voldec = videoControls.querySelector('.voldec');
    var progress = videoControls.querySelector('.progress');
    var progressBar = videoControls.querySelector('.progress-bar');
    var fullscreen = videoControls.querySelector('.fs');
    var play = playpause.querySelector('.fa-play');
    var pause = playpause.querySelector('.fa-pause');
    var expand = fullscreen.querySelector('.fa-expand');
    var compress = fullscreen.querySelector('.fa-compress');

    playpause.addEventListener('click', function(e) {
        if (video.paused || video.ended) {
            video.play();
            play.classList.add('hidden');
            pause.classList.remove('hidden');
        } else{
            video.pause();
            play.classList.remove('hidden');
            pause.classList.add('hidden');
        }
    });

    stop.addEventListener('click', function(e) {
        video.pause();
        video.currentTime = 0;
        progress.value = 0;
    });

    mute.addEventListener('click', function(e) {
        video.muted = !video.muted;
    });

    volinc.addEventListener('click', function(e) {
        alterVolume('+');
    });
    voldec.addEventListener('click', function(e) {
        alterVolume('-');
    });

    var alterVolume = function(dir) {
        var currentVolume = Math.floor(video.volume * 10) / 10;
        if (dir === '+') {
            if (currentVolume < 1) video.volume += 0.1;
        }
        else if (dir === '-') {
            if (currentVolume > 0) video.volume -= 0.1;
        }
    };

    video.addEventListener('loadedmetadata', function() {
        progress.setAttribute('max', video.duration);
    });

    video.addEventListener('timeupdate', function() {

        console.log(progress);

        if (!progress.getAttribute('max')) progress.setAttribute('max', video.duration);
        progress.value = video.currentTime;
        progressBar.style.width = Math.floor((video.currentTime / video.duration) * 100) + '%';
    });

    progress.addEventListener('click', function(e) {
        var pos = (e.pageX  - this.offsetLeft) / this.offsetWidth;
        video.currentTime = pos * video.duration;
    });

    var fullScreenEnabled = !!(document.fullscreenEnabled || document.mozFullScreenEnabled || document.msFullscreenEnabled || document.webkitSupportsFullscreen || document.webkitFullscreenEnabled || document.createElement('video').webkitRequestFullScreen);

    if (!fullScreenEnabled) {
        fullscreen.style.display = 'none';
    }

    fullscreen.addEventListener('click', function(e) {
        handleFullscreen();
    });

    var handleFullscreen = function() {
        if (isFullScreen()) {
            if (document.exitFullscreen) document.exitFullscreen();
            else if (document.mozCancelFullScreen) document.mozCancelFullScreen();
            else if (document.webkitCancelFullScreen) document.webkitCancelFullScreen();
            else if (document.msExitFullscreen) document.msExitFullscreen();
            setFullscreenData(false);
        }
        else {
            if (videoContainer.requestFullscreen) videoContainer.requestFullscreen();
            else if (videoContainer.mozRequestFullScreen) videoContainer.mozRequestFullScreen();
            else if (videoContainer.webkitRequestFullScreen) videoContainer.webkitRequestFullScreen();
            else if (videoContainer.msRequestFullscreen) videoContainer.msRequestFullscreen();
            setFullscreenData(true);
        }
    };

    var isFullScreen = function() {
        return !!(document.fullScreen || document.webkitIsFullScreen || document.mozFullScreen || document.msFullscreenElement || document.fullscreenElement);
    };

    var setFullscreenData = function(state) {
        videoContainer.setAttribute('data-fullscreen', !!state);
        if(!!state){
            videoControls.classList.add('fullscreen');
            expand.classList.add('hidden');
            compress.classList.remove('hidden');
        }else{
            videoControls.classList.remove('fullscreen');
            expand.classList.remove('hidden');
            compress.classList.add('hidden');
        }
    };

    document.addEventListener('fullscreenchange', function(e) {
        setFullscreenData(!!(document.fullScreen || document.fullscreenElement));
    });
    document.addEventListener('webkitfullscreenchange', function() {
        setFullscreenData(!!document.webkitIsFullScreen);
    });
    document.addEventListener('mozfullscreenchange', function() {
        setFullscreenData(!!document.mozFullScreen);
    });
    document.addEventListener('msfullscreenchange', function() {
        setFullscreenData(!!document.msFullscreenElement);
    });

}
function init() {

    var supportsVideo = !!document.createElement('video').canPlayType;

    if (supportsVideo) {

        var videoContainerList = document.querySelectorAll('.videoContainer');

        for (var i = 0; i < videoContainerList.length; i++) {
            controlSet(videoContainerList[i]);
        }
    }
}
