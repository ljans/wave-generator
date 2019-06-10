// Number of particles
const N = 100;

// Setup particles
for(let p=0; p<=N+1; p++) document.querySelector('.transverse').innerHTML += '<div></div>';

// Setup molecules
for(let p=0; p<300; p++) {
	const atom = document.createElement('div');
	const longitudinal = document.querySelector('.longitudinal');
	atom.style.left = Math.random() * longitudinal.offsetWidth + 'px';
	atom.style.top = Math.random() * longitudinal.offsetHeight + 'px';
	longitudinal.appendChild(atom);
}

// Connect settings
const standing = document.querySelector('input[name="standing"]');
const v = document.querySelector('input[name="v"]');
const l = document.querySelector('input[name="l"]');

// Animation loop
function animate(timestamp) {
	const t = timestamp / 1000;
	
	// Calculate global values
	const k = (2 * Math.PI) / l.value;
	const w = k * (v.value / 10);
	
	// Transverse wave
	document.querySelector('.transverse').childNodes.forEach((item, p) => {
		const x = p / (N+1);
		const A = item.parentNode.offsetHeight / 2;
		
		// Calculate standing/travelling wave
		if(standing.checked) item.style.transform = 'translateY(' + (-A) * Math.sin(k*x) * Math.cos(w*t) + 'px)';
		else item.style.transform = 'translateY(' + (-A) * Math.cos(k*x - w*t) + 'px)';
	});
	
	// Longitudinal wave
	document.querySelector('.longitudinal').childNodes.forEach((item, p) => {
		const x = item.offsetLeft / item.parentNode.offsetWidth;
		const A = (l.value / 6) * item.parentNode.offsetWidth;
		
		// Calculate standing/travelling wave
		if(standing.checked) item.style.transform = 'translateX(' + A * Math.sin(k*x) * Math.cos(w*t) + 'px)';
		else item.style.transform = 'translateX(' + A * Math.cos(k*x - w*t) + 'px)';
	});
	
	// Recursion
	window.requestAnimationFrame(animate);	
} animate();
