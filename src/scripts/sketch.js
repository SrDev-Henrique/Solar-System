let sun; // Sol
let planets = []; // Array para armazenar os planetas
let G = 0.3; // Constante gravitacional
let numPlanets = 15; // Número de planetas
let destabilise = 2; // Fator de desestabilização das órbitas
let canvas; // Referência ao canvas
let planetTextures = []; // Array para armazenar as texturas dos planetas

function preload() {
  // Carrega as texturas dos planetas
  planetTextures.push(loadImage("images/planet1.jpg"));
  planetTextures.push(loadImage("images/planet2.jpg"));
  planetTextures.push(loadImage("images/planet3.jpg"));
  planetTextures.push(loadImage("images/planet4.jpg"));
  planetTextures.push(loadImage("images/planet5.jpg"));
  planetTextures.push(loadImage("images/planet6.jpg"));
  planetTextures.push(loadImage("images/planet7.jpg"));
  planetTextures.push(loadImage("images/planet8.jpg"));
  planetTextures.push(loadImage("images/planet9.jpg"));
  planetTextures.push(loadImage("images/planet10.jpg"));
  planetTextures.push(loadImage("images/planet11.jpg"));
  planetTextures.push(loadImage("images/planet12.jpg"));
  planetTextures.push(loadImage("images/planet13.jpg"));
}

function setup() {
  // Cria um canvas em modo WEBGL
  canvas = createCanvas(windowWidth, windowHeight, WEBGL);

  // Cria o Sol
  sun = new Body(0, 0, 50, 200, "Star");

  // Cria os planetas
  for (let i = 0; i < numPlanets; i++) {
    createRandomPlanet(i);
  }
}

function createRandomPlanet(index) {
  // Define a posição do planeta
  let r = random(150, 300); // Distância do Sol
  let theta = random(TWO_PI); // Ângulo aleatório
  let x = r * cos(theta); // Posição x
  let y = r * sin(theta); // Posição y

  // Define a velocidade orbital
  let vel = createVector(-y, x).normalize();
  vel.mult(sqrt((G * sun.mass) / r));

  // Define o raio e a massa do planeta
  let radius = random(10, 15);
  let mass = radius ** 2;

  // Inverte a direção da órbita em 20% dos casos
  if (random(1) < 0.2) {
    vel.mult(-1);
  }

  // Escolhe uma textura aleatória para o planeta
  let randomTexture = random(planetTextures);

  // Adiciona o planeta ao array de planetas
  planets.push(new Body(x, y, radius, mass, "Planet", vel, randomTexture));
}

function updatePlanetVelocities() {
  // Atualiza as velocidades dos planetas para criar órbitas instáveis
  for (let i = 0; i < planets.length; i++) {
    let planet = planets[i];

    // Vetor da posição do planeta em relação ao Sol
    let planetPos = createVector(planet.x - sun.x, planet.y - sun.y);

    // Vetor de velocidade orbital
    let planetVel = planetPos.copy();
    planetVel.rotate(HALF_PI); // Rotaciona 90° para criar a órbita
    planetVel.setMag(sqrt((G * sun.mass) / planetPos.mag())); // Define a magnitude da velocidade

    // Inverte a direção da órbita em 20% dos casos
    if (random(1) < 0.2) {
      planetVel.mult(-1);
    }

    // Aplica o fator de desestabilização
    planetVel.mult(random(1 - destabilise, 1 + destabilise));

    // Atualiza a velocidade do planeta
    planet.vel = planetVel;
  }
}

function draw() {
  background(0); // Fundo preto

  orbitControl(); // Controle de órbita (movimento da câmera)

  noStroke(); // Sem bordas nos objetos

  // Configuração da iluminação
  ambientLight(20); // Luz ambiente fraca
  pointLight(255, 255, 200, sun.x, sun.y, +40); // Luz direcional do Sol

  // Desenha o Sol
  sun.draw();

  // Atualiza e desenha os planetas
  for (let planet of planets) {
    sun.attract(planet); // Aplica a atração gravitacional do Sol
    planet.update(); // Atualiza a posição do planeta
    planet.draw(); // Desenha o planeta
  }

  // Verifica colisões entre planetas
  for (let i = 0; i < planets.length; i++) {
    for (let j = i + 1; j < planets.length; j++) {
      checkCollision(planets[i], planets[j]);
    }
  }
}

// Classe para representar corpos celestes (Sol e planetas)
function Body(
  x,
  y,
  radius,
  mass,
  type,
  velocity = createVector(0, 0),
  planetTexture = null // Textura do planeta
) {
  this.x = x; // Posição x
  this.y = y; // Posição y
  this.z = 0; // Posição z (não usada neste exemplo)
  this.radius = radius; // Raio do corpo
  this.mass = mass; // Massa do corpo
  this.type = type; // Tipo (Sol ou Planeta)
  this.vel = velocity; // Velocidade do corpo
  this.planetTexture = planetTexture; // Textura do planeta

  // Atualiza a posição do corpo com base na velocidade
  this.update = function () {
    this.x += this.vel.x;
    this.y += this.vel.y;
  };

  // Desenha o corpo na tela
  this.draw = function () {
    push();
    translate(this.x, this.y, this.z);
    if (this.type === "Planet") {
      if (this.planetTexture) {
        texture(this.planetTexture); // Aplica a textura do planeta
      } else {
        fill(255, 0, 0); // Cor de fallback se não houver textura
      }
      noStroke();
      sphere(this.radius); // Desenha o planeta
    }
    if (this.type === "Star") {
      emissiveMaterial(255, 204, 0); // Material emissivo para o Sol
      noStroke();
      sphere(this.radius); // Desenha o Sol
    }
    pop();
  };

  // Aplica uma força ao corpo
  this.applyForce = function (force) {
    this.vel.add(force.div(this.mass));
  };

  // Atrai outro corpo com base na gravidade
  this.attract = function (body) {
    let force = createVector(this.x - body.x, this.y - body.y);
    let distance = constrain(force.mag(), 50, 300);
    force.setMag((G * this.mass * body.mass) / (distance * distance));
    body.applyForce(force);
  };
}

// Verifica colisões entre dois planetas
function checkCollision(planetA, planetB) {
  let d = dist(planetA.x, planetA.y, planetB.x, planetB.y);

  if (d < planetA.radius + planetB.radius) {
    // Calcula o vetor normal entre os dois planetas
    let normal = createVector(
      planetB.x - planetA.x,
      planetB.y - planetA.y
    ).normalize();

    // Velocidade relativa
    let relativeVelocity = p5.Vector.sub(planetB.vel, planetA.vel);
    let speed = relativeVelocity.dot(normal);

    // Se as velocidades já estão se afastando, não faz nada
    if (speed > 0) return;

    // Calcula o impulso baseado nas massas
    let impulse = normal.copy().mult(speed / (planetA.mass + planetB.mass));

    // Ajusta as velocidades de acordo com o impulso
    planetA.vel.sub(p5.Vector.mult(impulse, -planetB.mass));
    planetB.vel.add(p5.Vector.mult(impulse, -planetA.mass));
  }
}

// Redimensiona o canvas quando a janela é redimensionada
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
