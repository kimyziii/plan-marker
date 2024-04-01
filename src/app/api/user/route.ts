import User from '@/models/user'
import connectMongo, { cached } from '@/utils/mongoose-connect'
import { Types } from 'mongoose'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  if (!cached.connection) await connectMongo()
  try {
    const uId = req.nextUrl.searchParams.get('uId')
    const lastLoginAt = req.nextUrl.searchParams.get('lastLoginAt')

    const updatedUser = await User.findOne({ uid: uId })

    if (updatedUser == null) {
      return NextResponse.json({
        message: 'no user found',
        status: 204,
      })
    } else {
      const targetId = updatedUser._id
      await User.updateOne({ _id: targetId }, { lastLoginAt })

      return NextResponse.json({
        status: 200,
        data: updatedUser,
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
    const { nickname, email, uid } = await req.json()
    const createdUser = await User.create({
      _id: new Types.ObjectId(),
      nickname,
      email,
      uid,
    })

    if (createdUser) {
      return NextResponse.json({
        status: 201,
        data: createdUser,
      })
    }
  } catch (error) {
    return NextResponse.json({ error })
  }
}

export async function PATCH(req: NextRequest) {
  if (!cached.connection) await connectMongo()

  const userId = req.nextUrl.searchParams.get('userId')
  const requestBody = await req.json()
  const nickname = requestBody.nickname

  try {
    const targetUser = await User.findOne({ nickname })

    if (targetUser && targetUser._id.toString() !== userId) {
      return NextResponse.json({ status: 409 })
    }

    if (targetUser && targetUser._id.toString() === userId) {
      return NextResponse.json({ status: 204 })
    }

    if (!targetUser) {
      await User.findByIdAndUpdate(userId, {
        nickname,
      })
      return NextResponse.json({
        status: 200,
      })
    }
  } catch (error) {
    return NextResponse.json({ error })
  }
}

export async function DELETE(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get('userId')

  try {
    const deletedUser = await User.findByIdAndDelete(userId)
    if (deletedUser) return NextResponse.json({ status: 200 })
  } catch (error) {
    return NextResponse.json({ status: 400, error })
  }
}
