var Bird = function(position, orientation) {
	this.line;
	this.mesh; 
	this.init_mesh(position, orientation);
	this.velocity = new THREE.Vector3(10, 0, 0);
}

Bird.prototype.init_mesh = function(position, orientation) {
	var geometry = new THREE.CylinderGeometry(.1, .4, 1, 10, 2);
	var material = new THREE.MeshLambertMaterial({color: this.get_random_color()});
	var mesh = new THREE.Mesh(geometry, material);


	var rot_mat = new THREE.Matrix4();
	rot_mat.setRotationFromEuler(new THREE.Vector3(0, 0, -Math.PI/2));//rotate on X 90 degrees
	geometry.applyMatrix(rot_mat);
	// mesh.rotation.x = -90*(Math.PI/180);
	mesh.position = position;
	mesh.rotation = orientation;
	this.mesh = mesh;

	var line_material = new THREE.LineBasicMaterial({
        color: 0xff0000
    });

    var line_geometry = new THREE.Geometry();
    line_geometry.dynamic = true;
    line_geometry.vertices.push(new THREE.Vector3(0, 0, 0));
    line_geometry.vertices.push(new THREE.Vector3(0, 0, 0));

    this.line = new THREE.Line(line_geometry, line_material);

};

Bird.prototype.update = function(elapsed_time, v, lookAt) {
	var world_velocity = 
	this.velocity.add(v);

	var displacement = new THREE.Vector3();
	displacement.copy(this.velocity);
	displacement.multiplyScalar(elapsed_time/1000);

	this.mesh.position.add(displacement);
	// this.mesh.lookAt(lookAt);

	this.line.geometry.vertices[0] = this.mesh.position;

	this.line.geometry.vertices[1] = lookAt;


	this.line.geometry.verticesNeedUpdate = true;

};

Bird.prototype.get_random_color = function () {
    var letters = '0123456789ABCDEF'.split('');
    var color = '#';
    for (var i = 0; i < 6; i++ ) {
        color += letters[Math.round(Math.random() * 15)];
    }
    return color;
}