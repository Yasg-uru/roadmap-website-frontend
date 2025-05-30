import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { ForgotPasswordSchema } from "@/schema/authschema/ForgotPasswordFormSchema";

import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@/hooks/useAppDispatch";
import { forgotPassword } from "@/state/slices/authSlice";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

const ForgotPassword: React.FC = () => {
  const dispatch = useAppDispatch();
 
  const [isBackToLogin, setIsBackToLogin] = useState<boolean>(false);
  const { isLoading } = useAppSelector((state) => state.auth);
  const navigate = useNavigate();

  const form = useForm<z.infer<typeof ForgotPasswordSchema>>({
    resolver: zodResolver(ForgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

 const onSubmit = (data: z.infer<typeof ForgotPasswordSchema>) => {
  dispatch(forgotPassword(data))
    .unwrap()
    .then(() => {
      setIsBackToLogin(true);
      toast.success("Mail sent successfully", {
        description: "Check your inbox and return to login.",
      });
    })
    .catch((error) =>
      toast.error("Invalid Email", {
        description: error,
      })
    );
};


  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-md dark:bg-gray-800">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800 dark:text-gray-200">
          Forgot Password
        </h2>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Email
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter your email"
                      type="email"
                      className="border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:focus:ring-indigo-400 dark:placeholder-gray-400"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {!isBackToLogin ? (
              <Button
                type="submit"
                className="w-full py-2 bg-indigo-600 text-white rounded-md shadow hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-indigo-500 dark:hover:bg-indigo-600 dark:focus:ring-indigo-400"
              >
                {isLoading ? (
                  <Loader2 className="h-6 w-6 animate-spin" />
                ) : (
                  "Send Mail"
                )}
              </Button>
            ) : (
              <Button
                type="button"
                onClick={() => navigate("/Login")}
                className="w-full py-2 bg-indigo-600 text-white rounded-md shadow hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-indigo-500 dark:hover:bg-indigo-600 dark:focus:ring-indigo-400"
              >
                Back To Login
              </Button>
            )}
          </form>
        </Form>
      </div>
    </div>
  );
};

export default ForgotPassword;
