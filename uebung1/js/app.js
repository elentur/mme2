window.addEventListener("load", function (event) {


    var videos = document.getElementsByTagName("video");
    for (var i = 0; i < videos.length; i++) {
        var video = videos[i]; // … find button objects and add listener … playButton.addEventListener("click", function (event) { video.play(); }); // … }
        var btnPlay = document.createElement("button");
        var btnStop = document.createElement("button");

        btnPlay.innerHTML = "PLAY";
        btnStop.innerHTML = "STOP";

        video.parentElement.appendChild(btnPlay);
        video.parentElement.appendChild(btnStop);

        btnPlay.addEventListener("click", onPlay(video));
        btnStop.addEventListener("click", onStop(video, btnPlay));

        video.removeAttribute("controls");
    }

});

function onPlay(video) {

    return function(e){
        var btnPlay = e.target;
        if (video.paused || video.ended) {
            video.play();
            btnPlay.innerHTML = "PAUSE";
        } else {
            video.pause();
            btnPlay.innerHTML = "PLAY";
        }
    }

}

function onStop(video, btnPlay) {

    return function () {

        video.pause();
        video.currentTime = 0;
        btnPlay.innerHTML = "PLAY";
    }
}