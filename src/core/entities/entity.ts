import { UniqueId } from "./value-objects/unique-id"

export class Entity<Props> {
  protected props: Props
  private _id: UniqueId

  protected constructor(props: Props, id?: UniqueId) {
    this.props = props
    this._id = id ?? new UniqueId()
  }

  get id() {
    return this._id
  }
}
