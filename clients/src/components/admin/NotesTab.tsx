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
                  {note.content && note.content.length > 100 ? `${note.content.substring(0, 100)}...` : note.content || 'No content'}
                </div>
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