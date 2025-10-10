import Group from "@/app/_components/group";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { api } from "@/trpc/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { EyeIcon, EyeOffIcon, Loader } from "lucide-react";
import Image from "next/image";
import { useForm } from "react-hook-form";
import z from "zod";

const SPONSORS = [
  { source: "fieldmade.png", name: "Fieldmade" },
  { source: "gkn.png", name: "GKN Aerospace" },
  { source: "nammo.png", name: "Nammo" },
  { source: "norwegian_royal_airforce.svg", name: "Norwegian Royal Airforce" },
  { source: "ntnu.png", name: "NTNU" },
  { source: "radionor.png", name: "Radionor" },
  { source: "sparebank1.svg", name: "Sparebank 1" },
];

const formSchema = z.object({
  sponsorIndex: z.number().optional(),
});

const SponsorControls = () => {
  const { data: state } = api.socket.onOverlayState.useSubscription();
  const { mutateAsync, status } = api.socket.setOverlayState.useMutation();
  const form = useForm<z.infer<typeof formSchema>>({
    defaultValues: { sponsorIndex: undefined },
    resolver: zodResolver(formSchema),
  });

  const handleSubmit = (data: z.infer<typeof formSchema>) => {
    void mutateAsync({
      sponsor: {
        show: true,
        sponsorIndex: data.sponsorIndex,
      },
    });
  };

  const handleHide = () => {
    void mutateAsync({
      sponsor: {
        show: false,
      },
    });
  };
  return (
    <Group title="Sponsors">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(handleSubmit)}
          className="flex flex-col gap-5"
        >
          <FormField
            control={form.control}
            name="sponsorIndex"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Sponsor</FormLabel>
                <FormControl>
                  <Select
                    onValueChange={(v) => field.onChange(Number(v))}
                    defaultValue={String(field.value)}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {SPONSORS.map((s, i) => (
                          <SelectItem key={s.source} value={String(i)}>
                            {s.name}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex flex-row gap-2.5">
            <Button className="w-fit" disabled={status === "pending"}>
              {status !== "pending" && (
                <>
                  <EyeIcon /> Show
                </>
              )}
              {status === "pending" && <Loader className="animate-spin" />}
            </Button>
          </div>
        </form>
      </Form>
      {state?.sponsor?.show && state?.sponsor?.sponsorIndex !== undefined && (
        <div className="mt-5 flex flex-col gap-2.5">
          <span>Currently displaying</span>
          <Image
            className="max-h-96 max-w-full"
            width={1000}
            height={1000}
            alt="Sponsor"
            src={`/images/sponsors/${SPONSORS[state?.sponsor.sponsorIndex]?.source}`}
          />
          <Button variant="destructive" className="w-fit" onClick={handleHide}>
            <EyeOffIcon /> Hide
          </Button>
        </div>
      )}
    </Group>
  );
};

export default SponsorControls;
