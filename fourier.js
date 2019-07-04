// Locate elements
const transverse = document.querySelector('#transverse');
const modes = document.querySelector('#modes');
const v = document.querySelector('input#v');
const a = document.querySelector('input#a');
const volume = document.querySelector('input#volume');
const fixed = document.querySelector('input#fixed');

// Setup number of particles and modes
const N = 100;
const m = 10;

// Render particles and modes
for(let i=0; i<=N+1; i++) transverse.innerHTML += '<div></div>';
for(let n=1; n<=m; n++) modes.innerHTML += '<label><span>'+n+'</span><input type="checkbox" id="b'+n+'" checked></label>';

// Check-all modes
document.querySelector('input#all').addEventListener('change', function(){
	document.querySelectorAll('#modes input').forEach(mode => mode.checked = this.checked);
});

// Predefined positions
document.querySelectorAll('button[data-a]').forEach(button => {
	button.addEventListener('click', () => a.value = 1/button.dataset.a);
});

// Setup coefficient arrays
const real = new Float32Array(m+1);
const imag = new Float32Array(m+1);

// Setup context and oscillator
const context = new AudioContext();
const oscillator = context.createOscillator();

// Setup gain node
const gain = context.createGain();
gain.gain.value = 0;

// Setup visualizer
const visualizer = new Visualizer(context);
visualizer.timeDomain = new Canvas(document.querySelector('canvas#timeDomain'));
visualizer.frequencyDomain = new Canvas(document.querySelector('canvas#frequencyDomain'));

// Setup audio graph
oscillator.connect(gain);
gain.connect(visualizer.analyser);
visualizer.analyser.connect(context.destination);

// Apply settings
setInterval(() => {
	oscillator.setPeriodicWave(context.createPeriodicWave(real, imag, {disableNormalization: true}));
	oscillator.frequency.setValueAtTime(v.value * 100, context.currentTime);
	gain.gain.value = volume.value;
}, 100);

// Start oscillator after interaction
volume.addEventListener('input', () => oscillator.start(), {once: true});

// Play/Pause animation
transverse.addEventListener('click', () => { paused = !paused; });

// Animation loop
let paused = true;
let buffer = 0;
let t = 0;
function animate(timestamp) {
	if(!timestamp) timestamp = 0;
	
	// Calculate t
	const next = (timestamp / 1000) - buffer;
	if(paused) buffer+= next - t;
	t = (timestamp / 1000) - buffer;
	
	// Transverse wave
	transverse.childNodes.forEach((item, p) => {
		let x = p / (N+1);
		
		// Reset total elongation
		let y = 0;
		
		// Iterate through normal modes
		for(let n=1; n<=m; n++) {
			const k = n * Math.PI;
			const w = k * (v.value / 10);
			const d = 1/10;
			
			// Reset coefficients
			let a_n = 0;
			let b_n = 0;
			
			// Calculate coefficients
			if(type.value == 1) {
				if(fixed.checked) b_n = -Math.sin(Math.PI * a.value * n) / (Math.pow(Math.PI * n, 2) * a.value * (a.value - 1));
				else a_n = (a.value * Math.cos(Math.PI * n) - a.value + 1 - Math.cos(Math.PI * n * a.value)) / (Math.pow(Math.PI * n, 2) * a.value * (a.value - 1));
			} else {
				if(fixed.checked) b_n = (Math.cos((a.value - d) * n * Math.PI) - Math.cos((parseFloat(a.value) + d) * n * Math.PI)) / (n * Math.PI);
				else a_n = (Math.sin((a.value - d) * n * Math.PI) - Math.sin((parseFloat(a.value) + d) * n * Math.PI)) / (n * Math.PI);
			}
			
			// Add coefficients and elongation if checked
			if(document.querySelector('input#b'+n+'').checked) {
				real[n] = a_n;
				imag[n] = b_n;
				y+= transverse.offsetHeight * a_n * Math.cos(k*x) * Math.cos(w*t);
				y+= transverse.offsetHeight * b_n * Math.sin(k*x) * Math.cos(w*t);
			} else {
				real[n] = 0;
				imag[n] = 0;
			}
		}
		
		// Apply elongation
		item.style.transform = 'translateY('+y+'px)'
	});
	
	// Recursion
	window.requestAnimationFrame(animate);	
} animate();
