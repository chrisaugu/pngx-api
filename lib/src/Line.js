
export class Line {
	constructor(x, y) {
		this.x = x;
		this.y = y;
	}
	set X(x) {
		this.x = x
	};
	set Y(y) {
		this.y = y
	};
	get X() {
		return this.x;
	};
	get Y() {
		return this.y
	};
}

// function Line() {
// 	this.p1 = new Point();
// 	this.p2 = new Point();
//   this.setP1 = (p) => {this.p1 = p};
//   this.setP2 = (p) => {this.p2 = p};
//   this.getP1 = () => {return this.p1};
//   this.getP2 = () => {return this.p2};
// }
