document.addEventListener("DOMContentLoaded", function() {
    const algorithmItems = document.querySelectorAll('.algorithm-item');

    function checkVisibility() {
        const triggerBottom = window.innerHeight / 5 * 4; // Trigger when 80% of the viewport is visible

        algorithmItems.forEach(item => {
            const boxTop = item.getBoundingClientRect().top;

            if (boxTop < triggerBottom) {
                item.classList.add('visible');
                item.style.animation = item.getAttribute('data-animation') + ' 0.5s forwards'; // Apply animation
            }
        });
    }

    window.addEventListener('scroll', checkVisibility);
    checkVisibility(); // Check visibility on load
});// Mobile Menu Toggle
const mobileMenuBtn = document.getElementById('mobileMenuBtn');
const navLinks = document.getElementById('navLinks');

mobileMenuBtn.addEventListener('click', () => {
    navLinks.classList.toggle('active');
    mobileMenuBtn.innerHTML = navLinks.classList.contains('active') ? 
        '<i class="fas fa-times"></i>' : '<i class="fas fa-bars"></i>';
});

// Close mobile menu when clicking a link
document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => {
        navLinks.classList.remove('active');
        mobileMenuBtn.innerHTML = '<i class="fas fa-bars"></i>';
    });
});

// Header scroll effect
const header = document.getElementById('header');
window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        header.classList.add('header-scrolled');
    } else {
        header.classList.remove('header-scrolled');
    }
});

// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });
});

// Form submission
const contactForm = document.getElementById('contactForm');
contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    alert('Thank you for your message! We will get back to you soon.');
    contactForm.reset();
});

// Traffic Simulation
const simulationCanvas = document.getElementById('simulationCanvas');
const startSimulationBtn = document.getElementById('startSimulation');
const resetSimulationBtn = document.getElementById('resetSimulation');
const toggleAlgorithmBtn = document.getElementById('toggleAlgorithm');
const statsDisplay = document.getElementById('statsDisplay');

// Simulation variables
let simulationRunning = false;
let smartAlgorithmEnabled = false;
let animationId;
let vehicles = [];
let trafficLights = [];
let currentGreenDirection = 'east-west'; // Start with east-west green
let timeAllocation = {
    north: 20,
    south: 20,
    east: 20,
    west: 20
};
let directionGroups = {
    'north-south': ['north', 'south'],
    'east-west': ['east', 'west']
};

// Initialize simulation
function initSimulation() {
    // Clear previous simulation
    simulationCanvas.innerHTML = '';
    vehicles = [];
    trafficLights = [];
    currentGreenDirection = 'east-west';
    timeAllocation = {
        north: 20,
        south: 20,
        east: 20,
        west: 20
    };

    // Hide stats display
    statsDisplay.style.display = 'none';

    // Create roads
    const horizontalRoad = document.createElement('div');
    horizontalRoad.className = 'road horizontal-road';
    simulationCanvas.appendChild(horizontalRoad);

    const verticalRoad = document.createElement('div');
    verticalRoad.className = 'road vertical-road';
    simulationCanvas.appendChild(verticalRoad);

    // Create lane markers
    for (let i = 0; i < 20; i++) {
        const horizontalMarker = document.createElement('div');
        horizontalMarker.className = 'lane-marker horizontal-lane-marker';
        horizontalMarker.style.left = `${i * 50 + 25}px`;
        simulationCanvas.appendChild(horizontalMarker);

        const verticalMarker = document.createElement('div');
        verticalMarker.className = 'lane-marker vertical-lane-marker';
        verticalMarker.style.top = `${i * 50 + 25}px`;
        simulationCanvas.appendChild(verticalMarker);
    }

    // Create traffic lights for each direction
    const lightPositions = [
        { x: '45%', y: '10%', direction: 'north' },  // North
        { x: '45%', y: '90%', direction: 'south' },  // South
        { x: '10%', y: '45%', direction: 'west' },   // West
        { x: '90%', y: '45%', direction: 'east' }    // East
    ];

    lightPositions.forEach((pos) => {
        const trafficLight = document.createElement('div');
        trafficLight.className = 'traffic-light';
        trafficLight.style.left = pos.x;
        trafficLight.style.top = pos.y;

        // Create lights (red, yellow, green)
        const redLight = document.createElement('div');
        redLight.className = 'light red';
        trafficLight.appendChild(redLight);

        const yellowLight = document.createElement('div');
        yellowLight.className = 'light yellow';
        trafficLight.appendChild(yellowLight);

        const greenLight = document.createElement('div');
        greenLight.className = 'light green';
        trafficLight.appendChild(greenLight);

        simulationCanvas.appendChild(trafficLight);

        // Set initial state
        let initialState = 'red';
        if ((pos.direction === 'east' || pos.direction === 'west') && currentGreenDirection === 'east-west') {
            initialState = 'green';
        } else if ((pos.direction === 'north' || pos.direction === 'south') && currentGreenDirection === 'north-south') {
            initialState = 'green';
        }

        trafficLights.push({
            element: trafficLight,
            direction: pos.direction,
            state: initialState,
            timer: 0
        });
    });

    updateTrafficLights();

    // Create initial vehicles for all directions
    for (let i = 0; i < 12; i++) {
        createVehicle();
    }
}

