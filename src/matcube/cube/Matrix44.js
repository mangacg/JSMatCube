//--------------------------------------------------------------
//  Matrix44
//--------------------------------------------------------------
class Matrix44 {
	constructor(mat) {
		this.m = [[],[],[],[]];
		if (mat) {
			this.copy(mat);
		} else {
			this.unit();
		}
	}

	//------------------------------
	//
	//------------------------------
    M_(x, y)
	{
		return this.m[y][x];
	}

	//------------------------------
	//
	//------------------------------
	M_set(x, y, f)
	{
		this.m[y][x] = f;
	}

	//------------------------------
	//
	//------------------------------
	M_add(x, y, f)
	{
		this.m[y][x] += f;
	}

	//------------------------------
	//
	//------------------------------
	set(x, y, f)
	{
		this.m[y][x] = f;
	}

	//------------------------------
	//
	//------------------------------
	unit()
	{
		for (let i = 0; i < 4; i++) {
			for (let j = 0; j < 4; j++) {
				if (j === i) {
					this.m[i][j] = 1.0;
				} else {
					this.m[i][j] = 0.0;
				}
			}
		}
	}

	//------------------------------
	//
	//------------------------------
	copy(m1)
	{
		for (let i = 0; i < 4; i++) {
			for (let j = 0; j < 4; j++) {
				this.m[i][j] = m1.m[i][j];
			}
		}
	}

	//------------------------------
	// 移動マトリックス作成
	//------------------------------
	makeTranslate(x, y, z)
	{
		this.unit();
		this.M_set(0, 3, x);
		this.M_set(1, 3, y);
		this.M_set(2, 3, z);
	}

	//------------------------------
	// 移動ベクトル取得
	//------------------------------
	getTranslate(v)
	{
		v[0] = this.M_(0, 3);
		v[1] = this.M_(1, 3);
		v[2] = this.M_(2, 3);
	}

	//------------------------------
	// スケーリングマトリックス作成
	//------------------------------
	makeScale(x, y, z)
	{
		this.unit();
		this.M_set(0, 0, x);
		this.M_set(1, 1, y);
		this.M_set(2, 2, z);
	}

	//------------------------------
	// ローテーションマトリックス作成
	//------------------------------
	makeRotX(radx)
	{
		const c = Math.cos(radx);
		const s = Math.sin(radx);

		this.unit();
		this.M_set(1, 1,  c);
		this.M_set(1, 2, -s);
		this.M_set(2, 1,  s);
		this.M_set(2, 2,  c);
	}

	makeRotY(rady)
	{
		const c = Math.cos(rady);
		const s = Math.sin(rady);

		this.unit();
		this.M_set(0, 0,  c);
		this.M_set(0, 2,  s);
		this.M_set(2, 0, -s);
		this.M_set(2, 2,  c);
	}

	makeRotZ(radz)
	{
		const c = Math.cos(radz);
		const s = Math.sin(radz);

		this.unit();
		this.M_set(0, 0,  c);
		this.M_set(0, 1, -s);
		this.M_set(1, 0,  s);
		this.M_set(1, 1,  c);
	}

	makeRotPoint(ox, oy, oz, rx, ry, rz)
	{
		this.unit();
		this.dspxyz(ox, oy, oz);
		this.rotzr(rz);
		this.rotyr(ry);
		this.rotxr(rx);
		this.dspxyz(-ox, -oy, -oz);
	}

	//---------------------------------------------------
	// this = m2 * m3
	// this は m2, m3のいづれかと同じであってはならない
	//---------------------------------------------------
	mulMM(m2, m3)
	{
		for (let i = 0; i < 4; i++) {
			for (let j = 0; j < 4; j++) {
				let v = 0;
				for (let k = 0; k < 4; k++) {
					v += m2.M_(i, k) * m3.M_(k, j);
				}
				this.M_set(i, j, v);
			}
		}
	}

