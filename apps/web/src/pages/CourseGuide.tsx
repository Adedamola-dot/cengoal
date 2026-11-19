import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import { BookOpen, Download, FileText } from 'lucide-react';

export default function CourseGuide() {
  const queryClient = useQueryClient();
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);

  // 1. Fetch all courses
  const { data: courses, isLoading: loadingCourses } = useQuery({
    queryKey: ['courses'],
    queryFn: async () => {
      const res = await api.get('/courses');
      return res.data.data.courses;
    },
  });

  // 2. Fetch materials for the selected course
  const { data: materials, isLoading: loadingMaterials } = useQuery({
    queryKey: ['materials', selectedCourse],
    queryFn: async () => {
      if (!selectedCourse) return [];
      const res = await api.get(`/materials/${selectedCourse}`);
      return res.data.data.materials;
    },
    enabled: !!selectedCourse,
  });

  // 3. Mark as seen mutation
  const markSeenMutation = useMutation({
    mutationFn: async (materialId: string) => {
      return await api.patch(`/materials/${materialId}/seen`);
    },
    onSuccess: () => {
      // We don't necessarily need to invalidate here for the student, 
      // but it's good practice if we show "Seen" status on the UI later.
    }
  });

  const handleViewMaterial = (materialId: string, fileUrl: string) => {
    // 1. Fire the API call to track proof of delivery
    markSeenMutation.mutate(materialId);
    
    // 2. Open the PDF in a new tab
    window.open(fileUrl, '_blank');
  };

  return (
    <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-8">
      
      {/* Left Sidebar - Course List */}
      <div className="w-full md:w-64 flex-shrink-0">
        <h2 className="text-lg font-semibold text-text-main mb-4">Course Guide</h2>
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

      {/* Right Area - Course Details & Materials */}
      <div className="flex-1">
        {!selectedCourse ? (
          <div className="h-64 flex flex-col items-center justify-center bg-surface border border-border border-dashed rounded-xl p-8 text-center">
            <BookOpen className="w-12 h-12 text-brand-200 mb-4" />
            <h3 className="text-lg font-medium text-text-main mb-2">Select a course</h3>
            <p className="text-text-muted text-sm max-w-sm">
              Choose a course from the left to view the course outline and lecturer materials.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Course Header & Outline (Mocked for now, we can add this to DB later) */}
            <div className="bg-surface p-6 rounded-xl border border-border shadow-sm">
              <h2 className="text-2xl font-bold text-text-main mb-2">{selectedCourse}</h2>
              <p className="text-text-muted mb-4">Official Course Outline</p>
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-100 text-sm text-gray-700">
                Review the course materials below. The lecturer will upload lecture notes, slides, and lab manuals here.
              </div>
            </div>

            <h3 className="text-lg font-semibold text-text-main flex items-center gap-2">
              <FileText className="w-5 h-5 text-brand-500" />
              Lecture Materials
            </h3>

            {loadingMaterials ? (
              <div className="h-24 bg-surface rounded-xl border border-border animate-pulse" />
            ) : materials?.length === 0 ? (
              <div className="p-8 text-center bg-surface border border-border border-dashed rounded-xl">
                <p className="text-text-muted">No materials uploaded by the lecturer yet.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {materials?.map((m: any) => (
                  <div key={m._id} className="bg-surface p-5 rounded-xl border border-border shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
                    <div>
                      <h4 className="font-semibold text-text-main">{m.title}</h4>
                      {m.description && <p className="text-sm text-text-muted mt-1">{m.description}</p>}
                      <p className="text-xs text-gray-400 mt-2">Uploaded by {m.uploadedBy?.name || 'Lecturer'}</p>
                    </div>
                    
                    {/* 🔥 WHEN THEY CLICK THIS, DELIVERY LOG UPDATES */}
                    <button 
                      onClick={() => handleViewMaterial(m._id, m.fileUrl)}
                      className="flex items-center gap-2 bg-brand-50 text-brand-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-brand-100 transition-colors"
                    >
                      <Download className="w-4 h-4" /> Open PDF
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}