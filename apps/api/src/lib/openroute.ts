import { env } from '../config/env';

interface Coordinates {
  lat: number;
  lng: number;
}

interface RouteResponse {
  durationMinutes: number;
  distanceKm: number;
}

interface OpenRouteResponse {
    routes: {
      summary: {
        duration: number;
        distance: number;
      };
    }[];
  }

export async function calculateRoute(
  origin: Coordinates,
  destination: Coordinates
): Promise<RouteResponse> {
  const apiKey = env.openRouteApiKey;

  if (!apiKey) {
    // Si no hay API key, devolver estimado basado en distancia
    const distance = calculateHaversineDistance(origin, destination);
    return {
      durationMinutes: Math.ceil(distance * 3), // ~3 min por km estimado
      distanceKm: distance,
    };
  }

  try {
    const response = await fetch(
      'https://api.openrouteservice.org/v2/directions/driving-car',
      {
        method: 'POST',
        headers: {
          'Authorization': apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          coordinates: [
            [origin.lng, origin.lat],
            [destination.lng, destination.lat],
          ],
        }),
      }
    );

    if (!response.ok) {
      throw new Error('OpenRouteService request failed');
    }

    const data = await response.json() as OpenRouteResponse;
    const route = data.routes[0];

    return {
      durationMinutes: Math.ceil(route.summary.duration / 60),
      distanceKm: Math.round(route.summary.distance / 1000 * 10) / 10,
    };
  } catch (error) {
    // Fallback si falla la API
    const distance = calculateHaversineDistance(origin, destination);
    return {
      durationMinutes: Math.ceil(distance * 3),
      distanceKm: distance,
    };
  }
}

// Fórmula Haversine para calcular distancia entre dos puntos
function calculateHaversineDistance(
  point1: Coordinates,
  point2: Coordinates
): number {
  const R = 6371; // Radio de la Tierra en km
  const dLat = toRad(point2.lat - point1.lat);
  const dLng = toRad(point2.lng - point1.lng);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(point1.lat)) *
      Math.cos(toRad(point2.lat)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return Math.round(distance * 10) / 10;
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180);
}