	//---------------------------------------------------
	// this = m2 * m3
	// this は m2, m3のいづれかと同じであってもよい
	//---------------------------------------------------
	MulMM(m2, m3)
	{
		if (this == m2 || this == m3)
		{
			let m1 = new Matrix44();

			m1.mulMM(m2, m3);
			this.copy(m1);
		} else {
			this.mulMM(m2, m3);
		}
	}

	//---------------------------------------------------
	//  v4 = this * v4
	//---------------------------------------------------
	mulV4V4(f1, f2)
	{
		for (let i = 0; i < 4; i++) {
			f1[i] = 0.0;
			for (let j = 0; j < 4; j++) {
				f1[i] += this.M_(i, j) * f2[j];
			}
		}
	}

	//---------------------------------------------------
	//  v3 = this * v3
	//---------------------------------------------------
	mulV3V3(f1, f2)
	{
		for (let i = 0; i < 3; i++)
		{
			f1[i] = 0.0;
			for (let j = 0; j < 3; j++) {
				f1[i] += this.M_(i, j) * f2[j];
			}
			f1[i] += this.M_(i, 3);
		}
	}

	//---------------------------------------------------
	// v4 = this * v3
	//---------------------------------------------------
	mulV4V3(f1, f2)
	{
		for (let i = 0; i < 4; i++)
		{
			f1[i] = 0.0;
			for (let j = 0; j < 3; j++) {
				f1[i] += this.M_(i, j) * f2[j];
			}
			f1[i] += this.M_(i, 3);
		}
	}

	//---------------------------------------------------
	// ビューイング変換
	// world座標から視点座標へ
	//---------------------------------------------------
	lookat(vx, vy, vz,	/* 視点 */
		px, py, pz,	/* 注視点 */
		twist)		/* 回転 */
	{
		/*--- mov ---*/
		let t = new Matrix44();
		t.makeTranslate(-vx, -vy, -vz);
		/*--- rot y ---*/
		let l = Math.sqrt((px-vx)*(px-vx) + (pz-vz)*(pz-vz));
		let s = (px - vx) / l;
		let c = (vz - pz) / l;
		let ry = new Matrix44();
		ry.M_set(0, 0, c);
		ry.M_set(0, 2, s);
		ry.M_set(2, 0, -s);
		ry.M_set(2, 2, c);
		/*--- rot x ---*/
		l = Math.sqrt((px-vx)*(px-vx) + (py-vy)*(py-vy) + (pz-vz)*(pz-vz));
		s = (vy - py) / l;
		c = Math.sqrt((px-vx)*(px-vx) + (pz-vz)*(pz-vz)) / l;
		let rx = new Matrix44();
		rx.M_set(1, 1, c);
		rx.M_set(1, 2, -s);
		rx.M_set(2, 1, s);
		rx.M_set(2, 2, c);
		/*--- rot z ---*/
		let rz = new Matrix44();
		rz.makeRotZ(-twist);

		/*--- m = rz * rx * ry * t ----*/
		let m1 = new Matrix44();
		m1.MulMM(ry, t);	/* m1 = ry * t */
		let m2 = new Matrix44();
		m2.MulMM(rx, m1);	/* m2 = rx * m1 */
		this.MulMM(rz, m2);	/* m  = rz * m2 */
	}

	// todo
	lookat2(vx, vy, vz,	/* 視点 */
			px, py, pz,	/* 注視点 */
			ux, uy, uz)	/* Up */
	{
		let eye = [vx, vy, vz];
		let at  = [px, py, pz];
		let up  = [ux, uy, uz];

		let zaxis = V3.sub(eye, at);
		let xaxis = V3.cross(up, zaxis);

		if (V3.length(xaxis) <= 0) {
			up = [uz, ux, uy];
			xaxis = V3.cross(up, zaxis);
		}

		let yaxis = V3.cross(zaxis, xaxis);

		V3.normalize(xaxis);
		V3.normalize(yaxis);
		V3.normalize(zaxis);

		let m = [	[xaxis[0], yaxis[0], zaxis[0], 0],
					[xaxis[1], yaxis[1], zaxis[1], 0],
					[xaxis[2], yaxis[2], zaxis[2], 0],
					[-V3.dot(xaxis, eye), -V3.dot(yaxis, eye), -V3.dot(zaxis, eye),  1]
				];

		for (let x = 0; x < m.length; ++x) {
			let mx = m[x];
			for (let y = 0; y < mx.length; ++y) {
				let my = mx[y];
				this.M_set(y, x, my);
			}
		}
	}

