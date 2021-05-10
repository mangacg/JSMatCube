//--------------------------------------------------------------
// CubeGameDef
//--------------------------------------------------------------
CubeGameDef = {
	instance : null
};

//--------------------------------------------------------------
// CubeGame
//--------------------------------------------------------------
class CubeGame {

	constructor() {
		this.camMat = new Matrix44();
		this.winMat = new Matrix44();
		this.cubelist;
		this.cubeSize  = 2; // 2x2, 3x3, 4x4, 5x5
		this.cubeStage = 0; // 0-7
		//this.cubeStage = 2; // 0-7
		this.isSound   = false;
		this.cubelist  = new Cubelist1(3, 3, new CubeStyle());

		this.changeCubeStage(this.cubeStage);
		this.changeCubeSize(this.cubeSize);
	}

	// instance
	//static instance = new CubeGame();
	static GetInstance() {
		if (CubeGameDef.instance == null) {
			CubeGameDef.instance = new CubeGame();
		}
		return CubeGameDef.instance;
	}
	static DeleteInstance() {
		CubeGameDef.instance = null;
	}

	getCubelist() {
		return this.cubelist;
	}

	isSoundEnable() {
		return this.isSound;
	}

	enableSound(b) {
		this.isSound = b;
	}

	shuffleCube() {
		this.isSuffle = true;
	}

	resetCube() {
		this.isReset = true;
	}

	click(x, y, b) {
		this.clickx = x;
		this.clicky = y;
		this.clickb = b;
	}

	setCubeSize(i) {
		if (this.cubeSize == i) {
			return false;
		}
		this.cubeSize = i;
		this.isResize = true;
		return true;
	}

	getCubeSize() {
		return this.cubeSize;
	}

	setCubeStage(i) {
		if (this.cubeStage == i) {
			return false;
		}
		this.cubeStage = i;
		this.isRestage = true;
		return true;
	}

	getCubeStage() {
		return this.cubeStage;
	}

	changeCubeSize(i) {
		return this.cubelist.resize(i, i);
	}

	changeCubeStage(n) {
		let x = this.cubelist.getXlen();
		let y = this.cubelist.getYlen();

		let cub;
		if (n == 0)			cub = new Cubelist1(x, y, new CubeStyle2Col());
		else if (n == 1)	cub = new Cubelist2(x, y, new CubeStyle2Col());
		else if (n == 2)	cub = new Cubelist3(x, y, new CubeStyle2Col());
		else if (n == 3)	cub = new Cubelist4(x, y, new CubeStyle2Col());
		else if (n == 4)	cub = new Cubelist1(x, y, new CubeStyle());
		else if (n == 5)	cub = new Cubelist2(x, y, new CubeStyle());
		else if (n == 6)	cub = new Cubelist3(x, y, new CubeStyle());
		else if (n == 7)	cub = new Cubelist4(x, y, new CubeStyle());
		else	return false;

		this.cubelist = cub;
		return true;
	}

	getStyleSizeName() {
		let cls = this.cubelist.constructor;
		let name = "";
		if      (cls == Cubelist1)	name = "Stage:1";
		else if (cls == Cubelist2)	name = "Stage:2";
		else if (cls == Cubelist3)	name = "Stage:3";
		else if (cls == Cubelist4)	name = "Stage:4";

		cls = cub.getCubeStyle().constructor;
		if      (cls == CubeStyle)		name = name + " Col:6";
		else if (cls == CubeStyle2Col)	name = name + " Col:2";

		name = name + " Xlen:" + cub.getXlen();
		name = name + " Ylen:" + cub.getYlen();

		return name;
	}

	update(deltatime) {
		let state = {};
		state.redraw  = false;
		state.sound   = -1;
		state.shuffle = false;
		state.match   = false;
		state.stage   = false;
		state.size    = false;

		let isRedraw = false;
		let flag = false;
		let	valuex;
		let	valuey;

		// resize
		//synchronized(this)
		{
			// size
			if (this.isResize) {
				this.isResize = false;
				this.changeCubeSize(this.cubeSize);
				isRedraw = true;
				state.size = true;
			}
			// stage
			if (this.isRestage) {
				this.isRestage	= false;
				this.changeCubeStage(this.cubeStage);
				isRedraw = true;
				state.stage = true;
			}
			// shuffle
			if (this.isSuffle) {
				this.isSuffle	= false;
				this.cubelist.shuffle(100, Date.now());
				isRedraw      = true;
				state.shuffle = true;
			}
			// reset
			if (this.isReset) {
				this.isReset	= false;
				this.cubelist.initlist();
				isRedraw = true;
			}
			// click
			valuex		= this.clickx;
			valuey		= this.clicky;
			flag		= this.clickb;
			this.clickx = this.clicky = null;
		}

		if (valuex != null) {
			let cxy = [0, 0];
			if (this.cubelist.pick(valuex, valuey, cxy)) // TODO: この処理もtartTimer()のスレッドで行うべき
			{
				// console.log("pick pos(%d, %d), cubepos(%d, %d)", valuex, valuey, cxy[0], cxy[1]);
				// TODO: pick（）の他に、移動に有効なキューブかどうかのチェックも必要。
				this.cubelist.endMoveEach(); // 現在のアニメーションの終了
				if (this.cubelist.moveStartEach(cxy[0], cxy[1], flag) != 0) {// アニメーションの開始
					if (this.isSound) {
						state.sound = flag ? 1 : 0;
					}
				}
					// soundPool.play(soundId, 1f, 1f, 1, 0, 1f);
				isRedraw = true;
			}
		}

		if (0 != this.cubelist.doMoveEach(deltatime)) {
			isRedraw = true;
		}
		state.redraw = isRedraw;
		state.match  = this.cubelist.doCheckEachAbsolute();

		return state;
	}

	/*------------------------------------

	  ------------------------------------*/
	draw(ctx, winsizex, winsizey)
	{
		// ctx.clearRect(0, 0, winsizex, winsizey);
		ctx.fillStyle = "rgb(200, 200, 200)";
		ctx.fillRect(0, 0, winsizex, winsizey);
		this.setcamera(winsizex, winsizey);
		this.cubelist.draw(ctx, this.camMat, this.winMat, null, winsizex, winsizey);
	}

	/*------------------------------------

	  ------------------------------------*/
	setcamera(winsizex, winsizey)
	{
		/*--- world -> camera ---*/
		//cam = new Matrix44();
		//this.camMat.lookat( 28.0, 32.0, 28.0,/* from */
		//				  0.0, -1.0,  0.0,	/* to */
		//				  0);				/* twist */
		this.camMat.lookat2( 28.0, 32.0, 28.0,/* from */
						  0.0, -1.0,  0.0,	/* to */
						  0, 1, 0);		/* twist */

		/*--- camera -> screen ---*/
		let asp = winsizex / winsizey;
		let near = 1.0;
		let angw = near * 0.20;
		let angh = near * 0.15;
		if (asp < angw/angh) {
			this.winMat.window(-angw, angw, -angw / asp, angw / asp, near, 1000.0);
		} else {
			this.winMat.window(-asp * angh, asp * angh, -angh, angh, near, 1000.0);
		}
	}
}


