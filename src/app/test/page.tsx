'use client';

import { useState, useRef } from 'react';
import { Mic, Square, Send } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

interface RecordingError {
    message: string;
}

export default function TestPage() {
    const [isRecording, setIsRecording] = useState(false);
    const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [credentials, setCredentials] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch('/api/users/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(credentials),
            });

            if (!res.ok) throw new Error('Invalid credentials');
            setIsLoggedIn(true);
            setError('');
        } catch (error) {
            const recordingError = error as RecordingError;
            console.error('Error starting recording:', recordingError.message);
            setError('Failed to start recording');
        }
    };

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            chunksRef.current = [];

            mediaRecorder.ondataavailable = (e) => {
                chunksRef.current.push(e.data);
            };

            mediaRecorder.onstop = () => {
                const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
                setAudioBlob(blob);
                stream.getTracks().forEach(track => track.stop());
            };

            mediaRecorder.start();
            setIsRecording(true);
        } catch (err) {
            console.error('Error starting recording:', err);
            setError('Failed to start recording');
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
        }
    };

    const sendAudio = async () => {
        if (!audioBlob) return;

        try {
            // Create form data with audio file
            const formData = new FormData();
            formData.append('audio', audioBlob, `recording-${uuidv4()}.webm`);

            const res = await fetch('/api/audio/upload', {
                method: 'POST',
                body: formData,
            });

            if (!res.ok) throw new Error('Failed to send audio');
            setAudioBlob(null);
            setError('');
        } catch (error) {
            const uploadError = error as Error;
            console.error('Error sending audio:', uploadError.message);
            setError('Failed to send audio');
        }
    };

    if (!isLoggedIn) {
        return (
            <div className="min-h-screen bg-background p-8">
                <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
                    <h1 className="text-2xl font-bold mb-6">Test User Login</h1>
                    <form onSubmit={handleLogin} className="space-y-4">
                        {error && (
                            <div className="bg-red-50 text-red-500 p-3 rounded-md text-sm">
                                {error}
                            </div>
                        )}
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Email</label>
                            <input
                                type="email"
                                value={credentials.email}
                                onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Password</label>
                            <input
                                type="password"
                                value={credentials.password}
                                onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90"
                        >
                            Login
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background p-8">
            <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
                <h1 className="text-2xl font-bold mb-6">Audio Recording Test</h1>

                {error && (
                    <div className="bg-red-50 text-red-500 p-3 rounded-md text-sm mb-4">
                        {error}
                    </div>
                )}

                <div className="space-y-4">
                    {!isRecording && !audioBlob && (
                        <button
                            onClick={startRecording}
                            className="w-full py-3 flex items-center justify-center space-x-2 bg-primary text-white rounded-md hover:bg-primary/90"
                        >
                            <Mic className="h-5 w-5" />
                            <span>Start Recording</span>
                        </button>
                    )}

                    {isRecording && (
                        <button
                            onClick={stopRecording}
                            className="w-full py-3 flex items-center justify-center space-x-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                        >
                            <Square className="h-5 w-5" />
                            <span>Stop Recording</span>
                        </button>
                    )}

                    {audioBlob && (
                        <div className="space-y-4">
                            <audio src={URL.createObjectURL(audioBlob)} controls className="w-full" />
                            <button
                                onClick={sendAudio}
                                className="w-full py-3 flex items-center justify-center space-x-2 bg-primary text-white rounded-md hover:bg-primary/90"
                            >
                                <Send className="h-5 w-5" />
                                <span>Send Audio</span>
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}