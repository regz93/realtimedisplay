let count1 = 0;
let count2 = 0;

const counterElement1 = document.getElementById('counter1');
const counterElement2 = document.getElementById('counter2');

let previousAngle1 = 0;
let previousAngle2 = 0;

let soundEnabled = false; // Variable pour suivre si l'utilisateur a interagi

// Charger l'élément audio (Option pour un futur usage si nécessaire)
const notificationSound = document.getElementById('notification-sound');

// Détection d'une interaction utilisateur subtile (défilement ou mouvement de souris)
function enableSoundOnUserInteraction() {
    if (!soundEnabled) {
        soundEnabled = true;
        console.log("Son activé après l'interaction utilisateur subtile.");
    }
}

// Activer le son lorsque l'utilisateur interagit subtilement (défilement ou mouvement de souris)
window.addEventListener('scroll', enableSoundOnUserInteraction);
window.addEventListener('mousemove', enableSoundOnUserInteraction);

function triggerConfetti() {
    console.log("Triggering confetti!"); // Pour débogage
    confetti({
        particleCount: 400,
        spread: 200,
        origin: { y: 0.6 }
    });
}

// Fonction pour jouer le son dans une nouvelle fenêtre
function playNotificationSound() {
    const soundUrl = "https://cdn.shopify.com/s/files/1/0705/7142/6045/files/Air_Raid_Siren_Sound_Effect.mp3?v=1726496593";
    const popupWindow = window.open(soundUrl, "popupWindow", "width=300,height=100,left=100,top=100");
    if (popupWindow) {
        popupWindow.focus(); // Mettre la nouvelle fenêtre en avant
    }
}

function updateCounter(counterElement, count, previousCount) {
    const formattedCount = count.toString().padStart(4, '0');
    const currentDigits = Array.from(counterElement.querySelectorAll('.digit-new')).map(digit => digit.textContent.trim());

    let newHtml = '';
    formattedCount.split('').forEach((digit, index) => {
        const currentDigit = currentDigits[index] || '0';
        if (digit !== currentDigit) {
            newHtml += `
            <div class="digit-wrapper roll-up">
                <div class="digit digit-old">${currentDigit}</div>
                <div class="digit digit-new">${digit}</div>
            </div>`;
        } else {
            newHtml += `
            <div class="digit-wrapper">
                <div class="digit digit-new">${digit}</div>
            </div>`;
        }
    });

    counterElement.innerHTML = newHtml;

    setTimeout(() => {
        counterElement.querySelectorAll('.roll-up').forEach(element => element.classList.remove('roll-up'));
        counterElement.querySelectorAll('.roll-down').forEach(element => element.classList.remove('roll-down'));
    }, 600);

    // Vérifier si le compteur atteint un multiple de 10 pour déclencher les confettis
    if (Math.floor(count / 10) > Math.floor(previousCount / 10)) {
        triggerConfetti();
    }
    
    // Déclencher le son pour counter2 uniquement si le compteur change
    if (counterElement === counterElement2 && count !== previousCount) {
        playNotificationSound(); // Jouer le son
    }
}

