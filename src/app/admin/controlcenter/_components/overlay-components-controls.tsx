import Group from "@/app/_components/group";
import Gauge from "@/app/overlay/_components/gauge";
import MapGauge from "@/app/overlay/_components/map-gauge";
import Navball from "@/app/overlay/_components/navball";

const OverlayComponentsControls = () => {
  return (
    <Group title="Overlay components" className="flex flex-row flex-wrap gap-5">
      <Navball />
      <Gauge label="Altitude" value={0} unit="Meters" />
      <Gauge label="Speed" value={0} unit="km/h" />
      <MapGauge lat={0} lng={0} />
      {/* <SponsorReel /> */}
    </Group>
  );
};

export default OverlayComponentsControls;
