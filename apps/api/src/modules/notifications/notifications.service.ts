import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { NotificationChannel, NotificationStatus } from '@prisma/client';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(
    userId: string,
    data: {
      type: string;
      channel?: NotificationChannel;
      title: string;
      body: string;
      complaintId?: string;
    },
  ) {
    const notification = await this.prisma.notification.create({
      data: {
        userId,
        type: data.type,
        channel: data.channel || NotificationChannel.IN_APP,
        title: data.title,
        body: data.body,
        complaintId: data.complaintId,
        status: NotificationStatus.SENT,
        sentAt: new Date(),
      },
    });

    this.logger.log(
      `Notification created for user ${userId}: ${data.title}`,
    );

    return notification;
  }

  async sendStatusUpdate(
    complaintId: string,
    oldStatus: string | null,
    newStatus: string,
  ) {
    const complaint = await this.prisma.complaint.findUnique({
      where: { id: complaintId },
      select: { userId: true, publicId: true, title: true },
    });

    if (!complaint) return;

    const statusLabel = newStatus.replace(/_/g, ' ').toLowerCase();
    const title = `Complaint ${complaint.publicId} updated`;
    const body = `Your complaint "${complaint.title}" status changed to ${statusLabel}.`;

    return this.create(complaint.userId, {
      type: 'STATUS_UPDATE',
      title,
      body,
      complaintId,
    });
  }

  async findByUser(
    userId: string,
    pagination: { page: number; limit: number },
  ) {
    const skip = (pagination.page - 1) * pagination.limit;

    const [items, total] = await Promise.all([
      this.prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: pagination.limit,
        include: {
          complaint: {
            select: { publicId: true, title: true, status: true },
          },
        },
      }),
      this.prisma.notification.count({ where: { userId } }),
    ]);

    return {
      items,
      meta: {
        page: pagination.page,
        limit: pagination.limit,
        total,
        totalPages: Math.ceil(total / pagination.limit),
      },
    };
  }

  async markAsRead(id: string, userId: string) {
    const notification = await this.prisma.notification.findFirst({
      where: { id, userId },
    });

    if (!notification) {
      throw new NotFoundException(`Notification ${id} not found`);
    }

    return this.prisma.notification.update({
      where: { id },
      data: { readAt: new Date() },
    });
  }

  async markAllAsRead(userId: string) {
    const result = await this.prisma.notification.updateMany({
      where: { userId, readAt: null },
      data: { readAt: new Date() },
    });

    return { updated: result.count };
  }

  async getUnreadCount(userId: string) {
    const count = await this.prisma.notification.count({
      where: { userId, readAt: null },
    });

    return { count };
  }
}
