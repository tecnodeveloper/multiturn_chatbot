import { FC, ChangeEvent } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, Pencil } from "lucide-react";

interface PhotoUploadProps {
  imageUrl?: string;
  name?: string;
  role?: string;
  onUpload: (e: ChangeEvent<HTMLInputElement>) => void;
  isUploading: boolean;
}

export const PhotoUpload: FC<PhotoUploadProps> = ({ imageUrl, name, role = "Owner", onUpload, isUploading }) => {
  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative">
        <Avatar className="h-24 w-24 border-2 border-border shadow-lg">
          <AvatarImage src={imageUrl} className="object-cover" />
          <AvatarFallback className="bg-primary/10 text-primary text-2xl font-bold">
            {name ? name.charAt(0).toUpperCase() : "U"}
          </AvatarFallback>
        </Avatar>

        <label className="absolute bottom-0 right-0 bg-blue-600 hover:bg-blue-500 text-white p-2 rounded-full shadow-md cursor-pointer transition-all hover:scale-105 active:scale-95 flex items-center justify-center">
          {isUploading ? (
            <Loader2 className="h-4 w-4 animate-spin text-white" />
          ) : (
            <Pencil className="h-4 w-4 text-white" />
          )}
          <input
            type="file"
            className="hidden"
            accept="image/*"
            onChange={onUpload}
            disabled={isUploading}
          />
        </label>
      </div>

      <div className="flex flex-col items-center gap-1">
        <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20">
          {role}
        </span>
        <h2 className="text-xl font-bold text-foreground">{name || "User"}</h2>
      </div>
    </div>
  );
};
