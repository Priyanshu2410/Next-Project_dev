// src/pages/api/posts.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req

  if (method === 'GET') {
    const posts = await prisma.post.findMany({ orderBy: { createdAt: 'desc' } })
    return res.status(200).json(posts)
  }

  if (method === 'POST') {
    const { title, content } = req.body
    if (!title) return res.status(400).json({ error: 'Title is required' })

    const post = await prisma.post.create({
      data: { title, content },
    })

    return res.status(201).json(post)
  }

  if (method === 'DELETE') {
    const { id } = req.body
    await prisma.post.delete({ where: { id } })
    return res.status(204).end()
  }

  if (method === 'PUT') {
    const { id, title, content } = req.body
    const updatedPost = await prisma.post.update({
      where: { id },
      data: { title, content },
    })
    return res.status(200).json(updatedPost)
  }

  res.setHeader('Allow', ['GET', 'POST', 'DELETE', 'PUT'])
  res.status(405).end(`Method ${method} Not Allowed`)
}
