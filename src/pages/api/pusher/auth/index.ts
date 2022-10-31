import { NextApiRequest, NextApiResponse } from "next";
import pusher from "../../../../../lib/pusher";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const {
    socket_id: socketId,
    channel_name: channelName,
    username,
  }: { socket_id: string; channel_name: string; username: string } = req.body;
  const randomString = Math.random().toString(36).slice(2);

  const presenceData = {
    user_id: randomString,
    user_info: {
      username,
    },
  };

  try {
    const auth = pusher.authorizeChannel(socketId, channelName, presenceData);
    res.send(auth);
  } catch (error) {
    res.send(500);
  }
}