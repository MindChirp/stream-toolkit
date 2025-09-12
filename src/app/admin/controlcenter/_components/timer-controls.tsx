import React from "react";
import { AnimatePresence, motion } from "motion/react";
import ControlButton from "./control-button";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { FormInput } from "lucide-react";
import { Button } from "@/components/ui/button";
const formSchema = z.object({
  time: z
    .string()
    .min(6, "Time must be 6 characters")
    .max(6, "Time must be 6 characters"),
});

const TimerControls = () => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      time: "003000",
    },
  });

  const handleSubmit = (data: z.infer<typeof formSchema>) => {
    console.log(data);
  };
  return (
    <div className="flex flex-col items-center gap-2.5">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(handleSubmit)}
          className="flex w-full items-center justify-center"
        >
          <FormField
            name="time"
            control={form.control}
            render={({ field, fieldState }) => (
              <FormItem className="flex flex-col items-center">
                <FormControl>
                  <div className="flex flex-row">
                    <InputOTP maxLength={6} defaultValue={"003000"} {...field}>
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
                      {fieldState.isDirty && (
                        <motion.div
                          key="submit-button"
                          className="overflow-hidden"
                          initial={{
                            opacity: 0,
                            width: 0,
                          }}
                          animate={{
                            opacity: 1,
                            width: "auto",
                            marginLeft: "1rem",
                          }}
                          exit={{
                            opacity: 0,
                            width: 0,
                            marginLeft: 0,
                          }}
                        >
                          <Button>Submit</Button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </form>
      </Form>
      <div className="flex flex-row flex-wrap gap-2.5">
        <ControlButton>T-00:00:10</ControlButton>
        <ControlButton>T-00:00:10</ControlButton>
      </div>
    </div>
  );
};

export default TimerControls;
