var scene;
var camera;
var getPastelColor;
var setActors;
var addStars;
var getTexture;
var setStage;
var animate;
var resize;
var mouseDown;
var mouseMove;
var random;
var rotateRadians;
var render;
var renderer;
var colors = ['#da6b00', '#8555d4', '#4ad3b5', '#ffffff'];
var particleCount = 500;
var initialRadius = 0.1;
var movementSpeed = 0.5;
var directions = [];
var starSystems = [];
var systemCount = 1;
var isPlay = true;
var isRemove = true;

function runPartical() {
    // setActors();
    addStars(getPastelColor(), 0, 0);
    var interval = setInterval(() => {
        // console.log('runpartical')
        systemCount++;
        addStars(getPastelColor(), 0, 0);
        if (systemCount >= 6) {
            clearInterval(interval);
            isPlay = false;
        }
    }, 1000);
}


function setStage(_renderer, _scene, _camera) {
    // renderer = new THREE.WebGLRenderer({
    //     canvas: document.getElementById("canvas"),
    //     antialias: true
    // });
    // scene = new THREE.Scene();
    // renderer.setPixelRatio(window.devicePixelRatio);
    // renderer.autoClear = false;
    // renderer.setSize(window.innerWidth, window.innerHeight);

    // camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 1000);
    // camera.position.z = 50;
    renderer = _renderer;
    scene = _scene;
    camera = _camera;
}

function getTexture(color) {
    var canvas, context, gradient, texture;
    canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1024;
    context = canvas.getContext('2d');
    gradient = context.createRadialGradient(canvas.width / 2, canvas.height / 2, 0, canvas.width / 2, canvas.height / 2, canvas.width / 3);
    gradient.addColorStop(0, 'rgba(255,255,255,1)');
    gradient.addColorStop(0.2, color);
    gradient.addColorStop(0.4, color);
    gradient.addColorStop(1, 'rgba(0,0,0,1)');
    context.fillStyle = gradient;
    context.fillRect(0, 0, canvas.width, canvas.height);
    texture = new THREE.Texture(canvas);
    texture.needsUpdate = true;
    return texture;
}

function addStars(color, x, y) {
    var angle, i, k, radiusSQ, ref, vertex;
    var dirs = [];
    var geometry = new THREE.Geometry();
    var materials = new THREE.PointsMaterial({
        color: color,
        size: 10,
        transparent: true,
        blending: THREE.AdditiveBlending,
        map: getTexture(color),
        depthTest: false
    });
    for (i = k = 0, ref = particleCount;
        (0 <= ref ? k < ref : k > ref); i = 0 <= ref ? ++k : --k) {
        angle = Math.random() * 2 * Math.PI;
        radiusSQ = Math.random() * initialRadius * initialRadius;
        vertex = new THREE.Vector3();
        vertex.x = x;
        vertex.y = y;
        vertex.z = -100;
        dirs.push({
            x: (Math.random() * movementSpeed) - (movementSpeed / 2),
            y: (Math.random() * movementSpeed) - (movementSpeed / 2),
            z: ((Math.random() * movementSpeed) - (movementSpeed / 2))
        });
        geometry.vertices.push(vertex);
    }
    var starSystem = new THREE.Points(geometry, materials);
    starSystem.name = 'point'
    starSystem.sortParticles = true;
    directions.push(dirs);
    starSystems.push(starSystem);
    return scene.add(starSystem);
}

function getPastelColor() {
    var col = new THREE.Color(`hsl(${random(0, 360)}, ${Math.floor(25 + 70 * Math.random())}%, ${Math.floor(10 + 10 * Math.random())}%)`);
    return `#${col.getHexString()}`;
}

// function setActors() {
//     return addStars(this.getPastelColor(), 100, 100);
// }


function animate() {
    if (starSystems[0] && isPlay) {
        var i, j, k, l, particle, ref, ref1;
        for (j = k = 0, ref = systemCount - 1;
            (0 <= ref ? k <= ref : k >= ref); j = 0 <= ref ? ++k : --k) {
            for (i = l = 0, ref1 = particleCount;
                (0 <= ref1 ? l < ref1 : l > ref1); i = 0 <= ref1 ? ++l : --l) {
                particle = starSystems[j].geometry.vertices[i];
                particle.x += directions[j][i].x;
                particle.y += directions[j][i].y;
                particle.z += directions[j][i].z;
            }
            starSystems[j].geometry.verticesNeedUpdate = true;
        }
        // renderer.render(scene, camera);

    } else {
        if (isRemove && !isPlay) {
            var length = scene.children.length;
            for (var i = 0; i < scene.children.length; i++) {
                if (scene.children[i].name == 'point') {
                    scene.remove(scene.children[i]);
                }
            }
            if (scene.children.length == length)
                isRemove = false
        }
    }
}

// function render() {
//     return renderer.render(scene, camera);
// }

function random(min, max) {
    return Math.floor(Math.random() * max) + min;
}