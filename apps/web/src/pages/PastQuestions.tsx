import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import { FileText, Download, ThumbsUp, Search, Plus } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { useAuthStore } from '../store/authStore';

export default function PastQuestions() {
  const queryClient = useQueryClient();
  const currentUser = useAuthStore((state) => state.user);
  
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Form state
  const [year, setYear] = useState('');
  const [session, setSession] = useState('');
  const [semester, setSemester] = useState<'first' | 'second'>('first');
  const [file, setFile] = useState<File | null>(null);

  // 1. Fetch all courses
  const { data: courses, isLoading: loadingCourses } = useQuery({
    queryKey: ['courses'],
    queryFn: async () => {
      const res = await api.get('/courses');
      return res.data.data.courses;
    },
  });

  // 2. Fetch past questions for the selected course
  const { data: questions, isLoading: loadingQuestions } = useQuery({
    queryKey: ['pastQuestions', selectedCourse],
    queryFn: async () => {
      if (!selectedCourse) return [];
      const res = await api.get(`/past-questions/${selectedCourse}`);
      return res.data.data.questions;
    },
    enabled: !!selectedCourse,
  });

  // 3. Upload Mutation
  const uploadMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      return await api.post('/past-questions', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pastQuestions', selectedCourse] });
      setIsModalOpen(false);
      setYear(''); setSession(''); setFile(null);
    },
  });

  // 4. Vote Mutation (NEW)
  const voteMutation = useMutation({
    mutationFn: async (questionId: string) => {
      return await api.patch(`/past-questions/${questionId}/vote`);
    },
    onSuccess: () => {
      // Refresh the list to show the new vote count
      queryClient.invalidateQueries({ queryKey: ['pastQuestions', selectedCourse] });
    },
    onError: (error: any) => {
      alert(error.response?.data?.message || 'Failed to vote');
    }
  });

  const handleUpload = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourse || !file) return;

    const formData = new FormData();
    formData.append('courseCode', selectedCourse);
    formData.append('year', year);
    formData.append('session', session);
    formData.append('semester', semester);
    formData.append('file', file);

    uploadMutation.mutate(formData);
  };

  return (
    <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-8">
      
      {/* Left Sidebar - Course List */}
      <div className="w-full md:w-64 flex-shrink-0">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-text-main">Courses</h2>
          <Search className="w-4 h-4 text-text-muted" />
        </div>
        
        <div className="space-y-1">
          {loadingCourses ? (
            <p className="text-sm text-text-muted">Loading courses...</p>
          ) : (
            courses?.map((course: any) => (
              <button
                key={course._id}
                onClick={() => setSelectedCourse(course.code)}
                className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  selectedCourse === course.code
                    ? 'bg-brand-50 text-brand-700 border border-brand-100'
                    : 'text-text-muted hover:bg-surface hover:text-text-main'
                }`}
              >
                <span className="block font-bold">{course.code}</span>
                <span className="block text-xs opacity-80 truncate">{course.title}</span>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Right Area - Past Questions List */}
      <div className="flex-1">
        {!selectedCourse ? (
          <div className="h-64 flex flex-col items-center justify-center bg-surface border border-border border-dashed rounded-xl p-8 text-center">
            <FileText className="w-12 h-12 text-brand-200 mb-4" />
            <h3 className="text-lg font-medium text-text-main mb-2">Select a course</h3>
            <p className="text-text-muted text-sm max-w-sm">
              Choose a course from the left to view verified past questions and solutions.
            </p>
          </div>
        ) : loadingQuestions ? (
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div key={i} className="h-32 bg-surface rounded-xl border border-border animate-pulse" />
            ))}
          </div>
        ) : questions?.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center bg-surface border border-border border-dashed rounded-xl p-8 text-center">
            <FileText className="w-12 h-12 text-brand-200 mb-4" />
            <h3 className="text-lg font-medium text-text-main mb-2">No past questions yet</h3>
            <p className="text-text-muted text-sm mb-4">
              Be the first to upload a past question for {selectedCourse}.
            </p>
            <Button onClick={() => setIsModalOpen(true)} className="w-auto flex items-center gap-2">
              <Plus className="w-4 h-4" /> Upload PDF
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-end mb-4">
                <Button onClick={() => setIsModalOpen(true)} className="w-auto flex items-center gap-2 px-4 h-9 text-xs">
                  <Plus className="w-3 h-3" /> Upload New
                </Button>
            </div>

            {questions?.map((q: any) => {
              // Check if the current user has already voted
              const hasVoted = q.helpfulVotes?.includes(currentUser?._id);

              return (
                <div key={q._id} className="bg-surface p-6 rounded-xl border border-border shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-text-main">
                        {q.session} — {q.semester} semester
                      </h3>
                      <p className="text-sm text-text-muted">Year: {q.year}</p>
                    </div>
                    {q.verified && (
                      <span className="bg-emerald-50 text-emerald-600 text-xs font-bold px-2 py-1 rounded-md border border-emerald-100">
                        Verified
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-3 mt-6">
                    <a href={q.fileUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2 bg-brand-50 text-brand-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-brand-100 transition-colors">
                      <Download className="w-4 h-4" /> Download PDF
                    </a>
                    
                    {/* 🔥 INTERACTIVE VOTE BUTTON */}
                    <button 
                      onClick={() => voteMutation.mutate(q._id)}
                      disabled={voteMutation.isPending || hasVoted}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        hasVoted 
                          ? 'bg-brand-50 text-brand-600 cursor-default' 
                          : 'text-text-muted hover:text-brand-500 hover:bg-brand-50'
                      }`}
                    >
                      <ThumbsUp className={`w-4 h-4 ${hasVoted ? 'fill-brand-500' : ''}`} /> 
                      Helpful ({q.helpfulVotes?.length || 0})
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Upload Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={`Upload for ${selectedCourse}`}>
        <form onSubmit={handleUpload} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-main mb-1.5">Session</label>
            <Input required placeholder="e.g. 2022/2023" value={session} onChange={(e) => setSession(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-main mb-1.5">Year</label>
            <Input required type="number" placeholder="e.g. 2023" value={year} onChange={(e) => setYear(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-main mb-1.5">Semester</label>
            <select 
              className="flex h-10 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
              value={semester}
              onChange={(e) => setSemester(e.target.value as 'first' | 'second')}
            >
              <option value="first">First Semester</option>
              <option value="second">Second Semester</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-text-main mb-1.5">PDF File</label>
            <input 
              type="file" 
              accept=".pdf"
              required
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="flex w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm file:mr-4 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100"
            />
          </div>
          
          <div className="pt-4">
            <Button type="submit" isLoading={uploadMutation.isPending}>
              Upload Question
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}