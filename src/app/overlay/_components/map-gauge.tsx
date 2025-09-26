import { cn } from "@/lib/utils";
import GoogleMapReact from "google-map-react";
import { useEffect, useState } from "react";
// const MapGeoJSON = require("../../../../public/maps/norway.geo.json") as object;

type MapGaugeProps = {
  lat: number;
  lng: number;
  zoomOverride?: number;
};

const ZoomSteps = [13, 5, 3];

const getNextZoomLevel = (current: number) => {
  const currentIndex = ZoomSteps.indexOf(current);
  if (currentIndex === -1 || currentIndex === ZoomSteps.length - 1) {
    return ZoomSteps[0];
  }
  return ZoomSteps[currentIndex + 1];
};

const MapGauge = ({ zoomOverride, lat, lng }: MapGaugeProps) => {
  const [zoom, setZoom] = useState(zoomOverride ?? 13);

  useEffect(() => {
    if (!zoomOverride) return;
    setZoom(zoomOverride);
  }, [zoomOverride]);

  useEffect(() => {
    const interval = setInterval(() => {
      setZoom((prev) => {
        if (zoomOverride) return zoomOverride;
        return getNextZoomLevel(prev) ?? 13;
      });
    }, 10000);

    return () => {
      clearInterval(interval);
    };
  }, [zoomOverride]);
  return (
    <div className="flex h-[9.5rem] w-[9.5rem] items-center justify-center overflow-hidden rounded-full bg-black/50">
      {/* <Image
        src="/images/map-placeholder.png"
        alt="Map"
        width={1000}
        height={1000}
        className="h-full w-full object-cover"
      /> */}
      <GoogleMapReact
        draggable={false}
        options={{
          mapTypeId: "hybrid",
          fullscreenControl: false,
          disableDefaultUI: true,
          zoomControl: false,
          streetViewControl: false,
          mapTypeControl: false,
          keyboardShortcuts: false,
        }}
        bootstrapURLKeys={{ key: "AIzaSyCDMVSXpqnNedtzJMGEckJsV86gOINZnO8" }}
        defaultCenter={{
          lat,
          lng,
        }}
        center={{
          lat,
          lng,
        }}
        zoom={zoom}
      >
        <RocketIcon className="" lat={lat} lng={lng} />
      </GoogleMapReact>
      {/* <h2 className="w-fit text-center text-white">MAPS PLACEHOLDER</h2> */}
    </div>
  );
};

const RocketIcon = ({
  className,
}: {
  className?: string;
  lat: number;
  lng: number;
}) => {
  return (
    <div
      className={cn(
        "size-5 -translate-1/2 rounded-full bg-white/30 backdrop-blur-[3px]",
        className,
      )}
    />
    // <Image
    //   src="/images/rocket.webp"
    //   alt="Rocket"
    //   width={500}
    //   height={500}
    //   className="h-16 w-fit -translate-x-1/2 -translate-y-2/3"
    // />
  );
};

export default MapGauge;