	//---------------------------------------------------
	// 透視変換
	// 3D座標から2D座標へ
	//---------------------------------------------------
	perspective(fov,		/* y方向の角度 */
				aspect,		/* yに対するxのスペクト比 */
				near, far)	/* 最大最小 */
	{
		this.unit();

		/***********
		M_set(0, 0, Math.cot(fov / 20) / aspect);
		M_set(1, 1, Math.cot(fov / 20));
		***********/
		this.M_set(0, 0, (1.0 / (Math.tan(fov / 20.0) * aspect)));
		this.M_set(1, 1, (1.0 / Math.tan(fov / 20.0)));
		this.M_set(2, 2, -(far + near) / (far - near));
		this.M_set(3, 2, -1.0);
		this.M_set(2, 3, -2.0 * far * near / (far - near));
		this.M_set(3, 3, 0);
	}

	//---------------------------------------------------
	// 透視変換
	// 3D座標から2D座標へ
	//---------------------------------------------------
	window(left,   right,
		   bottom, top,
		   near,   far)
	{
		this.unit();

		this.M_set(0, 0, 2.0 * near / (right - left));
		this.M_set(1, 1, 2.0 * near / (top - bottom));
		this.M_set(2, 2, - (far + near) / (far - near));
		this.M_set(0, 2, (right + left) / (right - left));
		this.M_set(1, 2, (top + bottom) / (top - bottom));
		this.M_set(3, 2, -1.0);
		this.M_set(2, 3, -2.0 * far * near / (far - near));
		this.M_set(3, 3, 0.0);
	}

	//---------------------------------------------------
	// 正射影変換
	// 3D座標から2D座標へ
	//---------------------------------------------------
	ortho(left,   right,
		  bottom, top,
		  near,   far)
	{
		this.unit();

		this.M_set(0, 0, 2 / (right - left));
		this.M_set(1, 1, 2 / (top - bottom));
		this.M_set(2, 2, -2/ (far - near));
		this.M_set(0, 3, -(right + left) / (right - left));
		this.M_set(1, 3, -(top + bottom) / (top - bottom));
		this.M_set(2, 3, -(far + near) / (far - near));
	}

	//---------------------------------------------------
	// 正射影変換
	// 3D座標から2D座標へ
	//---------------------------------------------------
	ortho2(left,   right,
		   bottom, top)
	{
		this.unit();

		this.M_set(0, 0, 2 / (right - left));
		this.M_set(1, 1, 2 / (top - bottom));
		this.M_set(2, 2, -1);
		this.M_set(0, 3, -(right + left) / (right - left));
		this.M_set(1, 3, -(top + bottom) / (top - bottom));
	}

	//---------------------------------------------------
	// mにXYZの移動を加える
	//---------------------------------------------------
	dspxyz(dx, dy, dz)
	{
		if (dx)
		{
			this.M_add(0, 3, dx * this.M_(0, 0));
			this.M_add(1, 3, dx * this.M_(1, 0));
			this.M_add(2, 3, dx * this.M_(2, 0));
			this.M_add(3, 3, dx * this.M_(3, 0));
		}
		if (dy)
		{
			this.M_add(0, 3, dy * this.M_(0, 1));
			this.M_add(1, 3, dy * this.M_(1, 1));
			this.M_add(2, 3, dy * this.M_(2, 1));
			this.M_add(3, 3, dy * this.M_(3, 1));
		}
		if (dz)
		{
			this.M_add(0, 3, dz * this.M_(0, 2));
			this.M_add(1, 3, dz * this.M_(1, 2));
			this.M_add(2, 3, dz * this.M_(2, 2));
			this.M_add(3, 3, dz * this.M_(3, 2));
		}
	}
	
