import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";

import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).end();
  }

  const { email, password, name } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Missing email or password" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
      },
    });
    return res.status(200).json(user);
  } catch (error) {
    console.error("Error creating user:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
}
