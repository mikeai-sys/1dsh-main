import React from 'react';
import { X } from 'lucide-react';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '../lib/supabase';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGuest: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onGuest }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-md relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-gray-800 rounded-lg transition-colors duration-300"
        >
          <X className="w-5 h-5 text-gray-400" />
        </button>

        <div className="p-8">
          <Auth
            supabaseClient={supabase}
            appearance={{ 
              theme: ThemeSupa,
              variables: {
                default: {
                  colors: {
                    brand: '#facc15',
                    brandAccent: '#eab308',
                    defaultButtonBackgroundHover: '#374151',
                  },
                },
              },
            }}
            providers={[]}
            theme="dark"
          />
          <div className="mt-6 text-center">
            <p className="text-gray-400">
              Or{' '}
              <button
                onClick={onGuest}
                className="text-yellow-400 hover:text-yellow-300 font-semibold transition-colors duration-300"
              >
                Continue as Guest
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;