	//---------------------------------------------------
	// mにXの回転を加える(radian)
	//---------------------------------------------------
	rotxr(r)
	{
		const s = Math.sin(r);
		const c = Math.cos(r);

		for (let i = 0; i < 4; i++)
		{
			let tmp = this.M_(i, 1) * c + this.M_(i, 2) * s;
			this.M_set(i, 2, -this.M_(i, 1) * s + this.M_(i, 2) * c);
			this.M_set(i, 1, tmp);
		}
	}
	//---------------------------------------------------
	// mにYの回転を加える(radian)
	//---------------------------------------------------
	rotyr(r)
	{
		const s = Math.sin(r);
		const c = Math.cos(r);

		for (let i = 0; i < 4; i++)
		{
			let tmp = this.M_(i, 0) * c - this.M_(i, 2) * s;
			this.M_set(i, 2, this.M_(i, 0) * s + this.M_(i, 2) * c);
			this.M_set(i, 0, tmp);
		}
	}
	//---------------------------------------------------
	// mにZの回転を加える(radian)
	//---------------------------------------------------
	rotzr(r)
	{
		const s = Math.sin(r);
		const c = Math.cos(r);

		for (let i = 0; i < 4; i++)
		{
			let tmp = this.M_(i, 0) * c + this.M_(i, 1) * s;
			this.M_set(i, 1, -this.M_(i, 0) * s + this.M_(i, 1) * c);
			this.M_set(i, 0, tmp);
		}
	}

	//---------------------------------------------------
	// mにXのスケールを加える
	//---------------------------------------------------
	scalex(r)
	{
		for (let i = 0; i < 4; i++) {
			this.M_set(i, 0, this.M_(i, 0) * r);
		}
	}

