/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
let particles = [];
class Particle {
  constructor(x, y, mass, velocity) {
    this.pos = createVector(x, y);
    this.vel = velocity;
    this.mass = mass;
    this.r = mass * 0.3; // Raio proporcional à massa
  }

  // Atualiza a posição e a opacidade da partícula
  update() {
    this.pos.add(this.vel);
  }

  // Desenha a partícula
  show() {
    noStroke();
    fill(255);
    ellipse(this.pos.x, this.pos.y, this.r * 2);
  }
}