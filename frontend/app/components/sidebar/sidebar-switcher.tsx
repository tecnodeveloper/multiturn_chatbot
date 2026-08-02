"use client";

import { FC } from "react";
import { ContentType } from "@/types";
import {
  IconAdjustmentsHorizontal,
  IconBolt,
  IconBooks,
  IconFile,
  IconMessage,
  IconPencil,
  IconRobotFace,
  IconSparkles
} from "@tabler/icons-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export const SIDEBAR_ICON_SIZE = 28;

interface SidebarSwitcherProps {
  onContentTypeChange: (contentType: ContentType) => void;
  contentType: ContentType;
}

import { ThemeToggle } from "@/components/theme-toggle";

export const SidebarSwitcher: FC<SidebarSwitcherProps> = ({
  onContentTypeChange,
  contentType
}) => {
  return (
    <div className="flex flex-col justify-between border-r border-border pb-5 bg-background w-[60px]">
      <Tabs value={contentType} onValueChange={(val) => onContentTypeChange(val as ContentType)}>
        <TabsList className="bg-background flex flex-col items-center py-4 space-y-4 h-auto">
          <SidebarSwitchItem
            icon={<IconMessage size={SIDEBAR_ICON_SIZE} />}
            contentType="chats"
            label="Chats"
            isActive={contentType === "chats"}
            onClick={() => onContentTypeChange("chats")}
          />

          <SidebarSwitchItem
            icon={<IconAdjustmentsHorizontal size={SIDEBAR_ICON_SIZE} />}
            contentType="presets"
            label="Presets"
            isActive={contentType === "presets"}
            onClick={() => onContentTypeChange("presets")}
          />

          <SidebarSwitchItem
            icon={<IconPencil size={SIDEBAR_ICON_SIZE} />}
            contentType="prompts"
            label="Prompts"
            isActive={contentType === "prompts"}
            onClick={() => onContentTypeChange("prompts")}
          />

          <SidebarSwitchItem
            icon={<IconSparkles size={SIDEBAR_ICON_SIZE} />}
            contentType="models"
            label="Models"
            isActive={contentType === "models"}
            onClick={() => onContentTypeChange("models")}
          />

          <SidebarSwitchItem
            icon={<IconFile size={SIDEBAR_ICON_SIZE} />}
            contentType="files"
            label="Files"
            isActive={contentType === "files"}
            onClick={() => onContentTypeChange("files")}
          />

          <SidebarSwitchItem
            icon={<IconBooks size={SIDEBAR_ICON_SIZE} />}
            contentType="collections"
            label="Collections"
            isActive={contentType === "collections"}
            onClick={() => onContentTypeChange("collections")}
          />

          <SidebarSwitchItem
            icon={<IconRobotFace size={SIDEBAR_ICON_SIZE} />}
            contentType="assistants"
            label="Assistants"
            isActive={contentType === "assistants"}
            onClick={() => onContentTypeChange("assistants")}
          />

          <SidebarSwitchItem
            icon={<IconBolt size={SIDEBAR_ICON_SIZE} />}
            contentType="tools"
            label="Tools"
            isActive={contentType === "tools"}
            onClick={() => onContentTypeChange("tools")}
          />
        </TabsList>
      </Tabs>

      <div className="flex flex-col items-center px-2">
        <ThemeToggle />
      </div>
    </div>
  );
};

interface SidebarSwitchItemProps {
  icon: React.ReactNode;
  contentType: ContentType;
  label: string;
  isActive: boolean;
  onClick: () => void;
}

const SidebarSwitchItem: FC<SidebarSwitchItemProps> = ({
  icon,
  contentType,
  label,
  isActive,
  onClick
}) => {
  return (
    <TooltipProvider delayDuration={0}>
      <Tooltip>
        <TooltipTrigger asChild>
          <TabsTrigger
            value={contentType}
            onClick={onClick}
            className={`flex h-10 w-10 items-center justify-center rounded-lg transition-colors p-0 ${
              isActive 
                ? "bg-primary text-primary-foreground" 
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            {icon}
          </TabsTrigger>
        </TooltipTrigger>
        <TooltipContent side="right">
          <p>{label}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
