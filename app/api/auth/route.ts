import { NextRequest, NextResponse } from 'next/server';
import { generateToken } from '../../utils/auth';

const DUMMY_USER = {
  id: '123',
  name: 'John Doe'
};

export async function POST(req: NextRequest) {
  const { userId } = await req.json();

  if (userId === DUMMY_USER.id) {
    const token = await generateToken(userId);
    return NextResponse.json({ success: true, user: DUMMY_USER, token });
  } else {
    return NextResponse.json({ success: false, message: 'Invalid User ID' }, { status: 401 });
  }
}