import './App.css';
import Navigation from './components/Navigation/Navigation';
import Logo from './components/Logo/Logo';
import Rank from './components/Rank/Rank';
import ImageLinkForm from './components/ImageLinkForm/ImageLinkForm';
import FaceRecognition from './components/FaceRecognition/FaceRecognition';
import Particles from 'react-particles-js';
import Clarifai from 'clarifai';
import { Component } from 'react';

const app = new Clarifai.App({
	apiKey: '922c6f0ec67c49d6878b51c1bd308f19'
});

const particleOptions = {
	number: {
		value: 30,
		density: {
			enable: true,
			value_area: 800
		}
	}
};

class App extends Component {
	constructor() {
		super();
		this.state = {
			input: '',
			imageUrl: '',
			box: {}
		};
	}

	calculateFaceLocation = (data) => {
		const clarifaiFacePosition = data.outputs[0].data.regions[0].region_info.bounding_box;
		const image = document.getElementById('inputImage');
		const width = Number(image.width);
		const height = Number(image.height);
		return {
			leftCol: clarifaiFacePosition.left_col * width,
			topRow: clarifaiFacePosition.top_row * height,
			rightCol: width - clarifaiFacePosition.right_col * width,
			bottomRow: height - clarifaiFacePosition.bottom_row * height
		};
	};

	displayFaceBox = (box) => {
		this.setState({ box });
	};

	onInputChange = (event) => {
		this.setState({ input: event.target.value });
	};

	onButtonSubmit = () => {
		this.setState({
			imageUrl: this.state.input
		});
		app.models
			.predict(Clarifai.CELEBRITY_MODEL, this.state.input)
			.then((response) => {
				this.calculateFaceLocation(response);
				this.calculateCelebrity(response);
				// console.log(response.outputs[0].data.regions[0].region_info.bounding_box);
				// console.log(response.outputs[0].data.regions[0].data.concepts[0].value);
			})
			.catch((err) => {
				console.log(err);
			});
	};

	render() {
		return (
			<div className="App">
				<Particles params={particleOptions} className="particles" />
				<Navigation />
				<Logo />
				<Rank />
				<ImageLinkForm onInputChange={this.onInputChange} onButtonSubmit={this.onButtonSubmit} />
				<FaceRecognition imageUrl={this.state.imageUrl} />
			</div>
		);
	}
}

export default App;
