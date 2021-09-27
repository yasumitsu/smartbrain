import React from 'react';

const Guess = ({ celebrity, celebrityUrl }) => {
	return celebrity ? (
		<div className="center ma">
			<div className=" mt2">
				<div className="white f3 mb3">{` your celebrity is ${celebrity}`}</div>
				<img width="500px" height="auto" src={celebrityUrl} />
			</div>
		</div>
	) : (
		<div />
	);
};

export default Guess;
