//--------------------------------------------------------------
//  CubeList
//--------------------------------------------------------------
class Cubelist {

	static BOX_INTERVAL     = 3;
	static BOX_INTERVAL_NON = 2.1;
	static BOX_LEN_NUM      = 5 * 5;
	
	static DIR_NONE	= 0;
	static DIR_X	= 1;
	static DIR_Y	= 2;
	static DIR_Z	= 3;
	static DIR_NX	= 4;	/* -x */
	static DIR_NY	= 5;
	static DIR_NZ	= 6;
	static DIR_EACH	= 9;
	static DIR_CHECK= 10;
	
	constructor(x, y, style) {
		this.b_data = [];
		this.b_list = [];
		for (let i = 0; i < Cubelist.BOX_LEN_NUM; i++) {
			this.b_data[i] = new RCube(style);
		}

		if (!this.resize(x, y)) {
			this.resize(3, 3);
		}
		
		this.cursor    = new Cursor();
		this.moveStep  = 1 / 100; // 100msecで1ターン.
		this.drawDir   = false;
		this.moveFlag  = Cubelist.DIR_NONE;
		this.clearFlag = true;
		this.movePos   = 0;
	}

	/*------------------------------------

	------------------------------------*/
	getCubeStyle()
	{
		return this.b_data[0].getStyle();
	}

	/*------------------------------------

	------------------------------------*/
	getXlen()
	{
		return this.xlen;
	}

	/*------------------------------------

	------------------------------------*/
	getYlen()
	{
		return this.ylen;
	}

	/*------------------------------------

	------------------------------------*/
	getData(x, y)
	{
		return this.b_list[this.pos(x, y)];
	}
	
	/*------------------------------------

	------------------------------------*/
	pos(x, y)
	{
		return x + y * this.xlen;
	}

	/*------------------------------------

	------------------------------------*/
	initlist()
	{
		for (let i = 0; i < Cubelist.BOX_LEN_NUM; i++) {
			this.b_data[i].use_flag = false;
		}
		for (let i = 0; i < this.xlen; i++) {
			for (let j = 0; j < this.ylen; j++) {
				let k = this.pos(i, j);
				this.b_list[k] = this.b_data[k];
				this.b_list[k].initialize();
				this.b_list[k].use_flag	= true;
			}
			this.clearFlag = true;
		}
	}

	/*------------------------------------

	------------------------------------*/
	resize(x, y)
	{
		if (!x || !y) {
			return false;
		}

		if (x * y > Cubelist.BOX_LEN_NUM) {
			return false;
		}
		if (this.xlen == x && this.ylen == y) {
			return false;
		}
		this.xlen = x;
		this.ylen = y;
		this.initlist();
		return true;
	}
	/*------------------------------------

	------------------------------------*/
	setMoveStep(step)
	{
		this.moveStep = step;
	}

	/*------------------------------------

	------------------------------------*/
	getMoveStep()
	{
		return this.moveStep;
	}

	static iseed = 100;
	/*------------------------------------

	------------------------------------*/
	shuffle(count, seed)
	{
		if (seed == null) {
			let r = new Random(Cubelist.iseed);
			seed = r.next();
			Cubelist.iseed = seed;
		}

		let r = new Random(seed);
		this.initlist();

		for (let i = 0; i < count; i++)
		{
			let hx = Math.abs(r.next()) % this.xlen;
			let hy = Math.abs(r.next()) % this.ylen;
			if (this.moveStartEach(hx, hy, false) == 0)
			{
				i--;
				continue;
			}
			this.endMoveEach();
		}
		this.clearFlag = false;
	}

	/*------------------------------------

	------------------------------------*/
	setEmpty(x, y)
	{
		let b = this.getData(x, y);

		if (b == null) {
			return;
		}
		this.b_list[this.pos(x, y)] = null;
		b.initialize();
		b.use_flag		= false;
	}

	/*------------------------------------
	  リストの空の場所を見つける
	------------------------------------*/
	whichEmpty(xy)
	{
		for (let i = 0; i < this.xlen; i++) {
			for (let j = 0; j < this.ylen; j++) {
				if (this.b_list[this.pos(i, j)] == null)
				{
					xy[0] = i;
					xy[1] = j;
					return true;
				}
			}
		}
		return false;
	}

	/*------------------------------------
	  範囲をアクティブにする．
	  範囲は１から始まる
	------------------------------------*/
	active(minx, maxx, miny, maxy)
	{
		if (minx > maxx) {
			let tmp = minx; minx = maxx; maxx = tmp;
		}
		if (miny > maxy) {
			let tmp = miny; miny = maxy; maxy = tmp;
		}

		let count = 0;
		for (let x = 0; x < this.xlen; x++) {
			for (let y = 0; y < this.ylen; y++)
			{
				let c = this.getData(x, y);
				if (c == null) {
					continue;
				}
				if (minx <= x && x <= maxx && miny <= y && y <= maxy) {
					c.active_flag = true;
					count++;
				} else {
					c.active_flag = false;
				}
			}
		}
		return count;
	}

