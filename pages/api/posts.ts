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
    } catch {
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
    try {
      const session = await getServerSession(req, res, authOptions);
      if (!session?.user?.email) {
        return res.status(401).json({ 
          success: false,
          message: "You must be logged in to delete posts" 
        });
      }

      const { id } = req.body;
      if (!id) {
        return res.status(400).json({ 
          success: false,
          message: "Post ID is required" 
        });
      }

      // First verify the post exists
      const existingPost = await prisma.post.findUnique({
        where: { id },
        include: { user: true }
      });

      if (!existingPost) {
        return res.status(404).json({ 
          success: false,
          message: "Post not found" 
        });
      }

      // Then verify the user owns the post
      const user = await prisma.user.findUnique({
        where: { email: session.user.email }
      });

      if (!user) {
        return res.status(404).json({ 
          success: false,
          message: "User not found" 
        });
      }

      if (existingPost.userId !== user.id) {
        return res.status(403).json({ 
          success: false,
          message: "You can only delete your own posts" 
        });
      }

      // If we get here, we know the post exists and belongs to the user
      await prisma.post.delete({
        where: { id }
      });

      return res.status(200).json({ 
        success: true,
        message: "Post deleted successfully" 
      });
    } catch (error) {
      console.error("Error deleting post:", error);
      return res.status(500).json({ 
        success: false,
        message: "Failed to delete post. Please try again." 
      });
    }
  }

  if (method === "PUT") {
    try {
      const session = await getServerSession(req, res, authOptions);
      if (!session?.user?.email) {
        return res.status(401).json({ 
          success: false,
          message: "You must be logged in to edit posts" 
        });
      }

      const { id, title, content } = req.body;
      if (!id || !title) {
        return res.status(400).json({ 
          success: false,
          message: "Post ID and title are required" 
        });
      }

      // First verify the post exists
      const existingPost = await prisma.post.findUnique({
        where: { id },
        include: { user: true }
      });

      if (!existingPost) {
        return res.status(404).json({ 
          success: false,
          message: "Post not found" 
        });
      }

      // Then verify the user owns the post
      const user = await prisma.user.findUnique({
        where: { email: session.user.email }
      });

      if (!user) {
        return res.status(404).json({ 
          success: false,
          message: "User not found" 
        });
      }

      if (existingPost.userId !== user.id) {
        return res.status(403).json({ 
          success: false,
          message: "You can only edit your own posts" 
        });
      }

      // If we get here, we know the post exists and belongs to the user
      const updatedPost = await prisma.post.update({
        where: { id },
        data: { title, content },
        include: {
          user: {
            select: { name: true, email: true },
          },
        },
      });

      return res.status(200).json({ 
        success: true,
        data: updatedPost,
        message: "Post updated successfully" 
      });
    } catch (error) {
      console.error("Error updating post:", error);
      return res.status(500).json({ 
        success: false,
        message: "Failed to update post. Please try again." 
      });
    }
  }

  res.setHeader("Allow", ["GET", "POST", "DELETE", "PUT"]);
  res.status(405).end(`Method ${method} Not Allowed`);
}
