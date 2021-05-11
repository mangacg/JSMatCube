//--------------------------------------------------------------
//  RCube
//--------------------------------------------------------------
class RCube extends Cube {
	//-----------------------------------------
	//
	//-----------------------------------------
	constructor(style) {
		super();
		this.style = style;
		this.m0    = new Matrix44();
		this.m     = new Matrix44();
		this.initialize();
	}

	//-----------------------------------------
	//
	//-----------------------------------------
	initialize()
	{
		this.m0.unit();
		this.m.unit();
		this.faceid_init    = [];
		this.faceid         = [];
		this.isvisibleface	= [];
		for (let i = 0; i < this.nface; i++) {
			this.faceid_init[i] = this.faceid[i] = i + 1;
			this.isvisibleface[i] = false;
		}
		this.active_flag	= false;
		this.use_flag		= false;
		this.clear_flag		= false;
		this.user_flag		= 0;
	}

	/*-----------------------------------------
	  styleを返す
	  -----------------------------------------*/
	getStyle() {
		return this.style;
	}

	/*-----------------------------------------
	 現在のマトリックスからfaceid[]を更新する
	  -----------------------------------------*/
	updata6FaceId()
	{
		let v3  = [1, 2, 3];
		let v3r = [];

		let inv = new Matrix44();
		inv.invert(this.m0);
		inv.mulV3V3(v3r, v3); /* v3r = v3 * inv; */

		let vi = [];
		vi[0] =	Math.round(v3r[0]);
		vi[1] = Math.round(v3r[1]);
		vi[2] = Math.round(v3r[2]);

		for (let i = 0; i < 3; i++)
		{
			let i0, i1;
			if (0 < vi[i])
			{
				i0 = vi[i];
				i1 = i0 + 3;
			}
			else
			{
				i1 = -vi[i];
				i0 = i1 + 3;
			}
			this.faceid[i]		= this.faceid_init[i0 - 1];
			this.faceid[i+3]	= this.faceid_init[i1 - 1];
		}
	}

	/*-----------------------------------------
	  マトリックスm0に回転を加える
	  -----------------------------------------*/
	rotMatrix(rx, ry, rz)
	{
		this.rotDrawMatrix(rx, ry, rz);
		this.m0.copy(this.m);
	}

	/*-----------------------------------------
	  表示マトリックスに回転を加える
	  -----------------------------------------*/
	rotDrawMatrix(rx, ry, rz)
	{
		let	tmp = new Matrix44();
	
		tmp.rotxr(rx);	/* radian */
		tmp.rotyr(ry);
		tmp.rotzr(rz);
		// m.MulMM(m0, tmp);
		this.m.MulMM(tmp, this.m0);
	}

	/*-----------------------------------------

	  -----------------------------------------*/
	adjustMatrix()
	{
		this.adjustIntMatrix44(this.m0);
		this.m.copy(this.m0);
	}

	/*-----------------------------------------
	  マトリックスの要素を整数にする
	  -----------------------------------------*/
	adjustIntMatrix44(m)
	{
		for (let i = 0; i < 4; i++) {
			for (let j = 0; j < 4; j++) {
				this.m.m[i][j] = Math.round(this.m.m[i][j]);
			}
		}
	}

	/*-----------------------------------------
	  cubeの向きが同じだったらtrue
	  -----------------------------------------*/
	faceMatch(a)
	{
		return this.style.faceMatch(this, a);
	}

	/*-----------------------------------------
		  cubeが初期状態だったらtrue
	  -----------------------------------------*/
	isFaceMatch()
	{
		return this.style.isFaceMatch(this);
	}
}
