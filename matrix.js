class Matrix {
  translate(x,y,z) {
    return new Float32Array([
      1.0, 0.0, 0.0, 0.0,
      0.0, 1.0, 0.0, 0.0,
      0.0, 0.0, 1.0, 0.0,
      x, y, z, 1.0
    ])
  }

  rotateX(angle) {
    const sinB = Math.sin(angle / 180 * Math.PI);
    const cosB = Math.cos(angle / 180 * Math.PI);
    return new Float32Array([
      1.0, 0.0, 0.0, 0.0,
      0.0, cosB, sinB, 0.0,
      0.0, -sinB, cosB, 0.0,
      0.0, 0.0, 0.0, 1.0
    ])
  }

  rotateY(angle) {
    const sinB = Math.sin(angle / 180 * Math.PI);
    const cosB = Math.cos(angle / 180 * Math.PI);
    return new Float32Array([
      cosB, 0.0, -sinB, 0.0,
      0.0, 1.0, 0.0, 0.0,
      sinB, 0.0, cosB, 0.0,
      0.0, 0.0, 0.0, 1.0
    ])
  }

  rotateZ(angle) {
    const sinB = Math.sin(angle / 180 * Math.PI);
    const cosB = Math.cos(angle / 180 * Math.PI);
    return new Float32Array([
      cosB, sinB, 0.0, 0.0,
      -sinB, cosB, 0.0, 0.0,
      0.0, 0.0, 1.0, 0.0,
      0.0, 0.0, 0.0, 1.0
    ])
  }

  scale(x,y,z) {
    return new Float32Array([
      x, 0.0, 0.0, 0.0,
      0.0, y, 0.0, 0.0,
      0.0, 0.0, z, 0.0,
      0.0, 0.0, 0.0, 1.0
    ])
  }
}
