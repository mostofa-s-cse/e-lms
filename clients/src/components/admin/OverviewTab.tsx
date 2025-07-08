import React from 'react';
import { 
  BookOpen, 
  GraduationCap, 
  User, 
  Calendar,
  Video,
  Clock,
  Users,
  FileText,
  HelpCircle,
  DollarSign
} from 'lucide-react';
import { Course, Video as VideoType, Enrollment, Note, Quiz } from './types';

interface OverviewTabProps {
  course: Course;
  videos: VideoType[];
  enrollments: Enrollment[];
  notes: Note[];
  quizzes: Quiz[];
}

const OverviewTab: React.FC<OverviewTabProps> = ({ 
  course, 
  videos, 
  enrollments, 
  notes, 
  quizzes 
}) => {
  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const getTotalVideoDuration = () => {
    return videos.reduce((total, video) => total + video.duration, 0);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Course Information */}
      <div className="lg:col-span-2 space-y-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Course Information</h2>
          {/* Course Thumbnail */}
          <div className="flex-shrink-0">
            {course.thumbnail ? (
              <img
                src={`${process.env.REACT_APP_IMG_URL || 'http://localhost:4000'}${course.thumbnail}`}
                alt={`${course.title} thumbnail`}
                className="w-full h-auto rounded-lg object-cover border-2 border-gray-200 mb-4"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            ) : (
              <div className="w-full h-auto bg-gray-200 rounded-lg border-2 border-gray-200 flex items-center justify-center">
                <span className="text-sm text-gray-500">No image</span>
              </div>
            )}
          </div>
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <BookOpen className="w-5 h-5 text-gray-500" />
              <div>
                <p className="text-sm text-gray-600">Course Code</p>
                <p className="font-medium">{course.code}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <GraduationCap className="w-5 h-5 text-gray-500" />
              <div>
                <p className="text-sm text-gray-600">Credits</p>
                <p className="font-medium">{course.credits} credits</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <DollarSign className="w-5 h-5 text-gray-500" />
              <div>
                <p className="text-sm text-gray-600">Price</p>
                <p className="font-medium">BDT {course.price.toFixed(2)}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <User className="w-5 h-5 text-gray-500" />
              <div>
                <p className="text-sm text-gray-600">Teacher</p>
                <p className="font-medium">
                  {course.teacher ? `${course.teacher.firstName} ${course.teacher.lastName}` : 'N/A'}
                </p>
                {course.teacher && (
                  <p className="text-xs text-gray-500">{course.teacher.email}</p>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Calendar className="w-5 h-5 text-gray-500" />
              <div>
                <p className="text-sm text-gray-600">Created</p>
                <p className="font-medium">{new Date(course.createdAt).toLocaleDateString()}</p>
              </div>
            </div>

            {course.intakes && course.intakes.length > 0 && (
              <div className="flex items-start space-x-3">
                <GraduationCap className="w-5 h-5 text-gray-500 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-600">Associated Intakes</p>
                  <div className="space-y-1 mt-1">
                    {course.intakes.map((intake) => (
                      <div key={intake.id} className="text-sm">
                        <span className="font-medium">{intake.name}</span>
                        <span className="text-gray-500 ml-2">
                          ({new Date(intake.startDate).toLocaleDateString()} - {new Date(intake.endDate).toLocaleDateString()})
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-3">Description</h3>
          <p className="text-gray-700 leading-relaxed">{course.description}</p>
        </div>
      </div>

      {/* Statistics */}
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Course Statistics</h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Video className="w-5 h-5 text-blue-500" />
                <span className="text-sm text-gray-600">Total Videos</span>
              </div>
              <span className="font-semibold">{course._count?.videos || videos.length}</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Clock className="w-5 h-5 text-green-500" />
                <span className="text-sm text-gray-600">Total Duration</span>
              </div>
              <span className="font-semibold">{formatDuration(getTotalVideoDuration())}</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Users className="w-5 h-5 text-purple-500" />
                <span className="text-sm text-gray-600">Enrolled Students</span>
              </div>
              <span className="font-semibold">{course._count?.enrollments || enrollments.length}</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <FileText className="w-5 h-5 text-orange-500" />
                <span className="text-sm text-gray-600">Notes</span>
              </div>
              <span className="font-semibold">{course._count?.notes || notes.length}</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <HelpCircle className="w-5 h-5 text-indigo-500" />
                <span className="text-sm text-gray-600">Quizzes</span>
              </div>
              <span className="font-semibold">{course._count?.quizzes || quizzes.length}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OverviewTab; 