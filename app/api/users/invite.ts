import { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "@/utils/supabase/client";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    const { email, gym_id, invited_by } = req.body;

    if (!email || !gym_id || !invited_by) {
        return res.status(400).json({ error: "Missing required fields" });
    }

    // Insert invite into the invitations table
    const { data, error } = await supabase
        .from("invitations")
        .insert([{ email, gym_id, invited_by, expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) }]); // Expires in 7 days

    if (error) {
        console.error("Error sending invite:", error);
        return res.status(500).json({ error: "Failed to send invite" });
    }

    // TODO: Add email-sending logic here (e.g., using SendGrid or Supabase email)
    return res.status(200).json({ message: "Invite sent successfully", data });
}
