/**
 * This funtion return a loop for render and process. The loop is used when a <script> in html file init this file
  
  Here some html Element are created:
  {
    divLoading: use for show loading screen. It will be disable when model loaded
    boxCanvas: use for show the rectangle with content "Scan marker here". It will be show when the marker can not detect and disable when marker found
    renderer.domElement: use for render all object of THREE. This is created when init THREE.WebGLRenderer

    all of elements above are append as child of 'renderCanvas' element. This element is added in the html file of ar page
  }

  This function use arController (import from artoolkit.three.js) to check userMedia, load NFT data marker and model
 * @param {String} modelUri - link to .gltf file model (this can be link raw github or link to folder local)
 **/
function initAR(modelUri) {
    var canvasMaster = document.getElementById('renderCanvas');
    var divLoading = document.createElement('div');
    divLoading.id = 'divLoading';
    divLoading.className = "loading";
    canvasMaster.appendChild(divLoading);
    // canvasMaster.className = 'main';
    var boxCanvas = document.createElement('canvas');
    boxCanvas.id = 'boxCanvas';
    boxCanvas.className = "boxCanvas";
    boxCanvas.style.transform = "scale(1,1)";
    // boxCanvas.width = canvasMaster.offsetWidth;
    // boxCanvas.height = parseFloat(boxCanvas.width) * 0.75;
    boxCanvas.width = 4096;
    boxCanvas.height = 2048;
    canvasMaster.appendChild(boxCanvas);
    boxCanvas.style.display = 'none';
    boxCanvas.getContext("2d").font = '10px samsung';

    var info = document.createElement('div');
    info.id = 'info';
    info.className = 'info';
    info.textContent = 'info';
    canvasMaster.appendChild(info);

    // boxCanvas.style.width = '100%';
    // boxCanvas.style.height = (0.75 * boxCanvas.offsetWidth).toString() + 'px';
    // boxCanvas.width = boxCanvas.style.width;
    // boxCanvas.height = boxCanvas.style.height;

    /**
     * This function will be call when arController is loaded from artoolkit.min.js
     */
    window.ARThreeOnLoad = function() {
        ARController.getUserMediaThreeScene({
            maxARVideoSize: 320,
            cameraParam: '/resources/camera_para/camera_para-iPhone 5 rear 640x480 1.0m.dat',
            /**
             * This function is called when get userMedia of device success
             * 
             * This funtion return a loop for render and process
             * @param {object} arScene - object is returned from artoolkit.three.js
             * @param {object} arController - object is returned from artoolkit.min.js
             */
            onSuccess: function(arScene, arController, arCamera) {
                document.body.className = arController.orientation;

                var renderer = new THREE.WebGLRenderer({ // create WebGLRenderer. renderer.domElement is a canvas
                    // antialias: true
                    // preserveDrawingBuffer: true,
                    antialias: true,
                    // alpha: true
                });
                renderer.gammaOutput = true;
                renderer.gammaFactor = 2.2;
                renderer.setClearColor(0x00ffff, 1);

                /**
                 * init Camera(fov, aspect, far, near)
                 */
                var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
                camera.position.z = 25;
                camera.position.y = 15;

                renderer.domElement.className = 'renderCanvas';
                renderer.domElement.id = 'renderCanvasContext';
                // renderer.domElement.style.width = '100%';
                canvasMaster.appendChild(renderer.domElement);

                // boxCanvas.width = renderer.domElement.width;
                // boxCanvas.height = renderer.domElement.height;
                // boxCanvas.style.top = renderer.domElement.height / 2 - boxCanvas.height / 2;

                var hint_Content = ""; // save type of hint

                ////////// setup for mobile version //////////
                if (arController.orientation === 'portrait') {
                    var w = (window.innerWidth / arController.videoHeight) * arController.videoWidth;
                    var h = window.innerWidth;
                    renderer.setSize(w, h);
                    // renderer.domElement.style.paddingBottom = (w - h) + 'px';
                    // canvasMaster.style.transform = 'rotate(-90deg)';

                    renderer.domElement.style.height = canvasMaster.offsetWidth + 'px';
                    renderer.domElement.style.width = parseFloat(canvasMaster.offsetWidth) / 0.75 + 'px';
                    canvasMaster.style.marginBottom = '15%';
                    canvasMaster.style.marginLeft = '-23%';
                    renderer.domElement.style.marginTop = '15%';
                    divLoading.style.width = renderer.domElement.offsetHeight + 'px';
                    divLoading.style.height = renderer.domElement.offsetWidth + 'px';
                    divLoading.style.marginLeft = '17%';
                    // boxCanvas.width = 2048;
                    // boxCanvas.height = 4096;
                    arScene.setContext('hint_mobile_portraint');
                    hint_Content = 'hint_mobile_portraint';

                } else {
                    ///////////// setup for mobile has not portrait mode //////////
                    if (/Android|mobile|iPad|iPhone/i.test(navigator.userAgent)) {
                        // renderer.setSize(window.innerWidth, (window.innerWidth / arController.videoWidth) * arController.videoHeight);

                        var w = (window.innerWidth / arController.videoHeight) * arController.videoWidth;
                        var h = window.innerWidth;
                        renderer.setSize(w, h);

                        arScene.setContext('hint_mobile');
                        hint_Content = 'hint_mobile';
                    }

                    /////////////// Setup For Desktop ////////////////
                    else {
                        renderer.setSize(arController.videoWidth, arController.videoHeight);
                        document.body.className += ' desktop';
                        // canvasMaster.style.transform = 'scale(-1,1)';
                        arScene.setContext('hint_desktop');
                        hint_Content = 'hint_desktop';
                        // arScene.setContext('info_camera');
                    }
                    // renderer.domElement.style.width = '100%';
                    // renderer.domElement.style.height = (0.75 * renderer.domElement.offsetWidth) + 'px';


                    renderer.domElement.style.height = '100%';
                    renderer.domElement.style.position = 'absolute';
                    renderer.domElement.style.width = (renderer.domElement.offsetHeight / 0.75) + 'px';
                    divLoading.style.width = renderer.domElement.offsetWidth + 'px';
                    divLoading.style.height = renderer.domElement.offsetHeight + 'px';
                    divLoading.style.margin = 'auto';
                    divLoading.style.left = '0';
                    divLoading.style.right = '0';

                }

                var mixers = []; // array for frames of animation of model. This is used in the loop
                var clock = new THREE.Clock(); // use in loop to update mixers
                var objectRoot; // the global object for model, use to interact with model outside load function
                var preMousePos; // save the old position of mouse, use to compare with new position of mouse
                var isRotate = false; // set allow rotate model or not. This dependent on the 'isShow' variable in artoolkit.three.js
                var finger_dist; // check distance of fingers on mobile
                var modelScale = 0.5 // default scale of model
                var modelCenterZ;

                /**
                 * This return the position of mouse on the render canvas
                 * @param {canvas} canvasDom - the canvas for get position of mouse. In this case, this is renderer.domElement
                 * @param {event} mouseEvent - event of mouse
                 */
                function getMousePos(canvasDom, mouseEvent) {
                    var rect = canvasDom.getBoundingClientRect();
                    return {
                        x: mouseEvent.clientX - rect.left,
                        y: mouseEvent.clientY - rect.top
                    };
                }

                function getTouchPos(canvasDom, touchEvent) {
                    var rect = canvasDom.getBoundingClientRect();
                    return {
                        x: touchEvent.touches[0].clientX - rect.left,
                        y: touchEvent.touches[0].clientY - rect.top
                    };
                }

                /**
                 * This get position of two fingures touches[0] & touches[1] and caculate the distance
                 * 
                 * This function return distance of fingures
                 * @param {event} e - event of mobile
                 */
                function get_distance(e) {
                    var diffX = e.touches[0].clientX - e.touches[1].clientX;
                    var diffY = e.touches[0].clientY - e.touches[1].clientY;
                    return Math.sqrt(diffX * diffX + diffY * diffY);
                }

                //////////// Mouse Event /////////////
                /**
                 * This function set the old mouse position if model is shown and set the pick position for Raycast
                 * 
                 * @param {event} ev - event mouse down
                 */
                renderer.domElement.addEventListener('mousedown', function(ev) {
                    arScene.setUnboxFlag(true);
                    if (arScene.isInteract()) {
                        preMousePos = getMousePos(renderer.domElement, ev);
                        isRotate = true
                    }
                    //TODO: name
                    // arg: 
                    // requires: 
                    setPickPosition(ev);
                }, false);
                /**
                 * If model is shown, delta of old postion and new postion of mouse will be caculate and set for rotation of model with ratio /100
                 * 
                 * @param {event} ev - event mouse move
                 */
                renderer.domElement.addEventListener('mousemove', function(ev) {
                    if (arScene.isInteract()) {
                        if (isRotate) {
                            var newMousePos = getMousePos(renderer.domElement, ev);
                            if (preMousePos.x && preMousePos.y) {
                                var deltaX = newMousePos.x - preMousePos.x;
                                var deltaY = newMousePos.y - preMousePos.y;
                                window['root'] = objectRoot;
                                // // objectRoot.geometry.computeBoundingBox();
                                // // objectRoot.geometry.boundingBox.getCenter(center);
                                // objectRoot.geometry.center();
                                // // objectRoot.position.copy(center);

                                // var scale = 20 / box.getSize().x;

                                // console.log(box.getSize(modelCenterZ))
                                var scale = objectRoot.scale.x;
                                modelCenterZ = scale / 10;
                                objectRoot.translateZ(modelCenterZ);
                                objectRoot.rotation.z += deltaX / 100;
                                objectRoot.rotation.x += deltaY / 100;
                                objectRoot.translateZ(-modelCenterZ);
                            }

                            preMousePos = newMousePos;
                        }
                    }
                }, false);
                renderer.domElement.addEventListener('mouseup', function(ev) {
                    /**
                     * reset position of mouse for raycast and block the rotate
                     */
                    if (arScene.isInteract()) {
                        isRotate = false;
                    }
                    clearPickPosition();
                    arScene.setContext(hint_Content);
                }, false);

                /**
                 * If the mouse roll up, scale model will increase and opposite.
                 * 
                 * @param {event} ev - event roll mouse
                 */
                renderer.domElement.addEventListener('wheel', function(ev) {
                    if (arScene.isInteract()) {
                        if (ev.deltaY < 0)
                            var scale = objectRoot.scale.x + modelScale / 10;
                        else
                            var scale = objectRoot.scale.x - modelScale / 10;
                        objectRoot.scale.x = scale;
                        objectRoot.scale.y = scale;
                        objectRoot.scale.z = scale;
                    }
                }, false);
                ///////////////////////////

                /////////// Touch Event //////////////
                /**
                 * Check the length of touches for get number of fingures.
                 * If number of fingures is one, we will process for rotate model else get distance of fingures for zoom
                 * 
                 * @param {event} ev - event touch on mobile
                 */
                renderer.domElement.addEventListener('touchstart', function(ev) {
                    arScene.setUnboxFlag(true);
                    if (arScene.isInteract()) {
                        if (ev.touches.length > 1) {
                            finger_dist = get_distance(ev);
                        } else {
                            preMousePos = getTouchPos(renderer.domElement, ev);
                            isRotate = true
                        }
                    }
                }, false);
                /**
                 * Check the length of touches for get number of fingures.
                 * If number of fingures is one, we will process for rotate model else get distance of fingures for zoom
                 * 
                 * @param {event} ev - event touch move on mobile
                 */
                renderer.domElement.addEventListener('touchmove', function(ev) {
                    if (arScene.isInteract()) {
                        ev.preventDefault();
                        if (ev.touches.length > 1) {
                            var new_finger_dist = get_distance(ev);
                            var scale = objectRoot.scale.x + (new_finger_dist - finger_dist) / (1000 * 0.3 / modelScale);
                            objectRoot.scale.x = scale;
                            objectRoot.scale.y = scale;
                            objectRoot.scale.z = scale;
                            finger_dist = new_finger_dist;
                        } else {
                            if (isRotate) {
                                var newMousePos = getTouchPos(renderer.domElement, ev);
                                if (preMousePos.x && preMousePos.y) {
                                    var deltaX = newMousePos.x - preMousePos.x;
                                    var deltaY = newMousePos.y - preMousePos.y;
                                    var scale = objectRoot.scale.x;
                                    modelCenterZ = scale / 10;
                                    objectRoot.translateZ(modelCenterZ);
                                    objectRoot.rotation.z += deltaX / 100;
                                    objectRoot.rotation.x += deltaY / 100;
                                    objectRoot.translateZ(-modelCenterZ);
                                }

                                preMousePos = newMousePos;
                            }
                        }
                    }
                }, false);
                renderer.domElement.addEventListener('touchend', function(ev) {
                    if (arScene.isInteract()) {
                        isRotate = false;
                    }
                    arScene.setContext(hint_Content);
                }, false);
                ////////////////////////////////

                //////////////// Pick detail part of model ////////////////
                class PickHelper {
                    constructor() {
                        this.raycaster = new THREE.Raycaster();
                        this.pickedObject = null;
                        this.pickedObjectSavedColor = 0;
                    }

                    /**
                     * @param {object} normalizedPosition - position of mouse on canvas
                     */
                    pick(normalizedPosition) {
                        // console.log(normalizedPosition)
                        // restore the color if there is a picked object
                        if (this.pickedObject) {
                            this.pickedObject = undefined;
                        }

                        // cast a ray through the frustum
                        this.raycaster.setFromCamera(normalizedPosition, arScene.camera);
                        this.raycaster.near = 0.1;
                        this.raycaster.far = 1000;

                        // get the list of objects the ray intersected
                        // the 'true' pram is used for check detail of model
                        const intersectedObjects = this.raycaster.intersectObjects(arScene.scene.children, true);

                        if (intersectedObjects.length > 0) {
                            // pick the first object. It's the closest one
                            this.pickedObject = intersectedObjects[0].object;
                            // save its color
                            // this.pickedObjectSavedColor = this.pickedObject.material.emissive.getHex();
                            // set its emissive color to flashing red/yellow

                            // this.pickedObject.material.emissive.setHex(0xFFFF00);

                            // this.pickedObject.rotation.y += 0.1 ;
                            //slowDown();
                            // document.getElementById('info').style.display = 'block';
                            // document.getElementById('info').style.left = clientPos.x;
                            // document.getElementById('info').style.top = clientPos.y;
                            // console.log(this.pickedObject.name)

                            /////////// Check part of model with name /////////
                            switch (this.pickedObject.name) {
                                case 'Mesh_0':
                                    arScene.setContext('info_front');
                                    break;
                                case 'Mesh.010_0':
                                    arScene.setContext('info_camera');
                                    break;
                                case "Mesh.008_0":
                                    arScene.setContext('info_back');
                                    break;
                                default:
                                    arScene.setContext(hint_Content);
                                    break;
                            }
                            // if (this.pickedObject.name == 'Mesh_0') {
                            //     // document.getElementById('info').textContent = 'Bow';
                            //     // arScene.planeBow.visible = true;
                            //     // arScene.planeArcher.visible = false;
                            //     // arScene.planeBow.position.x = normalizedPosition.x;
                            //     // arScene.planeBow.position.y = -normalizedPosition.y;
                            //     arScene.setContext('info_front');
                            //     arScene.planeBox.visible = true;
                            // }
                            // if (this.pickedObject.name == 'Mesh.010_0') {
                            //     // document.getElementById('info').textContent = 'Bow';
                            //     // arScene.planeBow.visible = true;
                            //     // arScene.planeArcher.visible = false;
                            //     // arScene.planeBow.position.x = normalizedPosition.x;
                            //     // arScene.planeBow.position.y = -normalizedPosition.y;
                            //     arScene.setContext('info_camera');
                            //     arScene.planeBox.visible = true;
                            // } else {
                            //     arScene.setContext('hint_desktop');
                            //     // arScene.planeBox.visible = true;
                            // }
                            // else {
                            //     // document.getElementById('info').textContent = 'Archer';
                            //     arScene.planeBow.visible = false;
                            //     arScene.planeArcher.visible = true;
                            //     arScene.planeArcher.position.x = normalizedPosition.x;
                            //     arScene.planeArcher.position.y = -normalizedPosition.y;
                            // }

                        }
                    }
                }

                const pickPosition = { x: 0, y: 0 }; // store the pick position for raycast
                const pickHelper = new PickHelper(); // use for init raycast
                clearPickPosition();

                ///////////// Caculate Mouse postion on Canvas ////////////
                /**
                 * This funtion caculate postion of mouse on canvas and set to pickPosition object
                 * If this is mobile device with portraint mode, we will interchangeable position x and y
                 * 
                 * @param {event} event - any event of mouse or touch
                 */
                function setPickPosition(event) {
                    // console.log('Client Pos: {x: ' + event.clientX + ' y: ' + event.clientY + '}')
                    // const pos = getCanvasRelativePosition(event);
                    pickPosition.x = ((event.clientX - renderer.domElement.getBoundingClientRect().left) / renderer.domElement.getBoundingClientRect().width) * -2 + 1;
                    pickPosition.y = ((event.clientY - renderer.domElement.getBoundingClientRect().top) / renderer.domElement.getBoundingClientRect().height) * -2 + 1; // note we flip Y
                    if (arController.orientation === 'portrait') {
                        var temp = pickPosition.x;
                        pickPosition.x = pickPosition.y;
                        pickPosition.y = temp;
                    }
                    // console.log('Renderer DOM Pos: {x: ' + pickPosition.x + ' y: ' + pickPosition.y + '}')
                }

                function clearPickPosition() {
                    pickPosition.x = -100000;
                    pickPosition.y = -100000;
                    arScene.planeBow.visible = false;
                    arScene.planeArcher.visible = false;
                }
                // window.addEventListener('mousedown', setPickPosition);
                // window.addEventListener('mouseup', clearPickPosition);
                window.addEventListener('mouseout', clearPickPosition);
                window.addEventListener('mouseleave', clearPickPosition);

                window.addEventListener('touchstart', (event) => {
                    // prevent the window from scrolling
                    event.preventDefault();
                    setPickPosition(event.touches[0]);
                }, { passive: false });

                window.addEventListener('touchmove', (event) => {
                    setPickPosition(event.touches[0]);
                });

                window.addEventListener('touchend', clearPickPosition);

                /////////////////////////////////////////
                var ambient = new THREE.AmbientLight(0x222222);
                // arScene.scene.add(ambient);

                var directionalLight = new THREE.DirectionalLight(0xffffff, 1);
                directionalLight.position.set(0, 0, -100).normalize();
                arScene.scene.add(directionalLight);

                var hemisphereLight = new THREE.HemisphereLight(0xffffbb, 0x080820, 1);
                arScene.scene.add(hemisphereLight);

                var pointLight = new THREE.PointLight(0xffffff, 5);
                pointLight.position.copy(arScene.camera.position);
                arScene.scene.add(pointLight);

                var sphereCamera = new THREE.CubeCamera(1, 1000, 500);
                sphereCamera.position.set(0, 100, 0);
                // arScene.scene.add(sphereCamera);

                /**
                 * set enviroment for partical
                 */
                setStage(renderer, arScene.videoScene, arScene.videoCamera);

                ///////// Load NFT data /////////////
                /**
                 * When load NFT of marker success, we will create a root object for add model to THREE
                 * 
                 * @param {any} markerId - set Id for object root marker
                 */
                arController.loadNFTMarker('/resources/dataNFT/Kyanon', function(markerId) {
                    var markerRoot = arController.createThreeNFTMarker(markerId);
                    markerRoot.name = 'rootObject';
                    arScene.scene.add(markerRoot);
                    root = markerRoot;

                    /**
                     * The interval for reload model if lib is not ready
                     */
                    var intervalLoad = setInterval(function() {
                        if (window.THREE.GLTFLoader) {
                            var loader = new THREE.GLTFLoader();

                            loader.load('/resources/models/Box/scene.gltf', function(gltf) {
                                // gltf.scene.rotation.x = Math.PI;
                                // gltf.scene.rotation.z = Math.PI;
                                var object = gltf.scene;
                                object.rotation.y = Math.PI;
                                // if (arController.orientation === 'portrait')
                                //     object.rotation.set(Math.PI, -Math.PI / 3, -Math.PI / 4);
                                // else
                                //     object.rotation.set(-Math.PI / 3, Math.PI, -Math.PI / 4);
                                // object.position.z = -132.87103807926178;
                                // object.position.x = 0;
                                // object.position.y = 3.9394508004188538;
                                object.position.z = -0;
                                object.position.x = 25;
                                object.position.y = 50;
                                var box = new THREE.Box3().setFromObject(object);
                                var scale = 20 / box.getSize().x;
                                // modelScale = scale;

                                object.scale.set(scale, scale, scale);

                                // var animation = gltf.animations[0];
                                // if (animation) {
                                //     var mixer = new THREE.AnimationMixer(object);
                                //     mixers.push(mixer);
                                //     var action = mixer.clipAction(animation);
                                //     action.play();
                                // }
                                object.name = 'box';
                                // arScene.scene.add(object);
                                markerRoot.add(object);
                            }, function(xhr) {

                                console.log((xhr.loaded / (xhr.total + xhr.loaded) * 100 * 2) + '% loaded');

                            }, function(error) {
                                console.error(error);
                            });




                            var modelLink = modelUri ? modelUri : '/resources/models/fairy-archer/scene.gltf';
                            /**
                             * OnSuccess load, edit, get animation of model and add to marker root
                             * 
                             * @param {String} modelLink - link to model. if modelUri is not define, the default will be fairy-archer model
                             */
                            loader.load(modelLink, function(gltf) {
                                setTimeout(function() {
                                    // gltf.scene.rotation.x = 0.5 * Math.PI;
                                    // var object = gltf.scene;
                                    // object.position.z = -0;
                                    // object.position.x = 25;
                                    // object.position.y = 50;

                                    /**
                                     * Create rotation and position default for mobile object. It is same with the box
                                     */
                                    var object = gltf.scene;
                                    var box = new THREE.Box3().setFromObject(object);
                                    var scale = 18 / box.getSize().x;
                                    modelScale = scale;

                                    // if (arController.orientation === 'portrait')
                                    //     object.rotation.set(Math.PI, -Math.PI / 3, -Math.PI / 4);
                                    // else
                                    //     object.rotation.set(-Math.PI / 3, Math.PI, -Math.PI / 4);
                                    // object.position.z = -132.87103807926178;
                                    // object.position.x = 0;
                                    // object.position.y = 3.9394508004188538;
                                    object.position.z = -0;
                                    object.position.x = 25;
                                    object.position.y = 32;

                                    object.scale.set(scale, scale, scale);
                                    // object.scale.set(0.5, 0.5, 0.5);
                                    // gltf.mixer = new THREE.AnimationMixer(gltf.scene);
                                    // gltf.mixer.clipAction(gltf.animations[0]).play();

                                    object.traverse((node) => {
                                        if (node.isMesh) node.material.envMap = sphereCamera.renderTarget.texture;
                                    });

                                    var animation = gltf.animations[0];
                                    if (animation) {
                                        var mixer = new THREE.AnimationMixer(object);
                                        mixers.push(mixer);
                                        var action = mixer.clipAction(animation);
                                        action.play();
                                    }

                                    markerRoot.matrixAutoUpdate = false;

                                    // if (markerRoot.children.length >= 1)
                                    //     for (var i = 0; i < markerRoot.children.length; i++)
                                    //         markerRoot.remove(markerRoot.children[i]);

                                    // add model to marker root

                                    object.name = 'mobile';
                                    markerRoot.add(object);

                                    objectRoot = object;

                                    directionalLight.target = object;


                                    // root.add(objectRoot);

                                }, 0)
                                window['arScene'] = arScene;

                                divLoading.style.display = "none";
                                arScene.setContext(hint_Content)

                            }, function(xhr) {

                                console.log((xhr.loaded / (xhr.total + xhr.loaded) * 100 * 2) + '% loaded');

                            }, function(error) {
                                console.error(error);
                            });
                            clearInterval(intervalLoad);
                        }
                    }, 2000)
                });

                //////////// EXTEND FUNCTION ////////////
                /**
                 * They are some function for add new, remove and replace the current model
                 */
                window['add'] = function add() {
                    root.add(objectRoot);
                }
                window['remove'] = function remove() {
                    if (root) {
                        if (root.children[0]) {
                            root.remove(root.children[0]);
                        }

                    }
                }
                window['replace'] = function replace(url) {
                        if (root) {
                            if (root.children[0]) {
                                root.remove(root.children[0]);
                                mixers = [];
                            }

                        }
                        var loader = new THREE.GLTFLoader();
                        loader.load(url, function(gltf) {
                            setTimeout(function() {
                                gltf.scene.rotation.x = 0.5 * Math.PI;
                                var object = gltf.scene;
                                object.position.z = -0;
                                object.position.x = 25;
                                object.position.y = 50;
                                var box = new THREE.Box3().setFromObject(object);
                                var scale = 50 / box.getSize().x;
                                object.scale.set(scale, scale, scale);

                                var animation = gltf.animations[0];
                                if (animation) {
                                    var mixer = new THREE.AnimationMixer(object);
                                    mixers.push(mixer);
                                    var action = mixer.clipAction(animation);
                                    action.play();
                                }

                                root.add(object);

                                objectRoot = object;

                            }, 0)

                        }, function(xhr) {

                            console.log((xhr.loaded / (xhr.total + xhr.loaded) * 100 * 2) + '% loaded');

                        }, function(error) {
                            console.error(error);
                        });
                    }
                    ////////////////////////////////////////////////////////////////////

                ///////////////// Loop /////////////////
                /**
                 * Check if have any loop (maybe because change webpage or reload file main.js)
                 * cancel it before run new loop
                 */
                if (window.id)
                    window.cancelAnimationFrame(window.id);
                /**
                 * The main loop for process, render, get position for raycast and run animation, ...
                 */
                var tick = function() {
                    var loopID = requestAnimationFrame(tick);
                    window['id'] = loopID;
                    arScene.renderOn(renderer);
                    arScene.process();
                    pickHelper.pick(pickPosition);
                    if (mixers.length > 0) {
                        for (var i = 0; i < mixers.length; i++) {
                            mixers[i].update(clock.getDelta());
                        }
                    }
                    pointLight.position.x = 250 * Math.sin(Date.now() / 1000);
                    pointLight.position.y = 250 * Math.cos(Date.now() / 1000);

                    // sphereCamera.updateCubeMap(renderer, arScene.scene);

                };

                tick();
                //////////////////////////////////

            }
        });

        delete window.ARThreeOnLoad;

    };

    if (window.ARController && ARController.getUserMediaThreeScene) {
        ARThreeOnLoad();
    }
}

/**
 * Change model load with URI
 */

// initAR('https://raw.githubusercontent.com/huynhthanhnhan/MyImage/master/Model/popipo_miku_remix/scene.gltf')
// initAR();
// initAR('/resources/models/all/scene.gltf')
// initAR('/resources/models/fairy-archer/untitled.gltf')
initAR('/resources/models/samsung/scene.gltf')

////////////////////////////////////////