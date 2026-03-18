import { User } from '../../database/mongodb/models/user.model';
import { Leave } from '../../database/mongodb/models/leave.model';
import { Todo } from '../../database/mongodb/models/todo.model';
import { Notification } from '../../database/mongodb/models/notification.model';
import { LeaveStatusEnum } from '../../constants/constants';
import { Types } from 'mongoose';

export interface DashboardData {
  user: {
    name: string;
    email: string;
    role: string;
    department?: string;
    currentJob?: string;
    city?: string;
    avatar: string;
  };
  recentLeaves: Array<{
    id: string;
    type: string;
    startDate: Date;
    endDate: Date;
    status: string;
    reason?: string;
  }>;
  leaveBalance: {
    totalDays: number;
    usedDays: number;
    remainingDays: number;
    lastUpdated: Date;
  };
  tasks: Array<{
    id: string;
    title: string;
    description?: string;
    dueDate?: Date;
    priority: 'low' | 'medium' | 'high';
    completed: boolean;
  }>;
  notifications: {
    unreadCount: number;
    recent: Array<{
      id: string;
      title: string;
      body: string;
      type: string;
      createdAt: Date;
    }>;
  };
  companyNews: Array<{
    id: string;
    title: string;
    content: string;
    category: string;
    createdAt: Date;
    imageUrl?: string;
  }>;
}

export interface LeaveBalanceData {
  totalDays: number;
  usedDays: number;
  remainingDays: number;
  lastUpdated: Date;
}

export interface TaskData {
  id: string;
  title: string;
  description?: string;
  dueDate?: Date;
  priority: 'low' | 'medium' | 'high';
  completed: boolean;
}

export interface NewsData {
  id: string;
  title: string;
  content: string;
  category: string;
  createdAt: Date;
  imageUrl?: string;
}

class EmployeeService {
  // Get complete dashboard data for employee
  async getDashboardData(userId: string): Promise<DashboardData> {
    const user = await User.findById(userId).select('-password -otp');
    if (!user) {
      throw new Error('User not found');
    }

    const [leaveBalance, tasks, notifications, news, recentLeaves] = await Promise.all([
      this.getLeaveBalance(userId),
      this.getEmployeeTasks(userId),
      this.getRecentNotifications(userId),
      this.getCompanyNews(),
      this.getRecentLeaves(userId),
    ]);

    return {
      user: {
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        currentJob: user.currentJob,
        city: user.city,
        avatar: user.avatar,
      },
      leaveBalance,
      tasks,
      notifications,
      companyNews: news,
      recentLeaves,
    };
  }

  // Get employee leave balance
  async getLeaveBalance(userId: string): Promise<LeaveBalanceData> {
    const currentYear = new Date().getFullYear();
    const yearStart = new Date(currentYear, 0, 1);
    const yearEnd = new Date(currentYear, 11, 31);

    // Get all approved leaves for current year
    const approvedLeaves = await Leave.find({
      user: new Types.ObjectId(userId),
      status: LeaveStatusEnum.approved,
      startDate: { $gte: yearStart },
      endDate: { $lte: yearEnd },
    });

    // Calculate used days (simplified calculation)
    let usedDays = 0;
    approvedLeaves.forEach((leave: any) => {
      const days = Math.ceil((leave.endDate.getTime() - leave.startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      usedDays += days;
    });

    // Standard leave days per year (can be made configurable)
    const totalDays = 25; // Standard 25 days per year

    return {
      totalDays,
      usedDays,
      remainingDays: Math.max(0, totalDays - usedDays),
      lastUpdated: new Date(),
    };
  }

  // Get employee tasks
  async getEmployeeTasks(userId: string): Promise<TaskData[]> {
    const todos = await Todo.find({
      user: new Types.ObjectId(userId),
      isConpleted: false,
    })
      .sort({ createdAt: -1 })
      .limit(5);

    return todos.map((todo: any) => ({
      id: todo._id.toString(),
      title: todo.name,
      description: todo.description,
      dueDate: todo.dueDate,
      priority: todo.slug === 'urgent' ? 'high' : 'medium',
      completed: todo.isConpleted || false,
    }));
  }

  // Get recent leave history for employee
  async getRecentLeaves(userId: string) {
    const leaves = await Leave.find({
      user: new Types.ObjectId(userId),
    })
      .sort({ startDate: -1 })
      .limit(5);

    return leaves.map((leave: any) => ({
      id: leave._id.toString(),
      type: leave.type,
      startDate: leave.startDate,
      endDate: leave.endDate,
      status: leave.status,
      reason: leave.reason,
    }));
  }

  // Get recent notifications
  async getRecentNotifications(userId: string) {
    const unreadCount = await Notification.countDocuments({
      user: new Types.ObjectId(userId),
      isRead: false,
    });

    const recent = await Notification.find({
      user: new Types.ObjectId(userId),
    })
      .sort({ createdAt: -1 })
      .limit(5);

    return {
      unreadCount,
      recent: recent.map((notif: any) => ({
        id: notif._id.toString(),
        title: notif.title,
        body: notif.body,
        type: notif.type,
        createdAt: notif.createdAt!,
      })),
    };
  }

  // Get company news (mock data for now, can be enhanced with a news model)
  async getCompanyNews(): Promise<NewsData[]> {
    // Mock company news - in a real app, this would come from a news collection
    return [
      {
        id: '1',
        title: 'Lancement du nouveau projet Alpha',
        content: 'Découvrez les détails de notre collaboration stratégique pour l\'année 2025. Ce projet ambitieux va transformer notre façon de travailler et nous positionner comme leader du marché.',
        category: 'Projet',
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        imageUrl: null,
      },
      {
        id: '2',
        title: 'Nouvelle politique télétravail',
        content: 'À partir du mois prochain, les bénéficiaires pourront télétravailler jusqu\'à 3 jours par semaine. Les modalités précises seront communiquées prochainement.',
        category: 'RH',
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
        imageUrl: null,
      },
      {
        id: '3',
        title: 'Semaine bien-être organisée',
        content: 'Participez à notre semaine dédiée au bien-être avec des ateliers yoga, méditation et nutrition. Des surprises vous attendent!',
        category: 'Événement',
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
        imageUrl: null,
      },
    ];
  }
}

export default new EmployeeService();
