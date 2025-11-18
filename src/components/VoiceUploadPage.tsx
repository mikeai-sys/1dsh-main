import React, { useState, useRef } from 'react';
import { ArrowLeft, Upload, Mic, Play, Pause, Trash2, Download, Volume2 } from 'lucide-react';

interface VoiceUploadPageProps {
  onBack: () => void;
}

interface VoiceFile {
  id: string;
  name: string;
  url: string;
  duration: number;
  uploadDate: string;
  captions?: string;
}

const VoiceUploadPage: React.FC<VoiceUploadPageProps> = ({ onBack }) => {
  const [voices, setVoices] = useState<VoiceFile[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [captions, setCaptions] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Load voices from localStorage on component mount
  React.useEffect(() => {
    const savedVoices = localStorage.getItem('deltasilicon_voices');
    if (savedVoices) {
      setVoices(JSON.parse(savedVoices));
    }
  }, []);

  // Save voices to localStorage
  const saveVoices = (newVoices: VoiceFile[]) => {
    localStorage.setItem('deltasilicon_voices', JSON.stringify(newVoices));
    setVoices(newVoices);
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('audio/')) {
      setSelectedFile(file);
    } else {
      alert('Please select a valid audio file');
    }
  };

  const handleUpload = () => {
    if (!selectedFile) return;

    // Simulate upload progress
    setUploadProgress(0);
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          
          // Create voice file object
          const newVoice: VoiceFile = {
            id: Date.now().toString(),
            name: selectedFile.name,
            url: URL.createObjectURL(selectedFile),
            duration: 0, // Would be calculated from actual audio
            uploadDate: new Date().toISOString(),
            captions: captions || 'No captions provided'
          };

          const updatedVoices = [newVoice, ...voices];
          saveVoices(updatedVoices);
          
          setSelectedFile(null);
          setCaptions('');
          setUploadProgress(0);
          
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        const audioUrl = URL.createObjectURL(audioBlob);
        
        const newVoice: VoiceFile = {
          id: Date.now().toString(),
          name: `Recording_${new Date().toLocaleTimeString()}`,
          url: audioUrl,
          duration: 0,
          uploadDate: new Date().toISOString(),
          captions: captions || 'Voice recording'
        };

        const updatedVoices = [newVoice, ...voices];
        saveVoices(updatedVoices);
        setCaptions('');
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      alert('Error accessing microphone');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const playVoice = (voiceId: string) => {
    if (currentlyPlaying === voiceId) {
      setCurrentlyPlaying(null);
    } else {
      setCurrentlyPlaying(voiceId);
      // In a real app, you would play the audio here
      setTimeout(() => setCurrentlyPlaying(null), 3000); // Simulate playback
    }
  };

  const deleteVoice = (voiceId: string) => {
    if (confirm('Are you sure you want to delete this voice?')) {
      const updatedVoices = voices.filter(voice => voice.id !== voiceId);
      saveVoices(updatedVoices);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-black/95 backdrop-blur-sm border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center">
          <button
            onClick={onBack}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors duration-300 mr-4"
          >
            <ArrowLeft className="w-6 h-6 text-yellow-400" />
          </button>
          <h1 className="text-xl font-bold text-white">Voice Upload Center</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            <span className="text-white">Voice</span>{' '}
            <span className="text-yellow-400 glow-text">Studio</span>
          </h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Upload and share voice recordings with captions for all users to enjoy.
          </p>
        </div>

        {/* Upload Section */}
        <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 mb-8">
          <h3 className="text-2xl font-bold text-white mb-6">Upload Voice</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* File Upload */}
            <div>
              <h4 className="text-lg font-semibold text-white mb-4">Upload Audio File</h4>
              <div className="space-y-4">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="audio/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full p-4 border-2 border-dashed border-gray-600 rounded-lg hover:border-yellow-400/50 transition-colors duration-300 flex flex-col items-center gap-2"
                >
                  <Upload className="w-8 h-8 text-gray-400" />
                  <span className="text-gray-400">Click to select audio file</span>
                </button>

                {selectedFile && (
                  <div className="bg-gray-800/50 p-3 rounded-lg">
                    <p className="text-white text-sm">{selectedFile.name}</p>
                    <p className="text-gray-400 text-xs">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                )}
              </div>
            </div>

            {/* Voice Recording */}
            <div>
              <h4 className="text-lg font-semibold text-white mb-4">Record Voice</h4>
              <div className="space-y-4">
                <button
                  onClick={isRecording ? stopRecording : startRecording}
                  className={`w-full p-4 rounded-lg transition-all duration-300 flex flex-col items-center gap-2 ${
                    isRecording 
                      ? 'bg-red-600 hover:bg-red-700 text-white' 
                      : 'bg-yellow-400 hover:bg-yellow-300 text-black'
                  }`}
                >
                  <Mic className="w-8 h-8" />
                  <span className="font-semibold">
                    {isRecording ? 'Stop Recording' : 'Start Recording'}
                  </span>
                </button>

                {isRecording && (
                  <div className="bg-red-600/20 border border-red-600/50 p-3 rounded-lg text-center">
                    <div className="flex items-center justify-center gap-2 text-red-400">
                      <div className="w-3 h-3 bg-red-400 rounded-full animate-pulse"></div>
                      <span className="text-sm font-semibold">Recording...</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Captions Input */}
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Captions/Description
            </label>
            <textarea
              value={captions}
              onChange={(e) => setCaptions(e.target.value)}
              placeholder="Add captions or description for your voice recording..."
              className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-yellow-400/50 focus:outline-none resize-none"
              rows={3}
            />
          </div>

          {/* Upload Button */}
          {selectedFile && (
            <div className="mt-6">
              {uploadProgress > 0 && uploadProgress < 100 && (
                <div className="mb-4">
                  <div className="bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                  <p className="text-sm text-gray-400 mt-1">Uploading... {uploadProgress}%</p>
                </div>
              )}
              
              <button
                onClick={handleUpload}
                disabled={uploadProgress > 0 && uploadProgress < 100}
                className="px-6 py-3 bg-yellow-400 text-black font-semibold rounded-lg hover:bg-yellow-300 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Upload Voice
              </button>
            </div>
          )}
        </div>

        {/* Voice Library */}
        <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
          <h3 className="text-2xl font-bold text-white mb-6">Voice Library</h3>
          
          {voices.length === 0 ? (
            <div className="text-center py-12">
              <Volume2 className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h4 className="text-lg font-semibold text-white mb-2">No voices uploaded yet</h4>
              <p className="text-gray-400">Upload your first voice recording to get started</p>
            </div>
          ) : (
            <div className="space-y-4">
              {voices.map((voice) => (
                <div key={voice.id} className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h4 className="text-lg font-semibold text-white mb-1">{voice.name}</h4>
                      <p className="text-sm text-gray-400 mb-2">{voice.captions}</p>
                      <p className="text-xs text-gray-500">
                        Uploaded on {new Date(voice.uploadDate).toLocaleDateString()}
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => playVoice(voice.id)}
                        className={`p-2 rounded-lg transition-colors duration-300 ${
                          currentlyPlaying === voice.id
                            ? 'bg-yellow-400 text-black'
                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        }`}
                      >
                        {currentlyPlaying === voice.id ? (
                          <Pause className="w-5 h-5" />
                        ) : (
                          <Play className="w-5 h-5" />
                        )}
                      </button>
                      
                      <button
                        onClick={() => {
                          const link = document.createElement('a');
                          link.href = voice.url;
                          link.download = voice.name;
                          link.click();
                        }}
                        className="p-2 bg-gray-700 text-gray-300 hover:bg-gray-600 rounded-lg transition-colors duration-300"
                      >
                        <Download className="w-5 h-5" />
                      </button>
                      
                      <button
                        onClick={() => deleteVoice(voice.id)}
                        className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors duration-300"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VoiceUploadPage;