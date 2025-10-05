"use client";

import Group from "@/app/_components/group";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/trpc/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader, SendIcon, Trash } from "lucide-react";
import { useForm } from "react-hook-form";
import z from "zod";

const formSchema = z.object({
  message: z.string(),
});

const MessageControls = () => {
  const { mutateAsync, status } = api.socket.setOverlayState.useMutation();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      message: "",
    },
  });

  const handleSubmit = (data: z.infer<typeof formSchema>) => {
    void mutateAsync({
      message: {
        show: true,
        message: data.message,
      },
    });
  };

  const handleDelete = () => {
    void mutateAsync({
      message: {
        show: false,
        message: null,
      },
    });
  };

  return (
    <Group title="Messages">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(handleSubmit)}
          className="flex flex-col gap-2.5"
        >
          <div className="flex flex-row items-center gap-2.5">
            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <>
                  <FormControl>
                    <Textarea {...field} />
                  </FormControl>
                  <FormMessage />
                </>
              )}
            />
            {form.formState.isDirty && (
              <Button
                variant="destructive"
                onClick={(e) => {
                  e.preventDefault();
                  handleDelete();
                }}
              >
                <Trash />
              </Button>
            )}
          </div>
          <Button className="w-fit">
            {status !== "pending" && (
              <>
                <SendIcon /> Push to overlay
              </>
            )}
            {status === "pending" && <Loader className="animate-spin" />}
          </Button>
        </form>
      </Form>
    </Group>
  );
};

export default MessageControls;
