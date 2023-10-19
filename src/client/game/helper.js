import Phaser from "phaser";

function shrinkHexagon(corners, size) {
	const hexagonCenterX =
		corners.reduce(function (sum, vertex) {
			return sum + vertex.x;
		}, 0) / corners.length;

	const hexagonCenterY =
		corners.reduce(function (sum, vertex) {
			return sum + vertex.y;
		}, 0) / corners.length;

	return corners.map((vertex) => {
		const dx = vertex.x - hexagonCenterX; // Calculate the difference in X from the center
		const dy = vertex.y - hexagonCenterY; // Calculate the difference in Y from the center
		const length = Math.sqrt(dx * dx + dy * dy); // Calculate the distance from the center
		const scale = (length - size) / length; // 2 pixels smaller on all sides
		const newX = hexagonCenterX + dx * scale;
		const newY = hexagonCenterY + dy * scale;
		return new Phaser.Math.Vector2(newX, newY);
	});
}

function blendColors(color1Hex, color2Hex) {
	const blendedColor = new Phaser.Display.Color();
	// const color1 = new Phaser.Display.Color();
	// const color2 = new Phaser.Display.Color();
	const color1 = Phaser.Display.Color.IntegerToColor(color1Hex);
	const color2 = Phaser.Display.Color.IntegerToColor(color2Hex);

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
