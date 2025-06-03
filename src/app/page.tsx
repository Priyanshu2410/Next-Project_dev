// src/app/page.tsx
"use client";

import { useEffect, useState } from "react";
import toast from 'react-hot-toast'
import Link from 'next/link';

type Post = {
  id: number;
  title: string;
  content: string | null;
  createdAt: string;
};

export default function HomePage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  useEffect(() => {
    fetch("/api/posts")
      .then((res) => res.json())
      .then((data) => setPosts(data));
  }, []);
  const [editingId, setEditingId] = useState<number | null>(null);

  const handleEdit = (post: Post) => {
    setEditingId(post.id);
    setTitle(post.title);
    setContent(post.content || "");
  };

  const handleDelete = async (id: number) => {
    try {
      await fetch('/api/posts', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })
      setPosts(posts.filter((post) => post.id !== id))
      toast.success('Post deleted')
    } catch (err) {
      console.error(err)
      toast.error('Failed to delete post')
    }
  };

  const copyToClipboard = async (id: number) => {
    try {
      await navigator.clipboard.writeText(
        `${window.location.origin}/post/${id}`
      );
      toast.success('Link copied to clipboard!');
    } catch (err) {
      toast.error('Failed to copy link');
      console.error('Copy failed:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;

    const method = editingId ? "PUT" : "POST";
    const body = editingId
      ? { id: editingId, title, content }
      : { title, content };

    try {
      const res = await fetch('/api/posts', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (!res.ok) throw new Error('Failed to submit')

      const result = await res.json()

      if (editingId) {
        setPosts(posts.map((post) => (post.id === editingId ? result : post)))
        setEditingId(null)
        toast.success('Post updated!')
      } else {
        setPosts([result, ...posts])
        toast.success('Post created!')
      }

      setTitle('')
      setContent('')
    } catch (err) {
      console.error(err)
      toast.error('Something went wrong')
    }
  };

  return (
    <main className="max-w-xl mx-auto mt-10 px-4">
      <h1 className="text-3xl font-bold mb-4">📝 Create or Edit Post</h1>

      <form onSubmit={handleSubmit} className="space-y-4 mb-8">
        <input
          type="text"
          placeholder="Post Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded"
        />
        <textarea
          placeholder="Post Content (optional)"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded"
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          {editingId ? "Update Post" : "Create Post"}
        </button>
      </form>

      <h2 className="text-2xl font-semibold mb-2">📜 All Posts</h2>
      {posts.length === 0 ? (
        <p className="text-gray-500">No posts yet.</p>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <div key={post.id} className="mb-4 border p-4 rounded shadow">
              <h2 className="text-xl font-bold">
                <Link href={`/post/${post.id}`}>{post.title}</Link>
              </h2>
              <p>{post.content ? `${post.content.slice(0, 100)}...` : 'No content'}</p>
              <div className="flex gap-2 mt-2">
                <button
                  onClick={() => handleEdit(post)}
                  className="text-blue-600 hover:underline"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(post.id)}
                  className="text-red-600 hover:underline"
                >
                  Delete
                </button>
                <button
                  onClick={() => copyToClipboard(post.id)}
                  className="text-gray-600 hover:underline"
                >
                  Copy URL
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
