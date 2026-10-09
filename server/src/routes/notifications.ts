import { Router, Response } from 'express';
import { prisma } from '../lib/prisma';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth';

export const notificationRouter = Router();

notificationRouter.use(authenticateToken);

notificationRouter.get('/', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const notifications = await prisma.notification.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    res.json({
      success: true,
      data: notifications,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Error fetching notifications' });
  }
});

notificationRouter.patch('/:id/read', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const { id } = req.params;

    const notification = await prisma.notification.findUnique({ where: { id } });
    if (!notification || notification.userId !== req.user.id) {
      res.status(404).json({ success: false, message: 'Notification not found' });
      return;
    }

    const updated = await prisma.notification.update({
      where: { id },
      data: { readAt: new Date() },
    });

    res.json({ success: true, data: updated });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Error updating notification' });
  }
});
