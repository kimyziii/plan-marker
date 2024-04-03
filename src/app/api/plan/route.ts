import Plan from '@/models/plan'
import User from '@/models/user'
import connectMongo, { cached } from '@/utils/mongoose-connect'
import { Types } from 'mongoose'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const planId = req.nextUrl.searchParams.get('planId')

  try {
    const selectedPlan = await Plan.findById(planId)
    if (!selectedPlan) throw new Error()
    const createdByName = await User.findById(selectedPlan.createdById)
    const returnObj = {
      ...selectedPlan._doc,
      createdByName: createdByName ? createdByName.nickname : '정보없음',
    }
    return NextResponse.json({ status: 200, data: returnObj })
  } catch (error) {
    return NextResponse.json({ status: 400 })
  }
}

export async function PATCH(req: NextRequest) {
  if (!cached.connection) await connectMongo()
  try {
    const planId = req.nextUrl.searchParams.get('planId')
    const { title, isPublic, data, city } = await req.json()

    const foundPlan = await Plan.findByIdAndUpdate(
      { _id: planId },
      { title, isPublic, data, city },
    )

    if (foundPlan == null) {
      return NextResponse.json({
        message: 'no plan found',
        status: 204,
      })
    } else {
      return NextResponse.json({
        status: 200,
        data: foundPlan,
      })
    }
  } catch (error) {
    console.log(error)
    return NextResponse.json({ error })
  }
}

export async function POST(req: NextRequest) {
  if (!cached.connection) await connectMongo()
  try {
    const { title, isPublic, createdById, data, city } = await req.json()
    const createdUser = await Plan.create({
      _id: new Types.ObjectId(),
      title,
      isPublic,
      createdById,
      data,
      city,
    })

    if (createdUser) {
      return NextResponse.json({
        status: 201,
        createdPlanId: createdUser._id,
      })
    }
  } catch (error) {
    return NextResponse.json({ error })
  }
}

export async function DELETE(req: NextRequest) {
  if (!cached.connection) await connectMongo()
  try {
    const planId = req.nextUrl.searchParams.get('planId')
    const deletedPlan = await Plan.findByIdAndDelete(planId)

    if (deletedPlan) {
      return NextResponse.json({
        status: 200,
      })
    }
  } catch (error) {
    return NextResponse.json({ error })
  }
}
