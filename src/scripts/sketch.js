/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */

let sun;
let planets = [];
let G = 0.3;
let numPlanets = 15;
let destabilise = 2;
let canvas;
let imgTexture1, imgTexture2, imgTexture3, imgTexture4;

function preload() {
  imgTexture1 = loadImage("../dist/images/planet1.jpg");
  imgTexture2 = loadImage("../dist/images/planet2.jpg");
  imgTexture3 = loadImage("../dist/images/planet3.jpg");
  imgTexture4 = loadImage("../dist/images/planet4.jpg");
}

function setup() {
  canvas = createCanvas(windowWidth, windowHeight, WEBGL); // Ativando WebGL
  canvas.position(0, 0);
  canvas.style("z-index", "-1");

  // Criar o Sol
  sun = new Body(0, 0, 50, 200, "Star");

  // Criar planetas
  for (let i = 0; i < numPlanets; i++) {
    createRandomPlanet(i);
  }
}

function createRandomPlanet(index) {
  // Posição do planeta
  let r = random(150, 300);
  let theta = random(TWO_PI);
  let x = r * cos(theta);
  let y = r * sin(theta);

  // Velocidade orbital
  let vel = createVector(-y, x).normalize();
  vel.mult(sqrt((G * sun.mass) / r));

  // Criar planeta
  let radius = random(10, 15);
  let mass = radius ** 2;

  if (random(1) < 0.2) {
    vel.mult(-1);
  }

  planets.push(new Body(x, y, radius, mass, "Planet", vel));
}

function updatePlanetVelocities() {
  for (let i = 0; i < planets.length; i++) {
    let planet = planets[i];

    // Vetor da posição do planeta em relação ao Sol
    let planetPos = createVector(planet.x - sun.x, planet.y - sun.y);

    // Criar o vetor de velocidade orbital
    let planetVel = planetPos.copy();
    planetVel.rotate(HALF_PI); // Rotaciona 90° para criar a órbita
    planetVel.setMag(sqrt((G * sun.mass) / planetPos.mag())); // Define a magnitude da velocidade orbital

    // Aleatoriamente inverter a direção do movimento orbital
    if (random(1) < 0.2) {
      planetVel.mult(-1);
    }

    // Destabilizar a velocidade para criar variação
    planetVel.mult(random(1 - destabilise, 1 + destabilise));

    // Atualizar a velocidade do planeta
    planet.vel = planetVel;
  }
}

function draw() {
  background(0);
  orbitControl();
  noStroke();

  // Iluminação
  ambientLight(20); // Luz ambiente fraca
  pointLight(255, 255, 200, sun.x, sun.y, +40); // Luz direcional do Sol

  // Desenhar o Sol
  sun.draw();

  // Atualizar e desenhar planetas
  for (let planet of planets) {
    sun.attract(planet);
    planet.update();
    planet.draw();
  }

  // Verificar colisões entre planetas
  for (let i = 0; i < planets.length; i++) {
    for (let j = i + 1; j < planets.length; j++) {
      checkCollision(planets[i], planets[j]);
    }
  }
}

// Classe Body ajustada
function Body(
  x,
  y,
  radius,
  mass,
  type,
  velocity = createVector(0, 0),
) {
  this.x = x;
  this.y = y;
  this.z = 0;
  this.radius = radius;
  this.mass = mass;
  this.type = type;
  this.vel = velocity;

  this.update = function () {
    this.x += this.vel.x;
    this.y += this.vel.y;
  };

  this.draw = function () {
    push();
    translate(this.x, this.y, this.z);
    if (this.type === "Planet") {
      texture(imgTexture1);
    }
    if (this.type === "Star") {
      emissiveMaterial(255, 204, 0); // Cor emissiva para o Sol
    }
    sphere(this.radius);
    pop();
  };

  this.applyForce = function (force) {
    this.vel.add(force.div(this.mass));
  };

  this.attract = function (body) {
    let force = createVector(this.x - body.x, this.y - body.y);
    let distance = constrain(force.mag(), 50, 300);
    force.setMag((G * this.mass * body.mass) / (distance * distance));
    body.applyForce(force);
  };
}

function checkCollision(planetA, planetB) {
  let d = dist(planetA.x, planetA.y, planetB.x, planetB.y);

  if (d < planetA.radius + planetB.radius) {
    // Calcular o vetor normal entre os dois planetas
    let normal = createVector(
      planetB.x - planetA.x,
      planetB.y - planetA.y
    ).normalize();

    // Velocidade relativa
    let relativeVelocity = p5.Vector.sub(planetB.vel, planetA.vel);
    let speed = relativeVelocity.dot(normal);

    // Se as velocidades já estão se afastando, não faz nada
    if (speed > 0) return;

    // Calcular o impulso baseado nas massas
    let impulse = normal.copy().mult(speed / (planetA.mass + planetB.mass));

    // Ajustar as velocidades de acordo com o impulso
    planetA.vel.sub(p5.Vector.mult(impulse, -planetB.mass));
    planetB.vel.add(p5.Vector.mult(impulse, -planetA.mass));
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
