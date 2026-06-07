import { FC } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface PhotoUploadProps {
  imageUrl?: string;
  name?: string;
}

export const PhotoUpload: FC<PhotoUploadProps> = ({ imageUrl, name }) => {
  return (
    <div className="flex items-center gap-4">
      <Avatar className="h-16 w-16 border border-gray-100 shadow-sm">
        <AvatarImage src={imageUrl} className="object-cover" />
        <AvatarFallback className="bg-[#8b6f5c]/10 text-[#8b6f5c] text-xl font-bold">
          {name ? name.charAt(0).toUpperCase() : "U"}
        </AvatarFallback>
      </Avatar>
      
      <div className="flex flex-col">
        <button className="bg-[#8b6f5c] text-white rounded-md text-sm px-4 py-2 font-medium hover:bg-[#7a6151] transition-colors w-fit">
          Change Photo
        </button>
        <p className="text-xs text-gray-400 mt-1">
          JPG, PNG or GIF. Max size 2MB
        </p>
      </div>
    </div>
  );
};
