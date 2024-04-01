import User from '@/models/user'
import connectMongo, { cached } from '@/utils/mongoose-connect'
import { Types } from 'mongoose'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  if (!cached.connection) await connectMongo()
  const { email, uid } = await req.json()

  try {
    const loginedUser = await User.findOne({ email })

    if (loginedUser) {
      await loginedUser.save()
      return NextResponse.json({ status: 200, data: loginedUser })
    }
    if (!loginedUser) {
      const createdUser = await User.create({
        _id: new Types.ObjectId(),
        email,
        nickname: email,
        uid,
      })
      return NextResponse.json({ status: 201, data: createdUser })
    }
  } catch (error) {
    return NextResponse.json({ status: 400, error: error.message })
  }
}
