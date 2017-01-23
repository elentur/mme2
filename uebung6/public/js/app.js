/** The main application file that registers event listeners
 *  to buttons for each document
 *
 * @author Johannes Konert
 * @created 04.04.2016
 */

window.addEventListener("load", function(event) {
    var videos = document.getElementsByTagName("video");
    // videos is not an array but a NodeList, thus for each does not work
    for (var i = 0; i < videos.length; i++) {
        var video = videos[i];
        // find the elements after the video for controls play, pause, stop
        var controls = video.nextElementSibling;
        if (!controls || controls.className !== "controls") {
            continue; // just in case the HTML structure has changed
        }
        var buttons = controls.children;
        if (!buttons || buttons.length === 0) {
            continue; // just in case the HTML structure has changed and buttons are missing
        }

        // for closure context we have to save the current video in an own variable!
        // (in an own function context! and run this anonymous function directly)
        // try out what happens if you use "video" directly instead of myVideo below
        (function () {
            var myVideo = video;
            // for readability we assign variable names to buttons
            var playButton = buttons[0];
            var pauseButton = buttons[1];
            var stopButton = buttons[2];
            playButton.addEventListener("click", function (event) {
                if (myVideo.paused) {
                    myVideo.play();
                    this.style.display = "none";
                    pauseButton.style.display = "";
                }
            });
            pauseButton.addEventListener("click", function (event) {
                if (!myVideo.paused) {
                    myVideo.pause();
                    this.style.display = "none";
                    playButton.style.display = "";
                }
            });
            stopButton.addEventListener("click", function (event) {
                pauseButton.click(); // use the functionality of pause above.
                myVideo.currentTime = 0;
            });
            // now hide the button that is not used at the moment
            var buttonToHide = myVideo.paused?pauseButton:playButton;
            buttonToHide.style.display = "none";
        })();
    }
});