	/*-----------------------------------------------

	  -----------------------------------------------*/
	transActiveToEmpty(dx, dy)
	{
		let count = 0;
		let emp   = [0, 0];
		if (!this.whichEmpty(emp)) {
			return count;
		}

		dx = -dx;
		dy = -dy;
		do {
			if (emp[0]+dx < 0 || this.xlen <= emp[0] + dx) {
				break;
			}
			if (emp[1]+dy < 0 || this.ylen <= emp[1] + dy) {
				break;
			}

			let c = this.getData(emp[0]+dx, emp[1]+dy);
			if (c == null) {
				break;
			}
			if (!c.active_flag) {
				break;
			}
			this.b_list[this.pos(emp[0], emp[1])] = c;
			this.b_list[this.pos(emp[0]+dx, emp[1]+dy)] = null;
			emp[0] += dx;
			emp[1] += dy;
			count++;
		} while (true);
		return count;
	}

	/*-----------------------------------------------

	  -----------------------------------------------*/
	pick(x, y, result)
	{
		if (this._pick(x, y, result)) {
			return this.getData(result[0], result[1]);
		}
		return null;
	}

	/*-----------------------------------------------

	  -----------------------------------------------*/
	_pick(x, y, result)
	{
		this.cursor.init(!this.drawDir, true, this.xlen, this.ylen);
		do {
			let rc = this.getData(this.cursor.x, this.cursor.y);
			if (rc == null) {
				continue;
			}
			if (rc.checkPicking(x, y))
			{
				result[0] = this.cursor.x;
				result[1] = this.cursor.y;
				return true;
			}
		} while (this.cursor.next());

		return false;
	}

	/*-----------------------------------------------

	  -----------------------------------------------*/
	getDrawPos(x, y, p)
	{
		p[0] = ((x - (this.xlen - 1) / 2)) * Cubelist.BOX_INTERVAL;
		p[1] = 0;
		p[2] = ((y - (this.ylen - 1) / 2)) * Cubelist.BOX_INTERVAL;
	}

	/*-----------------------------------------------

	  -----------------------------------------------*/
	doMoveEach(deltatime)
	{
		if (this.moveFlag != Cubelist.DIR_EACH) {
			return 0;
		}
		this.movePos += this.moveStep * deltatime;
		if (this.movePos >= 1.0) {
			return this.endMoveEach();
		}
		return this.doRoteEach(false);
	}

	/*-----------------------------------------------

	  -----------------------------------------------*/
	endMoveEach() {
		let		count = 0;
	
		if (this.moveFlag != Cubelist.DIR_EACH) {
			return 0;
		}
		this.movePos	= 1.0;
		count			= this.doRoteEach(true);
		this.moveFlag	= Cubelist.DIR_CHECK;
		this.movePos	= 0.0;
		return count;
	}

	/*-----------------------------------------------

	  -----------------------------------------------*/
	doRoteEach(endflag)
	{
		let count = 0;

		for (let i = 0; i < this.xlen; i++)
		{
			for (let j = 0; j < this.ylen; j++)
			{
				let p = this.getData(i, j);
				if (p == null) {
					continue;
				}
				let rx = 0;
				let ry = 0;
				let rz = 0;
				const r = Math.PI * this.movePos / 2.0;
				switch (p.user_flag)
				{
					case Cubelist.DIR_X:	rx =  r;	break;
					case Cubelist.DIR_NX:	rx = -r;	break;
					case Cubelist.DIR_Y:	ry =  r;	break;
					case Cubelist.DIR_NY:	ry = -r;	break;
					case Cubelist.DIR_NZ:	rz = -r;	break;
					case Cubelist.DIR_Z:	rz =  r;	break;
					default:	continue;
				}
				if (!endflag) {
					p.rotDrawMatrix(rx, ry, rz);
				} else {
					p.rotMatrix(rx, ry, rz);
					p.adjustMatrix();
					p.updata6FaceId();
					p.user_flag = Cubelist.DIR_NONE;
				}
				count++;
			}
		}
		return count;
	}

