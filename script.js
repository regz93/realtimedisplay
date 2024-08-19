// Configuration de la scène, de la caméra et du renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, 960 / 540, 0.1, 1000);  // Ratio d'aspect ajusté
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(960, 540);  // Taille fixe pour correspondre à la section
document.getElementById('globe-container').appendChild(renderer.domElement);

// Ajout d'un globe avec texture
const globe = new ThreeGlobe()
    .globeImageUrl('https://unpkg.com/three-globe/example/img/earth-dark.jpg') // Texture de la Terre
    .bumpImageUrl('https://unpkg.com/three-globe/example/img/earth-topology.png'); // Topologie de la Terre

// Données des points lumineux (Paris, Montréal, Bangkok)
const pointsData = [
    { lat: 48.8566, lng: 2.3522, size: 0.5, color: 'red' },  // Paris
    { lat: 45.5017, lng: -73.5673, size: 0.5, color: 'red' },  // Montréal
    { lat: 13.7563, lng: 100.5018, size: 0.5, color: 'red' }   // Bangkok
];

// Ajout des points lumineux au globe
globe
    .pointsData(pointsData)
    .pointAltitude(0.1) // Altitude des points par rapport à la surface du globe
    .pointRadius(0.3)   // Taille des points
    .pointColor('color');

// Ajout du globe à la scène
scene.add(globe);

// Positionnement de la caméra
camera.position.z = 300;

// Ajout d'une lumière ambiante
const ambientLight = new THREE.AmbientLight(0xffffff, 1);
scene.add(ambientLight);

// Fonction d'animation
function animate() {
    requestAnimationFrame(animate);
    globe.rotation.y += 0.001;  // Vitesse de rotation du globe
    renderer.render(scene, camera);
}

// Démarrage de l'animation
animate();

// Réajustement de la taille du rendu en cas de redimensionnement de la fenêtre
window.addEventListener('resize', () => {
    camera.aspect = 960 / 540;  // Ratio d'aspect pour la section
    camera.updateProjectionMatrix();
    renderer.setSize(960, 540);
});
