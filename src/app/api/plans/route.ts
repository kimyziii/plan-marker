import Plan from '@/models/plan'
import connectMongo, { cached } from '@/utils/mongoose-connect'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  if (!cached.connection) await connectMongo()
  const userId = req.nextUrl.searchParams.get('userId')
  if (!userId) {
    const publicPlans = await Plan.find({ isPublic: true })
    return NextResponse.json({
      status: 200,
      plans: publicPlans,
    })
  } else {
    const myPlans = await Plan.find({ createdById: userId })
    return NextResponse.json({
      status: 200,
      plans: myPlans,
    })
  }
}