function createGauge(containerId, value, maxPoints, previousAngle, color, squareClass) {
    var container = document.getElementById(containerId);
    var w = container.offsetWidth; // Largeur du conteneur
    var h = w / 2; // Hauteur pour un demi-cercle
    var outerRadius = w / 2;
    var innerRadius = w / 2 - 20;

    var percent = value / maxPoints * 100;
    var ratio = percent / 100;
    var newAngle = Math.PI * ratio;

    var arc = d3.svg.arc()
        .innerRadius(innerRadius)
        .outerRadius(outerRadius)
        .startAngle(0)
        .endAngle(Math.PI);

    var arcLine = d3.svg.arc()
        .innerRadius(innerRadius)
        .outerRadius(outerRadius)
        .startAngle(0);

    var svg = d3.select("#" + containerId)
        .append("svg")
        .attr("width", w)
        .attr("height", h)
        .append("g")
        .attr("transform", "translate(" + w / 2 + "," + h + ")");

    svg.append("path")
        .attr("d", arc)
        .attr("transform", "rotate(-90)")
        .style("fill", "#ddd");

    var pathForeground = svg.append("path")
        .datum({ endAngle: previousAngle }) // Utiliser l'angle précédent ici
        .attr("d", arcLine)
        .attr("transform", "rotate(-90)")
        .style("fill", color);

    pathForeground.transition()
        .duration(750)
        .ease("cubic")
        .attrTween("d", function(d) {
            var interpolate = d3.interpolate(d.endAngle, newAngle); // Interpoler à partir de l'angle précédent
            return function(t) {
                d.endAngle = interpolate(t);
                return arcLine(d);
            };
        });

    // Création du carré au milieu de la jauge
    var squareSize = 80; // Taille du carré
    var square = svg.append("rect")
        .attr("x", -squareSize / 2)
        .attr("y", outerRadius - squareSize / 2)
        .attr("width", squareSize)
        .attr("height", squareSize)
        .attr("fill", "#fff")
        .attr("stroke", color)
        .attr("stroke-width", 2)
        .attr("class", squareClass);

    // Texte dans le carré
    var text = svg.append("text")
        .attr("class", "gauge-text")
        .attr("x", 0)
        .attr("y", 0)
        .text(`${Math.round(percent)}%`); // Afficher le pourcentage actuel

    // Ajouter des étiquettes à l'origine et à la fin de la jauge
    svg.append("text")
        .attr("x", -w / 2 + 10)
        .attr("y", outerRadius + 20)
        .attr("class", "gauge-text")
        .text("0");

    svg.append("text")
        .attr("x", w / 2 - 10)
        .attr("y", outerRadius + 20)
        .attr("class", "gauge-text")
        .text("Daily target");

    return newAngle; // Retourner l'angle actuel pour la prochaine mise à jour
}

function updateGauge(containerId, value, maxPoints, previousAngle, color, squareClass) {
    d3.select("#" + containerId + " svg").remove(); // Supprimer l'ancienne jauge
    return createGauge(containerId, value, maxPoints, previousAngle, color, squareClass);
}

// Fonction pour récupérer les données en temps réel
async function fetchData() {
    const response = await fetch('https://script.google.com/macros/s/AKfycbwOltLszBi2RPoNgBmEouIRY7U3S5VIx_C6zrow1M_ck00_FnW8AJm9FNGL8K7VBmRW/exec');
    const data = await response.json();
    return data;
}

// Mettre à jour les compteurs et les jauges toutes les 2 secondes
setInterval(async () => {
    const data = await fetchData();
    // Supposons que les données renvoyées aient des propriétés `count1` et `count2`
    const previousCount1 = count1;
    const previousCount2 = count2;
    count1 = data[2][1];
    count2 = data[20][1];
    netsales = data[3][1];
    netsales2 = data[21][1];
    target = data[12][1];
    target2 = data[30][1];

    // Mettre à jour les compteurs
    updateCounter(counterElement1, count1, previousCount1);
    updateCounter(counterElement2, count2, previousCount2);

    // Mettre à jour les jauges
    previousAngle1 = updateGauge('gauge1', netsales % target, target, previousAngle1, '#0496e6', 'square1');
    previousAngle2 = updateGauge('gauge2', netsales2 %target2, target2, previousAngle2, '#547e79', 'square2');
}, 2000);

function startCountdown(duration, display) {
    let timer = duration, seconds;
    setInterval(function () {
        seconds = parseInt(timer, 10);
        display.textContent = seconds;

        if (--timer < 0) {
            timer = duration; // Redémarre le compte à rebours après avoir atteint 0
        }
    }, 1000);
}

window.onload = function () {
    const countdownDuration = 60; // Durée du compte à rebours en secondes
    const display = document.getElementById('countdown');
    startCountdown(countdownDuration, display);
};
