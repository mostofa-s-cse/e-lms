import React from 'react';
import DataTable from '../../pages/DataTable';
import { Note } from './types';

interface NotesTabProps {
  notes: Note[];
  loading: boolean;
  onEdit: (note: Note) => void;
  onDelete: (note: Note) => void;
  onCreate: () => void;
}

const NotesTab: React.FC<NotesTabProps> = ({ 
  notes, 
  loading, 
  onEdit, 
  onDelete, 
  onCreate 
}) => {
  return (
    <div className="space-y-6">
      <div className="flex justify-end items-center">
        <button
          onClick={onCreate}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Add Note
        </button>
      </div>
      <DataTable
        columns={[
          {
            key: 'title',
            label: 'Title',
            render: (title: string, note: Note) => (
              <div>
                <div className="text-sm font-medium text-gray-900">{title}</div>
                <div className="text-sm text-gray-500 mt-1">
                  {note.description && note.description.length > 100 ? `${note.description.substring(0, 100)}...` : note.description || 'No description'}
                </div>
                {note.file && (
                  <div className="text-sm text-blue-600 mt-1">
                    {note.isImage ? '🖼️' : '📎'} {note.file.split('/').pop()}
                    {note.fileSize && (
                      <span className="text-gray-500 ml-1">
                        ({(note.fileSize / 1024 / 1024).toFixed(2)} MB)
                      </span>
                    )}
                  </div>
                )}
              </div>
            )
          },
          {
            key: 'file',
            label: 'File',
            render: (_: any, note: Note) => (
              <div className="text-sm text-gray-900">
                {note.file ? (
                  <div className="flex items-center space-x-2">
                    {note.isImage ? (
                      <img
                        src={`${process.env.REACT_APP_IMG_URL || 'http://localhost:4000'}${note.file}`}
                        alt="Note file"
                        className="w-8 h-8 rounded object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center">
                        <span className="text-xs text-blue-600">📎</span>
                      </div>
                    )}
                    <span>{note.file.split('/').pop()}</span>
                  </div>
                ) : (
                  'No file'
                )}
              </div>
            )
          },
          {
            key: 'author',
            label: 'Author',
            render: (_: any, note: Note) => (
              <div className="text-sm text-gray-900">
                {note.author ? `${note.author.firstName} ${note.author.lastName}` : 'N/A'}
              </div>
            )
          },
          {
            key: 'isActive',
            label: 'Status',
            render: (isActive: boolean) => (
              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {isActive ? 'Active' : 'Inactive'}
              </span>
            )
          },
          {
            key: 'createdAt',
            label: 'Created',
            render: (date: string) => (
              <span className="text-sm text-gray-900">
                {new Date(date).toLocaleDateString()}
              </span>
            )
          }
        ]}
        data={notes}
        loading={loading}
        title="Course Notes"
        onEdit={onEdit}
        onDelete={onDelete}
      />
    </div>
  );
};

export default NotesTab; 