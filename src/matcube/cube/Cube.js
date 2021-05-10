//--------------------------------------------------------------
//  Cube
//--------------------------------------------------------------
class Cube {

	constructor() {
		this.fcol    = Cube.FACE_COLOR;
		this.vertex  = Cube.VERTEX;
		this.face    = Cube.FACE;
		this.nvertex = this.vertex.length;
		this.nface   = this.face.length;
		this.ccenter = [0, 0, 0];
		this.svertex = []; // screen座標.
		this.cvertex = []; // camera座標.

		for (let i = 0; i < this.nvertex; ++i) {
			this.svertex.push([0, 0]);
			this.cvertex.push([0, 0, 0]);
		}
	}

	static FACE_COLOR = [
		"#ff0000", // Color.RED,
		"#ff00ff", // Color.MAGENTA,
		"#0000ff", // Color.BLUE,
		"#00ffff", // Color.CYAN,
		"#00ff00", // Color.GREEN,
		"#ffff00", // Color.YELLOW,
		"#ff8f00", // Color.rgb(255, 165", 0),//.orange",
		"#404040", // Color.DKGRAY //  .darkGray,
		"#808080", // Color.GRAY, // .gray,
		"#ff8fa0"  // Color.rgb(255, 192, 203),//.pink
	];

	static VERTEX = [	[-1.0, 1.0, -1.0],
						[ 1.0, 1.0, -1.0],
						[ 1.0, 1.0,  1.0],
						[-1.0, 1.0,  1.0],
						[-1.0,-1.0, -1.0],
						[ 1.0,-1.0, -1.0],
						[ 1.0,-1.0,  1.0],
						[-1.0,-1.0,  1.0]
					];

	static FACE = [	[0, 1, 2, 3],	/* +y */
					[4, 7, 6, 5],	/* -y */
					[1, 5, 6, 2],	/* +x */
					[3, 7, 4, 0],	/* -x */
					[0, 4, 5, 1],	/* +z */
					[2, 6, 7, 3]	/* -z */
				  ];
	
	/*-------------------------------------
	  world -> camera -> screen座標へ
	  -------------------------------------*/
	worldToScreen(camMat, winMat, modelMat, width, height)
	{
		let mat;
		if (modelMat == null) {
			mat = camMat;
		} else {
			mat = new Matrix44(modelMat);
			mat.MulMM(camMat, modelMat);
		}

		mat.getTranslate(this.ccenter);
		for (let i = 0; i < this.nvertex; i++) { /* vertex loop */
			mat.mulV3V3(this.cvertex[i], this.vertex[i]);
		}

		this.camToScreen(winMat, width, height);
	}

	/*------------------------------------------------
		camera -> screen座標へ
	------------------------------------------------*/
	camToScreen(winMat, width, height)
	{
		let xc = width  / 2;
		let yc = height / 2;
		let f1 = [0, 0, 0, 0];
		for (let i = 0; i < this.nvertex; i++)
		{
			winMat.mulV4V3(f1, this.cvertex[i]);
			this.svertex[i][0] = Math.floor(xc + f1[0] * xc / f1[3]);
			this.svertex[i][1] = Math.floor(yc - f1[1] * yc / f1[3]);
			// sdepth = f1[2] / f1[3]; // zvalue
		}

	}
	/*------------------------------------------------
		a1 -> a2 と a1 -> a3の外積を求める
	------------------------------------------------*/
	outerProduct(a1, a2, a3)
	{
		return	(a2[0] - a1[0]) * (a3[1] - a1[1]) -
				(a2[1] - a1[1]) * (a3[0] - a1[0]);
	}

	/*------------------------------------------------

	  ------------------------------------------------*/
	checkBackface(fn) // face number
	{
		const face = this.face[fn];
		return this.outerProduct(	this.svertex[face[1]],
									this.svertex[face[0]],
									this.svertex[face[2]]);
	}

	/*------------------------------------------------

	  ------------------------------------------------*/
	checkPicking(x, y)
	{
		let minx = x + 100;
		let maxx = x - 100;
		let miny = y + 100;
		let maxy = y - 100;
		for (let i = 0; i < this.nvertex; i++) /* vertex loop */
		{
			const sv = this.svertex[i];
			minx = Math.min(sv[0], minx);
			maxx = Math.max(sv[0], maxx);
			miny = Math.min(sv[1], miny);
			maxy = Math.max(sv[1], maxy);
		}
		if (x < minx || maxx < x || y < miny || maxy < y) {
			return false;
		}

		
		for (let i = 0; i < this.nface; i++) /* face loop */
		{
 			if (this.checkBackface(i) > 0) {
				continue;
			}
			if (this.checkPickingFace(i, x, y)) {
				return true;
			}
		}
		return false;
	}

	/*------------------------------------------------

	  ------------------------------------------------*/
	checkPickingFace(fn, x, y)
	{
		const cp      = [x, y];
		const face    = this.face[fn];
		const nvertex = face.length;
		for (let i = 0; i < nvertex; i++) {
			let j = (i + 1) % nvertex;
			let k = this.outerProduct(	this.svertex[face[i]],
										this.svertex[face[j]],
										cp);
			if (k < 0) {
				return false;
			}
		}
		return true;
	}
}

/*----------------------------------------------------------

  ----------------------------------------------------------*/
class CubeStyle {
	/*-----------------------------------------
	  cubeの向きが同じだったらtrue. a:RCube b:RCube
	  -----------------------------------------*/
	faceMatch(a, b)
	{
		return a.faceid[0] == b.faceid[0] && a.faceid[2] == b.faceid[2];
	}

	/*-----------------------------------------
	  cubeが初期状態だったらtrue a:RCube
	  -----------------------------------------*/
	isFaceMatch(a)
	{
		return a.faceid[0] == a.faceid_init[0] && a.faceid[2] == a.faceid_init[2];
	}

	// a:RCube
	getColor(a, faceindex) {
		return a.fcol[faceindex];
	}
}
/*----------------------------------------------------------

  ----------------------------------------------------------*/
class CubeStyle2Col extends CubeStyle {
	/*-----------------------------------------
	  cubeの向きが同じだったらtrue. a:RCube b:RCube
	  -----------------------------------------*/
	faceMatch(a, b)
	{
		return a.faceid[0] == b.faceid[0] && a.faceid[2] == b.faceid[2];
	}

	/*-----------------------------------------
	  cubeが初期状態だったらtrue. a:RCube
	  -----------------------------------------*/
	isFaceMatch(a)
	{
		return a.faceid[1] == a.faceid_init[1] || a.faceid[1] == a.faceid_init[4];
	}

	// a:RCube
	getColor(a, faceindex) {	
		if (faceindex == 0 || faceindex == 1) {
			return "#ff0000"; // Color.RED;
		} else {
			return "#00ff00"; // Color.GREEN;
		}
	}
}


