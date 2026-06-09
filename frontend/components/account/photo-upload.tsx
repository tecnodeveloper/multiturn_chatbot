import { FC, ChangeEvent } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2 } from "lucide-react";

interface PhotoUploadProps {
  imageUrl?: string;
  name?: string;
  onUpload: (e: ChangeEvent<HTMLInputElement>) => void;
  isUploading: boolean;
}

export const PhotoUpload: FC<PhotoUploadProps> = ({ imageUrl, name, onUpload, isUploading }) => {
  return (
    <div className="flex items-center gap-4">
      <Avatar className="h-16 w-16 border border-gray-100 shadow-sm">
        <AvatarImage src={imageUrl} className="object-cover" />
        <AvatarFallback className="bg-[#8b6f5c]/10 text-[#8b6f5c] text-xl font-bold">
          {name ? name.charAt(0).toUpperCase() : "U"}
        </AvatarFallback>
      </Avatar>
      
      <div className="flex flex-col">
        <label className="bg-[#8b6f5c] text-white rounded-md text-sm px-4 py-2 font-medium hover:bg-[#7a6151] transition-colors w-fit cursor-pointer flex items-center gap-2">
          {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Change Photo"}
          <input
            type="file"
            className="hidden"
            accept="image/*"
            onChange={onUpload}
            disabled={isUploading}
          />
        </label>
        <p className="text-xs text-gray-400 mt-1">
          JPG, PNG or GIF. Max size 2MB
        </p>
      </div>
    </div>
  );
};
