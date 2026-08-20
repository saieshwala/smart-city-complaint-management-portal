"use client";

import React, { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  MapPin,
  CheckCircle2,
  Loader2,
  AlertTriangle,
  Navigation,
} from "lucide-react";
import dynamic from "next/dynamic";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

const MapComponent = dynamic(
  () => import("@/components/report/steps/MapComponent"),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[300px] items-center justify-center rounded-lg bg-gray-100">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    ),
  }
);

interface LocationData {
  latitude: number;
  longitude: number;
  address: string;
  source: "browser" | "manual";
}

interface LocationStepProps {
  location: LocationData | null;
  onLocationChange: (location: LocationData) => void;
}

type LocationStatus = "idle" | "detecting" | "detected" | "denied" | "manual";

export function LocationStep({
  location,
  onLocationChange,
}: LocationStepProps) {
  const [status, setStatus] = useState<LocationStatus>(
    location ? "detected" : "idle"
  );
  const [manualAddress, setManualAddress] = useState("");
  const [error, setError] = useState<string | null>(null);

  const reverseGeocode = useCallback(
    async (lat: number, lng: number): Promise<string> => {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
          { headers: { "Accept-Language": "en" } }
        );
        const data = await res.json();
        return data.display_name || `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
      } catch {
        return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
      }
    },
    []
  );

  const detectLocation = useCallback(async () => {
    if (!navigator.geolocation) {
      setStatus("denied");
      setError("Geolocation is not supported by your browser.");
      return;
    }

    setStatus("detecting");
    setError(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        const address = await reverseGeocode(latitude, longitude);
        onLocationChange({ latitude, longitude, address, source: "browser" });
        setStatus("detected");
      },
      (err) => {
        setStatus("denied");
        switch (err.code) {
          case err.PERMISSION_DENIED:
            setError(
              "Location permission was denied. Please enter your address manually."
            );
            break;
          case err.POSITION_UNAVAILABLE:
            setError(
              "Location information is unavailable. Please enter your address manually."
            );
            break;
          case err.TIMEOUT:
            setError(
              "Location request timed out. Please try again or enter your address manually."
            );
            break;
          default:
            setError(
              "An unknown error occurred. Please enter your address manually."
            );
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 60000,
      }
    );
  }, [onLocationChange, reverseGeocode]);

  useEffect(() => {
    if (!location && status === "idle") {
      detectLocation();
    }
  }, [location, status, detectLocation]);

  const handleMapLocationChange = async (lat: number, lng: number) => {
    const address = await reverseGeocode(lat, lng);
    onLocationChange({ latitude: lat, longitude: lng, address, source: "browser" });
  };

  const handleManualSubmit = () => {
    if (!manualAddress.trim()) return;
    // For manual entry, use a default location (city center) since we can't geocode without API key
    onLocationChange({
      latitude: 19.076,
      longitude: 72.8777,
      address: manualAddress.trim(),
      source: "manual",
    });
    setStatus("detected");
  };

  const switchToManual = () => {
    setStatus("manual");
    setError(null);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div className="text-center space-y-2">
        <h2 className="text-xl font-semibold text-gray-900">
          Set Problem Location
        </h2>
        <p className="text-sm text-gray-500">
          Help us pinpoint where the issue is so the right team can respond.
        </p>
      </div>

      {/* Detecting state */}
      {status === "detecting" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center gap-4 py-12"
        >
          <div className="relative">
            <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center">
              <Navigation className="h-8 w-8 text-blue-600" />
            </div>
            <div className="absolute inset-0 rounded-full border-2 border-blue-400 animate-ping opacity-30" />
          </div>
          <div className="text-center">
            <p className="font-medium text-gray-900">
              Detecting your location...
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Please allow location access when prompted.
            </p>
          </div>
        </motion.div>
      )}

      {/* Denied / Error state */}
      {(status === "denied" || (status === "idle" && error)) && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-4"
        >
          <div className="rounded-lg bg-amber-50 border border-amber-200 p-4 flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-medium text-amber-800">
                Could not detect location
              </p>
              <p className="text-sm text-amber-700 mt-1">{error}</p>
            </div>
          </div>

          <div className="flex gap-3">
            <Button variant="outline" onClick={detectLocation}>
              <Navigation className="h-4 w-4" />
              Try Again
            </Button>
            <Button variant="primary" onClick={switchToManual}>
              <MapPin className="h-4 w-4" />
              Enter Manually
            </Button>
          </div>
        </motion.div>
      )}

      {/* Manual address input */}
      {status === "manual" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-4"
        >
          <Input
            label="Enter the address or location description"
            placeholder="e.g., Near City Mall, MG Road, Sector 12"
            value={manualAddress}
            onChange={(e) => setManualAddress(e.target.value)}
          />
          <div className="flex gap-3">
            <Button
              variant="primary"
              onClick={handleManualSubmit}
              disabled={!manualAddress.trim()}
            >
              <CheckCircle2 className="h-4 w-4" />
              Confirm Location
            </Button>
            <Button variant="ghost" onClick={detectLocation}>
              Try Auto-detect
            </Button>
          </div>
        </motion.div>
      )}

      {/* Detected state with map */}
      {status === "detected" && location && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-4"
        >
          {/* Success badge */}
          <div className="flex items-center gap-2 rounded-lg bg-emerald-50 border border-emerald-200 px-4 py-3">
            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            <span className="text-sm font-medium text-emerald-800">
              Location {location.source === "browser" ? "detected" : "set"}
            </span>
          </div>

          {/* Map */}
          <div className="rounded-xl overflow-hidden border border-gray-200 shadow-sm">
            <div className="h-[300px] sm:h-[350px]">
              <MapComponent
                latitude={location.latitude}
                longitude={location.longitude}
                onLocationChange={handleMapLocationChange}
              />
            </div>
          </div>

          {/* Address */}
          <div className="flex items-start gap-2 text-sm">
            <MapPin className="h-4 w-4 text-gray-400 mt-0.5 shrink-0" />
            <p className="text-gray-600">{location.address}</p>
          </div>

          {/* Hint */}
          <p className="text-xs text-gray-400">
            Drag the marker or click on the map to adjust the location.
          </p>

          {/* Change location button */}
          <Button variant="ghost" size="sm" onClick={switchToManual}>
            <MapPin className="h-4 w-4" />
            Change Location
          </Button>
        </motion.div>
      )}
    </motion.div>
  );
}
