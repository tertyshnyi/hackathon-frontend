import { Component, OnInit, OnDestroy, ViewChild, ElementRef, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { LocationService, Location } from '../../core/services/location.service';
import { CommonModule } from '@angular/common';
import { GoogleMapsLoaderService } from '../../core/services/google-maps-loader.service';
import { InputComponent } from '../../shared/components/input/input.component';
import { FormsModule } from '@angular/forms';
import { HistoryItem } from '../../core/models/history.model';
import { HistoryService } from '../../core/services/history.service';
import { AuthService } from '../../core/services/auth.service';
import { GeolocationService, Coordinates } from '../../core/services/geolocation.service';

interface NavigationState {
  query?: string;
  userId?: string;
  location?: Coordinates;
  isNewSearch?: boolean;
  searchResult?: HistoryItem;
}

@Component({
  selector: 'app-map',
  imports: [
    CommonModule,
    FormsModule,
    InputComponent
  ],
  standalone: true,
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss'],
})
export class MapComponent implements OnInit, OnDestroy {
  @ViewChild('map', { static: true }) mapElement!: ElementRef;
  map!: google.maps.Map;
  places: Location[] = [];
  markers: google.maps.Marker[] = [];
  infoWindows: google.maps.InfoWindow[] = [];
  currentInfoWindow: google.maps.InfoWindow | null = null;
  activePlaceIndex: number | null = null;
  userMarker!: google.maps.Marker | null;
  private blinkInterval!: any;
  directionsService!: google.maps.DirectionsService;
  directionsRenderer!: google.maps.DirectionsRenderer;
  currentDestinationIndex: number | null = null;
  currentTravelMode: 'DRIVING' | 'WALKING' | null = null;
  userInput = '';
  
  // Search state
  searchResult: HistoryItem | null = null;
  aiResponse: string = '';
  isLoadingSearch: boolean = false;
  searchQuery: string = '';
  
  // Location state
  currentLocation: Coordinates | null = null;
  private locationSubscription?: Subscription;

  constructor(
    private googleLoader: GoogleMapsLoaderService,
    private locationService: LocationService,
    private historyService: HistoryService,
    private authService: AuthService,
    private geolocationService: GeolocationService,
    private router: Router
  ) {}

  async ngOnInit() {
    // Start location tracking
    this.startLocationTracking();
    
    // Get navigation state
    const state = history.state as NavigationState;
    
    if (state?.isNewSearch && state.query && state.userId && state.location) {
      // New search - make API call with location from home
      this.searchQuery = state.query;
      this.isLoadingSearch = true;
      
      this.historyService.createSearch(state.userId, state.query, state.location).subscribe({
        next: (result) => {
          this.searchResult = result;
          this.aiResponse = result.aiResponse || '';
          this.isLoadingSearch = false;
          console.log('Search result:', result);
          console.log('AI Response:', this.aiResponse);
        },
        error: (error) => {
          console.error('Failed to create search:', error);
          this.isLoadingSearch = false;
        }
      });
    } else if (state?.searchResult) {
      // Existing history item
      this.searchResult = state.searchResult;
      this.aiResponse = state.searchResult.aiResponse || '';
      this.searchQuery = state.searchResult.query;
    }

    await this.googleLoader.load();

    this.locationService.getLocations().subscribe(locations => {
      console.log('Locations from service:', locations);
      this.places = locations.sort((a, b) => b.reviews - a.reviews);

      this.map = new google.maps.Map(this.mapElement.nativeElement, {
        center: { lat: 48.1486, lng: 17.1077 },
        zoom: 13
      });

      this.directionsService = new google.maps.DirectionsService();
      this.directionsRenderer = new google.maps.DirectionsRenderer({ suppressMarkers: true });
      this.directionsRenderer.setMap(this.map);

      this.places.forEach((loc, i) => {
        const marker = new google.maps.Marker({
          position: { lat: loc.lat, lng: loc.long },
          map: this.map,
          title: loc.name
        });

        const infoWindow = new google.maps.InfoWindow({
          content: this.getInfoWindowContent(loc)
        });

        marker.addListener('click', () => {
          this.openInfoWindow(infoWindow, marker);
        });

        this.markers.push(marker);
        this.infoWindows.push(infoWindow);
      });

      // Update user marker when location changes
      this.updateUserMarkerOnMap();
    });
  }

  ngOnDestroy() {
    if (this.blinkInterval) {
      clearInterval(this.blinkInterval);
    }
    this.locationSubscription?.unsubscribe();
  }

  private startLocationTracking(): void {
    this.geolocationService.startWatching();
    this.locationSubscription = this.geolocationService.getPosition$().subscribe(position => {
      this.currentLocation = position;
      this.updateUserMarkerOnMap();
    });
  }

  private updateUserMarkerOnMap(): void {
    if (!this.currentLocation || !this.map) return;

    const userPos = {
      lat: this.currentLocation.latitude,
      lng: this.currentLocation.longitude
    };

    if (!this.userMarker) {
      this.userMarker = new google.maps.Marker({
        position: userPos,
        map: this.map,
        title: 'You are here',
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 10,
          fillColor: '#1b5e20',
          fillOpacity: 1,
          strokeColor: '#fff',
          strokeWeight: 2
        }
      });

      this.map.panTo(userPos);
    } else {
      const startPos = this.userMarker.getPosition()!;
      const deltaLat = (userPos.lat - startPos.lat()) / 10;
      const deltaLng = (userPos.lng - startPos.lng()) / 10;
      let step = 0;
      const animate = setInterval(() => {
        step++;
        const nextLat = startPos.lat() + deltaLat * step;
        const nextLng = startPos.lng() + deltaLng * step;
        this.userMarker!.setPosition({ lat: nextLat, lng: nextLng });
        if (step >= 10) clearInterval(animate);
      }, 50);
    }

    if (this.currentDestinationIndex !== null && this.currentTravelMode) {
      this.updateRoute(this.currentDestinationIndex, this.currentTravelMode);
    }
  }

  private getUserId(): string {
    const user = this.authService.getCurrentUser();
    return user?.id?.toString() || '';
  }

  focusPlace(index: number) {
    const place = this.places[index];
    if (!place) return;

    this.map.panTo({ lat: place.lat, lng: place.long });
    this.map.setZoom(15);

    const marker = this.markers[index];
    const infoWindow = this.infoWindows[index];

    this.openInfoWindow(infoWindow, marker);

    marker.setAnimation(google.maps.Animation.BOUNCE);
    setTimeout(() => marker.setAnimation(null), 1400);

    this.activePlaceIndex = index;
  }

  private openInfoWindow(infoWindow: google.maps.InfoWindow, marker: google.maps.Marker) {
    if (this.currentInfoWindow) {
      this.currentInfoWindow.close();
    }
    infoWindow.open(this.map, marker);
    this.currentInfoWindow = infoWindow;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('.place-list li')) {
      this.activePlaceIndex = null;
    }
  }

  private getInfoWindowContent(loc: Location): string {
    return `
      <div style="
        max-width: 280px;
        font-family: 'Segoe UI', Roboto, Arial, sans-serif;
        border-radius: 12px;
        overflow: hidden;
        box-shadow: 0 8px 20px rgba(0,0,0,0.25);
        background: #fff;
        border: 1px solid #e0e0e0;
        transition: transform 0.2s ease, box-shadow 0.2s ease;
      ">
        <div style="
          background: linear-gradient(135deg, #1b5e20, #0d3d12);
          color: white;
          padding: 12px 16px;
          font-weight: 700;
          font-size: 1.1rem;
          text-align: center;
        ">
          ${loc.name}
        </div>
        <div style="
          text-align: center;
          font-size: 0.85rem;
          color: #555;
          margin-top: 4px;
          margin-bottom: 8px;
        ">
          ${loc.category}
        </div>
        <div style="padding:12px 16px; color:#333; font-size:0.9rem;">
          <p style="margin:6px 0; font-weight:500;">${loc.address}</p>
          <p style="margin:6px 0; display:flex; align-items:center; justify-content: center;">
            <span style="color:#FFD700; margin-right:5px;">${'★'.repeat(loc.reviews).padEnd(5,'☆')}</span>
            <span style="font-size:0.8rem; color:#777;">(${loc.count_reviews} reviews)</span>
          </p>
        </div>
      </div>
    `;
  }

  navigateToPlace(index: number, mode: 'DRIVING' | 'WALKING') {
    if (!this.userMarker) {
      alert('Your location is not determined yet.');
      return;
    }

    this.markers.forEach((m, i) => {
      if (i !== index) {
        m.setMap(null);
      }
    });

    this.currentDestinationIndex = index;
    this.currentTravelMode = mode;

    this.updateRoute(index, mode);
  }

  private updateRoute(index: number, mode: 'DRIVING' | 'WALKING') {
    const origin = this.userMarker!.getPosition()!;
    const destination = new google.maps.LatLng(this.places[index].lat, this.places[index].long);

    const request: google.maps.DirectionsRequest = {
      origin,
      destination,
      travelMode: google.maps.TravelMode[mode]
    };

    this.directionsService.route(request, (result, status) => {
      if (status === 'OK' && result) {
        this.directionsRenderer.setDirections(result);

        const route = result.routes[0];
        if (route && route.bounds) {
          this.map.fitBounds(route.bounds);
        }
      } else {
        console.error('Directions request failed:', status);
      }
    });
  }

  exitNavigation() {
    this.directionsRenderer.setDirections({
      routes: [] as any,
      request: undefined
    });
    this.markers.forEach(m => m.setMap(this.map));
    this.currentDestinationIndex = null;
    this.currentTravelMode = null;
    this.activePlaceIndex = null;
    this.map.setZoom(13);
    this.map.panTo({ lat: 48.1486, lng: 17.1077 });
  }

  sendMessage() {
    const query = this.userInput.trim();
    if (!query) return;

    const userId = this.getUserId();
    if (!userId) return;

    if (!this.currentLocation) {
      alert('Waiting for location. Please allow location access.');
      return;
    }

    this.searchQuery = query;
    this.isLoadingSearch = true;
    this.userInput = '';

    this.historyService.createSearch(userId, query, this.currentLocation).subscribe({
      next: (result) => {
        this.searchResult = result;
        this.aiResponse = result.aiResponse || '';
        this.isLoadingSearch = false;
        console.log('Search result:', result);
        console.log('AI Response:', this.aiResponse);
      },
      error: (error) => {
        console.error('Failed to create search:', error);
        this.isLoadingSearch = false;
      }
    });
  }

  goBack() {
    this.router.navigate(['/']);
  }

  getStarWidths(rating: number): number[] {
    const stars: number[] = [];
    for (let i = 0; i < 5; i++) {
      const starFill = Math.min(Math.max(rating - i, 0), 1) * 100;
      stars.push(starFill);
    }
    return stars;
  }
}
