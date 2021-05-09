//--------------------------------------------------------------
// Random xorshift
// https://qiita.com/Toraja/items/fc9c04adbf88f3ff2683
//--------------------------------------------------------------
class Random {
	constructor(seed = 88675123) {
		this.x = 123456789;
		this.y = 362436069;
		this.z = 521288629;
		this.w = seed;
	}
	
	// XorShift
	next() {
		let t  = this.x ^ (this.x << 11);
		this.x = this.y;
		this.y = this.z;
		this.z = this.w;
		this.w = (this.w ^ (this.w >>> 19)) ^ (t ^ (t >>> 8));
		//return this.w;
		return (this.w >>> 0) - 1;
	}

	// 0 - 1 の値を返す.
	nextDouble() {
        return this.next() / 0xffffffff;
    }

	// min - maxの整数を返す.
	nextInt(min, max) {
		const r = Math.abs(this.next());
		return min + (r % (max + 1 - min));
	}
}
