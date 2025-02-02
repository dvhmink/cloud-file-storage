"use client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import { UserInfoProps } from "@/types/userInfo";

export default function UserCard({ user }: UserInfoProps) {
  return (
    <>
      <Card className="w-[350px] shadow-lg flex flex-col items-center p-2">
        <CardHeader className="flex flex-col items-center">
          <Avatar className="w-24 h-24">
            <AvatarImage
              src="https://preview.redd.it/180p6uglhkb71.jpg?width=1080&crop=smart&auto=webp&s=5d42aacd9c6404747817034c0634f6b0eaf7aad1"
              alt="uia"
              className="object-cover"
            />
            <AvatarFallback className="text-2xl">UIIA</AvatarFallback>
          </Avatar>
        </CardHeader>
        <CardContent className="flex flex-col items-center text-center">
          <form>
            <div className="grid w-full items-center gap-4">
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="name">Name: {user.name}</Label>
              </div>
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="email">Email: {user.email}</Label>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </>
  );
}
