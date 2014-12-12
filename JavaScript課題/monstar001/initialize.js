(function() {
    enchant();

    var theatre = enchant.puppet.Theatre.create({
        showScore: false
    });

    theatre.addEventListener('load', function() {
        var script = document.createElement('script');

        document.body.appendChild(script);

        script.onload = function() {
             enchant.puppet.Theatre._execSceneStartEvent();

             setTimeout(function() {
                 theatre.rootScene._dispatchExitframe();
             }, 100);
        };
        script.src = 'main.js';
    });
}());