	//---------------------------------------------------
	// this = (m1)-1 , invers matrix
	//---------------------------------------------------
	invert(m1)
	{
		let  mm = new Matrix44();

		this.unit();
    	/* get determinant */
		mm.m[0][0] =  ( m1.m[1][1] * m1.m[2][2] * m1.m[3][3]
					   +m1.m[1][2] * m1.m[2][3] * m1.m[3][1]
					   +m1.m[1][3] * m1.m[2][1] * m1.m[3][2]
					   -m1.m[1][3] * m1.m[2][2] * m1.m[3][1]
					   -m1.m[1][2] * m1.m[2][1] * m1.m[3][3]
					   -m1.m[1][1] * m1.m[2][3] * m1.m[3][2]);

		mm.m[0][1] = -( m1.m[0][1] * m1.m[2][2] * m1.m[3][3]
					   +m1.m[0][2] * m1.m[2][3] * m1.m[3][1]
					   +m1.m[0][3] * m1.m[2][1] * m1.m[3][2]
					   -m1.m[0][3] * m1.m[2][2] * m1.m[3][1]
					   -m1.m[0][2] * m1.m[2][1] * m1.m[3][3]
					   -m1.m[0][1] * m1.m[2][3] * m1.m[3][2]);

		mm.m[0][2] =  ( m1.m[0][1] * m1.m[1][2] * m1.m[3][3]
					   +m1.m[0][2] * m1.m[1][3] * m1.m[3][1]
					   +m1.m[0][3] * m1.m[1][1] * m1.m[3][2]
					   -m1.m[0][3] * m1.m[1][2] * m1.m[3][1]
					   -m1.m[0][2] * m1.m[1][1] * m1.m[3][3]
					   -m1.m[0][1] * m1.m[1][3] * m1.m[3][2]);

		mm.m[0][3] = -( m1.m[0][1] * m1.m[1][2] * m1.m[2][3]
					   +m1.m[0][2] * m1.m[1][3] * m1.m[2][1]
					   +m1.m[0][3] * m1.m[1][1] * m1.m[2][2]
					   -m1.m[0][3] * m1.m[1][2] * m1.m[2][1]
					   -m1.m[0][2] * m1.m[1][1] * m1.m[2][3]
					   -m1.m[0][1] * m1.m[1][3] * m1.m[2][2]);

		let det =	m1.m[0][0] * mm.m[0][0] +
					m1.m[1][0] * mm.m[0][1] +
					m1.m[2][0] * mm.m[0][2] +
					m1.m[3][0] * mm.m[0][3];
		if (det == 0.0) {
			return;
		}
		det = 1.0 / det;

		mm.m[1][0] = -( m1.m[1][0] * m1.m[2][2] * m1.m[3][3]
					   +m1.m[1][2] * m1.m[2][3] * m1.m[3][0]
					   +m1.m[1][3] * m1.m[2][0] * m1.m[3][2]
					   -m1.m[1][3] * m1.m[2][2] * m1.m[3][0]
					   -m1.m[1][2] * m1.m[2][0] * m1.m[3][3]
					   -m1.m[1][0] * m1.m[2][3] * m1.m[3][2]);

		mm.m[2][0] =  ( m1.m[1][0] * m1.m[2][1] * m1.m[3][3]
					   +m1.m[1][1] * m1.m[2][3] * m1.m[3][0]
					   +m1.m[1][3] * m1.m[2][0] * m1.m[3][1]
					   -m1.m[1][3] * m1.m[2][1] * m1.m[3][0]
					   -m1.m[1][1] * m1.m[2][0] * m1.m[3][3]
					   -m1.m[1][0] * m1.m[2][3] * m1.m[3][1]);

		mm.m[3][0] = -( m1.m[1][0] * m1.m[2][1] * m1.m[3][2]
					   +m1.m[1][1] * m1.m[2][2] * m1.m[3][0]
					   +m1.m[1][2] * m1.m[2][0] * m1.m[3][1]
					   -m1.m[1][2] * m1.m[2][1] * m1.m[3][0]
					   -m1.m[1][1] * m1.m[2][0] * m1.m[3][2]
					   -m1.m[1][0] * m1.m[2][2] * m1.m[3][1]);

		mm.m[1][1] =  ( m1.m[0][0] * m1.m[2][2] * m1.m[3][3]
					   +m1.m[0][2] * m1.m[2][3] * m1.m[3][0]
					   +m1.m[0][3] * m1.m[2][0] * m1.m[3][2]
					   -m1.m[0][3] * m1.m[2][2] * m1.m[3][0]
					   -m1.m[0][2] * m1.m[2][0] * m1.m[3][3]
					   -m1.m[0][0] * m1.m[2][3] * m1.m[3][2]);

		mm.m[2][1] = -( m1.m[0][0] * m1.m[2][1] * m1.m[3][3]
					   +m1.m[0][1] * m1.m[2][3] * m1.m[3][0]
					   +m1.m[0][3] * m1.m[2][0] * m1.m[3][1]
					   -m1.m[0][3] * m1.m[2][1] * m1.m[3][0]
					   -m1.m[0][1] * m1.m[2][0] * m1.m[3][3]
					   -m1.m[0][0] * m1.m[2][3] * m1.m[3][1]);

		mm.m[3][1] =  ( m1.m[0][0] * m1.m[2][1] * m1.m[3][2]
					   +m1.m[0][1] * m1.m[2][2] * m1.m[3][0]
					   +m1.m[0][2] * m1.m[2][0] * m1.m[3][1]
					   -m1.m[0][2] * m1.m[2][1] * m1.m[3][0]
					   -m1.m[0][1] * m1.m[2][0] * m1.m[3][2]
					   -m1.m[0][0] * m1.m[2][2] * m1.m[3][1]);

		mm.m[1][2] = -( m1.m[0][0] * m1.m[1][2] * m1.m[3][3]
					   +m1.m[0][2] * m1.m[1][3] * m1.m[3][0]
					   +m1.m[0][3] * m1.m[1][0] * m1.m[3][2]
					   -m1.m[0][3] * m1.m[1][2] * m1.m[3][0]
					   -m1.m[0][2] * m1.m[1][0] * m1.m[3][3]
					   -m1.m[0][0] * m1.m[1][3] * m1.m[3][2]);

		mm.m[2][2] =  ( m1.m[0][0] * m1.m[1][1] * m1.m[3][3]
					   +m1.m[0][1] * m1.m[1][3] * m1.m[3][0]
					   +m1.m[0][3] * m1.m[1][0] * m1.m[3][1]
					   -m1.m[0][3] * m1.m[1][1] * m1.m[3][0]
					   -m1.m[0][1] * m1.m[1][0] * m1.m[3][3]
					   -m1.m[0][0] * m1.m[1][3] * m1.m[3][1]);

		mm.m[3][2] = -( m1.m[0][0] * m1.m[1][1] * m1.m[3][2]
					   +m1.m[0][1] * m1.m[1][2] * m1.m[3][0]
					   +m1.m[0][2] * m1.m[1][0] * m1.m[3][1]
					   -m1.m[0][2] * m1.m[1][1] * m1.m[3][0]
					   -m1.m[0][1] * m1.m[1][0] * m1.m[3][2]
					   -m1.m[0][0] * m1.m[1][2] * m1.m[3][1]);

		mm.m[1][3] =  ( m1.m[0][0] * m1.m[1][2] * m1.m[2][3]
					   +m1.m[0][2] * m1.m[1][3] * m1.m[2][0]
					   +m1.m[0][3] * m1.m[1][0] * m1.m[2][2]
					   -m1.m[0][3] * m1.m[1][2] * m1.m[2][0]
					   -m1.m[0][2] * m1.m[1][0] * m1.m[2][3]
					   -m1.m[0][0] * m1.m[1][3] * m1.m[2][2]);

		mm.m[2][3] = -( m1.m[0][0] * m1.m[1][1] * m1.m[2][3]
					   +m1.m[0][1] * m1.m[1][3] * m1.m[2][0]
					   +m1.m[0][3] * m1.m[1][0] * m1.m[2][1]
					   -m1.m[0][3] * m1.m[1][1] * m1.m[2][0]
					   -m1.m[0][1] * m1.m[1][0] * m1.m[2][3]
					   -m1.m[0][0] * m1.m[1][3] * m1.m[2][1]);

		mm.m[3][3] =  ( m1.m[0][0] * m1.m[1][1] * m1.m[2][2]
					   +m1.m[0][1] * m1.m[1][2] * m1.m[2][0]
					   +m1.m[0][2] * m1.m[1][0] * m1.m[2][1]
					   -m1.m[0][2] * m1.m[1][1] * m1.m[2][0]
					   -m1.m[0][1] * m1.m[1][0] * m1.m[2][2]
					   -m1.m[0][0] * m1.m[1][2] * m1.m[2][1]);

		this.m[0][0] = det * mm.m[0][0];
		this.m[0][1] = det * mm.m[0][1];
		this.m[0][2] = det * mm.m[0][2];
		this.m[0][3] = det * mm.m[0][3];
		this.m[1][0] = det * mm.m[1][0];
		this.m[1][1] = det * mm.m[1][1];
		this.m[1][2] = det * mm.m[1][2];
		this.m[1][3] = det * mm.m[1][3];
		this.m[2][0] = det * mm.m[2][0];
		this.m[2][1] = det * mm.m[2][1];
		this.m[2][2] = det * mm.m[2][2];
		this.m[2][3] = det * mm.m[2][3];
		this.m[3][0] = det * mm.m[3][0];
		this.m[3][1] = det * mm.m[3][1];
		this.m[3][2] = det * mm.m[3][2];
		this.m[3][3] = det * mm.m[3][3];
	}
}

class V3 {
	static dot(a, b) {
		return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
	}

	static length(a) {
		let len = V3.dot(a, a);
		return Math.sqrt(len);
	}

	static normalize(a) {
		let len = V3.length(a);
		a[0] /= len;
		a[1] /= len;
		a[2] /= len;
	}

	static sub(a, b) { // a - b
		let c = [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
		return c;
	}

	static cross(a, b) { // a - b
		let c = [	a[1] * b[2] - a[2] * b[1],
					a[2] * b[0] - a[0] * b[2],
					a[0] * b[1] - a[1] * b[0]
				];
		return c;
	}
}

