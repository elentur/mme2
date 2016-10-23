/**
 * this script generates out custom video control bar for each video on the website
 */

// load > wartet auch auf fertig geladene Bilder, während DOMContentLoaded nur auf die fertige HTML Seite wartet
window.addEventListener("load", init());

/**
 *  when window is completely loaded and parsed this init function is fired
 */
function init() {

    // Suche alle Videos
    var videos = document.getElementsByTagName("video");

    // Durchlaufe alle gefundenen Videos
    for (var i = 0; i < videos.length; i++) {
        var video = videos[i];

        // Control-Bar initialisieren als div mit zwei buttons
        var div = document.createElement("div");
        div.classList.add("controller");
        var btnPlay = document.createElement("button");
        var btnStop = document.createElement("button");

        // Füge Text in buttons ein
        btnPlay.innerHTML = "PLAY";
        btnStop.innerHTML = "STOP";

        // buttons dem div übergeben
        div.appendChild(btnPlay);
        div.appendChild(btnStop);

        // div-Box hinter das Video packen
        video.parentElement.appendChild(div);

        // event-listener zu "play" und "stop" hinzufügen
        // wird sofort aufgerufen (auch vor dem klick)
        // springe onPlay oder onStop, die wiederum anweisungen für das click-event enthält
        btnPlay.addEventListener("click", onPlay(video));
        btnStop.addEventListener("click", onStop(video, btnPlay));

        // default control-bar des videos entfernen
        video.removeAttribute("controls");
    }

}

/**
 * onPlay returns a function, which pauses and plays the actual video. The button text toggles between "play" and "pause"
 * @param {Element} video - a html5 video tag
 * @returns {Function} a closure that plays or pauses the video and changes the button text related to the video state
 */
function onPlay(video) {

    // privater bereich, von außen nicht zugänglich

    // dieser teil wird erst beim klicken des buttons ausgefürt (click event)
    return function(event){

        // event.taret bezeichnet das element, das gedrückt wurde > play button
        var btnPlay = event.target;
        if (video.paused || video.ended) {
            video.play();
            btnPlay.innerHTML = "PAUSE";
        } else {
            video.pause();
            btnPlay.innerHTML = "PLAY";
        }
    }

}

/**
 * onStop returns a function, which stops the video and sets back video time and button-text to "play"
 * @param {Element} video - a html5 tag
 * @param {Element} btnPlay - a button tag to change the button status to "play" again
 * @returns {Function} a closure that stops the video and sets the play-button-text to "play" and resets the video time.
 */
function onStop(video, btnPlay) {

    return function () {

        video.pause();
        video.currentTime = 0;
        btnPlay.innerHTML = "PLAY";
    }
}