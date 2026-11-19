import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import { UploadCloud, FileText, Eye } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';

export default function LecturerDashboard() {
  const queryClient = useQueryClient();
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState<File | null>(null);

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

  // 3. Upload Material Mutation
  const uploadMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      return await api.post('/materials', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['materials', selectedCourse] });
      setIsModalOpen(false);
      setTitle(''); setDescription(''); setFile(null);
    },
    onError: (error: any) => {
      alert(error.response?.data?.message || 'Failed to upload material');
    }
  });

  const handleUpload = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourse || !file) return;

    const formData = new FormData();
    formData.append('courseCode', selectedCourse);
    formData.append('title', title);
    formData.append('description', description);
    formData.append('file', file);

    uploadMutation.mutate(formData);
  };

  return (
    <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-8">
      
      {/* Left Sidebar - Course List */}
      <div className="w-full md:w-64 flex-shrink-0">
        <h2 className="text-lg font-semibold text-text-main mb-4">My Courses</h2>
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

      {/* Right Area - Materials List */}
      <div className="flex-1">
        {!selectedCourse ? (
          <div className="h-64 flex flex-col items-center justify-center bg-surface border border-border border-dashed rounded-xl p-8 text-center">
            <UploadCloud className="w-12 h-12 text-brand-200 mb-4" />
            <h3 className="text-lg font-medium text-text-main mb-2">Select a course</h3>
            <p className="text-text-muted text-sm max-w-sm">
              Choose a course to view delivery logs and upload new materials.
            </p>
          </div>
        ) : loadingMaterials ? (
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div key={i} className="h-32 bg-surface rounded-xl border border-border animate-pulse" />
            ))}
          </div>
        ) : materials?.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center bg-surface border border-border border-dashed rounded-xl p-8 text-center">
            <UploadCloud className="w-12 h-12 text-brand-200 mb-4" />
            <h3 className="text-lg font-medium text-text-main mb-2">No materials yet</h3>
            <p className="text-text-muted text-sm mb-4">
              Upload the first lecture note or slide for {selectedCourse}.
            </p>
            <Button onClick={() => setIsModalOpen(true)} className="w-auto flex items-center gap-2">
              Upload Material
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-text-main">Uploaded Materials</h3>
                <Button onClick={() => setIsModalOpen(true)} className="w-auto flex items-center gap-2 px-4 h-9 text-xs">
                  <UploadCloud className="w-3 h-3" /> New Upload
                </Button>
            </div>

            {materials?.map((m: any) => (
              <div key={m._id} className="bg-surface p-6 rounded-xl border border-border shadow-sm">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-text-main flex items-center gap-2">
                      <FileText className="w-5 h-5 text-brand-500" />
                      {m.title}
                    </h3>
                    {m.description && <p className="text-sm text-text-muted mt-1">{m.description}</p>}
                  </div>
                </div>
                
                {/* 🔥 DELIVERY LOG UI */}
                <div className="mt-6 p-4 bg-gray-50 border border-gray-100 rounded-lg flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Eye className="w-4 h-4 text-emerald-500" />
                    <span className="font-medium">Delivery Log:</span>
                    <span>Seen by {m.deliveryLog?.inAppSeenBy?.length || 0} students</span>
                  </div>
                  <a 
                    href={m.fileUrl} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="text-sm text-brand-600 font-medium hover:underline"
                  >
                    View File
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Upload Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={`Upload Material for ${selectedCourse}`}>
        <form onSubmit={handleUpload} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-main mb-1.5">Title</label>
            <Input required placeholder="e.g. Introduction to Logic Gates" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-main mb-1.5">Description (Optional)</label>
            <Input placeholder="Short summary of the material" value={description} onChange={(e) => setDescription(e.target.value)} />
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
              Upload Material
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}