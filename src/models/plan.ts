import { model, models, Schema, Types } from 'mongoose'

export interface IPlan {
  _id?: Types.ObjectId
  title: string
  isPublic: boolean
  createdById?: string
  data: string
  city: string
}

const PlanSchema = new Schema<IPlan>(
  {
    _id: Schema.Types.ObjectId,
    title: String,
    isPublic: Boolean,
    createdById: String,
    data: String,
    city: String,
  },
  {
    timestamps: true,
  },
)

const Plan = models?.Plan || model('Plan', PlanSchema)
export default Plan
