import './App.css';
import Navigation from './components/Navigation/Navigation';
import Logo from './components/Logo/Logo';
import Signin from './components/Signin/Signin';
import Register from './components/Register/Register';
import Rank from './components/Rank/Rank';
import Guess from './components/Guess/Guess.jsx';
import ImageLinkForm from './components/ImageLinkForm/ImageLinkForm';
import FaceRecognition from './components/FaceRecognition/FaceRecognition';
import Particles from 'react-particles-js';
import axios from 'axios';
import { Component } from 'react';

const particleOptions = {
	number: {
		value: 30,
		density: {
			enable: true,
			value_area: 800
		}
	}
};

const initialState = {
	input: '',
	imageUrl: '',
	box: {},
	route: 'signin',
	isSignedIn: false,
	celebrity: '',
	celebrityUrl: '',
	user: {
		id: '',
		name: '',
		email: '',
		password: '',
		entries: 0,
		joined: ''
	}
};

class App extends Component {
	constructor() {
		super();
		this.state = initialState;
	}

	loadUser = (data) => {
		this.setState({
			user: {
				id: data.id,
				name: data.name,
				email: data.email,
				entries: data.entries,
				joined: data.joined
			}
		});
	};

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

		fetch('https://enigmatic-waters-43513.herokuapp.com/imageurl', {
			method: 'post',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				input: this.state.input
			})
		})
			.then((response) => response.json())
			.then((response) => {
				if (response) {
					fetch('https://enigmatic-waters-43513.herokuapp.com/image', {
						method: 'put',
						headers: { 'Content-Type': 'application/json' },
						body: JSON.stringify({
							id: this.state.user.id
						})
					})
						.then((response) => response.json())
						.then((count) => {
							this.setState(Object.assign(this.state.user, { entries: count }));
						});
				}
				this.displayFaceBox(this.calculateFaceLocation(response));
				// this.calculateCelebrity(response);
				// console.log(response.outputs[0].data.regions[0].region_info.bounding_box);
				// console.log(response.outputs[0].data.regions[0].data.concepts[0].value);
				this.setState({ celebrity: response.outputs[0].data.regions[0].data.concepts[0].name });
				const options = {
					method: 'GET',
					url: 'https://contextualwebsearch-websearch-v1.p.rapidapi.com/api/Search/ImageSearchAPI',
					params: { q: this.state.celebrity, pageNumber: '1', pageSize: '1', autoCorrect: 'true' },
					headers: {
						'x-rapidapi-host': 'contextualwebsearch-websearch-v1.p.rapidapi.com',
						'x-rapidapi-key': 'eacdada91amshc767ae517ce85d5p1a7e68jsn0e01cc5e5541'
					}
				};

				axios
					.request(options)
					.then((response) => {
						console.log(this.state.celebrity);
						this.setState({ celebrityUrl: response.data.value[0].url });
					})
					.catch((error) => {
						console.error(error);
					});
			})
			.catch((err) => {
				console.log(err);
			});
	};

	onRouteChange = (route) => {
		if (route === 'signout') {
			this.setState(initialState);
		} else if (route === 'home') {
			this.setState({ isSignedIn: true });
		}
		this.setState({ route: route });
	};
	render() {
		const { isSignedIn, imageUrl, route, box } = this.state;
		return (
			<div className="App">
				<Particles params={particleOptions} className="particles" />
				<Navigation isSignedIn={isSignedIn} onRouteChange={this.onRouteChange} />
				{route === 'home' ? (
					<div>
						<Logo />
						<Rank name={this.state.user.name} entries={this.state.user.entries} />
						<Guess celebrity={this.state.celebrity} celebrityUrl={this.state.celebrityUrl} />
						<ImageLinkForm onInputChange={this.onInputChange} onButtonSubmit={this.onButtonSubmit} />
						<FaceRecognition box={box} imageUrl={imageUrl} />
					</div>
				) : route === 'signin' ? (
					<Signin loadUser={this.loadUser} onRouteChange={this.onRouteChange} />
				) : (
					<Register loadUser={this.loadUser} onRouteChange={this.onRouteChange} />
				)}
			</div>
		);
	}
}

export default App;
