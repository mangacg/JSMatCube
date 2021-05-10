//--------------------------------------------------------------
//  Cubelist2
//--------------------------------------------------------------
class Cubelist2 extends Cubelist {
	//--------------------------
	//
	//--------------------------
	constructor(x, y, style)
	{
		super(x, y, style);
	}

	//--------------------------
	//
	//--------------------------
	moveStartEach(hx, hy, negative)
	{
		for (let i = 0; i < this.xlen; i++)
		{
			let p = this.getData(i, hy);
			if (p == null) {
				continue;
			}
			if (i <= hx - 1)
			{
				if (negative)	p.user_flag = CubelistDef.DIR_NZ;
				else			p.user_flag = CubelistDef.DIR_Z;
			}
			if (i >= hx + 1)
			{
				if (negative)	p.user_flag = CubelistDef.DIR_Z;
				else			p.user_flag = CubelistDef.DIR_NZ;
			}
			else {
				continue;
			}
		}
		for (let i = 0; i < this.ylen; i++)
		{
			let p = this.getData(hx, i);
			if (p == null) {
				continue;
			}
			if (i <= hy - 1)
			{
				if (negative)	p.user_flag = CubelistDef.DIR_X;
				else			p.user_flag = CubelistDef.DIR_NX;
			}
			if (i >= hy + 1)
			{
				if (negative)	p.user_flag = CubelistDef.DIR_NX;
				else			p.user_flag = CubelistDef.DIR_X;
			}
			else {
				continue;
			}
		}
		this.movePos  = 0.0;
		this.moveFlag = CubelistDef.DIR_EACH;
		return 1;
	}
}

