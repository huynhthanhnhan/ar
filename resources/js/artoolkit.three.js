/* THREE.js ARToolKit integration */

var setContent;
(function() {
    var integrate = function() {
        /**
        	Helper for setting up a Three.js AR scene using the device camera as input.
        	Pass in the maximum dimensions of the video you want to process and onSuccess and onError callbacks.

        	On a successful initialization, the onSuccess callback is called with an ThreeARScene object.
        	The ThreeARScene object contains two THREE.js scenes (one for the video image and other for the 3D scene)
        	and a couple of helper functions for doing video frame processing and AR rendering.

        	Here's the structure of the ThreeARScene object:
        	{
        		scene: THREE.Scene, // The 3D scene. Put your AR objects here.
        		camera: THREE.Camera, // The 3D scene camera.

        		arController: ARController,

        		video: HTMLVideoElement, // The userMedia video element.

        		videoScene: THREE.Scene, // The userMedia video image scene. Shows the video feed.
        		videoCamera: THREE.Camera, // Camera for the userMedia video scene.

        		process: function(), // Process the current video frame and update the markers in the scene.
        		renderOn: function( THREE.WebGLRenderer ) // Render the AR scene and video background on the given Three.js renderer.
        	}

        	You should use the arScene.video.videoWidth and arScene.video.videoHeight to set the width and height of your renderer.

        	In your frame loop, use arScene.process() and arScene.renderOn(renderer) to do frame processing and 3D rendering, respectively.

        	@param {number} width - The maximum width of the userMedia video to request.
        	@param {number} height - The maximum height of the userMedia video to request.
        	@param {function} onSuccess - Called on successful initialization with an ThreeARScene object.
        	@param {function} onError - Called if the initialization fails with the error encountered.
        */
        ARController.getUserMediaThreeScene = function(configuration) {
            var obj = {};
            for (var i in configuration) {
                obj[i] = configuration[i];
            }
            var onSuccess = configuration.onSuccess;

            obj.onSuccess = function(arController, arCameraParam) {
                var scenes = arController.createThreeScene();
                onSuccess(scenes, arController, arCameraParam);
            };

            //////////// Process for lost camera ////////////
            obj.onError = function() {
                    document.getElementById('divLoading').style.display = 'none';
                    var errorMessage = document.createElement('div')
                    errorMessage.textContent = 'Make sure your camera is enable and your device has met minimum requirement!';
                    errorMessage.className = 'errorMessage';
                    document.getElementById('renderCanvas').appendChild(errorMessage);

                    var script = document.createElement('script');
                    script.src = '/static/resources/js/offline.js';
                    document.getElementById('renderCanvas').appendChild(script);
                }
                ////////////////////////////////////////////////

            var video = this.getUserMediaARController(obj);
            return video;
        };

        /**
         * function auto wrap text if text is too long
         * 
         * @param {*} context - context of canvas
         * @param {*} text - content
         * @param {*} x - position x
         * @param {*} y - position y
         * @param {*} maxWidth - max width of content on a line
         * @param {*} lineHeight  - distance of two line
         */
        function wrapText(context, text, x, y, maxWidth, lineHeight) {
            var words = text.split(' ');
            var line = '';

            for (var n = 0; n < words.length; n++) {
                var testLine = line + words[n] + ' ';
                var metrics = context.measureText(testLine);
                var testWidth = metrics.width;
                if (testWidth > maxWidth && n > 0) {
                    context.fillText(line, x, y);
                    line = words[n] + ' ';
                    y += lineHeight;

                } else {
                    line = testLine;
                }
            }
            context.fillText(line, x, y);
            return y;
        }
        /**
         * content of front side
         */
        var list_Front_Content = ["Màn hình kích thước 6.9 inch sử dụng tấm nền Dynamic AMOLED 2X",
            "Màn hình trên Galaxy S20 Ultra có tần số quét lên tới 120 Hz",
            "Công nghệ HDR10+ cho trải nghiệm giải trí chơi game với chất lượng tuyệt vời",
            "Được bảo vệ bằng kính cường lực Gorilla Glass 6 với độ bền cao",
            "Sử dụng màn hình công nghệ Infinity O khoét lỗ cho camera selfie"
        ];

        var list_Camera_Content = ["Camera đỉnh cao, độ phân giải siêu khủng 108 MP",
            "Sự kết hợp độc đáo giữa bộ 4 camera siêu khủng",
            "Chế độ Space Zoom 100x số 1 trên thế giới smartphone",
            "Tính năng quay phim chất điện ảnh 8K",
            "Kết hợp cùng công nghệ chống rung quang học OIS"
        ]

        var list_Back_Content = ["Vi xử lý mạnh mẽ mang tên Exynos 990 với xung nhịp cao nhất có thể đạt tới  2.73 GHz",
            "Dung lượng RAM 12 GB và bộ nhớ trong 128 GB, hỗ trợ thẻ nhớ ngoài lên đến 1T",
            "điểm hiệu năng mạnh mẽ lên tới 503.122 điểm",
            "Pin dung lượng lớn 5000 mAh có hỗ trợ sạc nhanh 45 W",
            "Chế độ sạc không dây công suất 15W"
        ];


        var typeContext; // status type of canvas hint or info
        var isFirstSetTypeContext = true; // only set the transform for canvas on the first time
        var isPortraint = false; // check is portraint mode
        /**
         * Create content for the canvas
         * 
         * @param {String} type - type of context
         */
        var createContext = function(type, content) {
            var renderCanvas = document.getElementById('renderCanvasContext');
            // console.log('set')
            var canvas = document.getElementById("boxCanvas");
            var ctx = canvas.getContext("2d");
            ctx.clearRect(-canvas.width, -canvas.height, canvas.width * 2, canvas.height * 2);
            ctx.strokeStyle = 'white';
            ctx.fillStyle = "white";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            var boxWidth = canvas.width;
            var boxHeight = canvas.height;
            if (type == 'hint_mobile_portraint')
                isPortraint = true;
            if (isPortraint) {
                var temp = boxWidth;
                boxWidth = boxHeight;
                boxHeight = temp;
            }

            var drawContent = function(listContent, boxWidth, textSize) {
                var yIndex = 0;
                if (isPortraint)
                    ctx.rotate(Math.PI / 2);
                for (var i = 0; i < listContent.length; i++) {
                    yIndex = wrapText(ctx, listContent[i], boxWidth / 2, yIndex + textSize, boxWidth - textSize, textSize);
                }
                if (isPortraint)
                    ctx.rotate(-Math.PI / 2);
                // ctx.translate(-canvas.width / 2, -canvas.height / 2)
            }
            if (type == 'hint_mobile' || type == 'hint_mobile_portraint' || type == 'hint_desktop') {
                typeContext = 'hint';
                if (isShow)
                    planeBox.visible = false;
                ctx.lineWidth = 50;
                if (isPortraint)
                    ctx.strokeRect(-canvas.width, 0, canvas.width, canvas.height)
                else
                    ctx.strokeRect(0, 0, canvas.width, canvas.height)
                if (isFirstSetTypeContext) {
                    // console.log('here')
                    switch (type) {
                        case 'hint_mobile':
                        case 'hint_mobile_portraint':
                            ctx.scale(-1, 1);
                            break;
                    }
                    isFirstSetTypeContext = false;
                }
                if (isPortraint)
                    ctx.rotate(Math.PI / 2);
                ctx.font = boxWidth / 10 + 'px' + " samsung";
                var content = content ? content : 'Scan marker here';
                ctx.fillText(content, boxWidth / 2, boxHeight / 2);
                if (isPortraint)
                    ctx.rotate(-Math.PI / 2); // revert rotation for the next setContext
            } else {
                typeContext = 'info';
                ctx.fillStyle = "#0d41a3";
                ctx.fillRect(-canvas.width, -canvas.height, canvas.width * 2, canvas.height * 2);
                ctx.lineWidth = 10;

                ctx.strokeRect(0, 0, canvas.width, canvas.height);
                if (isPortraint)
                    var textSize = boxHeight / 20;
                else
                    var textSize = boxWidth / 20;
                ctx.font = textSize + 'px samsung';
                ctx.fillStyle = "white";
                ctx.textAlign = "center";
                switch (type) {
                    case 'info_front':
                        drawContent(list_Front_Content, boxWidth, textSize);
                        break;
                    case 'info_camera':
                        drawContent(list_Camera_Content, boxWidth, textSize);
                        break;
                    case 'info_back':
                        drawContent(list_Back_Content, boxWidth, textSize);
                        break;
                }
                planeBox.visible = true;
            }

        }

        setContent = createContext;

        /**
            Creates a Three.js scene for use with this ARController.

            Returns a ThreeARScene object that contains two THREE.js scenes (one for the video image and other for the 3D scene)
            and a couple of helper functions for doing video frame processing and AR rendering.

            Here's the structure of the ThreeARScene object:
            {
                scene: THREE.Scene, // The 3D scene. Put your AR objects here.
                camera: THREE.Camera, // The 3D scene camera.

                arController: ARController,

                video: HTMLVideoElement, // The userMedia video element.

                videoScene: THREE.Scene, // The userMedia video image scene. Shows the video feed.
                videoCamera: THREE.Camera, // Camera for the userMedia video scene.

                process: function(), // Process the current video frame and update the markers in the scene.
                renderOn: function( THREE.WebGLRenderer ) // Render the AR scene and video background on the given Three.js renderer.
            }

            You should use the arScene.video.videoWidth and arScene.video.videoHeight to set the width and height of your renderer.

            In your frame loop, use arScene.process() and arScene.renderOn(renderer) to do frame processing and 3D rendering, respectively.

            @param video Video image to use as scene background. Defaults to this.image
        */
        var isShow = false; // check if marker is detected isShow will be true else false
        var planeBox; // plane object of THREE for show "Scan marker here"
        var planeBow, planeArcher; // plane for the Bow and Archer infomation
        var global_scene; // save scene to global for use in setUpThree
        var global_arcontroller; // save arcontroller to global for use in setUpThree
        var isUnbox = false; // flag for check event unbox

        /**
         * This function create element of THREE: plane, scene, camera,light, ...
         * 
         * This function return arScene object
         * @param {any} video - set the video element. In this case, video will be set by this.image (image is a video element created in artoolkit.min.js)
         */
        ARController.prototype.createThreeScene = function(video) {

            video = video || this.image;

            this.setupThree();

            // To display the video, first create a texture from it.

            var videoTex = new THREE.Texture(video);

            videoTex.minFilter = THREE.LinearFilter;
            videoTex.flipY = false;

            // Then create a plane textured with the video.
            var plane = new THREE.Mesh(
                new THREE.PlaneBufferGeometry(2, 2),
                new THREE.MeshBasicMaterial({ map: videoTex, side: THREE.DoubleSide })
            );

            // The video plane shouldn't care about the z-buffer.
            plane.material.depthTest = false;
            plane.material.depthWrite = false;

            var texture = new THREE.CanvasTexture(document.getElementById('boxCanvas'));
            // texture.needsUpdate = true;
            // texture.wrapS = THREE.RepeatWrapping;
            // // texture.repeat.x = -1;
            // // texture.rotation.x = Math.PI;
            // texture.repeat.z = -1;

            // create plane for "Scan marker here" box
            var scale = typeContext == 'hint' ? -1 : -1.5; // scale of plane for scan marker here or info mobile
            //TODO: set scale for plane with type of context
            planeBox = new THREE.Mesh(
                new THREE.PlaneBufferGeometry(scale, scale),
                new THREE.MeshBasicMaterial({ map: texture, side: THREE.DoubleSide, transparent: true })
            );
            // planeBox.material.map.needsUpdate = true;

            ////////// Create texture and plane for bow //////////
            var bowTexture = new THREE.TextureLoader().load("/resources/image/bow-arrow-png-7.png");
            bowTexture.wrapS = THREE.RepeatWrapping;
            bowTexture.wrapT = THREE.RepeatWrapping;
            // bowTexture.repeat.set(4, 4);

            planeBow = new THREE.Mesh(
                new THREE.PlaneBufferGeometry(-1, -1),
                new THREE.MeshBasicMaterial({ map: bowTexture, side: THREE.DoubleSide })
            );
            planeBow.needsUpdate = true;
            planeBow.visible = false;
            ////////////////////////////////////////////////////////

            ////////// Create texture and plane for archer //////////
            var archerTexture = new THREE.TextureLoader().load("/resources/image/archer.png");
            archerTexture.opacity = 0.5;
            archerTexture.color = '0x000000';
            // archerTexture.transparent = true;
            // archerTexture.wrapS = THREE.RepeatWrapping;
            // archerTexture.wrapT = THREE.RepeatWrapping;
            // archerTexture.repeat.set(4, 4);

            planeArcher = new THREE.Mesh(
                new THREE.PlaneBufferGeometry(-0.5, -1),
                new THREE.MeshBasicMaterial({ map: archerTexture, side: THREE.DoubleSide })
            );
            planeArcher.needsUpdate = true;
            planeArcher.visible = false;
            ////////////////////////////////////////////////////////



            // Create a camera and a scene for the video plane and
            // add the camera and the video plane to the scene.
            // var videoCamera = new THREE.OrthographicCamera(window.innerWidth / -50, window.innerWidth / 50, window.innerHeight / 50, window.innerHeight / -50, -500, 1000);
            var videoCamera = new THREE.OrthographicCamera(-1, 1, -1, 1, -500, 1000);
            var videoScene = new THREE.Scene();
            videoScene.background = new THREE.Color(0x000000);

            videoScene.add(plane);
            videoScene.add(planeBox);

            videoScene.add(planeBow);
            videoScene.add(planeArcher);
            videoScene.add(videoCamera);

            if (this.orientation === 'portrait') {
                plane.rotation.z = Math.PI / 2;
            }

            var scene = new THREE.Scene();

            var camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 500);
            camera.position.z = 0;
            camera.position.y = 0;
            camera.matrixAutoUpdate = false;

            // reset camrera matrix for show correct model
            var matrix = [1.9102363924347978, 0, 0, 0, 0, 2.5377457054523322, 0, 0, -0, -0.005830389685211879, -1.0000002000000199, -1, 0, 0, -20.0000002000000202, 0]

            setProjectionMatrix(camera.projectionMatrix, matrix);

            /**
             * set Unbox flag, the flag is set at the main.js when trigger the canvas
             */
            var setUnboxFlag = function(flag) {
                if (isGetMarker)
                    isUnbox = flag;
            }

            var self = this;
            var count = 0;
            global_scene = scene;
            global_arcontroller = this;

            return {

                // all of this var can be use in main.js as property of arScene
                scene: scene, // scene for render model
                videoScene: videoScene, // scene for video stream and plane on it
                camera: camera, // camera for model
                videoCamera: videoCamera, // camera for video stream

                arController: this,

                video: video,
                setContext: createContext,
                isInteract: function() { return isShow; }, // get isShow variable for use in main.js
                planeBow: planeBow, // public plane of Bow
                planeArcher: planeArcher, // public plane of Archer
                planeBox: planeBox, //public plane box (of hint and info)
                setUnboxFlag: setUnboxFlag,

                /**
                 * Process function, check if model detected it will be visible
                 * This call the process function for detect marker in three.min.js
                 */
                process: function() {

                    if (isShow)
                        for (var i in self.threeNFTMarkers) {
                            self.threeNFTMarkers[i].visible = true;
                        }
                    else
                        for (var i in self.threeNFTMarkers) {
                            self.threeNFTMarkers[i].visible = false;
                        }
                        // document.getElementById('txt').textContent = video.paused;
                    if (video.paused)
                        video.paused = false;
                    self.process(video);
                },

                /**
                 * Render:
                 * {
                 *  videoScene: render the video stream and planes
                 *  scene: render model and THREE objects
                 * }
                 * 
                 * @param {any} renderer - THREE.WebGLRenderer object
                 */
                renderOn: function(renderer) {
                    texture.needsUpdate = true; // need to update the Canvas Texture in a loop
                    videoTex.needsUpdate = true;
                    var ac = renderer.autoClear;
                    renderer.autoClear = false;
                    renderer.clear();
                    // render from camera and planes added
                    renderer.render(this.videoScene, this.videoCamera);
                    // render model from root, light, ... added in main.js file
                    renderer.render(this.scene, this.camera);
                    renderer.autoClear = ac;
                    animate();
                }

            };
        };


        /**
            Creates a Three.js marker Object3D for the given NFT marker UID.
            The marker Object3D tracks the NFT marker when it's detected in the video.

            Use this after a successful artoolkit.loadNFTMarker call:

            arController.loadNFTMarker('DataNFT/pinball', function(markerUID) {
                var markerRoot = arController.createThreeNFTMarker(markerUID);
                markerRoot.add(myFancyModel);
                arScene.scene.add(markerRoot);
            });

            @param {number} markerUID The UID of the marker to track.
            @param {number} markerWidth The width of the marker, defaults to 1.
            @return {THREE.Object3D} Three.Object3D that tracks the given marker.
        */
        ARController.prototype.createThreeNFTMarker = function(markerUID, markerWidth) {
            this.setupThree();
            var obj = new THREE.Object3D();
            obj.markerTracker = this.trackNFTMarkerId(markerUID, markerWidth);
            obj.matrixAutoUpdate = false;
            this.threeNFTMarkers[markerUID] = obj;
            return obj;
        };

        var first = true; // check is the first get marker
        var isDoneAnimation = false; // check is animation of box Done
        var isGetMarker = false; // check marker is get


        const interpolationFactor = 5; // delta time for make stable

        var trackedMatrix = {
            // for interpolation
            delta: [
                0, 0, 0, 0,
                0, 0, 0, 0,
                0, 0, 0, 0,
                0, 0, 0, 0
            ],
            interpolated: [
                0, 0, 0, 0,
                0, 0, 0, 0,
                0, 0, 0, 0,
                0, 0, 0, 0
            ]
        }

        ARController.prototype.setupThree = function() {
            if (this.THREE_JS_ENABLED) {
                return;
            }
            this.THREE_JS_ENABLED = true;

            /*
                Listen to getNFTMarker events to keep track of Three.js markers.
            */
            this.addEventListener('getNFTMarker', function(ev) {

                if (typeContext == 'hint')
                    planeBox.visible = false;
                var marker = ev.data.marker;
                isGetMarker = true;
                var obj;

                obj = this.threeNFTMarkers[ev.data.marker.id];
                if (obj) {

                    /**
                     * make stable matrix
                     */
                    var array = ev.data.matrixGL_RH; // get the result matrix from detect
                    for (let i = 0; i < 16; i++) {
                        trackedMatrix.delta[i] = array[i] - trackedMatrix.interpolated[i];
                        trackedMatrix.interpolated[i] = trackedMatrix.interpolated[i] + (trackedMatrix.delta[i] / interpolationFactor);
                    }

                    /**
                     * check if from the lost tracking, the matrix will not set from interpolate
                     */
                    if (isShow || !isDoneAnimation)
                        setProjectionMatrix(obj.matrix, trackedMatrix.interpolated); // set the interpolate matrix to object
                    else {
                        setProjectionMatrix(obj.matrix, array);
                        for (let i = 0; i < 16; i++) {
                            trackedMatrix.delta[i] = 0;
                            trackedMatrix.interpolated[i] = array[i];
                        }
                    }
                    //TODO: use interpolate to set matrix
                    //arg: from the new and old matrix detect, if the change of them is large, we need to  reset the matrix before set for model matrix to make it stable
                    //requires: we need two 4x4 matrix to store the old matrix and the delta matrix. From the delta matrix and interpolation factor, reset the matrix detected

                    ///////////////////////////

                    // obj.matrix.fromArray(ev.data.matrixGL_RH);
                    obj.visible = true;
                    preMatrix = ev.data.matrixGL_RH;
                    var box;
                    if (first && obj.children.length >= 2) {
                        if (obj.children[0].name == 'mobile') {
                            var temp = obj.children[0];
                            obj.children[0] = obj.children[1];
                            obj.children[1] = temp;
                        }
                        box = obj.children[0].children[2];
                    }
                    if (isDoneAnimation == true)
                        isShow = true;
                    if (isUnbox) {
                        first = false;
                        if (box) {
                            /**
                             * interval to create animtion for box
                             */
                            var interval = setInterval(function() {
                                var delta = 1;
                                box.children[0].position.y += delta;
                                box.children[1].position.y -= delta;
                                box.children[2].position.y -= delta;

                                if (Math.abs(box.children[1].position.y - box.children[0].position.y) >= 50) {
                                    clearInterval(interval);
                                    runPartical();
                                    box.visible = false;
                                    isShow = true;
                                    isDoneAnimation = true;
                                    var mobile = obj.children[1].children[2];
                                    window['mobile'] = mobile;
                                    var mobileInterval = setInterval(function() {
                                        var modelCenterZ = mobile.scale.x / 10;
                                        mobile.translateZ(modelCenterZ);
                                        var delta = 0.04;
                                        if (mobile.rotation.x < Math.PI)
                                            mobile.rotation.x += delta;
                                        if (mobile.rotation.z < Math.PI * 2)
                                            mobile.rotation.z += delta * 4;
                                        mobile.translateZ(-modelCenterZ);
                                        if (mobile.rotation.x >= Math.PI && mobile.rotation.z >= Math.PI * 2)
                                            clearInterval(mobileInterval);

                                    }, 25);
                                }
                            }, 50)
                        }
                    }
                }
            });


            /**
                Listen to lostNFTMarker event from artoolkit.min.js
             */
            this.addEventListener('lostNFTMarker', function(ev) {

                isShow = false;
                if (typeContext == 'hint')
                    planeBox.visible = true;
                planeBow.visible = false;
                planeArcher.visible = false;
                var marker = ev.data.marker;
                var obj;

                obj = this.threeNFTMarkers[ev.data.marker.id];

                if (obj) {
                    obj.visible = false;
                }
            });

            /**
                Index of Three.js NFT markers, maps markerID -> THREE.Object3D.
            */
            this.threeNFTMarkers = {};

        };

    };
    /**
     * Helper Method for Three.js compatibility
     */
    var setProjectionMatrix = function(projectionMatrix, value) {
        // if (typeof projectionMatrix.elements.set === "function") {
        //     projectionMatrix.elements.set(value);
        // } else {
        //     projectionMatrix.elements = [].slice.call(value);
        // }
        let array = [];
        for (let key in value) {
            array[key] = value[key];
        }
        if (typeof projectionMatrix.elements.set === "function") {
            projectionMatrix.elements.set(array);
        } else {
            projectionMatrix.elements = [].slice.call(array);
        }
    };

    /**
     * Check for reload init function
     */
    var tick = function() {
        if (window.ARController && window.THREE) {
            integrate();
            if (window.ARThreeOnLoad) {
                window.ARThreeOnLoad();
            }
        } else {
            setTimeout(tick, 50);
        }
    };

    tick();

})();