export class Vector {
	constructor() {
	}

	get size() {

	}


	transpose() {
		let newVector = _createVector(this.m);

		// iterate and swap the entries
		for (var i = 0; i < N.length; i++) {
			for (let j = 0; j < N[i].length; j++) {
				newVector[j][i] = N[i][j]
			}
		}

		return newVector;
	}

	_createVector(m_size, n_size) {
		for (var i = 0; i < m_size; i++) {
			M[i] = [];
		}
	}
}