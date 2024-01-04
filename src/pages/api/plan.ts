import { PrismaClient } from '@prisma/client'
import { NextApiRequest, NextApiResponse } from 'next'

const prisma = new PrismaClient()

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>,
) {
  if (req.method === 'POST') {
    const data = req.body

    const createdPlan = await prisma.plan.create({
      data,
    })
  }
  return res.status(200).json({ ok: true })
}
