import React, { useState, useEffect } from 'react';
import { FiSearch, FiChevronLeft, FiChevronRight, FiArrowUp, FiArrowDown, FiEdit, FiCheckCircle, FiClock, FiX, FiChevronsLeft, FiChevronsRight, FiPlus } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import ErrorPopup from './ErrorPopup';
import { useApiError, handleResponse } from '../hooks/useApiError';
import { fetchWithAuth } from '../utils/fetchWithAuth';

interface HistoryItem {
  id: number;
  template_used: number;
  template_name: string;
  status: string;
  date_modified: string;
  unique_identifier: string;
}

interface SortConfig {
  key: keyof HistoryItem;
  direction: 'asc' | 'desc';
}

interface ApiResponse {
  data: HistoryItem[];
  recordsTotal: number;
  recordsFiltered: number;
}

interface CreateReportResponse {
  id: number;
  unique_identifier: string;
}

interface StatusCounts {
  completed: number;
  draft: number;
  total: number;
}

const PAGE_SIZE_OPTIONS = [5, 10, 15, 20, 25, 50, 100];

const History: React.FC = () => {
  const navigate = useNavigate();
  const { error, handleApiError, clearError } = useApiError();
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'date_modified', direction: 'desc' });
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [filteredItems, setFilteredItems] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [statusCounts, setStatusCounts] = useState<StatusCounts>({
    completed: 0,
    draft: 0,
    total: 0
  });
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [pageInput, setPageInput] = useState('');

  const fetchStatusCounts = async () => {
    try {
      const response = await fetchWithAuth('/api/report/status-counts');
      const data = await handleResponse<StatusCounts>(response);
      setStatusCounts(data);
    } catch (error) {
      handleApiError(error);
    }
  };

  useEffect(() => {
    fetchStatusCounts();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const offset = (currentPage - 1) * pageSize;
      const statusQuery = statusFilter ? `&status=${statusFilter}` : '';
      
      const response = await fetchWithAuth(
        `/api/report/?limit=${pageSize}&offset=${offset}&draw=${currentPage}&search=${encodeURIComponent(searchQuery)}&sortOrder=${sortConfig.direction}${statusQuery}`
      );

      const data = await handleResponse<ApiResponse>(response);
      setItems(data.data);
      setTotalItems(data.recordsTotal);
      setFilteredItems(data.recordsFiltered);

      // If current page is beyond the total pages, reset to last page
      const maxPage = Math.ceil(data.recordsTotal / pageSize);
      if (currentPage > maxPage) {
        setCurrentPage(Math.max(1, maxPage));
      }
    } catch (error) {
      handleApiError(error);
      if (error instanceof Error && error.message === 'Authentication required') {
        navigate('/login');
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchData();
    }, 300);

    return () => clearTimeout(timer);
  }, [currentPage, pageSize, sortConfig, searchQuery, statusFilter]);

  const handleSort = (key: keyof HistoryItem) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const totalPages = Math.ceil(totalItems / pageSize);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case 'COMPLETED':
        return 'bg-green-900/50 text-green-300';
      case 'DRAFT':
        return 'bg-yellow-900/50 text-yellow-300';
      case 'FAILED':
        return 'bg-red-900/50 text-red-300';
      default:
        return 'bg-white/50 text-gray-300';
    }
  };

  const handleNewSession = async () => {
    try {
      const response = await fetchWithAuth('/api/report/create/', {
        method: 'POST'
      });

      const data = await handleResponse<CreateReportResponse>(response);
      
      // Redirect to editor with the response parameters
      navigate(`/editor?report_id=${data.unique_identifier}&id=${data.id}`);
    } catch (error) {
      handleApiError(error);
      if (error instanceof Error && error.message === 'Authentication required') {
        navigate('/login');
      }
    }
  };

  const handleStatusClick = (status: string) => {
    if (statusFilter === status) {
      setStatusFilter(null);
    } else {
      setStatusFilter(status);
      setCurrentPage(1); // Reset to first page when filtering
    }
  };

  const handlePageInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Allow only numbers and empty string
    if (value === '' || /^\d+$/.test(value)) {
      setPageInput(value);
    }
  };

  const handlePageInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const pageNumber = parseInt(pageInput);
      if (pageNumber && pageNumber > 0 && pageNumber <= totalPages) {
        setCurrentPage(pageNumber);
        setPageInput('');
      }
    }
  };

  const handleFirstPage = () => setCurrentPage(1);
  const handleLastPage = () => setCurrentPage(totalPages);

  return (
    <div className="flex h-screen bg-white">
      <div className="flex-1 p-4">
        {error && (
          <ErrorPopup
            message={error.message}
            isAuthError={error.isAuthError}
            onClose={clearError}
          />
        )}
        
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-6">
            <div className="flex items-center w-64 relative">
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full py-1.5 px-8 bg-gray-800 border border-gray-700 rounded text-sm text-white focus:outline-none focus:border-blue-500"
              />
              <FiSearch className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            </div>
            
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-6">
                <button
                  onClick={() => handleStatusClick('COMPLETED')}
                  className={`flex items-center gap-2 px-2 py-1 rounded transition-colors ${
                    statusFilter === 'COMPLETED' ? 'bg-green-900/30' : 'hover:bg-gray-700'
                  }`}
                  title="Click to filter completed reports"
                >
                  <FiCheckCircle className="w-4 h-4 text-green-400" />
                  <span className="text-gray-300">{statusCounts.completed} Completed</span>
                  {statusFilter === 'COMPLETED' && (
                    <FiX className="w-4 h-4 text-gray-400 hover:text-white" />
                  )}
                </button>
                <button
                  onClick={() => handleStatusClick('DRAFT')}
                  className={`flex items-center gap-2 px-2 py-1 rounded transition-colors ${
                    statusFilter === 'DRAFT' ? 'bg-yellow-900/30' : 'hover:bg-gray-700'
                  }`}
                  title="Click to filter pending reports"
                >
                  <FiClock className="w-4 h-4 text-yellow-400" />
                  <span className="text-gray-300">{statusCounts.draft} Pending</span>
                  {statusFilter === 'DRAFT' && (
                    <FiX className="w-4 h-4 text-gray-400 hover:text-white" />
                  )}
                </button>
              </div>
              <div className="border-l border-gray-700 pl-4 text-gray-400">
                {searchQuery || statusFilter ? 
                  `Showing ${filteredItems} of ${statusCounts.total} records` : 
                  `Total ${statusCounts.total} records`}
              </div>
            </div>
          </div>
          <button
            onClick={handleNewSession}
            className="!px-4 !py-2 !bg-green-500 !text-white !rounded-lg !text-sm !font-semibold hover:!bg-green-400 !transition-all flex items-center gap-2 !shadow-lg hover:!shadow-green-400/30 !ring-1 !ring-green-300/50 !border-0"
          >
            <FiPlus className="w-4 h-4" />
            New Report
          </button>
        </div>

        <div className="bg-gray-800 rounded border border-gray-700">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-700">
              <thead>
                <tr>
                  {[
                    { label: 'ID', key: 'id' },
                    { label: 'Template Name', key: 'template_name' },
                    { label: 'Report Status', key: 'status' },
                    { label: 'Last Update', key: 'date_modified' },
                    { label: '', key: '' }
                  ].map(({ label, key }) => (
                    <th
                      key={label}
                      onClick={() => key && handleSort(key as keyof HistoryItem)}
                      className="px-3 py-2 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-700"
                    >
                      <div className="flex items-center gap-1">
                        {label}
                        {key && sortConfig.key === key && (
                          sortConfig.direction === 'asc' ? <FiArrowUp className="w-3 h-3" /> : <FiArrowDown className="w-3 h-3" />
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="px-3 py-2 text-center text-gray-400">Loading...</td>
                  </tr>
                ) : items.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-700/50">
                    <td className="px-3 py-2 text-sm text-gray-300">{item.id}</td>
                    <td className="px-3 py-2 text-sm text-gray-300">{item.template_name}</td>
                    <td className="px-3 py-2">
                      <span className={`px-2 py-0.5 rounded-full text-xs ${getStatusColor(item.status)}`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-sm text-gray-300">
                      {formatDate(item.date_modified)}
                    </td>
                    <td className="px-3 py-2">
                      <button
                        onClick={() => navigate(`/editor?report_id=${item.unique_identifier}&id=${item.id}`)}
                        className="p-1 text-gray-400 hover:text-white rounded"
                        title="Edit Report"
                      >
                        <FiEdit className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="px-3 py-2 border-t border-gray-700 flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <span>Show</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  const newPageSize = Number(e.target.value);
                  const newMaxPage = Math.ceil(totalItems / newPageSize);
                  setPageSize(newPageSize);
                  if (currentPage > newMaxPage) {
                    setCurrentPage(Math.max(1, newMaxPage));
                  }
                }}
                className="bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white text-sm focus:outline-none focus:border-blue-500"
              >
                {PAGE_SIZE_OPTIONS.map(size => (
                  <option key={size} value={size}>{size}</option>
                ))}
              </select>
              <span>entries per page</span>
            </div>
            
            <div className="flex items-center gap-3 text-sm">
              <div className="flex items-center gap-1">
                <button
                  onClick={handleFirstPage}
                  disabled={currentPage === 1}
                  className="p-1 rounded hover:bg-gray-700 text-gray-400 enabled:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                  title="First Page"
                >
                  <FiChevronsLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="p-1 rounded hover:bg-gray-700 text-gray-400 enabled:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Previous Page"
                >
                  <FiChevronLeft className="w-4 h-4" />
                </button>
              </div>

              <div className="flex items-center gap-2 min-w-[200px] justify-center">
                <span className="text-gray-400">Page</span>
                <div className="flex items-center gap-1">
                  <input
                    type="text"
                    value={pageInput}
                    onChange={handlePageInputChange}
                    onKeyDown={handlePageInputKeyDown}
                    placeholder={currentPage.toString()}
                    className="w-12 px-1 py-0.5 bg-gray-700 border border-gray-600 rounded text-center text-white text-sm focus:outline-none focus:border-blue-500"
                    title="Press Enter to go to page"
                  />
                  <span className="text-gray-400">of {totalPages}</span>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="p-1 rounded hover:bg-gray-700 text-gray-400 enabled:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Next Page"
                >
                  <FiChevronRight className="w-4 h-4" />
                </button>
                <button
                  onClick={handleLastPage}
                  disabled={currentPage === totalPages}
                  className="p-1 rounded hover:bg-gray-700 text-gray-400 enabled:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Last Page"
                >
                  <FiChevronsRight className="w-4 h-4" />
                </button>
              </div>

              <div className="border-l border-gray-700 pl-3 text-gray-400">
                {totalItems.toLocaleString()} total records
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default History; 