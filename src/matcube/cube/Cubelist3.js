//--------------------------------------------------------------
//  Cubelist3
//--------------------------------------------------------------
class Cubelist3 extends Cubelist {
	//--------------------------
	//
	//--------------------------
	constructor(x, y, style)
	{
		super(x, y, style);
		this.setEmpty(0, 0);
		this.moveDir = CubelistDef.DIR_NONE;
	}

	/*--------------------------------------

	  --------------------------------------*/
	initlist()
    {
		super.initlist();
		this.setEmpty(0, 0);
	}

	/*--------------------------------------

	  --------------------------------------*/
	moveStartEach(hx, hy, negative)
	{
		let emp = [0, 0];

		if (!this.whichEmpty(emp)) {
			return 0;
		}
		if (hx != emp[0] && hy != emp[1]) {
			return 0;
		}
		if (this.active(hx, emp[0], hy, emp[1]) == 0) {
			return 0;
		}

		if (emp[0] - hx > 0)		{ this.moveDir = CubelistDef.DIR_X;  this.drawDir = true; }
		else if (emp[0] - hx < 0)	{ this.moveDir = CubelistDef.DIR_NX; this.drawDir = true; }
		else if (emp[1] - hy > 0)	{ this.moveDir = CubelistDef.DIR_Z;  this.drawDir = false; }
		else if (emp[1] - hy < 0)	{ this.moveDir = CubelistDef.DIR_NZ; this.drawDir = false; }
		else	return 0;

		this.movePos  = 0.0;
		this.moveFlag = CubelistDef.DIR_EACH;
		return 1;
	}

    /*----------------------------------------------------
    public int	endMoveEach()
	{
    	int			count = 0, mflag;
	
		if (moveFlag != DIR_EACH)
			return 0;
		movePos = 1.0f;

		count = doRoteEach(true);
		moveFlag = DIR_CHECK;
		movePos = 0.0f;
		return count;
	}
	  ----------------------------------------------------*/

    /*----------------------------------------------------

	  ----------------------------------------------------*/
	doRoteEach(endflag)
	{
		const org_px = [ 1, -1,  0];
		const org_nx = [-1, -1,  0];
		const org_pz = [ 0, -1,  1];
		const org_nz = [ 0, -1, -1];
		
		//int		i, j, count = 0, ix, iz;
		//float	rx, ry, rz, dx, dy, dz, org[], dl;
		
		let rx = 0;
		let ry = 0;
		let rz = 0;
		let dx = 0;
		let dy = 0;
		let dz = 0;
		let ix = 0;
		let iz = 0;
		let dl = CubelistDef.BOX_INTERVAL - 2;
		let org;
		let count = 0;
		switch (this.moveDir)
		{
			case CubelistDef.DIR_X:
				org	= org_px;
				rz	= -Math.PI * this.movePos / 2.0;
				dx	= this.movePos * dl;
				ix	= 1;
				break;
			case CubelistDef.DIR_NX:
				org	= org_nx;
				rz	= Math.PI * this.movePos / 2.0;
				dx	= -this.movePos * dl;
				ix	= -1;
				break;
			case CubelistDef.DIR_Z:
				org	= org_pz;
				rx  = Math.PI * this.movePos / 2.0;
				dz	= this.movePos * dl;
				iz	= 1;
				break;
			case CubelistDef.DIR_NZ:
				org	= org_nz;
				rx	= -Math.PI * this.movePos / 2.0;
				dz	= -this.movePos * dl;
				iz	= -1;
				break;
			default:
				return 0;
				// break;
		}
		if (!endflag)
		{
			let mr = new Matrix44();
			mr.makeRotPoint(org[0], org[1], org[2], rx, ry, rz);
			let mt = new Matrix44();
			mt.makeTranslate(dx, dy, dz);
			mt.MulMM(mt, mr);
			// mt.MulMM(mr, mt);

			for (let i = 0; i < this.xlen; i++)
			{
				for (let j = 0; j < this.ylen; j++)
				{
					let p = this.getData(i, j);
					if (p == null) {
						continue;
					}
					if (!p.active_flag) {
						continue;
					}
					p.m.MulMM(mt, p.m0);
					count++;
				}
			}
		}
		else
		{
			for (let i = 0; i < this.xlen; i++)
			{
				for (let j = 0; j < this.ylen; j++)
				{
					let p = this.getData(i, j);
					if (p == null) {
						continue;
					}
					if (!p.active_flag) {
						continue;
					}
					p.rotMatrix(rx, ry, rz);
					p.adjustMatrix();
					p.updata6FaceId();
					count++;
				}
			}
			this.transActiveToEmpty(ix, iz);
		}
		return count;
	}
}

