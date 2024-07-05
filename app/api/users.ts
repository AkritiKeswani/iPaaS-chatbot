import type { NextApiRequest, NextApiResponse } from "next";
import { v4 as uuidv4 } from "uuid"; // You'll need to install this: npm install uuid @types/uuid
import { kv } from "/../../Users/akritikeswani/paragon-app/paragon-app/app/components/ui/lib/kv";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method === "POST") {
    try {
      const { name } = req.body;
      const userId = uuidv4();

      await kv.set(`user:${userId}`, { name });

      res.status(201).json({ userId, name });
    } catch (error) {
      console.error("Error creating user:", error);
      res.status(500).json({ error: "Error creating user" });
    }
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
