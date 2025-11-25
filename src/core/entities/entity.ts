import { UniqueId } from "./value-objects/unique-id"

export class Entity<Props> {
  protected props: Props
  private _id: UniqueId

  constructor(props: Props, id?: string) {
    this.props = props
    this._id = new UniqueId(id)
  }

  get id() {
    return this._id
  }
}
