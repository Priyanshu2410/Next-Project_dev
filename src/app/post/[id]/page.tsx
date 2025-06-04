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
  user?: {
    name?: string | null;
    email?: string;
  };
};

export default function PostPage() {
  const params = useParams();
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
    <div className="max-w-2xl mx-auto p-6 bg-white rounded shadow-md mt-10">
      <div className="mb-4">
        <Link href="/" className="text-blue-600 hover:underline">← Back to posts</Link>
      </div>

      <h1 className="text-4xl font-extrabold mb-4 text-gray-800">{post.title}</h1>
      <p className="text-gray-700 text-lg mb-6 whitespace-pre-wrap">{post.content}</p>

      <div className="mb-4 text-sm text-gray-600">
        <p>📅 Created at: <span className="text-gray-800">{new Date(post.createdAt).toLocaleString()}</span></p>
        <p>👤 Created by: <span className="text-gray-800">{post.user?.name || "Unnamed"}</span> ({post.user?.email || "No email"})</p>
      </div>

      <button
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
        onClick={copyToClipboard}
      >
        📋 Copy Post URL
      </button>
    </div>
  );
}
