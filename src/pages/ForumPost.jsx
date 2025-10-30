import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FaArrowLeft, FaThumbsUp, FaReply, FaClock, FaUser, FaEye } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';

const ForumPost = () => {
  const { postId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [replies, setReplies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [replyContent, setReplyContent] = useState('');
  const [submittingReply, setSubmittingReply] = useState(false);

  useEffect(() => {
    fetchPost();
  }, [postId]);

  const fetchPost = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/community/posts/${postId}`);
      const data = await response.json();
      
      if (response.ok) {
        setPost(data.post);
        setReplies(data.replies || []);
      } else {
        console.error('Error fetching post:', data.error);
      }
    } catch (error) {
      console.error('Error fetching post:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpvote = async () => {
    if (!user) {
      alert('Please log in to upvote');
      return;
    }

    try {
      const response = await fetch(`/api/community/posts/${postId}/upvote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: user.id
        })
      });

      if (response.ok) {
        // Refresh post data
        fetchPost();
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to upvote');
      }
    } catch (error) {
      console.error('Error upvoting:', error);
      alert('Failed to upvote. Please try again.');
    }
  };

  const handleReply = async (e) => {
    e.preventDefault();
    
    if (!user) {
      alert('Please log in to reply');
      return;
    }

    if (!replyContent.trim()) {
      alert('Please enter a reply');
      return;
    }

    try {
      setSubmittingReply(true);
      
      const response = await fetch(`/api/community/posts/${postId}/reply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: user.id,
          content: replyContent
        })
      });

      const data = await response.json();

      if (response.ok) {
        setReplyContent('');
        // Refresh post data to get new reply
        fetchPost();
      } else {
        alert(data.error || 'Failed to submit reply');
      }
    } catch (error) {
      console.error('Error submitting reply:', error);
      alert('Failed to submit reply. Please try again.');
    } finally {
      setSubmittingReply(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Post Not Found</h1>
            <p className="text-gray-600 mb-6">The post you're looking for doesn't exist or has been removed.</p>
            <Link
              to="/community/forum"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <FaArrowLeft className="mr-2" />
              Back to Forum
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <button
          onClick={() => navigate('/community/forum')}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
        >
          <FaArrowLeft className="mr-2" />
          Back to Forum
        </button>

        {/* Post */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {post.category}
                </span>
                {post.is_pinned && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                    Pinned
                  </span>
                )}
              </div>
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <div className="flex items-center">
                  <FaEye className="mr-1" />
                  {post.views || 0}
                </div>
                <div className="flex items-center">
                  <FaClock className="mr-1" />
                  {formatDate(post.created_at)}
                </div>
              </div>
            </div>

            <h1 className="text-2xl font-bold text-gray-900 mb-4">{post.title}</h1>
            
            <div className="flex items-center mb-6">
              <img
                src={`https://ui-avatars.com/api/?name=${post.users?.name || 'User'}&background=3b82f6&color=fff`}
                alt={post.users?.name || 'User'}
                className="h-10 w-10 rounded-full mr-3"
              />
              <div>
                <p className="font-medium text-gray-900">{post.users?.name || 'Anonymous'}</p>
                <p className="text-sm text-gray-500">{post.users?.email}</p>
              </div>
            </div>

            <div className="prose max-w-none mb-6">
              <p className="text-gray-700 whitespace-pre-wrap">{post.content}</p>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
              <button
                onClick={handleUpvote}
                className="flex items-center px-4 py-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              >
                <FaThumbsUp className="mr-2" />
                {post.upvotes || 0} Upvotes
              </button>
            </div>
          </div>
        </div>

        {/* Replies */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Replies ({replies.length})
            </h2>

            {replies.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No replies yet. Be the first to reply!</p>
            ) : (
              <div className="space-y-4">
                {replies.map(reply => (
                  <div key={reply.id} className="border-l-4 border-gray-200 pl-4">
                    <div className="flex items-center mb-2">
                      <img
                        src={`https://ui-avatars.com/api/?name=${reply.users?.name || 'User'}&background=10b981&color=fff`}
                        alt={reply.users?.name || 'User'}
                        className="h-8 w-8 rounded-full mr-3"
                      />
                      <div>
                        <p className="font-medium text-gray-900">{reply.users?.name || 'Anonymous'}</p>
                        <p className="text-sm text-gray-500">{formatDate(reply.created_at)}</p>
                      </div>
                    </div>
                    <p className="text-gray-700 whitespace-pre-wrap">{reply.content}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Reply Form */}
        {user ? (
          <div className="bg-white rounded-lg shadow-sm">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Add a Reply</h3>
              <form onSubmit={handleReply}>
                <textarea
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  rows={4}
                  placeholder="Share your thoughts..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-4"
                  required
                />
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={submittingReply}
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <FaReply className="mr-2" />
                    {submittingReply ? 'Posting...' : 'Post Reply'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm p-6 text-center">
            <p className="text-gray-600 mb-4">Please log in to reply to this post.</p>
            <Link
              to="/login"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Log In
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default ForumPost;
