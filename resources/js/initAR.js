export function initAR(root) {
    /**
     * @param {String} root - link to root of folder 'resource'
     * 
     * This function create script elements of html to load libs and run the loop in main.js
     * When load lib if the async lib not ready, the interval will be call to reload
     */
    var nameLoadFunction = "ThreeReady";
    if (!window[nameLoadFunction]) {
        // debugger
        const script1 = document.createElement("script");
        script1.src = root + "/resources/js/three.min.js";
        // script1.async = true;
        document.body.appendChild(script1);

        const script = document.createElement("script");
        script.src = root + "/resources/js/artoolkit.min.js";
        script.async = true;
        document.body.appendChild(script);

        function whenAvailable(name, callback) {
            // Store the interval id
            var intervalId = window.setInterval(function() {
                if (window["THREE"]) {
                    // Clear the interval id
                    window.clearInterval(intervalId);
                    // Call back
                } else
                    callback(window[name]);
            }, 100);
        }

        whenAvailable(nameLoadFunction, function(t) {
            // debugger
            if (document.getElementById('GLTF'))
                document.body.removeChild(document.getElementById('GLTF'));
            if (document.getElementById('arThree'))
                document.body.removeChild(document.getElementById('arThree'));

            const script2 = document.createElement("script");
            script2.src = root + "/resources/js/GLTFLoader.js";
            script2.id = 'GLTF';
            script2.async = true;
            document.body.appendChild(script2);

            const script3 = document.createElement("script");
            script3.src = root + "/resources/js/artoolkit.three.js";
            script3.id = 'arThree';
            script3.async = true;
            document.body.appendChild(script3);
            window[nameLoadFunction] = 'OK';

        });
        const script4 = document.createElement("script");
        script4.src = root + "/resources/js/main.js";
        script4.id = 'main';
        script4.async = true;
        document.body.appendChild(script4);
    } else {
        /**
         * In this case, libs are ready, we don't need to reload
         */
        if (document.getElementById('main'))
            document.body.removeChild(document.getElementById('main'));
        if (document.getElementById('boxCanvas') && document.getElementById('renderCanvasContext'))
            return;
        var script4 = document.createElement("script");
        script4.src = root + "/resources/js/main.js";
        script4.id = 'main';
        script4.async = true;
        document.body.appendChild(script4);
    }
}