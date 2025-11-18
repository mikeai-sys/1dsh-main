export interface StreamingService {
  id: string;
  name: string;
  baseUrl: string;
  embedPattern: string;
  isActive: boolean;
}

export class StreamingServiceManager {
  private static services: StreamingService[] = [
    {
      id: 'vidsrc',
      name: 'VidSrc',
      baseUrl: 'https://vidsrc.in',
      embedPattern: '/embed/movie/{id}',
      isActive: true
    },
    {
      id: 'vidfast',
      name: 'VidFast',
      baseUrl: 'https://vidfast.net',
      embedPattern: '/movie/{id}?autoPlay=true',
      isActive: false
    },
    {
      id: 'vidlink',
      name: 'VidLink',
      baseUrl: 'https://vidlink.pro',
      embedPattern: '/movie/{id}',
      isActive: false
    },
    {
      id: 'videasy',
      name: 'Videasy',
      baseUrl: 'https://videasy.io',
      embedPattern: '/embed/{id}',
      isActive: false
    }
  ];

  static getServices(): StreamingService[] {
    return this.services;
  }

  static getActiveService(): StreamingService {
    return this.services.find(service => service.isActive) || this.services[0];
  }

  static setActiveService(serviceId: string): void {
    this.services.forEach(service => {
      service.isActive = service.id === serviceId;
    });
    
    // Save to localStorage
    localStorage.setItem('deltasilicon_active_service', serviceId);
  }

  static loadActiveService(): void {
    const savedServiceId = localStorage.getItem('deltasilicon_active_service');
    if (savedServiceId) {
      this.setActiveService(savedServiceId);
    }
  }

  static getEmbedUrl(movieId: number, serviceId?: string): string {
    const service = serviceId 
      ? this.services.find(s => s.id === serviceId) 
      : this.getActiveService();
    
    if (!service) return '';
    
    return service.baseUrl + service.embedPattern.replace('{id}', movieId.toString());
  }
}

// Initialize on load
StreamingServiceManager.loadActiveService();