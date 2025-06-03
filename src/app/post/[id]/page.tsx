'use client'

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';

type Post = {
  id: number;
  title: string;
  content: string | null;
  createdAt: string;
};

export default function PostPage() {
  const params = useParams(); // ✅ Extract params from useParams
  const postId = params?.id as string;

  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!postId) return;

    async function fetchPost() {
      try {
        const res = await fetch(`/api/posts/${postId}`);
        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          throw new Error(errorData.error || 'Failed to fetch post');
        }
        const data = await res.json();
        setPost(data);
        setError(null);
      } catch (error) {
        console.error('Error fetching post:', error);
        setError(error instanceof Error ? error.message : 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    }

    fetchPost();
  }, [postId]);

  if (loading) return <div className="max-w-2xl mx-auto p-4">Loading...</div>;
  if (error) return <div className="max-w-2xl mx-auto p-4 text-red-500">Error: {error}</div>;
  if (!post) return <div className="max-w-2xl mx-auto p-4">Post not found</div>;

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/post/${post.id}`);
      toast.success('Link copied to clipboard!');
    } catch (err) {
      toast.error('Failed to copy link');
      console.error('Copy failed:', err);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="mb-4">
        <Link href="/" className="text-blue-600 hover:underline">← Back to posts</Link>
      </div>
      
      <h1 className="text-3xl font-bold mb-2">{post.title}</h1>
      <p className="text-gray-700 mb-6">{post.content}</p>
      <p className="text-xs text-gray-400 mb-4">
        Created at: {new Date(post.createdAt).toLocaleString()}
      </p>

      <button
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        onClick={copyToClipboard}
      >
        Copy Post URL
      </button>
    </div>
  );
}
