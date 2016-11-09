window.addEventListener("load", function () {
    var supportsVideo = !!document.createElement('video').canPlayType;

    if (supportsVideo) {

        var videoList = document.querySelectorAll('video');

        for (var i = 0; i < videoList.length; i++) {
            var controlBar = new ControlBar();

            controlBar
                .forVideo(videoList[i])
                .add();
        }
    }
}, false);

var ControlBar = function () {

    this.createTemplate = function () {
        var child = document.createElement('div');
        child.innerHTML = this.TEMPLATE;
        return child.firstChild;
    };

    this.tmpl = this.createTemplate();

    this.video = false;

    this.forVideo = function(video){

        var self = this;

        this.video = video;

        var videoContainer = video.parentNode;

        // Hide the default controls
        video.controls = false;
        // Display the user defined video controls
        this.tmpl.style.display = 'block';


        var playpause = this.tmpl.querySelector('.playpause');
        var stop = this.tmpl.querySelector('.stop');
        var mute = this.tmpl.querySelector('.mute');
        var volinc = this.tmpl.querySelector('.volinc');
        var voldec = this.tmpl.querySelector('.voldec');
        var progress = this.tmpl.querySelector('.progress');
        var progressBar = this.tmpl.querySelector('.progress-bar');
        var fullscreen = this.tmpl.querySelector('.fs');
        var play = playpause.querySelector('.fa-play');
        var pause = playpause.querySelector('.fa-pause');
        var expand = fullscreen.querySelector('.fa-expand');
        var compress = fullscreen.querySelector('.fa-compress');

        playpause.addEventListener('click', function (e) {
            if (video.paused || video.ended) {
                video.play();
                play.classList.add('hidden');
                pause.classList.remove('hidden');
            } else {
                video.pause();
                play.classList.remove('hidden');
                pause.classList.add('hidden');
            }
        });

        stop.addEventListener('click', function (e) {
            video.pause();
            video.currentTime = 0;
            progress.value = 0;
        });

        mute.addEventListener('click', function (e) {
            video.muted = !video.muted;
        });

        volinc.addEventListener('click', function (e) {
            alterVolume('+');
        });
        voldec.addEventListener('click', function (e) {
            alterVolume('-');
        });

        var alterVolume = function (dir) {
            var currentVolume = Math.floor(video.volume * 10) / 10;
            if (dir === '+') {
                if (currentVolume < 1) video.volume += 0.1;
            }
            else if (dir === '-') {
                if (currentVolume > 0) video.volume -= 0.1;
            }
        };

        video.addEventListener('loadedmetadata', function () {
            progress.setAttribute('max', video.duration);
        });

        video.addEventListener('timeupdate', function () {
            if (!progress.getAttribute('max')) progress.setAttribute('max', video.duration);
            progress.value = video.currentTime;
            progressBar.style.width = Math.floor((video.currentTime / video.duration) * 100) + '%';
        });

        progress.addEventListener('click', function (e) {
            var pos = (e.pageX - this.offsetLeft) / this.offsetWidth;
            video.currentTime = pos * video.duration;
        });

        var fullScreenEnabled = !!(document.fullscreenEnabled || document.mozFullScreenEnabled || document.msFullscreenEnabled || document.webkitSupportsFullscreen || document.webkitFullscreenEnabled || document.createElement('video').webkitRequestFullScreen);

        if (!fullScreenEnabled) {
            fullscreen.style.display = 'none';
        }

        fullscreen.addEventListener('click', function (e) {
            handleFullscreen();
        });

        var handleFullscreen = function () {
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

        var isFullScreen = function () {
            return !!(document.fullScreen || document.webkitIsFullScreen || document.mozFullScreen || document.msFullscreenElement || document.fullscreenElement);
        };

        var setFullscreenData = function (state) {
            videoContainer.setAttribute('data-fullscreen', !!state);
            if (!!state) {
                self.tmpl.classList.add('fullscreen');
                expand.classList.add('hidden');
                compress.classList.remove('hidden');
            } else {
                self.tmpl.classList.remove('fullscreen');
                expand.classList.remove('hidden');
                compress.classList.add('hidden');
            }
        };

        document.addEventListener('fullscreenchange', function (e) {
            setFullscreenData(!!(document.fullScreen || document.fullscreenElement));
        });
        document.addEventListener('webkitfullscreenchange', function () {
            setFullscreenData(!!document.webkitIsFullScreen);
        });
        document.addEventListener('mozfullscreenchange', function () {
            setFullscreenData(!!document.mozFullScreen);
        });
        document.addEventListener('msfullscreenchange', function () {
            setFullscreenData(!!document.msFullscreenElement);
        });

        return this;
    };

    this.add = function(){
        if(this.video){
            this.video.parentElement.appendChild(this.tmpl);
        }

        return this;
    }
};

ControlBar.prototype.TEMPLATE= ['<ul class="controls">',
    '<li>',
    '<button class="playpause" type="button">',
    '<i class="fa fa-play" aria-hidden="true"></i>',
    '<i class="fa fa-pause hidden" aria-hidden="true"></i>',
    '</button>',
    '</li>',
    '<li>',
    '<button class="stop" type="button">',
    '<i class="fa fa-stop" aria-hidden="true"></i>',
    '</button>',
    '</li>',
    '<li class="progress-wrapper">',
    '<progress class="progress" value="0" min="0">',
    '<span class="progress-bar"></span>',
    '</progress>',
    '</li>',
    '<li>',
    '<button class="mute" type="button">',
    '<i class="fa fa-volume-off" aria-hidden="true"></i>',
    '</button>',
    '</li>',
    '<li>',
    '<button class="volinc" type="button">',
    '<i class="fa fa-volume-up" aria-hidden="true"></i>',
    '</button>',
    '</li>',
    '<li>',
    '<button class="voldec" type="button">',
    '<i class="fa fa-volume-down" aria-hidden="true"></i>',
    '</button>',
    '</li>',
    '<li>',
    '<button class="fs" type="button">',
    '<i class="fa fa-expand" aria-hidden="true"></i>',
    '<i class="fa fa-compress hidden" aria-hidden="true"></i>',
    '</button>',
    '</li>',
    '</ul>'].join('');
