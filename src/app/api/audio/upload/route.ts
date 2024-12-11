import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import type { Server } from 'socket.io';

declare global {
  let io: Server | undefined;
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const audioFile = formData.get('audio') as File;
    
    if (!audioFile) {
      return NextResponse.json(
        { error: 'No audio file provided' },
        { status: 400 }
      );
    }

    // Convert audio file to base64
    const arrayBuffer = await audioFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64Audio = buffer.toString('base64');

    // Create audio item with base64 data
    const audioItem = {
      id: uuidv4(),
      userId: 'test-user',
      username: 'Test User',
      url: `data:audio/webm;base64,${base64Audio}`,
      duration: 0,
      createdAt: new Date().toISOString(),
      status: 'pending'
    };

    // Emit the new audio item to all connected clients
    if (io) {
      console.log('Emitting new audio to clients');
      io.emit('newAudio', audioItem);
    } else {
      console.warn('Socket.IO instance not found');
    }

    return NextResponse.json(audioItem);
  } catch (error) {
    console.error('Error uploading audio:', error);
    return NextResponse.json(
      { error: 'Failed to upload audio' },
      { status: 500 }
    );
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
};