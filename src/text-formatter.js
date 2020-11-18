export class TextFormatter {
	constructor() {
		//this.$refreshOutput = document.getElementById('RefreshOutput');
		this.$sourceText = document.getElementById('SourceText');
		this.$fontFamily = document.getElementById('FontSelector');
		this.$formattedText = document.getElementById('FormattedText');
		this.$measurer = document.getElementById('SizeMeasurer');
		this.$fontSelectors = document.querySelectorAll('.font-selector');

		let defaultState = {
			sourceText: this.$sourceText.value,
			fontFamily: 'bangers', //this.$fontFamily.options[this.$fontFamily.selectedIndex].value,
		};

		this.state = new Proxy(
			typeof defaultState !== 'undefined' ? defaultState : {},
			{
				// This fires whenever anyone changes a property on the state constant.
				set: (state, key, value) => {
					// Take a copy of the old state.
					const oldState = { ...state };

					// Update the state with new values.
					state[key] = value;

					// Fire callbacks for all state subscribers.
					this.subscribers.forEach((callback) => callback(state, oldState));

					return state;
				},
			}
		);

		// Add our functions to a subscriber array.

		this.subscribers = [this.changeSourceText, this.changeFontFamily];

		// Set up event handlers that manipulate the state.

		this.$sourceText.addEventListener('keyup', () => {
			this.state.sourceText = this.$sourceText.value;
		});

		this.$fontSelectors.forEach((item) => {
			item.addEventListener('click', () => {
				this.recipeChanged(this.$sourceText.value, item.dataset.fontClass);

				this.$fontSelectors.forEach((item) => {
					item.classList.remove('selected');
				});

				item.classList.add('selected');
			});
		});

		// A little timeout to wait for fonts to load.
		setTimeout(() => {
			this.recipeChanged(this.$sourceText.value, this.state.fontFamily);
		}, 1000);
	}

	// Subscriber functions

	changeSourceText(state, oldState) {
		if (state.sourceText !== oldState.sourceText) {
			//console.log('SOURCE TEXT CHANGED!');

			this.recipeChanged(state.sourceText, state.fontFamily);
		}
	};

	changeFontFamily(state, oldState) {
		if (state.fontFamily !== oldState.fontFamily) {
			//console.log(`FONT FAMILY CHANGED to ${state.fontFamily}!`);

			this.recipeChanged(state.sourceText, state.fontFamily);
		}
	};

	// Set up functions that abstract away the effects of changes to state.

	recipeChanged(sourceText, fontFamily) {
		this.$formattedText.innerHTML = '';

		var textLines = sourceText.split(/\r?\n/);

		textLines.forEach((line) => {
			var text;
			var paragraph = document.createElement('p');

			// console.log(
			// 	'Measurer offsetWidth BEFORE measuring: ' + this.$measurer.offsetWidth
			// );

			paragraph.classList.add(fontFamily);

			if (line === '') {
				text = document.createElement('br');

				paragraph.classList.add('separator');
			} else {
				text = document.createTextNode(line);

				paragraph.style.fontSize = '10px';
				paragraph.classList.add('line');

				// We add the font family to the measurer as well so it can measure correctly.
				this.$measurer.classList.add(fontFamily);
				this.$measurer.innerHTML = '';

				var maxTries = 0;
				var currentFontSize = '';

				while (
					maxTries <= 10 &&
					this.$measurer.offsetWidth <= this.$formattedText.offsetWidth
				) {
					// This lives inside the loop or it'll never get started.
					this.$measurer.appendChild(text);

					currentFontSize = paragraph.style.fontSize;
					// console.log(currentFontSize);

					var newFontSize =
						parseInt(currentFontSize.replace('px', '')) + 8 + 'px';

					//console.log(`GUESSED font size: ${newFontSize}`);

					this.$measurer.style.fontSize = newFontSize;

					// console.log(
					// 	'Measurer offsetWidth WHEN FONT SIZE CHANGES: ' +
					// 		this.$measurer.offsetWidth +
					// 		' vs ' +
					// 		this.$formattedText.offsetWidth
					// );

					// Check if this size increase results in the thing getting too big.
					if (this.$measurer.offsetWidth > this.$formattedText.offsetWidth) {
						paragraph.style.fontSize = currentFontSize;
					} else {
						paragraph.style.fontSize = newFontSize;
					}

					//console.log(`ACTUAL font size: ${paragraph.style.fontSize}`);

					maxTries += 1;
				}

				// We need to remove the font family class here or it'll mess up future calculations.
				this.$measurer.classList.remove(fontFamily);
			}

			// console.log(
			// 	'Measurer offsetWidth AFTER measuring: ' + this.$measurer.offsetWidth
			// );

			paragraph.appendChild(text);

			this.$formattedText.appendChild(paragraph);
		});
	};
}
