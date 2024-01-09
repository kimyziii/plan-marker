import { PrismaClient } from '@prisma/client'
import { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>,
) {
  const prisma = new PrismaClient()
  // POST
  if (req.method === 'POST') {
    const data = req.body

    const createdPlan = await prisma.plan.create({
      data,
    })

    return res.status(200).json({ ok: true, result: createdPlan })
  }

  // DELETE
  else if (req.method === 'DELETE') {
    const {pId} = req.query
    if (pId) {
      const result = await prisma.plan.delete({
        where: {
          id: pId.toString(),
        },
      })
      return res.status(200).json(result)
    }
    return res.status(500).json(null)
  }

  // GET
  else if (req.method === 'GET') {
    const { uId, pId } = req.query

    let plans

    if (uId) {
      plans = await prisma.plan.findMany({
        where: {
          createdById: uId.toString()
        },
      })
    } else if (pId) {
      const strPId = pId.toString()
      plans = await prisma.plan.findMany({
        include: {
          user: true,
        },
        where: {
          id: strPId,
        },
      })
    }

    await prisma.$disconnect()
    return res.status(200).json({ plans })
  }
}
