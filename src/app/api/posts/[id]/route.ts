import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';
import { requireAuth } from '@/lib/auth/middleware';
import { Post } from '@/types';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const docRef = adminDb.collection('posts').doc(params.id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      );
    }

    const data = doc.data();
    if (!data) {
      return NextResponse.json(
        { error: 'Post data is empty' },
        { status: 500 }
      );
    }

    const post: Post = {
      id: doc.id,
      ...data,
      createdAt: data.createdAt.toDate(),
      updatedAt: data.updatedAt.toDate(),
    } as Post;

    return NextResponse.json({ data: post });
  } catch (error) {
    console.error('Error fetching post:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const decodedToken = await requireAuth(request);
    if (decodedToken instanceof NextResponse) return decodedToken;

    const docRef = adminDb.collection('posts').doc(params.id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      );
    }

    const postData = doc.data();
    if (!postData) {
      return NextResponse.json(
        { error: 'Post data is empty' },
        { status: 500 }
      );
    }

    if (postData.authorId !== decodedToken.uid) {
      return NextResponse.json(
        { error: 'Unauthorized to edit this post' },
        { status: 403 }
      );
    }

    const { title, content } = await request.json();
    if (!title || !content) {
      return NextResponse.json(
        { error: 'Title and content are required' },
        { status: 400 }
      );
    }

    await docRef.update({
      title,
      content,
      updatedAt: new Date(),
    });

    return NextResponse.json({
      data: {
        id: doc.id,
        ...postData,
        title,
        content,
        updatedAt: new Date(),
      },
    });
  } catch (error) {
    console.error('Error updating post:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const decodedToken = await requireAuth(request);
    if (decodedToken instanceof NextResponse) return decodedToken;

    const docRef = adminDb.collection('posts').doc(params.id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      );
    }

    const postData = doc.data();
    if (!postData) {
      return NextResponse.json(
        { error: 'Post data is empty' },
        { status: 500 }
      );
    }

    if (postData.authorId !== decodedToken.uid) {
      return NextResponse.json(
        { error: 'Unauthorized to delete this post' },
        { status: 403 }
      );
    }

    await docRef.delete();
    return NextResponse.json({ data: { id: doc.id } });
  } catch (error) {
    console.error('Error deleting post:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 