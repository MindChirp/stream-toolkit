"use client";
import { parseTime } from "@/app/overlay/_components/bottom-telemetry/utils/parse-time";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { api } from "@/trpc/react";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  AlertTriangle,
  Loader,
  Pause,
  Play,
  SendHorizonal,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useForm } from "react-hook-form";
import z from "zod";
import ControlButton from "./control-button";
const formSchema = z.object({
  time: z.string().min(6).max(6),
  beforeTZero: z.boolean().optional(),
});

const TimerControls = () => {
  const { mutate, isPending } = api.socket.setClock.useMutation();
  const { data: time } = api.socket.onClock.useSubscription();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      time: "003000",
      beforeTZero: true,
    },
  });

  const handleSubmit = (data: z.infer<typeof formSchema>) => {
    mutate({
      time: `T${data.beforeTZero ? "-" : "+"}${data.time}`,
      state: time?.state ?? "hold",
    });
  };

  return (
    <div className="flex flex-col items-center gap-2.5">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(handleSubmit)}
          className="flex w-full items-center justify-center"
        >
          <div className="flex">
            <FormField
              control={form.control}
              name="beforeTZero"
              render={({ field }) => (
                <Button
                  variant="outline"
                  className="mr-2 w-16"
                  onClick={() => field.onChange(!field.value)}
                  disabled={isPending}
                  type="button"
                >
                  <AnimatePresence mode="popLayout">
                    {field.value && (
                      <motion.div
                        key="tminus"
                        initial={{ opacity: 0, translateY: 10 }}
                        animate={{ opacity: 1, translateY: 0 }}
                        exit={{ opacity: 0, translateY: -10 }}
                      >
                        T-
                      </motion.div>
                    )}
                    {!field.value && (
                      <motion.div
                        key="tplus"
                        initial={{ opacity: 0, translateY: 10 }}
                        animate={{ opacity: 1, translateY: 0 }}
                        exit={{ opacity: 0, translateY: -10 }}
                      >
                        T+
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Button>
              )}
            />

            <FormField
              name="time"
              control={form.control}
              render={({ field, fieldState, formState }) => (
                <FormItem className="flex flex-col items-center">
                  <FormControl>
                    <div className="flex flex-col gap-2.5 md:flex-row">
                      <InputOTP
                        maxLength={6}
                        defaultValue={"003000"}
                        {...field}
                      >
                        <InputOTPGroup>
                          <InputOTPSlot index={0} />
                          <InputOTPSlot index={1} />
                        </InputOTPGroup>
                        :
                        <InputOTPGroup>
                          <InputOTPSlot index={2} />
                          <InputOTPSlot index={3} />
                        </InputOTPGroup>
                        :
                        <InputOTPGroup>
                          <InputOTPSlot index={4} />
                          <InputOTPSlot index={5} />
                        </InputOTPGroup>
                      </InputOTP>
                      <AnimatePresence>
                        <Button
                          type="submit"
                          className="w-28"
                          variant="secondary"
                        >
                          {!isPending && (
                            <motion.div
                              key="submit-label"
                              className="flex flex-row items-center gap-2"
                              initial={{ opacity: 0, translateY: 10 }}
                              animate={{ opacity: 1, translateY: 0 }}
                              exit={{ opacity: 0, translateY: -10 }}
                            >
                              <SendHorizonal size={16} />
                              Send
                            </motion.div>
                          )}
                          {isPending && (
                            <motion.div
                              key="loading"
                              initial={{ opacity: 0, translateY: 10 }}
                              animate={{ opacity: 1, translateY: 0 }}
                              exit={{ opacity: 0, translateY: -10 }}
                            >
                              <Loader className="animate-spin" />
                            </motion.div>
                          )}
                        </Button>
                      </AnimatePresence>
                    </div>
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
        </form>
      </Form>
      <div className="flex flex-row flex-wrap gap-2.5">
        <ControlButton
          onClick={() => {
            form.setValue("time", "000008");
            form.setValue("beforeTZero", true);
          }}
        >
          T-00:00:08
        </ControlButton>
        <ControlButton
          onClick={() => {
            form.setValue("time", "000030");
            form.setValue("beforeTZero", true);
          }}
        >
          T-00:00:30
        </ControlButton>
        <ControlButton
          onClick={() => {
            form.setValue("time", "003000");
            form.setValue("beforeTZero", true);
          }}
        >
          T-00:30:00
        </ControlButton>
      </div>
      <Button
        className="mt-2.5 h-16 w-full"
        onClick={() => {
          mutate({
            state: time?.state === "active" ? "hold" : "active",
            time: time?.time ?? "T-003000",
          });
        }}
      >
        {!isPending && time?.state === "hold" && <Play size={50} />}
        {!isPending && time?.state === "active" && <Pause size={50} />}
        {isPending && <Loader className="animate-spin" size={50} />}
        {!time?.state && !isPending && <AlertTriangle />}
      </Button>
      {time?.time ? parseTime(time.time) : "Waiting for clock data"}
    </div>
  );
};

export default TimerControls;
