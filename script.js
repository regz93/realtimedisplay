// script.js
let count1 = 0;
let count2 = 0;

const counterElement1 = document.getElementById('counter1');
const counterElement2 = document.getElementById('counter2');

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

    // Ensure that the 'roll-up' and 'roll-down' animations are applied correctly
    setTimeout(() => {
        counterElement.querySelectorAll('.roll-up').forEach(wrapper => {
            wrapper.classList.remove('roll-up');
        });
        counterElement.querySelectorAll('.roll-down').forEach(wrapper => {
            wrapper.classList.remove('roll-down');
        });
    }, 500); // Duration should match CSS animation duration

    return count;
}

function updateGauge(gaugeElement, value) {
    // Value should be between 0 and 100
    const percentage = Math.min(Math.max(value, 0), 100);
    gaugeElement.style.background = `conic-gradient(#4caf50 ${percentage}%, #ddd ${percentage}%)`;
}

// Set interval to update the counters and gauges every 2 seconds
setInterval(() => {
    count1 = updateCounter(counterElement1, count1);
    count2 = updateCounter(counterElement2, count2);
    
    updateGauge(document.getElementById('gauge1'), count1 % 101); // Just a sample, adjust as needed
    updateGauge(document.getElementById('gauge2'), count2 % 101); // Just a sample, adjust as needed
}, 2000);
