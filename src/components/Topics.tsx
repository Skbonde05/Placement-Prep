import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase, Topic } from '../lib/supabase';
import {
  Plus,
  Edit2,
  Trash2,
  Clock,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import SearchBar from './SearchBar';


export default function Topics() {
  const { user } = useAuth();

  const [topics, setTopics] = useState<Topic[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (user) loadTopics();
  }, [user]);

  const loadTopics = async () => {
    const { data } = await supabase
      .from('topics')
      .select('*')
      .eq('user_id', user?.id)
      .order('created_at', { ascending: false });

    if (data) setTopics(data);
  };

  /* 🔍 SEARCH FILTER */
  const filteredTopics = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return topics;

    return topics.filter((topic) =>
      [
        topic.name,
        topic.category,
        topic.status,
        topic.priority,
      ]
        .join(' ')
        .toLowerCase()
        .includes(query)
    );
  }, [topics, searchQuery]);

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this topic?')) {
      await supabase.from('topics').delete().eq('id', id);
      loadTopics();
    }
  };

  const getStatusColor = (status: string) =>
    status === 'Completed'
      ? 'bg-green-100 text-green-700'
      : status === 'In Progress'
      ? 'bg-blue-100 text-blue-700'
      : 'bg-gray-100 text-gray-700';

  const getPriorityColor = (priority: string) =>
    priority === 'High'
      ? 'bg-red-100 text-red-700'
      : priority === 'Medium'
      ? 'bg-orange-100 text-orange-700'
      : 'bg-gray-100 text-gray-700';

  const getStatusIcon = (status: string) =>
    status === 'Completed' ? (
      <CheckCircle2 className="w-4 h-4" />
    ) : status === 'In Progress' ? (
      <Clock className="w-4 h-4" />
    ) : (
      <AlertCircle className="w-4 h-4" />
    );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Topics</h2>
          <p className="text-gray-600 mt-1">
            Track your learning progress across different subjects
          </p>
        </div>

        {/* Placeholder Add Topic Button */}
        <button
          onClick={() => alert('Add Topic modal not implemented yet')}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" />
          Add Topic
        </button>
      </div>

      {/* 🔍 Search Bar */}
      <SearchBar
  value={searchQuery}
  onChange={setSearchQuery}
  placeholder="Search topics, category, status, priority..."
/>


      {/* Topics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredTopics.map((topic) => {
          const progress =
            topic.total_hours > 0
              ? Math.round(
                  (topic.completed_hours / topic.total_hours) * 100
                )
              : 0;

          return (
            <div
              key={topic.id}
              className="bg-white rounded-xl border p-6 hover:shadow-md"
            >
              <div className="flex justify-between mb-4">
                <h3 className="text-lg font-semibold">{topic.name}</h3>
                <div className="flex gap-2">
                  <button title="Edit (not implemented)">
                    <Edit2 className="w-4 h-4 text-gray-400" />
                  </button>
                  <button onClick={() => handleDelete(topic.id)}>
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-3">
                <span
                  className={`px-2 py-1 text-xs rounded ${getStatusColor(
                    topic.status
                  )}`}
                >
                  {getStatusIcon(topic.status)} {topic.status}
                </span>
                <span
                  className={`px-2 py-1 text-xs rounded ${getPriorityColor(
                    topic.priority
                  )}`}
                >
                  {topic.priority}
                </span>
                <span className="px-2 py-1 text-xs rounded bg-cyan-100 text-cyan-700">
                  {topic.category}
                </span>
              </div>

              <div className="mb-2 text-sm">
                {topic.completed_hours}/{topic.total_hours}h ({progress}%)
              </div>

              <div className="h-2 bg-gray-200 rounded">
                <div
                  className="h-2 bg-blue-600 rounded"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          );
        })}

        {topics.length > 0 && filteredTopics.length === 0 && (
          <div className="col-span-2 text-center py-10 text-gray-500">
            No matching topics found
          </div>
        )}

        {topics.length === 0 && (
          <div className="col-span-2 text-center py-10 text-gray-400">
            No topics yet. Click “Add Topic” to get started.
          </div>
        )}
      </div>
    </div>
  );
}
