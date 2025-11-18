import React, { useState } from 'react';
import { ArrowLeft, Play, Calendar, Eye } from 'lucide-react';

interface CompanyVideosPageProps {
  onBack: () => void;
}

const CompanyVideosPage: React.FC<CompanyVideosPageProps> = ({ onBack }) => {
  const [selectedVideo, setSelectedVideo] = useState<any>(null);

  const companyVideos = [
    {
      id: 1,
      title: "Welcome to DeltaSilicon.Hub",
      description: "Discover the future of streaming with our revolutionary platform that combines AI-powered recommendations with ad-free entertainment.",
      thumbnail: "https://images.pexels.com/photos/7991579/pexels-photo-7991579.jpeg?auto=compress&cs=tinysrgb&w=800",
      duration: "2:30",
      views: "125K",
      date: "2024-01-15",
      videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ"
    },
    {
      id: 2,
      title: "Behind the Scenes: Building the Future",
      description: "Take a look behind the scenes at how our team of engineers and designers are creating the next generation of streaming technology.",
      thumbnail: "https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=800",
      duration: "5:45",
      views: "89K",
      date: "2024-01-10",
      videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ"
    },
    {
      id: 3,
      title: "AI Recommendations Explained",
      description: "Learn how our advanced AI system analyzes your preferences to deliver personalized content recommendations that you'll love.",
      thumbnail: "https://images.pexels.com/photos/8386440/pexels-photo-8386440.jpeg?auto=compress&cs=tinysrgb&w=800",
      duration: "3:20",
      views: "156K",
      date: "2024-01-05",
      videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ"
    },
    {
      id: 4,
      title: "The Ad-Free Promise",
      description: "Why we believe entertainment should be uninterrupted and how we're building a sustainable ad-free streaming platform.",
      thumbnail: "https://images.pexels.com/photos/7991579/pexels-photo-7991579.jpeg?auto=compress&cs=tinysrgb&w=800",
      duration: "4:15",
      views: "203K",
      date: "2023-12-28",
      videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ"
    },
    {
      id: 5,
      title: "Global Expansion Plans",
      description: "Our vision for bringing DeltaSilicon.Hub to audiences worldwide and the challenges we're solving along the way.",
      thumbnail: "https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=800",
      duration: "6:30",
      views: "78K",
      date: "2023-12-20",
      videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ"
    },
    {
      id: 6,
      title: "User Stories: Why They Love DSH",
      description: "Real users share their experiences with DeltaSilicon.Hub and how it's changed their streaming habits.",
      thumbnail: "https://images.pexels.com/photos/8386440/pexels-photo-8386440.jpeg?auto=compress&cs=tinysrgb&w=800",
      duration: "8:45",
      views: "312K",
      date: "2023-12-15",
      videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ"
    }
  ];

  const handleVideoClick = (video: any) => {
    setSelectedVideo(video);
  };

  const closeVideo = () => {
    setSelectedVideo(null);
  };

  if (selectedVideo) {
    return (
      <div className="fixed inset-0 bg-black z-50">
        <button
          onClick={closeVideo}
          className="absolute top-4 right-4 z-10 p-2 bg-black/70 hover:bg-black/90 rounded-lg transition-colors duration-300 backdrop-blur-sm"
        >
          <ArrowLeft className="w-6 h-6 text-white" />
        </button>

        <div className="absolute top-4 left-4 z-10 bg-black/70 backdrop-blur-sm rounded-lg p-3 max-w-md">
          <h2 className="text-white font-semibold text-lg">{selectedVideo.title}</h2>
          <p className="text-gray-300 text-sm">{selectedVideo.description}</p>
        </div>

        <iframe
          src={selectedVideo.videoUrl}
          className="w-full h-full"
          allowFullScreen
          frameBorder="0"
          title={selectedVideo.title}
   
        />
      </div>
    );
  }

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
          <h1 className="text-xl font-bold text-white">Company Videos</h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            <span className="text-white">Behind the</span>{' '}
            <span className="text-yellow-400 glow-text">Scenes</span>
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Get an inside look at DeltaSilicon.Hub with our collection of company videos, 
            featuring product updates, team insights, and our vision for the future of streaming.
          </p>
        </div>

        {/* Videos Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {companyVideos.map((video) => (
            <div 
              key={video.id}
              className="group bg-gray-900/50 border border-gray-800 rounded-xl overflow-hidden hover:border-yellow-400/50 transition-all duration-300 cursor-pointer"
              onClick={() => handleVideoClick(video)}
            >
              {/* Thumbnail */}
              <div className="relative aspect-video overflow-hidden">
                <img
                  src={video.thumbnail}
                  alt={video.title}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors duration-300"></div>
                
                {/* Play Button */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="p-3 bg-yellow-400/90 text-black rounded-full group-hover:bg-yellow-400 transition-colors duration-300 glow-button">
                    <Play className="w-6 h-6" />
                  </div>
                </div>

                {/* Duration */}
                <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/70 rounded text-xs text-white">
                  {video.duration}
                </div>
              </div>

              {/* Content */}
              <div className="p-4">
                <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-yellow-400 transition-colors duration-300">
                  {video.title}
                </h3>
                
                <p className="text-sm text-gray-400 mb-3 line-clamp-2">
                  {video.description}
                </p>

                <div className="flex items-center justify-between text-xs text-gray-500">
                  <div className="flex items-center gap-1">
                    <Eye className="w-3 h-3" />
                    <span>{video.views} views</span>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    <span>{new Date(video.date).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Call to Action */}
        <div className="text-center mt-12">
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-8">
            <h3 className="text-2xl font-bold text-white mb-4">Stay Updated</h3>
            <p className="text-gray-300 mb-6">
              Subscribe to our newsletter to get notified about new company videos and product updates.
            </p>
            <button className="px-8 py-3 bg-yellow-400 text-black font-semibold rounded-lg hover:bg-yellow-300 transition-all duration-300 glow-button">
              Subscribe Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanyVideosPage;