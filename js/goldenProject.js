// Get window dimension
var ww = document.documentElement.clientWidth || document.body.clientWidth;
var wh = window.innerHeight;
var isMobile = ww < 500;

// Save half window dimension
var ww2 = ww * 0.5, wh2 = wh * 0.5;


// Constructor function
function Tunnel() {
  // Init the scene and the
  this.init();
  // Create the shape of the tunnel
  this.createMesh();

  // Mouse events & window resize
  this.handleEvents();

  // Start loop animation
  window.requestAnimationFrame(this.render.bind(this));
}



Tunnel.prototype.init = function() {
  // Define the speed of the tunnel
  this.speed = 0.02;

  // Store the position of the mouse
  // Default is center of the screen
  this.mouse = {
    position: new THREE.Vector2(0, 0),
    target: new THREE.Vector2(0, 0)
  };

  // Create a WebGL renderer
  this.renderer = new THREE.WebGLRenderer({
    antialias: true,
    canvas: document.querySelector("#scene")
  });
  // Set size of the renderer and its background color
  this.renderer.setSize(ww, wh);
  this.renderer.setClearColor(0x222222);

  // Create a camera and move it along Z axis
  this.camera = new THREE.PerspectiveCamera(15, ww / wh, 0.01, 1000);
  this.camera.position.z = 0.35;
  // this.camera.position.y = -3; // To see the actual shape of tunnel

  // Create an empty scene and define a fog for it
  this.scene = new THREE.Scene();
  this.scene.fog = new THREE.Fog(0x222222, 0.6, 2.8);

  this.addPC();  

  // Add obstacle
  this.addParticle();


};


Tunnel.prototype.addPC = function() {
  // this.PC = 
  // var geometry = new THREE.BoxGeometry(0.1,0.1,2);
  // var material = new THREE.MeshStandardMaterial({color: 0xff0000});
  // this.PC = new THREE.Mesh(geometry, material);
  // this.PC.position.set(0,0,1.5);
  // this.scene.add(this.PC);

  this.PC = new Particle(this.scene, false, 0 , true);
};


Tunnel.prototype.addParticle = function() {
    this.particles = [];
    for(var i = 0; i < (isMobile?4:10); i++){
      this.particles.push(new Particle(this.scene, false, 0 , false));
    }
    this.particles.push(this.PC)
};


Tunnel.prototype.createMesh = function() {
  // Empty array to store the points along the path
  var points = [];

  // Define points along Z axis to create a curve
  for (var i = 0; i < 5; i += 1) {
    points.push(new THREE.Vector3(0, 0, 2.5 * (i / 4)));
  }
  // Set custom Y position for the last point
  points[4].y = -0.06;

  /**To End game
   * points[4].y = 0; // downward curd is straightened up
   */
  
  // Create a curve based on the points
  this.curve = new THREE.CatmullRomCurve3(points);
  // Define the curve type

  // Empty geometry
  var geometry = new THREE.Geometry();
  // Create vertices based on the curve
  geometry.vertices = this.curve.getPoints(70);
  // Create a line from the points with a basic line material
  this.splineMesh = new THREE.Line(geometry, new THREE.LineBasicMaterial());

  // Create a material for the tunnel with a custom texture
  // Set side to BackSide since the camera is inside the tunnel
  this.tubeMaterial = new THREE.MeshStandardMaterial({
    side: THREE.BackSide,
    map: textures.stone.texture,
    bumpMap: textures.stoneBump.texture,
    bumpScale: 0.0003
  });
  
  // Add two lights in the scene
  // An hemisphere light, to add different light from sky and ground
  var light = new THREE.HemisphereLight( 0xffffbb, 0x887979, 0.9);
this.scene.add( light );
  // Add a directional light for the bump
  var directionalLight = new THREE.DirectionalLight( 0xffffff, 0.8 );
this.scene.add( directionalLight );
  // Repeat the pattern
  this.tubeMaterial.map.wrapS = THREE.RepeatWrapping;
  this.tubeMaterial.map.wrapT = THREE.RepeatWrapping;
  this.tubeMaterial.map.repeat.set(30, 6);
  this.tubeMaterial.bumpMap.wrapS = THREE.RepeatWrapping;
  this.tubeMaterial.bumpMap.wrapT = THREE.RepeatWrapping;
  this.tubeMaterial.bumpMap.repeat.set(30, 6);

  // Create a tube geometry based on the curve
  this.tubeGeometry = new THREE.TubeGeometry(this.curve, 70, 0.02, 50, false);
  // Create a mesh based on the tube geometry and its material
  this.tubeMesh = new THREE.Mesh(this.tubeGeometry, this.tubeMaterial);
  // Push the tube into the scene
  this.scene.add(this.tubeMesh);

  // Clone the original tube geometry
  // Because we will modify the visible one but we need to keep track of the original position of the vertices
  this.tubeGeometry_o = this.tubeGeometry.clone();
};



