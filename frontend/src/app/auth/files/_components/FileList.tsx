import { FileObject } from "@/types/files";
import FileItem from "./FileItem";
import { useCookies } from "react-cookie";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type FileListProps = {
  files: FileObject[];
};

const FileList = ({ files }: FileListProps) => {
  return (
    <Table className="border border-gray-300">
      <TableHeader>
        <TableRow>
          <TableHead className="text-center">FILE NAME</TableHead>
          <TableHead className="text-center">TYPE</TableHead>
          <TableHead className="text-center">SIZE</TableHead>
          <TableHead className="text-center">LAST MODIFED</TableHead>
          <TableHead className="text-center">ACTION</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {files.map((file) => (
          <FileItem file={file} key={file.key} />
        ))}
      </TableBody>
    </Table>
  );
};

export default FileList;
