"use client";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import axiosInstance from "@/config/axios";
// import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

type SignupForm = {
  name: string;
  email: string;
  password: string;
};

export default function Signup() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupForm>();

  const handleSignup = async (data: SignupForm) => {
    try {
      const response = await axiosInstance.post("/auth/signup", data);

      if (response.status === 201) {
        console.log("Registered successfully!");
        router.replace("/auth/login");
      } else {
        console.log("Failed to register");
      }
    } catch (error: any) {
      if (error.response) {
        // Handle error response from backend
        console.error("Signup failed:", error.response.data.message);
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
          <form onSubmit={handleSubmit(handleSignup)}>
            <CardHeader>
              <CardTitle>Signup</CardTitle>
              <CardDescription className=" ml-5 mr-5">
                Create you cloud storage account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid w-full items-center gap-4">
                <div className="flex flex-col space-y-1.5">
                  <div className="mt-2 mb-2">
                    <Label htmlFor="Name">Name</Label>
                    <Input
                      type="name"
                      // placeholder="Name"
                      {...register("name", { required: true })}
                    />
                  </div>
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
              <Button type="submit">Create User</Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </>
  );
}
