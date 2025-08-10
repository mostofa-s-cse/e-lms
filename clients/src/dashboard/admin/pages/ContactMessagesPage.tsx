import React, { useState, useEffect, useCallback } from 'react';
import { FaEnvelope, FaEye, FaTrash, FaCheck, FaTimes, FaClock, FaSpinner } from 'react-icons/fa';
import type { IconType } from 'react-icons';
import { contactAPI, ContactMessage } from '../../../services/api';
import { applySweetAlert } from '../../../utils/applySweetAlert';

interface ContactMessageWithActions extends ContactMessage {
  isUpdating?: boolean;
}

const ContactMessagesPage = () => {
  const [messages, setMessages] = useState<ContactMessageWithActions[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [adminResponse, setAdminResponse] = useState('');

  const fetchMessages = useCallback(async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();
      queryParams.append('page', currentPage.toString());
      queryParams.append('limit', '10');
      if (filterStatus !== 'all') {
        queryParams.append('status', filterStatus);
      }

      const response = await contactAPI.getMessages(`?${queryParams.toString()}`);
      
      if (response.data.success) {
        setMessages(response.data.data || []);
        setTotalPages(response.data.pagination?.pages || 1);
      }
    } catch (error: any) {
      console.error('Error fetching messages:', error);
      applySweetAlert({
        title: 'Error',
        text: 'Failed to fetch contact messages',
        icon: 'error'
      });
    } finally {
      setLoading(false);
    }
  }, [currentPage, filterStatus]);

  useEffect(() => {
    document.title = 'Contact Messages - Admin Dashboard | E-LMS';
    fetchMessages();
  }, [fetchMessages]);

  const handleStatusUpdate = async (messageId: string, newStatus: string) => {
    try {
      setMessages(prev => 
        prev.map(msg => 
          msg.id === messageId 
            ? { ...msg, isUpdating: true }
            : msg
        )
      );

      const response = await contactAPI.updateStatus(messageId, { 
        status: newStatus,
        adminResponse: adminResponse || undefined
      });

      if (response.data.success && response.data.data) {
        const updatedMessage: ContactMessageWithActions = {
          ...response.data.data,
          isUpdating: false
        };
        
        setMessages(prev => 
          prev.map(msg => 
            msg.id === messageId 
              ? updatedMessage
              : msg
          )
        );
        
        applySweetAlert({
          title: 'Success',
          text: 'Message status updated successfully',
          icon: 'success'
        });

        if (showModal) {
          setShowModal(false);
          setSelectedMessage(null);
          setAdminResponse('');
        }
      }
    } catch (error: any) {
      console.error('Error updating message status:', error);
      applySweetAlert({
        title: 'Error',
        text: 'Failed to update message status',
        icon: 'error'
      });
    } finally {
      setMessages(prev => 
        prev.map(msg => 
          msg.id === messageId 
            ? { ...msg, isUpdating: false }
            : msg
        )
      );
    }
  };

  const handleDelete = async (messageId: string) => {
    const result = await applySweetAlert({
      title: 'Are you sure?',
      text: 'This action cannot be undone',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it',
      cancelButtonText: 'Cancel'
    });

    if (result.isConfirmed) {
      try {
        await contactAPI.delete(messageId);
        setMessages(prev => prev.filter(msg => msg.id !== messageId));
        applySweetAlert({
          title: 'Deleted!',
          text: 'Message has been deleted',
          icon: 'success'
        });
      } catch (error: any) {
        console.error('Error deleting message:', error);
        applySweetAlert({
          title: 'Error',
          text: 'Failed to delete message',
          icon: 'error'
        });
      }
    }
  };

  const openMessageModal = (message: ContactMessage) => {
    setSelectedMessage(message);
    setAdminResponse(message.adminResponse || '');
    setShowModal(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'IN_PROGRESS': return 'bg-blue-100 text-blue-800';
      case 'RESOLVED': return 'bg-green-100 text-green-800';
      case 'CLOSED': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const renderIcon = (IconComponent: IconType, className: string) => {
    const Icon = IconComponent as React.ComponentType<{ className?: string }>;
    return <Icon className={className} />;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING': return renderIcon(FaClock, "w-4 h-4");
      case 'IN_PROGRESS': return renderIcon(FaSpinner, "w-4 h-4");
      case 'RESOLVED': return renderIcon(FaCheck, "w-4 h-4");
      case 'CLOSED': return renderIcon(FaTimes, "w-4 h-4");
      default: return renderIcon(FaClock, "w-4 h-4");
    }
  };

  const filteredMessages = messages.filter(message => {
    const matchesSearch = 
      message.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.subject.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || message.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Contact Messages</h1>
        <p className="text-gray-600">Manage and respond to contact form submissions</p>
      </div>

      {/* Filters and Search */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search by name, email, or subject..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="all">All Status</option>
          <option value="PENDING">Pending</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="RESOLVED">Resolved</option>
          <option value="CLOSED">Closed</option>
        </select>
      </div>

      {/* Messages Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            {renderIcon(FaSpinner, "w-8 h-8 text-blue-500 animate-spin mx-auto mb-4")}
            <p className="text-gray-600">Loading messages...</p>
          </div>
        ) : filteredMessages.length === 0 ? (
          <div className="p-8 text-center">
            {renderIcon(FaEnvelope, "w-12 h-12 text-gray-400 mx-auto mb-4")}
            <p className="text-gray-600">No messages found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact Info
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Subject
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredMessages.map((message) => (
                  <tr key={message.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{message.name}</div>
                        <div className="text-sm text-gray-500">{message.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-xs truncate" title={message.subject}>
                        {message.subject}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(message.status)}`}>
                        {getStatusIcon(message.status)}
                        <span className="ml-1">{message.status.replace('_', ' ')}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(message.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => openMessageModal(message)}
                          className="text-blue-600 hover:text-blue-900 p-1"
                          title="View & Respond"
                        >
                          {renderIcon(FaEye, "w-4 h-4")}
                        </button>
                        <button
                          onClick={() => handleStatusUpdate(message.id, 'RESOLVED')}
                          disabled={message.isUpdating || message.status === 'RESOLVED'}
                          className="text-green-600 hover:text-green-900 p-1 disabled:opacity-50"
                          title="Mark as Resolved"
                        >
                          {renderIcon(FaCheck, "w-4 h-4")}
                        </button>
                        <button
                          onClick={() => handleDelete(message.id)}
                          className="text-red-600 hover:text-red-900 p-1"
                          title="Delete"
                        >
                          {renderIcon(FaTrash, "w-4 h-4")}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6 flex justify-center">
          <nav className="flex space-x-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`px-3 py-2 text-sm font-medium rounded-md ${
                  currentPage === page
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50'
                }`}
              >
                {page}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </nav>
        </div>
      )}

      {/* Message Modal */}
      {showModal && selectedMessage && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Message Details</h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  {renderIcon(FaTimes, "w-5 h-5")}
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">From:</label>
                  <p className="text-sm text-gray-900">{selectedMessage.name} ({selectedMessage.email})</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Subject:</label>
                  <p className="text-sm text-gray-900">{selectedMessage.subject}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Message:</label>
                  <div className="bg-gray-50 p-3 rounded-md">
                    <p className="text-sm text-gray-900 whitespace-pre-wrap">{selectedMessage.message}</p>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Admin Response:</label>
                  <textarea
                    value={adminResponse}
                    onChange={(e) => setAdminResponse(e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Add your response here..."
                  />
                </div>
                
                <div className="flex justify-between items-center">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleStatusUpdate(selectedMessage.id, 'IN_PROGRESS')}
                      disabled={selectedMessage.status === 'IN_PROGRESS'}
                      className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-100 rounded-md hover:bg-blue-200 disabled:opacity-50"
                    >
                      Mark In Progress
                    </button>
                    <button
                      onClick={() => handleStatusUpdate(selectedMessage.id, 'RESOLVED')}
                      disabled={selectedMessage.status === 'RESOLVED'}
                      className="px-4 py-2 text-sm font-medium text-green-600 bg-green-100 rounded-md hover:bg-green-200 disabled:opacity-50"
                    >
                      Mark Resolved
                    </button>
                  </div>
                  
                  <button
                    onClick={() => handleStatusUpdate(selectedMessage.id, 'CLOSED')}
                    disabled={selectedMessage.status === 'CLOSED'}
                    className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 disabled:opacity-50"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContactMessagesPage;
