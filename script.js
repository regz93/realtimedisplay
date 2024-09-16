let count1 = 0;
let count2 = 0;
let previousCount2 = 0; // Sauvegarde de l'état précédent

const counterElement1 = document.getElementById('counter1');
const counterElement2 = document.getElementById('counter2');

let previousAngle1 = 0;
let previousAngle2 = 0;

const soundUrl = "https://cdn.shopify.com/videos/c/o/v/cff96bfa4d014e1db91f78b7583ddad2.mp4";
let soundPlayed = false;

// Fonction pour déclencher le son dans un nouvel onglet
function playSoundInNewTab() {
    // Ouvrir la vidéo CDN dans un nouvel onglet
    const newWindow = window.open(soundUrl, "_blank");

    // Après 10 secondes, fermer la nouvelle fenêtre et revenir à la page principale
    setTimeout(() => {
        if (newWindow) {
            newWindow.close(); // Ferme la fenêtre du CDN
        }
        soundPlayed = false; // Réinitialiser le drapeau pour permettre la prochaine lecture du son
    }, 10000);
}

// Fonction pour mettre à jour les compteurs
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

    // Si c'est le compteur Nutrielement (counter2) et qu'il change, jouer le son
    if (counterElement === counterElement2 && count !== previousCount && !soundPlayed) {
        playSoundInNewTab(); // Jouer le son dans un nouvel onglet
        soundPlayed = true;
    }
}

function createGauge(containerId, value, maxPoints, previousAngle, color, squareClass) {
    var container = document.getElementById(containerId);
    var w = container.offsetWidth;
    var h = w / 2;
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
        .datum({ endAngle: previousAngle })
        .attr("d", arcLine)
        .attr("transform", "rotate(-90)")
        .style("fill", color);

    pathForeground.transition()
        .duration(750)
        .ease("cubic")
        .attrTween("d", function(d) {
            var interpolate = d3.interpolate(d.endAngle, newAngle);
            return function(t) {
                d.endAngle = interpolate(t);
                return arcLine(d);
            };
        });

    var squareSize = 80;
    var square = svg.append("rect")
        .attr("x", -squareSize / 2)
        .attr("y", outerRadius - squareSize / 2)
        .attr("width", squareSize)
        .attr("height", squareSize)
        .attr("fill", "#fff")
        .attr("stroke", color)
        .attr("stroke-width", 2)
        .attr("class", squareClass);

    var text = svg.append("text")
        .attr("class", "gauge-text")
        .attr("x", 0)
        .attr("y", 0)
        .text(`${Math.round(percent)}%`);

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

    return newAngle;
}

function updateGauge(containerId, value, maxPoints, previousAngle, color, squareClass) {
    d3.select("#" + containerId + " svg").remove();
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
    const previousCount1 = count1;
    previousCount2 = count2; // Sauvegarder l'état précédent
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
    previousAngle2 = updateGauge('gauge2', netsales2 % target2, target2, previousAngle2, '#547e79', 'square2');
}, 2000);

function startCountdown(duration, display) {
    let timer = duration, seconds;
    setInterval(function () {
        seconds = parseInt(timer, 10);
        display.textContent = seconds;

        if (--timer < 0) {
            timer = duration;
        }
    }, 1000);
}

window.onload = function () {
    const countdownDuration = 60;
    const display = document.getElementById('countdown');
    startCountdown(countdownDuration, display);
};
