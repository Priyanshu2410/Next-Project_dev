// src/pages/api/posts.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from "next-auth";
import { authOptions } from "./auth/[...nextauth]";

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req;

  if (method === "POST") {
    const session = await getServerSession(req, res, authOptions);

    if (!session?.user?.email) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { title, content } = req.body;
    if (!title) return res.status(400).json({ error: "Title is required" });

    try {
      const user = await prisma.user.findUnique({
        where: { email: session.user.email },
      });

      if (!user) return res.status(404).json({ error: "User not found" });

      const post = await prisma.post.create({
        data: {
          title,
          content,
          userId: user.id,
        },
        include: {
          user: {
            select: { name: true, email: true },
          },
        },
      });

      return res.status(201).json(post);
    } catch (error) {
      return res.status(500).json({ error: "Error creating post" });
    }
  }

  if (method === "GET") {
    const posts = await prisma.post.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: { name: true, email: true },
        },
      },
    });
    return res.status(200).json(posts);
  }

  if (method === "DELETE") {
    const { id } = req.body;
    await prisma.post.delete({ where: { id } });
    return res.status(204).end();
  }

  if (method === "PUT") {
    const { id, title, content } = req.body;
    const updatedPost = await prisma.post.update({
      where: { id },
      data: { title, content },
      include: {
        user: {
          select: { name: true, email: true },
        },
      },
    });
    return res.status(200).json(updatedPost);
  }

  res.setHeader("Allow", ["GET", "POST", "DELETE", "PUT"]);
  res.status(405).end(`Method ${method} Not Allowed`);
}
