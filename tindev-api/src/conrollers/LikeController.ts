import { Response } from 'express';

import Dev from '../models/Dev';
import { AppRequestProps } from '../interfaces/AppRequest';

export default {
  async store(req: AppRequestProps, res: Response): Promise<Response> {
    const user = req.headers.user as string;
    const { devId } = req.params;

    const loggedDev = await Dev.findById(user);
    const targetDev = await Dev.findById(devId);

    if (!targetDev) {
      return res.status(400).json({ error: 'Dev not exists' });
    }

    if (targetDev.likes.includes(loggedDev._id)) {
      const loggedSocket = req.connectedUsers[user];
      const targetSocket = req.connectedUsers[devId];

      if (loggedSocket) {
        req.io.to(loggedSocket).emit('match', targetDev);
      }

      if (targetSocket) {
        req.io.to(targetSocket).emit('match', loggedDev);
      }
    }

    loggedDev.likes.push(targetDev._id);

    await loggedDev.save();

    return res.json(loggedDev);
  },
};