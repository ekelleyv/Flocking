//Based on http://www.kfish.org/boids/pseudocode.html

var Flock = function(scene, octree, flock_size) {
	this.flock_size = flock_size;
	this.scene = scene;
	this.octree = octree;
	this.center;
	this.avg_vel;
	this.birds = this.init_flock();
	this.update_center();
	
}

Flock.prototype.init_flock = function() {
	var birds = [];
	for (var i = 0; i < this.flock_size; i++) {
		var position = new THREE.Vector3((Math.random()-.5)*10, 0, (Math.random()-.5)*10);
		var orientation = new THREE.Vector3(0, Math.random()*2*Math.PI, 0);
		var bird = new Bird(position, orientation);
		birds.push(bird);
		this.scene.add(bird.mesh);
		this.scene.add(bird.line);
		this.scene.add(bird.sphere);
	}
	return birds;
};

Flock.prototype.update = function(elapsed_time) {
	this.update_center();
	for (var i = 0; i < this.flock_size; i++) {
		var bird = this.birds[i];
		var v1, v2, v3;

		v1 = this.cohesion(i);
		v2 = this.separation(i);
		v3 = this.alignment(i);

		bird.apply_force(v1);
		bird.apply_force(v2);
		bird.apply_force(v3);

		bird.update(elapsed_time, this.center);
	}
};

Flock.prototype.update_center = function() {
	var center = new THREE.Vector3(0, 0, 0);
	var avg_vel = new THREE.Vector3(0, 0, 0);

	for (var i = 0; i < this.flock_size; i++) {
		var current_bird = this.birds[i];
		center = center.add(current_bird.mesh.position);
		avg_vel = avg_vel.add(current_bird.velocity);
	}
	center = center.divideScalar(this.flock_size);
	avg_vel = avg_vel.divideScalar(this.flock_size);

	this.center = center;
	this.avg_vel = avg_vel;
};

Flock.prototype.cohesion = function(bird_index) {
	var other_birds = this.flock_size - 1;
	var center = new THREE.Vector3(0, 0, 0);
	var bird = this.birds[bird_index];

	for (var i = 0; i < this.flock_size; i++) {
		if (i == bird_index) continue;
		var current_bird = this.birds[i];
		center = center.add(current_bird.mesh.position);
	}

	center = center.divideScalar(other_birds);

	var v1 = center.sub(bird.mesh.position);
	v1.divideScalar(100);

	return v1;
};

Flock.prototype.separation = function(bird_index) {
	var bird = this.birds[bird_index];
	var v2 = new THREE.Vector3(0, 0, 0);

	for (var i = 0; i < this.flock_size; i++) {
		if (i == bird_index) continue;

		var current_bird = this.birds[i];

		var dist = bird.mesh.position.distanceTo(current_bird.mesh.position);

		if (dist < 3) {
			var offset = new THREE.Vector3(0, 0, 0);
			offset.subVectors(current_bird.mesh.position, bird.mesh.position);
			v2 = v2.sub(offset);
		}
	}
	return v2;
};

Flock.prototype.alignment = function(bird_index) {
	var bird = this.birds[bird_index];
	var v3 = new THREE.Vector3(0, 0, 0);

	for (var i = 0; i < this.flock_size; i++) {
		if (i == bird_index) continue;

		var current_bird = this.birds[i];
		v3 = v3.add(current_bird.velocity);
	}

	v3 = v3.divideScalar(this.flock_size-1);

	v3 = v3.sub(bird.velocity);

	return v3.divideScalar(8);
};

