import Image from "next/image";
// const MapGeoJSON = require("../../../../public/maps/norway.geo.json") as object;

type MapGaugeProps = {
  lat: number;
  lng: number;
};
const MapGauge = ({ lat, lng }: MapGaugeProps) => {
  return (
    <div className="flex h-[9.5rem] w-[9.5rem] items-center justify-center overflow-hidden rounded-full bg-black/50">
      <Image
        src="/images/map-placeholder.png"
        alt="Map"
        width={1000}
        height={1000}
        className="h-full w-full object-cover"
      />
      {/* <GoogleMapReact
        draggable={false}
        options={{
          fullscreenControl: false,
          disableDefaultUI: true,
          keyboardShortcuts: false,
        }}
        bootstrapURLKeys={{ key: "" }}
        defaultCenter={{
          lat,
          lng,
        }}
        zoom={10}
      >
        <RocketIcon lat={lat} lng={lng} />
      </GoogleMapReact> */}
      {/* <h2 className="w-fit text-center text-white">MAPS PLACEHOLDER</h2> */}
    </div>
  );
};

const RocketIcon = ({}: { lat: number; lng: number }) => {
  return (
    <Image
      src="/images/rocket.webp"
      alt="Rocket"
      width={500}
      height={500}
      className="h-10 w-4 -translate-1/2"
    />
  );
};

export default MapGauge;
