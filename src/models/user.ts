import { model, models, Schema, Types } from 'mongoose'

export interface IUser {
  _id?: Types.ObjectId
  nickname: string
  email: string
  uid: string
}

const UserSchema = new Schema<IUser>(
  {
    _id: Schema.Types.ObjectId,
    nickname: String,
    email: {
      type: String,
      required: true,
      unique: true,
    },
    uid: String,
  },
  {
    timestamps: true,
  },
)

const User = models?.User || model('User', UserSchema)
export default User
