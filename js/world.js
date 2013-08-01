'use strict';

var World = function() {};

World.prototype.init = function() {

	this.renderer = this.init_renderer();

	this.render_stats;
	this.init_stats();

	this.scene = this.init_scene();

	this.camera = this.init_camera();
	this.camera_rotation = Math.PI/180*90;
	this.camera.position = new THREE.Vector3(0, 20, -30);
	this.camera_radius = 50;

	this.lights = this.init_lights();

	this.keyboard = new THREEx.KeyboardState();

	this.controls = new THREE.TrackballControls( this.camera, this.renderer.domElement );
	this.controls.rotateSpeed = 1.0;
	this.controls.zoomSpeed = .6;
	this.controls.panSpeed = 2;
	this.controls.noZoom = false;
	this.controls.noPan = false;
	this.controls.staticMoving = false;
	this.controls.dynamicDampingFactor = 0.3;
	this.controls.target = new THREE.Vector3(0, 0, 0);




	this.octree = new THREE.Octree({
	    radius: 1, // optional, default = 1, octree will grow and shrink as needed
	    depthMax: -1, // optional, default = -1, infinite depth
	    objectsThreshold: 8, // optional, default = 8
	    overlapPct: 0.15, // optional, default = 0.15 (15%), this helps sort objects that overlap nodes
	    scene: null// optional, pass scene as parameter only if you wish to visualize octree
	} );

	this.obstacles;

	this.flock = new Flock(this.scene, this.octree, this.obstacles, 100);

	this.last_time = new Date();

	this.elapsed_time = 0;

	this.ground = new THREE.Mesh(new THREE.PlaneGeometry(50, 50, 50, 50), new THREE.MeshLambertMaterial({color: 0x0000DD, wireframe: true}));
	this.ground.rotation.set(-90*Math.PI/180, 0, 0);
	this.ground.position.set(0, -10, 0);
	this.scene.add(this.ground);

	console.log(this.octree);

	//DAT GUI VARIABLES
	this.gui = new dat.GUI();

	this.draw_octree = function() {
		this.octree.scene = this.scene;
	}
	var octree_control = this.gui.add(this, 'draw_octree');

	this.separation = 1;
	this.cohesion = 1;
	this.alignment = 1;
	this.min_velocity = 6;
	this.max_velocity = 10;
	this.bound_strength = 1;
	this.max_climb = 1;

	console.log(this.gui.addFolder);	

	this.bc = this.gui.addFolder("Bird Controls");
	this.separation_control = this.bc.add(this, "separation", 0, 3);
	this.cohesion_control = this.bc.add(this, "cohesion", 0, 3);
	this.alignment_control = this.bc.add(this, "alignment", 0, 3);
	this.min_velocity_control = this.bc.add(this, "min_velocity", 0, 7);
	this.max_velocity_control = this.bc.add(this, "max_velocity", 8, 15);
	this.bound_strength_control = this.bc.add(this, "bound_strength", 0, 3);
	this.max_climb_control = this.bc.add(this, "max_climb", 0, 3);
	this.bc.open();
	var self = this;

	this.separation_control.onFinishChange(function(value) {
		self.flock.change_separation(value);
	});
	this.cohesion_control.onFinishChange(function(value) {
		self.flock.change_cohesion(value);
	});
	this.alignment_control.onFinishChange(function(value) {
		self.flock.change_alignment(value);
	});
	this.min_velocity_control.onFinishChange(function(value) {
		self.flock.change_min_velocity(value);
	});
	this.max_velocity_control.onFinishChange(function(value) {
		self.flock.change_max_velocity(value);
	});
	this.bound_strength_control.onFinishChange(function(value) {
		self.flock.change_bound_strength(value);
	});
	this.max_climb_control.onFinishChange(function(value) {
		self.flock.change_max_climb(value);
	});


	requestAnimationFrame(this.render.bind(this));

	window.addEventListener( 'resize', this.onWindowResize.bind(this), false );
};