// Count vehicles in each direction
function countVehicles() {
    const counts = {
        north: 0,
        south: 0,
        east: 0,
        west: 0
    };

    vehicles.forEach(vehicle => {
        counts[vehicle.direction]++;
    });

    return counts;
}

// Update stats display
function updateStatsDisplay() {
    const counts = countVehicles();

    document.getElementById('northCount').textContent = counts.north;
    document.getElementById('southCount').textContent = counts.south;
    document.getElementById('eastCount').textContent = counts.east;
    document.getElementById('westCount').textContent = counts.west;

    document.getElementById('northTime').textContent = timeAllocation.north + 's';
    document.getElementById('southTime').textContent = timeAllocation.south + 's';
    document.getElementById('eastTime').textContent = timeAllocation.east + 's';
    document.getElementById('westTime').textContent = timeAllocation.west + 's';
}

// Create a new vehicle
function createVehicle() {
    const vehicle = document.createElement('div');
    vehicle.className = 'vehicle';

    // Random direction (north, south, east, west)
    const directions = ['north', 'south', 'east', 'west'];
    const direction = directions[Math.floor(Math.random() * directions.length)];
    const colors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6'];
    const color = colors[Math.floor(Math.random() * colors.length)];

    // Set vehicle position based on direction
    switch(direction) {
        case 'north':
            vehicle.style.width = '15px';
            vehicle.style.height = '30px';
            vehicle.style.left = `${Math.random() * 100 + 200}px`;
            vehicle.style.top = '500px';
            break;
        case 'south':
            vehicle.style.width = '15px';
            vehicle.style.height = '30px';
            vehicle.style.left = `${Math.random() * 100 + 200}px`;
            vehicle.style.top = '-30px';
            break;
        case 'east':
            vehicle.style.width = '30px';
            vehicle.style.height = '15px';
            vehicle.style.left = '-30px';
            vehicle.style.top = `${Math.random() * 100 + 200}px`;
            break;
        case 'west':
            vehicle.style.width = '30px';
            vehicle.style.height = '15px';
            vehicle.style.left = '1000px';
            vehicle.style.top = `${Math.random() * 100 + 200}px`;
            break;
    }

    vehicle.style.backgroundColor = color;
    simulationCanvas.appendChild(vehicle);

    vehicles.push({
        element: vehicle,
        direction: direction,
        speed: Math.random() * 2 + 1,
        x: parseFloat(vehicle.style.left) || 0,
        y: parseFloat(vehicle.style.top) || 0
    });
}

// Update traffic light states
function updateTrafficLights() {
    trafficLights.forEach(light => {
        // Clear all active states
        light.element.querySelectorAll('.light').forEach(l => {
            l.classList.remove('active');
        });

        // Set active state
        if (light.state === 'red') {
            light.element.querySelector('.red').classList.add('active');
        } else if (light.state === 'yellow') {
            light.element.querySelector('.yellow').classList.add('active');
        } else {
            light.element.querySelector('.green').classList.add('active');
        }
    });
}

// Update traffic light cycles with smart time allocation
function updateTrafficLightCycles(timestamp) {
    const vehicleCounts = countVehicles();

    // Calculate dynamic time allocation if smart algorithm is enabled
    if (smartAlgorithmEnabled) {
        // Calculate total vehicles in each direction group
        const nsTotal = vehicleCounts.north + vehicleCounts.south;
        const ewTotal = vehicleCounts.east + vehicleCounts.west;
        const totalVehicles = nsTotal + ewTotal;

        if (totalVehicles > 0) {
            // Allocate time proportionally to vehicle counts (minimum 10s, maximum 30s)
            const nsTime = Math.max(10, Math.min(30, Math.round((nsTotal / totalVehicles) * 40)));
            const ewTime = Math.max(10, Math.min(30, Math.round((ewTotal / totalVehicles) * 40)));

            // Distribute time between directions in each group based on their proportion
            if (nsTotal > 0) {
                timeAllocation.north = Math.max(10, Math.min(30, Math.round((vehicleCounts.north / nsTotal) * nsTime * 1.5)));
                timeAllocation.south = Math.max(10, Math.min(30, Math.round((vehicleCounts.south / nsTotal) * nsTime * 1.5)));
            } else {
                timeAllocation.north = 15;
                timeAllocation.south = 15;
            }

            if (ewTotal > 0) {
                timeAllocation.east = Math.max(10, Math.min(30, Math.round((vehicleCounts.east / ewTotal) * ewTime * 1.5)));
                timeAllocation.west = Math.max(10, Math.min(30, Math.round((vehicleCounts.west / ewTotal) * ewTime * 1.5)));
            } else {
                timeAllocation.east = 15;
                timeAllocation.west = 15;
            }
        } else {
            // Default equal time when no vehicles
            timeAllocation = {
                north: 15,
                south: 15,
                east: 15,
                west: 15
            };
        }
    }

    // Update light states based on current direction and timing
    trafficLights.forEach(light => {
        light.timer++;

        const isCurrentDirection = directionGroups[currentGreenDirection].includes(light.direction);
        const directionTime = timeAllocation[light.direction];

        if (isCurrentDirection) {
            // For the current green direction
            if (light.timer < directionTime - 3) {
                light.state = 'green';
            } else if (light.timer < directionTime) {
                light.state = 'yellow';
            } else {
                // Time to switch directions
                light.state = 'red';
                if (light.timer >= directionTime + 1) {
                    light.timer = 0;
                    currentGreenDirection = currentGreenDirection === 'east-west' ? 'north-south' : 'east-west';
                }
            }
        } else {
            // For the red direction
            light.state = 'red';
            const oppositeDirection = currentGreenDirection === 'east-west' ? 'north-south' : 'east-west';
            const maxOppositeTime = Math.max(...directionGroups[oppositeDirection].map(dir => timeAllocation[dir]));

            if (light.timer >= maxOppositeTime + 1) {
                light.timer = 0;
            }
        }
    });

    updateTrafficLights();
}

