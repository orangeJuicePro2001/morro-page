import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';
import { requireAuth } from '@/lib/auth/middleware';
import { Post } from '@/types';

// 确保集合存在
async function ensureCollection() {
  try {
    const postsRef = adminDb.collection('posts');
    // 检查集合是否存在
// QuerySnapshot 类型没有 exists 属性，通过检查 docs 数组长度判断集合是否为空
if ((await postsRef.limit(1).get()).docs.length === 0) {
      await adminDb.collection('posts').doc().set({ createdAt: new Date() });
    }
    return postsRef;
  } catch (error) {
    console.error('Error ensuring collection:', error);
    throw new Error('Failed to initialize posts collection');
  }
}

export async function GET() {
  try {
    const postsRef = await ensureCollection();
    const snapshot = await postsRef
      .orderBy('createdAt', 'desc')
      .limit(10)
      .get();

    const posts: Post[] = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      posts.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt.toDate(),
        updatedAt: data.updatedAt.toDate(),
      } as Post);
    });

    return NextResponse.json({ data: posts });
  } catch (error) {
    console.error('Error fetching posts:', error);
    
    // 处理特定类型的错误
    if (error.code === 5) {
      // 集合不存在，返回空数组
      return NextResponse.json({ data: [] });
    }
    
    if (error.code === 7) {
      return NextResponse.json(
        { error: 'Firestore API not enabled. Please enable it in the Google Cloud Console.' },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const decodedToken = await requireAuth(request);
    if (decodedToken instanceof NextResponse) return decodedToken;

    const { title, content } = await request.json();
    if (!title || !content) {
      return NextResponse.json(
        { error: 'Title and content are required' },
        { status: 400 }
      );
    }

    const postData = {
      title,
      content,
      authorId: decodedToken.uid,
      authorName: decodedToken.name || 'Anonymous',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const postsRef = await ensureCollection();
    const docRef = await postsRef.add(postData);
    
    return NextResponse.json({
      data: {
        id: docRef.id,
        ...postData,
      },
    });
  } catch (error) {
    console.error('Error creating post:', error);
    
    if (error.code === 7) {
      return NextResponse.json(
        { error: 'Firestore API not enabled. Please enable it in the Google Cloud Console.' },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}