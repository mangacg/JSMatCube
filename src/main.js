let MC = {};
MC.canvas = document.getElementById("myCanvas");
MC.ctx    = MC.canvas.getContext("2d");
MC.game   = CubeGame.GetInstance();
MC.click1Sound = document.getElementById("click1Sound");
MC.click2Sound = document.getElementById("click2Sound");

init();
updateFrame();

function init() {
	MC.game.setCubeSize(1);
	MC.game.setCubeStage(4);
	MC.game.shuffleCube();
	MC.game.enableSound(true);
}

// main loop
function updateFrame() {
    requestAnimationFrame(updateFrame);

	let time = Date.now();
	let deltatime = 0;
	if (MC.time) {
		deltatime = time - MC.time;
	}
	MC.time = time;

	// console.log("deltatime = " + deltatime); //16
	let state = MC.game.update(deltatime);

	if (state.redraw) {
		MC.game.draw(MC.ctx, MC.canvas.width, MC.canvas.height);
	}
	if (state.sound == 0) {	
		MC.click1Sound.currentTime = 0;
		MC.click1Sound.play();
	} else if (state.sound == 1) {
		MC.click2Sound.currentTime = 0;
		MC.click2Sound.play();
	}
}

// click
MC.canvas.addEventListener('mousedown', function(event) {
	let rect = MC.canvas.getBoundingClientRect();
    let x = event.clientX - rect.left;
    let y = event.clientY - rect.top;
	let isNotLeft = event.button != 0;
	MC.game.click(x, y, isNotLeft);
});

// touch
MC.canvas.addEventListener('touchstart', function(event) {
	if (event.touches.length != 1) {
		return;
	}
	event.preventDefault();

	let rect      = MC.canvas.getBoundingClientRect();
	let t         = event.touches[0];
    let x         = t.pageX - rect.left;
    let y         = t.pageY - rect.top;
	let isNotLeft = event.touches.length != 1;
	MC.game.click(x, y, isNotLeft);
}, false);

// shuffle
let shuffleBtn = document.getElementById('shuffleBtn');
shuffleBtn.addEventListener('click', function() {
	if (!window.confirm("シャッフルしても良いですか?")) {
		return;
	}
	MC.game.shuffleCube();
});

// reset
let resetBtn = document.getElementById('resetBtn');
resetBtn.addEventListener('click', function() {
	if (!window.confirm("初期化しても良いですか?")) {
		return;
	}
	MC.game.resetCube();
});

// size
let sizeSel = document.getElementById('sizeSel');
sizeSel.options[MC.game.getCubeSize()].selected = true;
sizeSel.addEventListener('change', function(event) {
	let index = event.currentTarget.selectedIndex;
	MC.game.setCubeSize(index);
});

// stage
let stageSel = document.getElementById('stageSel');
stageSel.options[MC.game.getCubeStage()].selected = true;
stageSel.addEventListener('change', function(event) {
	let index = event.currentTarget.selectedIndex;
	MC.game.setCubeStage(index);
});

// sound
let soundCheck = document.getElementById('soundCheck');
soundCheck.checked = MC.game.isSoundEnable();
soundCheck.addEventListener('change', function(event) {
	let b = event.currentTarget.checked;
	MC.game.enableSound(b);
});

