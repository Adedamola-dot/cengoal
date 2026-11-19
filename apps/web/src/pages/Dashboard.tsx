import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../store/authStore';
import { api } from '../lib/api';
import { BookOpen, FileText, Zap } from 'lucide-react';

export default function Dashboard() {
  const user = useAuthStore((state) => state.user);

  const { data: courses, isLoading } = useQuery({
    queryKey: ['courses'],
    queryFn: async () => {
      const res = await api.get('/courses');
      return res.data.data.courses;
    },
  });

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="bg-brand-500 rounded-2xl p-8 text-white shadow-sm flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-semibold mb-2">Welcome back, {user?.name.split(' ')[0]}!</h1>
          <p className="text-brand-100 max-w-lg">
            {user?.role === 'student' 
              ? `Ready to conquer ${user?.level || 'your'}L? Dive into verified past questions, check your course guides, and prepare for success.`
              : 'Ready to manage your courses? Upload materials and track your delivery logs.'}
          </p>
        </div>
        <Zap className="w-24 h-24 text-brand-400 opacity-50 hidden md:block" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-surface p-6 rounded-xl border border-border shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-text-muted font-medium">Total Courses</p>
            <p className="text-2xl font-bold text-text-main">
              {isLoading ? '...' : courses?.length || 0}
            </p>
          </div>
        </div>

        <div className="bg-surface p-6 rounded-xl border border-border shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-text-muted font-medium">Past Questions</p>
            <p className="text-2xl font-bold text-text-main">1</p>
          </div>
        </div>
      </div>
    </div>
  );
}