//Based on http://www.kfish.org/boids/pseudocode.html

var Flock = function(scene, flock_size) {
	this.flock_size = flock_size;
	this.scene = scene;
	this.birds = this.init_flock();
	
}

Flock.prototype.init_flock = function() {
	var birds = [];
	for (var i = 0; i < this.flock_size; i++) {
		var position = new THREE.Vector3((Math.random()-.5)*10-20, Math.random()*5, (Math.random()-.5)*10);
		var orientation = new THREE.Vector3(0, 0, -90*Math.PI/180);
		var bird = new Bird(position, orientation);
		birds.push(bird);
		this.scene.add(bird.mesh);
	}
	return birds;
};

Flock.prototype.update = function() {
	for (var i = 0; i < this.flock_size; i++) {
		var bird = this.birds[i];
		var v1, v2, v3;

		v1 = this.rule1(i);
		v2 = this.rule2(i);
		// v3 = rule3(bird);

		var v = v1;
		bird.update(v);
	}
};



Flock.prototype.rule1 = function(bird_index) {
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
	v1 = v1.divideScalar(10000);

	return v1;
};

Flock.prototype.rule2 = function(bird_index) {
	var bird = this.birds[bird_index];
	var v2 = new THREE.Vector3(0, 0, 0);

	for (var i = 0; i < this.flock_size; i++) {
		if (i == bird_index) continue;

		var current_bird = this.birds[i];

		var dist = bird.mesh.position.distanceTo(current_bird.mesh.position);

		if (dist < .1) {
			var offset = current_bird.mesh.position.sub(bird.mesh.position)
			v2 = v2.sub(offset);
		}
	}
	return v2;
};