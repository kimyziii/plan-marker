import { PrismaClient } from '@prisma/client'
import { NextApiRequest, NextApiResponse } from 'next'

const prisma = new PrismaClient()

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>,
) {
  if (req.method === 'GET') {
    const userEmail = req.query.email.toString()

    const result = await prisma.user.findUnique({
      where: {
        email: userEmail,
      },
    })
    res.json({ status: '200', result })
  }
}
