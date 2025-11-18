import React, { useState } from 'react';
import { X, User, LogIn } from 'lucide-react';
import { UserService } from '../services/userService';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (user: any) => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onLogin }) => {
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      setError('Please enter your name');
      return;
    }

    if (name.trim().length < 2) {
      setError('Name must be at least 2 characters long');
      return;
    }

    try {
      const user = UserService.login(name.trim());
      onLogin(user);
      onClose();
      setName('');
      setError('');
    } catch (error) {
      setError('Failed to login. Please try again.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 border border-gray-700 rounded-2xl p-8 w-full max-w-md relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-gray-800 rounded-lg transition-colors duration-300"
        >
          <X className="w-5 h-5 text-gray-400" />
        </button>

        <div className="text-center mb-8">
          <div className="inline-flex p-4 bg-yellow-400/10 rounded-full mb-4">
            <User className="w-8 h-8 text-yellow-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Welcome to DeltaSilicon.Hub</h2>
          <p className="text-gray-400">Enter your name to get started</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
              Your Name
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setError('');
              }}
              placeholder="Enter your name"
              className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-yellow-400/50 focus:outline-none focus:ring-2 focus:ring-yellow-400/20 transition-all duration-300"
              autoFocus
            />
            {error && (
              <p className="mt-2 text-sm text-red-400">{error}</p>
            )}
          </div>

          <button
            type="submit"
            className="w-full px-6 py-3 bg-yellow-400 text-black font-semibold rounded-lg hover:bg-yellow-300 transition-all duration-300 glow-button flex items-center justify-center gap-2"
          >
            <LogIn className="w-5 h-5" />
            Get Started
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            Your name will be stored locally on your device for a personalized experience
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginModal;