"use client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { useCookies } from "react-cookie";
import { useRouter } from "next/navigation";
import axiosInstance from "@/config/axios";
import { LoginResponse } from "@/types/auth";
import Link from "next/link";
import { useEffect } from "react";

type LoginForm = {
  email: string;
  password: string;
};

export default function Login() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<LoginForm>();

  const [cookies, setCookie] = useCookies(["jwt"]);

  // useEffect(() => {
  //   if (cookies.jwt) {
  //     router.replace("/auth/files");
  //   }
  // }, [cookies.jwt, router]);
  // console.log(cookies);

  const handleLogin = async (credentials: LoginForm) => {
    try {
      const response = await axiosInstance.post<LoginResponse>(
        "/auth/login",
        credentials
      );
      if (response.status === 201) {
        setCookie("jwt", response.data, { path: "/" });
        router.replace("/auth/files");
        // console.log(cookies);
        // console.log(response.data);
      } else {
        console.log("Failed to Login");
      }
    } catch (error: any) {
      if (error.response) {
        // Handle error response from backend
        console.error("Login failed:", error.response.data.message);
        alert(error.response.data.message);
      } else {
        // Handle any other type of error (e.g., network issues)
        console.error("An error occurred:", error.message);
        alert("An unexpected error occurred. Please try again.");
      }
    }
  };

  return (
    <>
      <div className="flex items-center justify-center h-[70vh]">
        <Card className="w-[30vw]">
          <form onSubmit={handleSubmit(handleLogin)}>
            <CardHeader>
              <CardTitle>Login</CardTitle>
              <CardDescription className=" ml-5 mr-5">
                Login to your cloud storage account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid w-full items-center gap-4">
                <div className="flex flex-col space-y-1.5">
                  <div className="mt-2 mb-2">
                    <Label htmlFor="Email">Email</Label>
                    <Input
                      type="email"
                      // placeholder="Email"
                      {...register("email", { required: true })}
                    />
                  </div>
                  <div className="mt-2 mb-2">
                    <Label htmlFor="Password">Password</Label>
                    <Input
                      type="password"
                      // placeholder="Password"
                      {...register("password", { required: true })}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end ">
              <Button type="submit">Login</Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </>
  );
}
