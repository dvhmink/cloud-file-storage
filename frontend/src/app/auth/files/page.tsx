"use client";

import { ChangeEvent, useEffect, useState } from "react";
import axiosInstance from "@/config/axios";
import {
  PresignedUrlResponse,
  UploadPresignedUrlRequest,
} from "@/types/presignedUrl";
import { Cookies, useCookies } from "react-cookie";
import axios from "axios";
import FileList from "./_components/FileList";
import { FileObject } from "@/types/files";
import { useRouter } from "next/navigation";
import useSWR, { mutate } from "swr";
import UserCard from "./_components/UserCard";
import { UserInfoProps } from "@/types/userInfo";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Input } from "@/components/ui/input";

const FilesPage = () => {
  const [files, setFiles] = useState<FileObject[]>([]);
  const [cookies] = useCookies([""]);
  const router = useRouter();

  // @ts-ignore
  const jwtToken = cookies.jwt?.accessToken;

  // console.log("Cookies:", cookies.jwt);

  const { data: file } = useSWR<FileObject[]>(
    jwtToken ? "file-list" : null,
    async () => {
      const response = await axiosInstance.get<FileObject[]>("/file/list", {
        headers: {
          Authorization: `Bearer ${jwtToken}`,
        },
      });
      return response.data;
    }
  );

  const { data: user } = useSWR<UserInfoProps>(
    jwtToken ? "user-info" : null,
    async () => {
      const response = await axiosInstance.get("/auth/user", {
        headers: { Authorization: `Bearer ${jwtToken}` },
      });
      return response.data;
    }
  );

  const handleFileUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file: File = event.target.files![0];

    const requestBody: UploadPresignedUrlRequest = {
      fileName: file.name,
      fileType: file.name.split(".").pop()!,
    };

    const formData = new FormData();
    formData.append("file", file);
    formData.append("isPublic", "false"); // Or 'false'

    const response = await axiosInstance.post<PresignedUrlResponse>(
      "/file/upload",
      formData,
      {
        headers: {
          Authorization: `Bearer ${jwtToken}`,
          "Content-Type": "multipart/form-data",
        },
      }
    );
    const presignedUrl = response.data.url;

    axios
      .put(presignedUrl, file, {
        headers: {
          "Content-Type": file.type, // Match ContentType in presigned URL
        },
      })
      .then(() => {
        mutate("file-list");
      })
      .catch((error) => {
        console.error(error);
      });
  };

  const handleButtonClick = () => {
    inputRef.current?.click();
  };

  useEffect(() => {
    if (!jwtToken) {
      router.replace("/auth/login");
    }
  });

  return (
    <>
      <div className="flex h-[90vh]">
        <div className="mx-12 flex items-center ">
          {user && <UserCard user={user} />}
        </div>

        <div className="relative w-full mt-6 mr-12 p-4">
          <div className=" flex justify-end mb-5">
            <Label
              className="group relative flex items-center justify-center 
        w-12 h-12 rounded-full bg-blue-500 text-white cursor-pointer
        transition-all duration-300 overflow-hidden hover:w-32 hover:bg-black"
            >
              {/* Plus Icon (Hidden on Hover) */}
              <Plus
                className="w-6 h-6 transition-opacity duration-300 
          group-hover:opacity-0"
              />

              {/* Text (Appears on Hover) */}
              <span
                className="absolute opacity-0 left-[30%] transition-all 
          duration-300 whitespace-nowrap font-medium 
          group-hover:opacity-100"
              >
                Add File
              </span>
              <input
                type="file"
                className="hidden"
                onChange={handleFileUpload}
              />
            </Label>
          </div>

          {file && <FileList files={file} />}
        </div>
      </div>
    </>
  );
};

export default FilesPage;