// Update vehicle positions
function updateVehicles() {
    vehicles.forEach(vehicle => {
        // Move vehicle based on direction
        switch(vehicle.direction) {
            case 'north':
                vehicle.y -= vehicle.speed;
                break;
            case 'south':
                vehicle.y += vehicle.speed;
                break;
            case 'east':
                vehicle.x += vehicle.speed;
                break;
            case 'west':
                vehicle.x -= vehicle.speed;
                break;
        }

        // Check if vehicle is at intersection
        const atIntersection = Math.abs(vehicle.x - 450) < 50 && Math.abs(vehicle.y - 250) < 50;

        // Check traffic light state for this direction
        const relevantLight = trafficLights.find(light => light.direction === vehicle.direction);
        const lightIsRed = relevantLight && (relevantLight.state === 'red' || relevantLight.state === 'yellow');

        if (atIntersection && lightIsRed) {
            // Stop at red light
            switch(vehicle.direction) {
                case 'north':
                    vehicle.y = Math.max(vehicle.y, 280);
                    break;
                case 'south':
                    vehicle.y = Math.min(vehicle.y, 220);
                    break;
                case 'east':
                    vehicle.x = Math.min(vehicle.x, 420);
                    break;
                case 'west':
                    vehicle.x = Math.max(vehicle.x, 480);
                    break;
            }
        }

        // Update vehicle position
        vehicle.element.style.left = `${vehicle.x}px`;
        vehicle.element.style.top = `${vehicle.y}px`;

        // Remove if off screen and create new vehicle
        if ((vehicle.direction === 'north' && vehicle.y < -50) ||
            (vehicle.direction === 'south' && vehicle.y > 550) ||
            (vehicle.direction === 'east' && vehicle.x > 1000) ||
            (vehicle.direction === 'west' && vehicle.x < -50)) {
            simulationCanvas.removeChild(vehicle.element);
            vehicles = vehicles.filter(v => v !== vehicle);
            createVehicle();
        }
    });
}

// Animation loop
function animate(timestamp) {
    if (simulationRunning) {
        updateTrafficLightCycles(timestamp);
        updateVehicles();

        // Randomly add new vehicles
        if (Math.random() < 0.03) {
            createVehicle();
        }
    }

    animationId = requestAnimationFrame(animate);
}

// Start simulation
startSimulationBtn.addEventListener('click', () => {
    if (!simulationRunning) {
        simulationRunning = true;
        startSimulationBtn.textContent = 'Pause Simulation';
        statsDisplay.style.display = 'none';
        animate();
    } else {
        simulationRunning = false;
        startSimulationBtn.textContent = 'Resume Simulation';
        updateStatsDisplay();
        statsDisplay.style.display = 'block';
        cancelAnimationFrame(animationId);
    }
});

// Reset simulation
resetSimulationBtn.addEventListener('click', () => {
    simulationRunning = false;
    startSimulationBtn.textContent = 'Start Simulation';
    cancelAnimationFrame(animationId);
    initSimulation();
});

// Toggle smart algorithm
toggleAlgorithmBtn.addEventListener('click', () => {
    smartAlgorithmEnabled = !smartAlgorithmEnabled;
    toggleAlgorithmBtn.textContent = smartAlgorithmEnabled ? 
        'Disable Smart Algorithm' : 'Enable Smart Algorithm';

    if (smartAlgorithmEnabled) {
        toggleAlgorithmBtn.style.backgroundColor = '#10b981';
    } else {
        toggleAlgorithmBtn.style.backgroundColor = '#3b82f6';
        // Reset to equal time allocation when disabling smart algorithm
        timeAllocation = {
            north: 20,
            south: 20,
            east: 20,
            west: 20
        };
        if (!simulationRunning) {
            updateStatsDisplay();
        }
    }
});

// Initialize simulation on load
window.addEventListener('load', initSimulation);