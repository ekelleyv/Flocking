var Bird = function(position, orientation) {
	this.line;
	this.sphere;
	this.mesh;
	this.init_mesh(position, orientation);
	this.acceleration = new THREE.Vector3(0, 0, 0);
	this.max_force = .03;
	this.max_speed = .05;
	this.velocity = new THREE.Vector3(this.max_speed*Math.cos(this.mesh.rotation.y), 0, this.max_speed*Math.sin(this.mesh.rotation.y));
}

Bird.prototype.init_mesh = function(position, orientation) {
	var geometry = new THREE.CylinderGeometry(.1, .4, 1, 10, 2);
	var material = new THREE.MeshLambertMaterial({color: this.get_random_color()});
	var mesh = new THREE.Mesh(geometry, material);


	var rot_mat = new THREE.Matrix4();
	rot_mat.setRotationFromEuler(new THREE.Vector3(0, 0, -Math.PI/2));//rotate on X 90 degrees
	geometry.applyMatrix(rot_mat);

	mesh.position = position;
	mesh.rotation = orientation;
	this.mesh = mesh;

	var line_material = new THREE.LineBasicMaterial({
        color: 0x999999
    });

    var line_geometry = new THREE.Geometry();
    line_geometry.dynamic = true;
    line_geometry.vertices.push(new THREE.Vector3(0, 0, 0));
    line_geometry.vertices.push(new THREE.Vector3(0, 0, 0));

    this.line = new THREE.Line(line_geometry, line_material);

    var sphere_material = new THREE.MeshBasicMaterial({
    	color: 0xaaaaaa,
        wireframe: true
    });

    var sphere_geometry = new THREE.SphereGeometry(3, 8, 8);

    this.sphere = new THREE.Mesh(sphere_geometry, sphere_material);

};

Bird.prototype.update = function(elapsed_time, lookAt) {
	this.velocity.add(this.acceleration);
	this.acceleration.set(0, 0, 0);
	this.velocity = this.velocity.clamp(0, this.max_speed);

	var displacement = new THREE.Vector3();
	displacement.copy(this.velocity);
	displacement.multiplyScalar(elapsed_time/1000);

	this.mesh.position.add(displacement);

	this.mesh.rotation.y = Math.atan2(-this.velocity.z, this.velocity.x);


	//Drawing lines
	this.line.geometry.vertices[0] = this.mesh.position;
	this.line.geometry.vertices[1] = lookAt;
	this.line.geometry.verticesNeedUpdate = true;

	this.sphere.position = this.mesh.position;
	this.sphere.rotation = this.mesh.rotation;

};

Bird.prototype.apply_force = function(force) {
	this.acceleration.add(force);
};

Bird.prototype.get_random_color = function () {
    var letters = '0123456789ABCDEF'.split('');
    var color = '#';
    for (var i = 0; i < 6; i++ ) {
        color += letters[Math.round(Math.random() * 15)];
    }
    return color;
}