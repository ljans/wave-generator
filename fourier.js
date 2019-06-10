// Locate elements
const transverse = document.querySelector('.transverse');
const modes = document.querySelector('.modes');
const v = document.querySelector('input[name="v"]');
const a = document.querySelector('input[name="a"]');
const volume = document.querySelector('input[name="volume"]');

// Setup number of particles and modes
const N = 100;
const m = 10;

// Render particles and modes
for(let i=0; i<=N+1; i++) transverse.innerHTML += '<div></div>';
for(let n=1; n<=m; n++) modes.innerHTML += '<label><span>'+n+'</span><input type="checkbox" name="b'+n+'" checked></label>';

// Check-all modes
document.querySelector('input[name="all"]').addEventListener('change', function(){
	document.querySelectorAll('.modes input').forEach(mode => mode.checked = this.checked);
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

// Animation loop
function animate(timestamp) {
	const t = timestamp / 1000;
	
	// Transverse wave
	document.querySelector('.transverse').childNodes.forEach((item, p) => {
		const x = p / (N+1);
		
		// Reset total elongation
		let y = 0;
		
		// Iterate through normal modes
		for(let n=1; n<=m; n++) {
			const k = n * Math.PI;
			const w = k * (v.value / 10);
			
			// Calculate amplitude
			const A = Math.sin(Math.PI * a.value * n) / (Math.PI * a.value * Math.pow(n, 2) * (a.value - 1));
			
			// Add coefficients and elongation if checked
			if(document.querySelector('input[name="b'+n+'"]').checked) {
				imag[n] = A;
				y+= 80 * A * Math.sin(k*x) * Math.cos(w*t);
			} else imag[n] = 0;
		}
		
		// Apply elongation
		item.style.transform = 'translateY('+y+'px)'
	});
	
	// Recursion
	window.requestAnimationFrame(animate);	
} animate();
