//--------------------------------------------------------------
//  Cubelist4
//--------------------------------------------------------------
class Cubelist4 extends Cubelist {
	//--------------------------
	//
	//--------------------------
	constructor(x, y, style)
	{
		super(x, y, style);
		this.emptyList();
	}

	/*--------------------------------------

	  --------------------------------------*/
	initlist()
    {
		super.initlist();
		this.emptyList();
	}

	/*-------------------------------------

	-------------------------------------*/
	emptyList()
	{
		for (let i = 0; i < this.xlen; i++)
		{
			for (let j = 0; j < this.ylen; j++)
			{
				if (i + j < this.xlen) {
					continue;
				}
				this.setEmpty(i, j);
			}
		}
	}

    /*-----------------------------------------------

	  -----------------------------------------------*/
	getDrawPos(x, y, p)
	{
		/*
		p[0] =  (((float)x - ((float)xlen - 1f) / 2f)) * BOX_INTERVAL;
		p[1] = 0f;
		p[2] = (((float)y - ((float)ylen - 1f) / 2f)) * BOX_INTERVAL;
		*/
		p[0] = (x - (this.xlen - 1) / 2) * Cubelist.BOX_INTERVAL_NON;
		p[1] = -(x + y - 2) * Cubelist.BOX_INTERVAL_NON - 3.0;
		p[2] = (y - (this.ylen - 1) / 2) * Cubelist.BOX_INTERVAL_NON;
	}

	/*-------------------------------------

	-------------------------------------*/
	moveStartEach(hx, hy, negative)
	{
		for (let i = 0; i < this.xlen; i++)
		{
			let p = this.getData(i, hy);
			if (p == null) {
				continue;
			}
			if (i == hx - 1)
			{
				if (negative)	p.user_flag = Cubelist.DIR_NZ;
				else			p.user_flag = Cubelist.DIR_Z;
			}
			if (i == hx + 1)
			{
				if (negative)	p.user_flag = Cubelist.DIR_Z;
				else			p.user_flag = Cubelist.DIR_NZ;
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
			if (i == hy - 1)
			{
				if (negative)	p.user_flag = Cubelist.DIR_X;
				else			p.user_flag = Cubelist.DIR_NX;
			}
			if (i == hy + 1)
			{
				if (negative)	p.user_flag = Cubelist.DIR_NX;
				else			p.user_flag = Cubelist.DIR_X;
			}
			else {
				continue;
			}
		}
		if (hx - 1 >= 0 && hy + 1 < this.ylen)
		{
			let p = this.getData(hx - 1, hy + 1);
			if (p != null)
			{
				if (negative)	p.user_flag = Cubelist.DIR_Y;
				else			p.user_flag = Cubelist.DIR_NY;
			}
		}
		if (hy - 1 >= 0 && hx + 1 < this.xlen)
		{
			let p = this.getData(hx + 1, hy - 1);
			if (p != null)
			{
				if (negative)	p.user_flag = Cubelist.DIR_NY;
				else			p.user_flag = Cubelist.DIR_Y;
			}
		}

		this.movePos  = 0.0;
		this.moveFlag = Cubelist.DIR_EACH;
		return 1;
	}
}
