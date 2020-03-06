/* THREE.js ARToolKit integration */

;
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


        var typeContext; // status type of canvas hint or info
        /**
         * Create content for the canvas
         * 
         * @param {String} type - type of context
         */

        var createContext = function(type) {
            var canvas = document.getElementById("boxCanvas");
            var ctx = canvas.getContext("2d");
            ctx.strokeStyle = 'white';
            ctx.fillStyle = "white";
            ctx.textAlign = "center";

            var drawContent = function(listContent, boxWidth, textSize) {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                var yIndex = -boxHeight / 2;
                console.log('content')
                for (var i = 0; i < listContent.length; i++) {
                    yIndex = wrapText(ctx, listContent[i], 0, yIndex + textSize + textSize / 2, boxWidth - textSize, textSize);
                }
            }
            if (type == 'hint_mobile' || type == 'hint_mobile_portraint' || type == 'hint_desktop') {
                typeContext = 'hint';
                ctx.lineWidth = 50;
                var boxWidth = canvas.width;
                var boxHeight = canvas.height;
                ctx.strokeRect(canvas.width / 2 - boxWidth / 2, canvas.height / 2 - boxHeight / 2, boxWidth, boxHeight);
                ctx.translate(canvas.width / 2, canvas.height / 2);
                ctx.font = boxWidth / 10 + 'px' + " Comic Sans MS";
                ctx.fillText("Scan marker here", 0, 0);
                switch (type) {
                    case 'hint_mobile':
                        ctx.scale(-1, 1);
                        break;
                    case 'hint_mobile_portraint':
                        ctx.scale(-1, 1);
                        ctx.rotate(Math.PI / 2);
                        break;
                }
            } else {
                typeContext = 'info';
                ctx.fillStyle = "#9ea7b8";
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                ctx.lineWidth = 10;

                var boxWidth = canvas.width;
                var boxHeight = canvas.height;
                ctx.strokeRect(canvas.width / 2 - boxWidth / 2, canvas.height / 2 - boxHeight / 2, boxWidth, boxHeight);
                ctx.translate(canvas.width / 2, canvas.height / 2);
                var textSize = boxWidth / 20;
                ctx.font = textSize + 'px' + " Comic Sans MS";
                ctx.fillStyle = "white";
                ctx.textAlign = "center";
                switch (type) {
                    case 'info_front':
                        drawContent(list_Front_Content, boxWidth, textSize);
                        break;
                    case 'info_camera':
                        drawContent(list_Camera_Content, boxWidth, textSize);
                        break;

                }
            }


        }

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
            texture.needsUpdate = true;
            // texture.wrapS = THREE.RepeatWrapping;
            // // texture.repeat.x = -1;
            // // texture.rotation.x = Math.PI;
            // texture.repeat.z = -1;

            // create plane for "Scan marker here" box
            var scale = typeContext == 'hint' ? -1 : -1.5; // scale of plane for scan marker here or info mobile
            console.log(typeContext)
            var planeB = new THREE.Mesh(
                new THREE.PlaneBufferGeometry(scale, scale),
                new THREE.MeshBasicMaterial({ map: texture, side: THREE.DoubleSide, transparent: true })
            );
            planeBox = planeB;

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
            var videoCamera = new THREE.OrthographicCamera(-1, 1, -1, 1, -1, 1);
            var videoScene = new THREE.Scene();
            videoScene.background = new THREE.Color(0x000000);

            videoScene.add(plane);
            videoScene.add(planeB);

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

                    videoTex.needsUpdate = true;
                    var ac = renderer.autoClear;
                    renderer.autoClear = false;
                    renderer.clear();
                    // render from camera and planes added
                    renderer.render(this.videoScene, this.videoCamera);
                    // render model from root, light, ... added in main.js file
                    renderer.render(this.scene, this.camera);
                    renderer.autoClear = ac;
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

        ARController.prototype.setupThree = function() {
            if (this.THREE_JS_ENABLED) {
                return;
            }
            this.THREE_JS_ENABLED = true;

            /*
            	Listen to getNFTMarker events to keep track of Three.js markers.
            */
            this.addEventListener('getNFTMarker', function(ev) {
                isShow = true;
                if (typeContext == 'hint')
                    planeBox.visible = false;
                var marker = ev.data.marker;
                var obj;

                obj = this.threeNFTMarkers[ev.data.marker.id];

                if (obj) {
                    {
                        obj.matrix.fromArray(ev.data.matrixGL_RH);
                        obj.visible = true;
                        preMatrix = ev.data.matrixGL_RH;
                    }
                    if (first && obj.children.length >= 2) {
                        if (obj.children[0].name == 'mobile') {
                            var temp = obj.children[0];
                            obj.children[0] = obj.children[1];
                            obj.children[1] = temp;
                        }
                        first = false;
                        var box = obj.children[0].children[2];
                        window['box'] = box;
                        if (box) {
                            /**
                             * interval to create animtion for box
                             */
                            var interval = setInterval(function() {
                                var delta = 2;
                                box.children[0].position.y += delta;
                                box.children[1].position.y -= delta;
                                box.children[2].position.y -= delta;

                                if (Math.abs(box.children[1].position.y - box.children[0].position.y) >= 50) {
                                    clearInterval(interval);
                                    box.visible = false;
                                    var mobile = obj.children[1].children[2];
                                    window['mobile'] = mobile;
                                    var mobileInterval = setInterval(function() {
                                        var modelCenterZ = mobile.scale.x / 10;
                                        mobile.translateZ(modelCenterZ);
                                        var delta = 0.1;
                                        if (mobile.rotation.x < Math.PI)
                                            mobile.rotation.x += delta;
                                        if (mobile.rotation.z < Math.PI * 2)
                                            mobile.rotation.z += delta * 4;
                                        mobile.translateZ(-modelCenterZ);
                                        if (mobile.rotation.x >= Math.PI && mobile.rotation.z >= Math.PI * 2)
                                            clearInterval(mobileInterval);

                                    }, 50);
                                }
                            }, 100)
                        }
                    }
                }

                /**
                 * Check the first check model for run animation
                 */
                // if (first) {
                //     isShow = true;
                //     var obj = this.threeNFTMarkers[ev.data.marker.id];
                //     if (obj) {
                //         {
                //             obj.matrix.fromArray(ev.data.matrixGL_RH);
                //             obj.visible = true;
                //             preMatrix = ev.data.matrixGL_RH;
                //         }
                //     }
                //     /**
                //      * Get the object root which contain the model. The variable mobile is model
                //      */
                //     var objectRoot = global_scene.getObjectByName('rootObject');
                //     var mobile = objectRoot.children[0];

                //     var object = global_scene.getObjectByName('box');
                //     var box;
                //     if (object)
                //         box = obj.children[0];
                //     if (box) {
                //         /**
                //          * interval to create animtion for box
                //          */
                //         // box.matrix.fromArray(ev.data.matrixGL_RH);
                //         box.visible = true;
                //         // preMatrix = ev.data.matrixGL_RH;
                //         var interval = setInterval(function() {
                //             var delta = 0.01;
                //             box.children[0].position.y += delta;
                //             box.children[1].position.y -= delta;
                //             box.children[2].position.y -= delta;

                //             if (Math.abs(box.children[1].position.y - box.children[0].position.y) >= 20) {
                //                 clearInterval(interval);
                //                 // object.visible = false;
                //                 // global_scene.remove(object);
                //                 var count = 0;
                //                 /**
                //                  * interval for create animtion for mobile (it runs after the box disable)
                //                  * animation of mobile is change to rotate (Math.PI/2,0,0)
                //                  */
                //                 animationInterval = setInterval(function() {
                //                     var delta = 0.003;
                //                     /**
                //                      * rotate for mobile
                //                      */
                //                     if (global_arcontroller.orientation === 'portrait') {
                //                         if (mobile.rotation.y < 0)
                //                             mobile.rotation.y += delta * 3 / 2;
                //                         if (mobile.rotation.z < 0)
                //                             mobile.rotation.z += delta;
                //                         if (mobile.rotation.x > Math.PI / 2)
                //                             mobile.rotation.x -= delta * 2;
                //                         if (mobile.rotation.y >= 0 && mobile.rotation.z >= 0 && mobile.rotation.x <= Math.PI / 2) {

                //                             first = false;
                //                         }
                //                     }
                //                     /**
                //                      * rotate for desktop
                //                      */
                //                     else {
                //                         if (mobile.rotation.y > 0)
                //                             mobile.rotation.y -= delta * 3 / 2;
                //                         if (mobile.rotation.z < 0)
                //                             mobile.rotation.z += delta;
                //                         if (mobile.rotation.x < Math.PI / 2)
                //                             mobile.rotation.x += delta * 2;
                //                         if (mobile.rotation.y <= 0 && mobile.rotation.z >= 0 && mobile.rotation.x >= Math.PI / 2) {

                //                             first = false;
                //                         }
                //                     }
                //                 }, 100)
                //             }
                //         }, 100)
                //     }
                // } else {
                //     isShow = true;
                //     planeBox.visible = false;
                //     var marker = ev.data.marker;
                //     var obj;

                //     obj = this.threeNFTMarkers[ev.data.marker.id];

                //     if (obj) {
                //         {
                //             obj.matrix.fromArray(ev.data.matrixGL_RH);
                //             obj.visible = true;
                //             preMatrix = ev.data.matrixGL_RH;
                //         }
                //     }
                // }
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
        if (typeof projectionMatrix.elements.set === "function") {
            projectionMatrix.elements.set(value);
        } else {
            projectionMatrix.elements = [].slice.call(value);
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