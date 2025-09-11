import GoogleMapReact from "google-map-react";
import Image from "next/image";

type MapGaugeProps = {
  lat: number;
  lng: number;
};
const MapGauge = ({ lat, lng }: MapGaugeProps) => {
  return (
    <div className="flex h-[9.5rem] w-[9.5rem] items-center justify-center overflow-hidden rounded-full bg-black/50">
      <GoogleMapReact
        yesIWantToUseGoogleMapApiInternals
        bootstrapURLKeys={{ key: "" }}
        defaultCenter={{
          lat,
          lng,
        }}
        zoom={10}
      >
        <RocketIcon lat={lat} lng={lng} />
      </GoogleMapReact>
      {/* <h2 className="w-fit text-center text-white">MAPS PLACEHOLDER</h2> */}
    </div>
  );
};

const RocketIcon = ({}: { lat: number; lng: number }) => {
  return (
    <Image
      src="/images/rocket.png"
      alt="Rocket"
      width={500}
      height={500}
      className="h-10 w-4 -translate-1/2"
    />
  );
};

export default MapGauge;
