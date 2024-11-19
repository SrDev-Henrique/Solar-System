/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */

let sun;
let planets = [];
let G = 0.3;
let numPlanets = 5;
let canvas;
let planetTextures = []; // Para armazenar texturas

function preload() {
  // Carregar texturas para os planetas
  for (let i = 1; i <= 4; i++) {
    planetTextures.push(loadImage(`images/planet${i}.jpg`)); // Adicione planet1.jpg, planet2.jpg etc.
  }
}

function setup() {
  canvas = createCanvas(windowWidth, windowHeight, WEBGL); // Ativando WebGL
  canvas.position(0, 0);
  canvas.style("z-index", "-1");

  // Criar o Sol
  sun = new Body(0, 0, 100, 500, "Star");

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

  // Escolher textura aleatória
  let texture = planetTextures[index % planetTextures.length];

  // Criar planeta
  let radius = random(20, 50);
  let mass = radius ** 2;
  planets.push(new Body(x, y, radius, mass, "Planet", vel, texture));
}

function draw() {
  background(0);
  orbitControl();
  noStroke();

  // Iluminação
  ambientLight(50); // Luz ambiente fraca
  directionalLight(255, 255, 200, -1, -1, -1); // Luz direcional do Sol

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
  texture = null
) {
  this.x = x;
  this.y = y;
  this.z = 0;
  this.radius = radius;
  this.mass = mass;
  this.type = type;
  this.vel = velocity;
  this.texture = texture;

  this.update = function () {
    this.x += this.vel.x;
    this.y += this.vel.y;
  };

  this.draw = function () {
    push();
    translate(this.x, this.y, this.z);

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
  let d = dist(planetA.pos.x, planetA.pos.y, planetB.pos.x, planetB.pos.y);

  if (d < planetA.r / 2 + planetB.r / 2) {
    let normal = p5.Vector.sub(planetB.pos, planetA.pos).normalize();
    let relativeVelocity = p5.Vector.sub(planetB.vel, planetA.vel);
    let speed = relativeVelocity.dot(normal);

    if (speed > 0) return;

    let impulse = p5.Vector.mult(normal, speed / (planetA.mass + planetB.mass));

    planetA.vel.sub(p5.Vector.mult(impulse, -planetB.mass));
    planetB.vel.add(p5.Vector.mult(impulse, -planetA.mass));

    let massLoss = min(planetA.mass, planetB.mass) * 0.2;

    planetA.mass -= massLoss;
    planetB.mass -= massLoss;

    planetA.r = Math.sqrt(planetA.mass) * 5;
    planetB.r = Math.sqrt(planetB.mass) * 5;

    let numParticles = 2;
    for (let i = 0; i < numParticles; i++) {
      let velocity = p5.Vector.random2D();
      let mass = random(5, 10);
      let particle = new Particle(planetA.pos.x, planetA.pos.y, mass, velocity);
      particles.push(particle);
    }
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
