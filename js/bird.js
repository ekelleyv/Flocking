var Bird = function(position, orientation) {
	this.mesh = this.init_mesh(position, orientation);
	this.velocity = new THREE.Vector3(Math.random()/30 + .05, 0, 0);
}

Bird.prototype.init_mesh = function(position, orientation) {
	var geometry = new THREE.CylinderGeometry(.1, .4, 1, 10, 2);
	var material = new THREE.MeshLambertMaterial({color: 0xDDDDDD});
	var mesh = new THREE.Mesh(geometry, material);
	// mesh.rotation.x = -90*(Math.PI/180);
	mesh.position = position;
	mesh.rotation = orientation;
	return mesh;
};

Bird.prototype.update = function(v) {
	this.velocity = this.velocity.add(v);
	this.mesh.position = this.mesh.position.add(this.velocity);

	if (this.mesh.position.length() < 1) {
		console.log("RESET TO ORIGIN");
	}
};