Tunnel.prototype.handleEvents = function() {
  // When user resize window
  window.addEventListener("resize", this.onResize.bind(this), false);
  // When user move the mouse
//   document.body.addEventListener(
//     "mousemove",
//     this.onMouseMove.bind(this),
//     false
//   );

    document.body.addEventListener("keydown", (event)=> {
        console.log(event);
       
        if (event.key == "ArrowUp") {
            this.updateMaterialOffset(0.05,0)
        }

        if (event.key == "ArrowDown") {
            this.updateMaterialOffset(-0.05,0)
        }
        if (event.key == "ArrowLeft") {
            this.updateMaterialOffset(0,-0.02)
        }
        if (event.key == "ArrowRight") {
            this.updateMaterialOffset(0,0.02)
        }

    })
};



Tunnel.prototype.onResize = function() {
  // On resize, get new width & height of window
  ww = document.documentElement.clientWidth || document.body.clientWidth;
  wh = window.innerHeight;
  ww2 = ww * 0.5;
  wh2 = wh * 0.5;

  // Update camera aspect
  this.camera.aspect = ww / wh;
  // Reset aspect of the camera
  this.camera.updateProjectionMatrix();
  // Update size of the canvas
  this.renderer.setSize(ww, wh);
};

// Tunnel.prototype.onMouseMove = function(e) {
//   // Save mouse X & Y position
//   this.mouse.target.x = (e.clientX - ww2) / ww2;
//   this.mouse.target.y = (wh2 - e.clientY) / wh2;
// };



Tunnel.prototype.updateCameraPosition = function() {
  // Update the mouse position with some lerp
  this.mouse.position.x += (this.mouse.target.x - this.mouse.position.x) / 30;
  this.mouse.position.y += (this.mouse.target.y - this.mouse.position.y) / 30;

  // Rotate Z & Y axis
  this.camera.rotation.z = this.mouse.position.x * 0.2;
  this.camera.rotation.y = Math.PI - this.mouse.position.x * 0.06;
  // Move a bit the camera horizontally & vertically
  this.camera.position.x = this.mouse.position.x * 0.015;
  this.camera.position.y = -this.mouse.position.y * 0.015;
};




/**Method to move tunnel to make it look like PC is moving */

Tunnel.prototype.updateMaterialOffset = function(x1, y1) {
  // Update the offset of the material
//   this.tubeMaterial.map.offset.x += this.speed;

  this.tubeMaterial.map.offset.x += x1;
  this.tubeMaterial.map.offset.y += y1;
};



Tunnel.prototype.updateCurve = function() {
  var index = 0, vertice_o = null, vertice = null;
  // For each vertice of the tube, move it a bit based on the spline
  for (var i = 0, j = this.tubeGeometry.vertices.length; i < j; i += 1) {
    // Get the original tube vertice
    vertice_o = this.tubeGeometry_o.vertices[i];
    // Get the visible tube vertice
    vertice = this.tubeGeometry.vertices[i];
    // Calculate index of the vertice based on the Z axis
    // The tube is made of 50 rings of vertices
    index = Math.floor(i / 50);
    // Update tube vertice
    vertice.x +=
      (vertice_o.x + this.splineMesh.geometry.vertices[index].x - vertice.x) /
      10;
    vertice.y +=
      (vertice_o.y + this.splineMesh.geometry.vertices[index].y - vertice.y) /
      5;
  }
  // Warn ThreeJs that the points have changed
  this.tubeGeometry.verticesNeedUpdate = true;

  // Update the points along the curve base on mouse position
  this.curve.points[2].x = -this.mouse.position.x * 0.1;
  this.curve.points[4].x = -this.mouse.position.x * 0.1;
  this.curve.points[2].y = this.mouse.position.y * 0.1;

  // Warn ThreeJs that the spline has changed
  this.splineMesh.geometry.verticesNeedUpdate = true;
  this.splineMesh.geometry.vertices = this.curve.getPoints(70);
};




