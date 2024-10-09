import { Component, Entity } from '../engine'
import { Vector } from '../math'

export class $Transform extends Component {
  position = Vector.zero
  prevPosition = Vector.zero
  rotation = 0

  constructor(
    entity: Entity,
    args: { position?: Vector; rotation?: number } = {},
  ) {
    super(entity)

    if (args.position) {
      this.position = args.position
    }

    if (args.rotation) {
      this.rotation = args.rotation
    }
  }

  onPreUpdate() {
    this.prevPosition = this.position.clone()
  }
}
