export class Vector {
  constructor(
    public x: number,
    public y: number,
  ) {}

  clone() {
    return new Vector(this.x, this.y)
  }

  set(v: Vector) {
    this.x = v.x
    this.y = v.y
  }

  add(other: Vector) {
    return new Vector(this.x + other.x, this.y + other.y)
  }

  subtract(other: Vector) {
    return new Vector(this.x - other.x, this.y - other.y)
  }

  multiply(scalar: number) {
    return new Vector(this.x * scalar, this.y * scalar)
  }

  divide(scalar: number) {
    return new Vector(this.x / scalar, this.y / scalar)
  }

  round() {
    return new Vector(Math.round(this.x), Math.round(this.y))
  }

  floor() {
    return new Vector(Math.floor(this.x), Math.floor(this.y))
  }

  ceil() {
    return new Vector(Math.ceil(this.x), Math.ceil(this.y))
  }

  get magnitude() {
    return Math.sqrt(this.x * this.x + this.y * this.y)
  }

  get normalized() {
    return this.divide(this.magnitude)
  }

  get angle() {
    return Math.atan2(this.y, this.x)
  }

  static get zero() {
    return new Vector(0, 0)
  }

  static get one() {
    return new Vector(1, 1)
  }

  static get up() {
    return new Vector(0, -1)
  }

  static get down() {
    return new Vector(0, 1)
  }

  static get left() {
    return new Vector(-1, 0)
  }

  static get right() {
    return new Vector(1, 0)
  }

  static fromAngle(angle: number) {
    return new Vector(Math.cos(angle), Math.sin(angle))
  }

  static distance(a: Vector, b: Vector) {
    return a.subtract(b).magnitude
  }

  static dot(a: Vector, b: Vector) {
    return a.x * b.x + a.y * b.y
  }

  static lerp(a: Vector, b: Vector, t: number) {
    return a.add(b.subtract(a).multiply(t))
  }

  static min(a: Vector, b: Vector) {
    return new Vector(Math.min(a.x, b.x), Math.min(a.y, b.y))
  }

  static max(a: Vector, b: Vector) {
    return new Vector(Math.max(a.x, b.x), Math.max(a.y, b.y))
  }

  static clamp(value: Vector, min: Vector, max: Vector) {
    return this.min(this.max(value, min), max)
  }
}