Tunnel.prototype.render = function() {
  // Update material offset
//   this.updateMaterialOffset();

  // Update camera position & rotation
  this.updateCameraPosition();

  // Update the tunnel
  this.updateCurve();

 

  // Update the particles
  var isPC = false;
  for(var i = 0; i < this.particles.length; i++){
    isPC = (i=== 10) ? true : false;
    this.particles[i].update(this, isPC);
    if(this.particles[i].burst && this.particles[i].percent > 1){
      this.particles.splice(i, 1);
      i--;
    }
  }


  // render the scene
  this.renderer.render(this.scene, this.camera);

  // Animation loop
  window.requestAnimationFrame(this.render.bind(this));
};



function Particle(scene, burst, time, isPC = false) {
    var radius = Math.random()*0.002 + 0.0003;
    var geom = this.icosahedron;
    var random = Math.random();
    // if(random > 0.9){
    //   geom = this.cube;
    // } else if(random > 0.8){
    //   geom = this.sphere;
    // }

    

    var range = 50;
    if(burst){
      this.color = new THREE.Color("hsl("+(time / 50)+",100%,60%)");
    } else {
      var offset = 180;
      this.color = new THREE.Color("hsl("+(Math.random()*range+offset)+",100%,80%)");
    }

    if (isPC) {
      geom = this.cube;
      this.color = new THREE.Color("hsl(0, 50%, 50%)"); // red colour
    }

    var mat = new THREE.MeshPhongMaterial({
      color: this.color,
      shading:THREE.FlatShading
    });
    this.mesh = new THREE.Mesh(geom, mat);
    this.mesh.scale.set(radius, radius, radius);
    // if (isPC) {
    //   this.mesh.position.set(0,0,0.5);
    // } else 
      this.mesh.position.set(0,0,1.5);
    this.percent = burst ? 0.2 : Math.random();
    this.burst = burst ? true : false;
    this.offset = new THREE.Vector3((Math.random()-0.5)*0.025, (Math.random()-0.5)*0.025, 0);
    this.speed = Math.random()*0.004 + 0.0002;
    if (this.burst){
      this.speed += 0.003;
      this.mesh.scale.x *= 1.4;
      this.mesh.scale.y *= 1.4;
      this.mesh.scale.z *= 1.4;
    }
    this.rotate = new THREE.Vector3(-Math.random()*0.1+0.01,0,Math.random()*0.01);
    
    this.pos = new THREE.Vector3(0,0,0);


    // if (isPC) {
    //   this.speed = 0;
    // }

   


    scene.add(this.mesh);
  }
  
  Particle.prototype.cube = new THREE.BoxBufferGeometry(1, 1, 1);
  Particle.prototype.sphere = new THREE.SphereBufferGeometry(1, 6, 6 );
  Particle.prototype.icosahedron = new THREE.IcosahedronBufferGeometry(1,0);

  Particle.prototype.update = function (tunnel, isPC) {
    
    this.percent += this.speed * (this.burst?2:1);
    if (isPC) {
      this.pos = tunnel.curve.getPoint(1 - (0.75));
      this.pos.z = 0.4
    } else 
      this.pos = tunnel.curve.getPoint(1 - (this.percent%1)) .add(this.offset);
      /**
       * this.offset -> changes particles from center ; remove offset and particles remain at center of screen
       * this.percent gives movement towards camera; give 0.75 instead of this.percent%1 to have static particles
       */

      // this.pos = tunnel.curve.getPoint(1 - 0.75) .add(this.offset);
    this.mesh.position.x = this.pos.x;
    this.mesh.position.y = this.pos.y;
    this.mesh.position.z = this.pos.z;
    this.mesh.rotation.x += this.rotate.x;
    this.mesh.rotation.y += this.rotate.y;
    this.mesh.rotation.z += this.rotate.z;
  };



// All needed textures
var textures = {
  "stone": {
    url: "img/demo1/stonePattern.jpg"
  },
  "stoneBump": {
    url: "img/demo1/stonePatternBump.jpg"
  }
};

// Create a new loader
var loader = new THREE.TextureLoader();
// Prevent crossorigin issue
loader.crossOrigin = "Anonymous";
// Load all textures
for (var name in textures) {
  (function(name) {
  loader.load(textures[name].url, function(texture) {
    textures[name].texture = texture;
    checkTextures();
  });
})(name)
}

var texturesLoaded = 0;

function checkTextures() {
  texturesLoaded++;
  if (texturesLoaded === Object.keys(textures).length) {
    document.body.classList.remove("loading");
    // When all textures are loaded, init the scene
    window.tunnel = new Tunnel();
  }
}
