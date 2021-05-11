//--------------------------------------------------------------
//  CubeDef
//--------------------------------------------------------------

CubeDef = {
	FACE_COLOR : [
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
	],

	VERTEX : [	[-1.0, 1.0, -1.0],
						[ 1.0, 1.0, -1.0],
						[ 1.0, 1.0,  1.0],
						[-1.0, 1.0,  1.0],
						[-1.0,-1.0, -1.0],
						[ 1.0,-1.0, -1.0],
						[ 1.0,-1.0,  1.0],
						[-1.0,-1.0,  1.0]
			 ],

	FACE : [	[0, 1, 2, 3],	/// +y
					[4, 7, 6, 5],	// -y
					[1, 5, 6, 2],	// +x
					[3, 7, 4, 0],	// -x
					[0, 4, 5, 1],	// +z
					[2, 6, 7, 3]	// -z
		   ],
};

//--------------------------------------------------------------
//  Cube
//--------------------------------------------------------------
class Cube {

	constructor() {
		this.fcol    = CubeDef.FACE_COLOR;
		this.vertex  = CubeDef.VERTEX;
		this.face    = CubeDef.FACE;
		this.nvertex = this.vertex.length;
		this.nface   = this.face.length;
		this.svertex = []; // screen座標.

		for (let i = 0; i < this.nvertex; ++i) {
			this.svertex.push([0, 0]);
		}
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


