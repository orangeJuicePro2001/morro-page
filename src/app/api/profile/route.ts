import { NextRequest, NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebase/admin';
import { requireAuth } from '@/lib/auth/middleware';
import { User } from '@/types';

export async function GET(request: NextRequest) {
  try {
    const decodedToken = await requireAuth(request);
    if (decodedToken instanceof NextResponse) return decodedToken;

    const userRecord = await adminAuth.getUser(decodedToken.uid);
    
    const user: User = {
      uid: userRecord.uid,
      email: userRecord.email || '',
      displayName: userRecord.displayName || 'Anonymous',
      photoURL: userRecord.photoURL || undefined,
    };

    return NextResponse.json({ data: user });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 