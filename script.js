// script.js
let count1 = 0;
let count2 = 0;

const counterElement1 = document.getElementById('counter1');
const counterElement2 = document.getElementById('counter2');

let previousAngle1 = 0;
let previousAngle2 = 0;

function updateCounter(counterElement, count) {
    count += 1;
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

    return count;
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
        .text("Target");

    return newAngle; // Retourner l'angle actuel pour la prochaine mise à jour
}



function updateGauge(containerId, value, maxPoints, previousAngle, color, squareClass) {
    d3.select("#" + containerId + " svg").remove(); // Supprimer l'ancienne jauge
    return createGauge(containerId, value, maxPoints, previousAngle, color, squareClass);
}

// Set interval to update the counters and gauges every 2 seconds
setInterval(() => {
    count1 = updateCounter(counterElement1, count1);
    count2 = updateCounter(counterElement2, count2);
    
    previousAngle1 = updateGauge('gauge1', count1 % 100, 100, previousAngle1, '#0496e6', 'square1');
    previousAngle2 = updateGauge('gauge2', count2 % 100, 100, previousAngle2, '#547e79', 'square2');
}, 2000);
