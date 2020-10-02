export class ImageExporter {
	constructor() {
		this.$generateImage = document.getElementById('GenerateImage');
		this.$formattedTextWrapper = document.getElementById(
			'FormattedTextWrapper'
		);

		const scale = 2;

		this.$generateImage.addEventListener('click', () => {
			domtoimage
				.toBlob(this.$formattedTextWrapper, {
					// These options scale the image to avoid blurry output.
					height: this.$formattedTextWrapper.offsetHeight * scale,
					style: {
						transform: `scale(${scale}) translate(${
							this.$formattedTextWrapper.offsetWidth / 2 / scale
						}px, ${this.$formattedTextWrapper.offsetHeight / 2 / scale}px)`,
					},
					width: this.$formattedTextWrapper.offsetWidth * scale,
				})
				.then(function (blob) {
					window.saveAs(blob, 'my-node.png');
				});
		});
	}
}
