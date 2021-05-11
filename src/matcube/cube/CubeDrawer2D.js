//--------------------------------------------------------------
//  CubeDrawer2D
//--------------------------------------------------------------
class CubeDrawer2D {

	constructor() {
		this.cursor    = new CubelistCursor();
	}

	/*-----------------------------------------------

	  -----------------------------------------------*/
	drawList(list, ctx, camMat, winMat, modelMat, width, height)
	{
		if (!list) {
			return;
		}

		let dp = [0, 0, 0];
		let tm = new Matrix44();

		this.cursor.init(list.drawDir, false, list.xlen, list.ylen);
		do {
			let p = list.getData(this.cursor.x, this.cursor.y);
			if (p == null) {
				continue;
			}
			list.getDrawPos(this.cursor.x, this.cursor.y, dp);
			tm.makeTranslate(dp[0], dp[1], dp[2]);
			tm.MulMM(tm, p.m);
			if (modelMat != null) {
				tm.MulMM(modelMat, tm);
			}

			this.drawRCube(p, ctx, camMat, winMat, tm, width, height);
		} while (this.cursor.next());
	}
	
	/*-------------------------------------
	 
	 -------------------------------------*/
	drawRCube(cube, ctx, camMat, winMat, modelMat, width, height)
	{
		//cube.worldToScreen(camMat, winMat, modelMat, width, height);
		this.worldToScreen(cube, camMat, winMat, modelMat, width, height);
		this.drawRCube2D(cube, ctx);
	}

	/*-------------------------------------
	  world -> camera -> screen座標へ
	  -------------------------------------*/
	worldToScreen(cube, camMat, winMat, modelMat, width, height)
	{
		let mat; // world -> camera
		if (modelMat == null) {
			mat = camMat;
		} else {
			mat = new Matrix44();
			mat.MulMM(camMat, modelMat);
		}

		let cwmat = new Matrix44();  // world -> camera -> screen
		cwmat.MulMM(winMat, mat);

		let xc = width  / 2;
		let yc = height / 2;
		let f1 = [0, 0, 0, 0];
		for (let i = 0; i < cube.nvertex; i++)
		{
			cwmat.mulV4V3(f1, cube.vertex[i]);
			cube.svertex[i][0] = Math.floor(xc + f1[0] * xc / f1[3]);
			cube.svertex[i][1] = Math.floor(yc - f1[1] * yc / f1[3]);
			// sdepth = f1[2] / f1[3]; // zvalue
		}
	}

	/*-------------------------------------
	 
	  -------------------------------------*/
	drawRCube2D(cube, ctx)
	{
		ctx.save();

		for (let i = 0; i < cube.nface; i++) /* face loop */
		{
			if (this.checkBackface(cube, i) > 0) {
				cube.isvisibleface[i] = false;
				continue;
			} else {
				cube.isvisibleface[i] = true;
			}

			ctx.beginPath();
			let v = cube.svertex[cube.face[i][0]];
			ctx.moveTo(v[0], v[1]);
			for (let j = 1; j < 4; j++) {
				v = cube.svertex[cube.face[i][j]];
				ctx.lineTo(v[0], v[1]);
			}
			ctx.closePath();

			//スタイルを設定
			ctx.fillStyle   = cube.style.getColor(cube, i);
			ctx.strokeStyle = "black";
			ctx.lineCap     = "round";
			ctx.lineJoin    = "round";
			ctx.lineWidth = 4;
			//描画
			ctx.fill();
			ctx.stroke();
		}

		// 揃ったキューブをハイライト表示
		// 上のループ内で以下を描画するとラインがつながらない
		if (!cube.isFaceMatch() || cube.user_flag != CubelistDef.DIR_NONE) {
			ctx.restore();
			return;
		}

		for (let i = 0; i < cube.nface; i++) /* face loop */
		{
			if (!cube.isvisibleface[i]) {
				continue;
			}

			ctx.beginPath();
			let v = cube.svertex[cube.face[i][0]];
			ctx.moveTo(v[0], v[1]);
			for (let j = 1; j < 4; j++) {
				v = cube.svertex[cube.face[i][j]];
				ctx.lineTo(v[0], v[1]);
			}
			ctx.closePath();

			ctx.strokeStyle = "white";
			ctx.lineCap     = "round";
			ctx.lineJoin    = "round";
			ctx.lineWidth = 2;
			//描画
			ctx.stroke();
		}

		ctx.restore();
	}

	////////////////////////////////////////////////////////////////////
	// pick

	/*-----------------------------------------------

	  -----------------------------------------------*/
	pick(list, x, y, result)
	{
		if (this._pick(list, x, y, result)) {
			return list.getData(result[0], result[1]);
		}
		return null;
	}

	/*-----------------------------------------------

	  -----------------------------------------------*/
	_pick(list, x, y, result)
	{
		this.cursor.init(list.drawDir, true, list.xlen, list.ylen);
		do {
			let rc = list.getData(this.cursor.x, this.cursor.y);
			if (rc == null) {
				continue;
			}
			// if (rc.checkPicking(x, y))
			if (this.checkPicking(rc, x, y))
			{
				result[0] = this.cursor.x;
				result[1] = this.cursor.y;
				return true;
			}
		} while (this.cursor.next());

		return false;
	}

	/*------------------------------------------------

	  ------------------------------------------------*/
	checkPicking(cube, x, y)
	{
		let minx = x + 100;
		let maxx = x - 100;
		let miny = y + 100;
		let maxy = y - 100;
		for (let i = 0; i < cube.nvertex; i++) /* vertex loop */
		{
			const sv = cube.svertex[i];
			minx = Math.min(sv[0], minx);
			maxx = Math.max(sv[0], maxx);
			miny = Math.min(sv[1], miny);
			maxy = Math.max(sv[1], maxy);
		}
		if (x < minx || maxx < x || y < miny || maxy < y) {
			return false;
		}

		for (let i = 0; i < cube.nface; i++) /* face loop */
		{
 			//if (this.checkBackface(i) > 0) {
			if (this.checkBackface(cube, i) > 0) {
				continue;
			}
			//if (this.checkPickingFace(i, x, y)) {
			if (this.checkPickingFace(cube, i, x, y)) {
				return true;
			}
		}
		return false;
	}

	/*------------------------------------------------

	  ------------------------------------------------*/
	checkBackface(cube, fn) // face number
	{
		const face = cube.face[fn];
		return this.outerProduct(	cube.svertex[face[1]],
									cube.svertex[face[0]],
									cube.svertex[face[2]]);
	}

	/*------------------------------------------------

	  ------------------------------------------------*/
	checkPickingFace(cube, fn, x, y)
	{
		const cp      = [x, y];
		const face    = cube.face[fn];
		const nvertex = face.length;
		for (let i = 0; i < nvertex; i++) {
			let j = (i + 1) % nvertex;
			let k = this.outerProduct(	cube.svertex[face[i]],
										cube.svertex[face[j]],
										cp);
			if (k < 0) {
				return false;
			}
		}
		return true;
	}

	/*------------------------------------------------
		a1 -> a2 と a1 -> a3の外積を求める
	------------------------------------------------*/
	outerProduct(a1, a2, a3)
	{
		return	(a2[0] - a1[0]) * (a3[1] - a1[1]) -
				(a2[1] - a1[1]) * (a3[0] - a1[0]);
	}
}