World.prototype.init_renderer = function() {
	var renderer =  new THREE.WebGLRenderer({ antialias: true });
	renderer.setSize( window.innerWidth, window.innerHeight );
	renderer.shadowMapEnabled = true;
	renderer.shadowMapSoft = true;
	renderer.setClearColorHex( 0xEEEEEE, 1 );
	renderer.domElement.id = "world";
	renderer.domElement.style.position = "absolute";
	renderer.domElement.style.zIndex   = 0;
	document.body.appendChild(renderer.domElement);
	return renderer;
};

World.prototype.onWindowResize = function() {
	this.camera.aspect = window.innerWidth / window.innerHeight;
	this.camera.updateProjectionMatrix();

	this.renderer.setSize( window.innerWidth, window.innerHeight );
};

World.prototype.init_stats = function() {
	this.render_stats = new Stats();
	this.render_stats.domElement.style.position = 'absolute';
	this.render_stats.domElement.style.top = '1px';
	this.render_stats.domElement.style.zIndex = 100;

	this.render_stats.domElement.hidden = false;
	document.body.appendChild(this.render_stats.domElement);
};

World.prototype.update_time = function() {
	var now = new Date();
	this.elapsed_time = now - this.last_time;
	this.last_time = now;
};

World.prototype.init_scene = function() {
	var scene = new THREE.Scene({ fixedTimeStep: 1 / 120 });
	scene.fog = new THREE.FogExp2( 0xcccccc, 0.005 );
	return scene;
};

World.prototype.init_camera = function() {
	var WIDTH = window.innerWidth,
	    HEIGHT = window.innerHeight;

	var VIEW_ANGLE = 45,
	    ASPECT = WIDTH / HEIGHT,
	    NEAR = 0.1,
	    FAR = 10000;
	var camera = new THREE.PerspectiveCamera(  VIEW_ANGLE,
                                ASPECT,
                                NEAR,
                                FAR  );
	camera.position.set( 0, 50, 0);
	camera.lookAt(new THREE.Vector3(0, 0, 0) );
	camera.h_rotation = 0;

	this.scene.add(camera);

	return camera;
}

World.prototype.init_lights = function() {
	var lights = [];
	// Light
	var d_light = new THREE.DirectionalLight( 0xFFFFFF );
	d_light.position.set( 300, 200, 300 );
	d_light.intensity = .7;
	d_light.target.position.set(0, 0, 0);
	d_light.castShadow = true;
	d_light.shadowBias = -.0001
	d_light.shadowMapWidth = d_light.shadowMapHeight = 2048;
	d_light.shadowDarkness = .7;
	
	lights.push(d_light);

	var s_light = new THREE.SpotLight( 0xFFFFFF);
	s_light.position.set( 0, 400, 200 );
	s_light.target.position.copy( this.scene.position );
	s_light.castShadow = true;
	s_light.intensity = .8;
	s_light.shadowDarkness = .7;

	lights.push(s_light);

	for (var i = 0; i < lights.length; i++) {
		this.scene.add(lights[i]);
	}

	return lights;
};

World.prototype.handle_keys = function() {
	if (this.keyboard.pressed("1")) {
		this.render_stats.domElement.hidden = false;
	}
	if (this.keyboard.pressed("a")) {
		this.camera_rotation += .05;
	}
	if (this.keyboard.pressed("d")) {
		this.camera_rotation -= .05;
	}
	if (this.keyboard.pressed("w")) {
		this.camera_radius -= .5;
	}
	if (this.keyboard.pressed("s")) {
		this.camera_radius += .5;
	}

};

World.prototype.update_camera = function() {
	
	// this.camera.position.x = this.camera_radius*Math.cos(Math.PI/8);
	// this.camera.position.y = this.camera_radius*Math.sin(Math.PI/8);
	// this.camera.position.z = this.flock.center.z;

	// this.camera.position.x = this.flock.center.x;
	// this.camera.position.z = this.flock.center.z;
	this.camera.lookAt(new THREE.Vector3(0, 0, 0));
};


World.prototype.render = function() {
	this.update_time();
	this.handle_keys();
	this.controls.update();
	this.update_camera();
	this.flock.update(this.elapsed_time);	
	this.renderer.render( this.scene, this.camera );
	this.render_stats.update();
	requestAnimationFrame( this.render.bind(this) );
};


var world = new World();
window.addEventListener("load", world.init.bind(world));