import axiosInstance from "@/config/axios";
import { FileObject } from "@/types/files";
import { PresignedUrlResponse } from "@/types/presignedUrl";
import dayjs from "dayjs";
import { useCookies } from "react-cookie";
import { mutate } from "swr";
import { TableCell, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";

function formatBytes(bytes: number, decimals: number) {
  if (bytes == 0) return "0 Bytes";
  const k = 1024,
    dm = decimals || 2,
    sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"],
    i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}

const FileItem = ({ file }: { file: FileObject }) => {
  const [cookies] = useCookies(["accessToken"]);

  // @ts-ignore
  const jwtToken = cookies.jwt.accessToken;

  const handleDownloadFile = async () => {
    const { data } = await axiosInstance.get<PresignedUrlResponse>(
      "/files/get",
      {
        params: {
          fileId: file.id,
        },
        headers: {
          Authorization: `Bearer ${jwtToken}`,
        },
      }
    );

    const downloadUrl = data.url;
    const downloadLink = document.createElement("a");

    downloadLink.href = downloadUrl;
    downloadLink.setAttribute("download", file.name);

    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };

  const handleDeleteFile = async () => {
    await axiosInstance.delete(`/file/${file.key}`, {
      headers: {
        Authorization: `Bearer ${jwtToken}`,
      },
    });

    mutate("file-list");
  };

  return (
    <TableRow key={file.id}>
      <TableCell className="font-medium text-center">{file.name}</TableCell>
      <TableCell className="text-center">{file.type}</TableCell>
      <TableCell className="text-center">{formatBytes(file.size, 2)}</TableCell>
      <TableCell className="text-center">
        {dayjs(file.lastModified).format("DD/MM/YYYY")}
      </TableCell>
      <TableCell className="px-6 py-4 text-center">
        <Button
          className="text-white mr-4"
          onClick={handleDownloadFile}
          variant="default"
        >
          Download
        </Button>
        <Button
          className="text-white hover:text-black"
          onClick={handleDeleteFile}
          variant="destructive"
        >
          Delete
        </Button>
      </TableCell>
    </TableRow>
  );
};

export default FileItem;
