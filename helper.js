function shrinkHexagon(corners, size) {
	var hexagonCenterX =
		corners.reduce(function (sum, vertex) {
			return sum + vertex.x;
		}, 0) / corners.length;

	var hexagonCenterY =
		corners.reduce(function (sum, vertex) {
			return sum + vertex.y;
		}, 0) / corners.length;

	return corners.map((vertex) => {
		var dx = vertex.x - hexagonCenterX; // Calculate the difference in X from the center
		var dy = vertex.y - hexagonCenterY; // Calculate the difference in Y from the center
		var length = Math.sqrt(dx * dx + dy * dy); // Calculate the distance from the center
		var scale = (length - size) / length; // 2 pixels smaller on all sides
		var newX = hexagonCenterX + dx * scale;
		var newY = hexagonCenterY + dy * scale;
		return new Phaser.Math.Vector2(newX, newY);
	});
}

function blendColors(color1Hex, color2Hex) {
	const blendedColor = new Phaser.Display.Color();
	// const color1 = new Phaser.Display.Color();
	// const color2 = new Phaser.Display.Color();
	let color1 = Phaser.Display.Color.IntegerToColor(color1Hex);
	let color2 = Phaser.Display.Color.IntegerToColor(color2Hex);

	blendedColor.red = (color1.red + color2.red) / 2;
	blendedColor.green = (color1.green + color2.green) / 2;
	blendedColor.blue = (color1.blue + color2.blue) / 2;

	const blendedInt = Phaser.Display.Color.GetColor(
		blendedColor.red,
		blendedColor.green,
		blendedColor.blue
	);
	return blendedInt;
}

export { blendColors, shrinkHexagon };