	/*-------------------------------------------------

	  -------------------------------------------------*/
	doCheckEachAbsolute()
	{
		if (this.moveFlag != Cubelist.DIR_CHECK || this.clearFlag) {
			return false;
		}
		/*-----------
		dp->moveFlag = DOC_NONE;
		if (dp->clearFlag)
			return 0;
		--------*/
		for (let i = 0; i < this.xlen; i++) {
			for (let j = 0; j < this.ylen; j++) {
				let bd = this.getData(i, j);
				if (bd == null){
					continue;
				}
				if (!bd.isFaceMatch()) {
					return false;
				}
			}
		}
		this.clearFlag = true;
		return true;
	}

	/*-------------------------------------------------

	  -------------------------------------------------*/
	doCheckEachRelative()
	{
		if (this.moveFlag != Cubelist.DIR_CHECK || this.clearFlag) {
			return false;
		}
		/*-----------
		dp->moveFlag = DOC_NONE;
		if (dp->clearFlag)
			return 0;
		--------*/
		let bd0 = null;
		for (let i = 0; i < this.xlen; i++) {
			for (let j = 0; j < this.ylen; j++) {
				if (bd0 == null) {
					bd0 = this.getData(i, j);
					continue;
				}
				bd = this.getData(i, j);
				if (bd == null) {
					continue;
				}
				if (!bd0.faceMatch(bd)) {
					return false;
				}
			}
		}
		/*-----------
		if (count)
			playSound(dp, kClearSoundId, 1);
		dp->clearFlag = 1;
		----------*/
		clearFlag = true;
		return true;
	}

	/*------------------------------------------------------

	------------------------------------------------------*/
	moveStartEach(hx, hy, negative)
	{
		for (let i = 0; i < this.xlen; i++) {
			let p = this.getData(i, hy);
			if (p == null) {
				continue;
			}
			if (i == hx - 1) {
				if (negative)	p.user_flag = Cubelist.DIR_NZ;
				else			p.user_flag = Cubelist.DIR_Z;
			}
			if (i == hx + 1) {
				if (negative)	p.user_flag = Cubelist.DIR_Z;
				else			p.user_flag = Cubelist.DIR_NZ;
			}
			else {
				continue;
			}
		}
		for (let i = 0; i < this.ylen; i++) {
			let p = this.getData(hx, i);
			if (p == null) {
				continue;
			}
			if (i == hy - 1) {
				if (negative)	p.user_flag = Cubelist.DIR_X;
				else			p.user_flag = Cubelist.DIR_NX;
			}
			if (i == hy + 1) {
				if (negative)	p.user_flag = Cubelist.DIR_NX;
				else			p.user_flag = Cubelist.DIR_X;
			}
			else {
				continue;
			}
		}
		this.movePos  = 0.0;
		this.moveFlag = Cubelist.DIR_EACH;
		return 1;
	}

	/*-----------------------------------------------

	  -----------------------------------------------*/
	draw(ctx, camMat, winMat, modelMat, width, height)
	{
		let dp = [0, 0, 0];
		let tm = new Matrix44();

		this.cursor.init(this.drawDir, false, this.xlen, this.ylen);
		do {
			let p = this.getData(this.cursor.x, this.cursor.y);
			if (p == null) {
				continue;
			}
			this.getDrawPos(this.cursor.x, this.cursor.y, dp);
			tm.makeTranslate(dp[0], dp[1], dp[2]);
			if (modelMat != null) {
				tm.MulMM(modelMat, tm);
			}
			tm.MulMM(tm, p.m);
			p.draw(ctx, camMat, winMat, tm, width, height);
		} while (this.cursor.next());
	}
}

class Cursor {
	constructor() {
		this.init(true, false, 3, 3);
	}

	init(xyorder, inverse, xlen, ylen) {
		this.bInverse = inverse;
		this.bXyorder = xyorder;
		this.xlen = xlen;
		this.ylen = ylen;

		if (this.bInverse) {
			this.x = this.xlen - 1;
			this.y = this.ylen - 1;
		}
		else {
			this.x = this.y = 0;
		}
	}

	next() {
		if (!this.hasNext()) {
			return false;
		}
		if (!this.bInverse) {
			if (this.bXyorder) {
				if (this.xlen <= ++this.x) {
					this.y++;
					this.x = 0;
				}
			} else {
				if (this.ylen <= ++this.y) {
					this.x++;
					this.y = 0;
				}
			}
		}
		else {
			if (this.bXyorder) {
				if (--this.y < 0) {
					--this.x;
					this.y = this.ylen - 1;
				}
			}else {
				if (--this.x < 0) {
					--this.y;
					this.x = this.xlen - 1;
				}
			}
		}
		return true;
	}

	hasNext() {
		if (!this.bInverse) {
			return this.x < this.xlen-1 || this.y < this.ylen-1;
		} else {
			return 0 < this.x || 0 < this.y;
		}
	}
}
