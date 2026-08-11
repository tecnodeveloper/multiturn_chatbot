"use client";

import { FC, useState, useEffect } from "react";
import { Search, Plus, Folder, MoreHorizontal, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ThemeToggle } from "@/components/theme-toggle";
import { CreateProjectModal } from "./create-project-modal";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ProjectsUIProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean | ((prev: boolean) => boolean)) => void;
}

export interface ProjectItem {
  id: string;
  name: string;
  description: string;
  modified: string;
  category: "created" | "shared";
}

const INITIAL_PROJECTS: ProjectItem[] = [
  {
    id: "1",
    name: "multiturn-ai chatbot",
    description: "Primary AI conversational interface project",
    modified: "Yesterday",
    category: "created",
  },
  {
    id: "2",
    name: "customer-support-agent",
    description: "Automated ticketing & response pipeline",
    modified: "3 days ago",
    category: "created",
  },
  {
    id: "3",
    name: "analytics-dashboard-v2",
    description: "Response latency & user feedback telemetry",
    modified: "1 week ago",
    category: "shared",
  },
];

export const ProjectsUI: FC<ProjectsUIProps> = ({
  sidebarOpen,
  setSidebarOpen,
}) => {
  const [projectsSearch, setProjectsSearch] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "created" | "shared">("all");
  const [projectsList, setProjectsList] = useState<ProjectItem[]>(INITIAL_PROJECTS);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Load persisted projects from localStorage if available
  useEffect(() => {
    try {
      const saved = localStorage.getItem("multiturn_projects");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setProjectsList(parsed);
        }
      }
    } catch (e) {
      console.error("Failed to load projects from storage", e);
    }
  }, []);

  // Save projects to localStorage whenever updated
  const saveProjects = (newList: ProjectItem[]) => {
    setProjectsList(newList);
    try {
      localStorage.setItem("multiturn_projects", JSON.stringify(newList));
    } catch (e) {
      console.error("Failed to save projects to storage", e);
    }
  };

  const handleCreateProject = (name: string, description: string) => {
    const newProject: ProjectItem = {
      id: String(Date.now()),
      name,
      description: description || "Custom AI project module",
      modified: "Just now",
      category: "created",
    };
    saveProjects([newProject, ...projectsList]);
  };

  const handleDeleteProject = (id: string) => {
    const updated = projectsList.filter((p) => p.id !== id);
    saveProjects(updated);
  };

  const filteredProjects = projectsList.filter((project) => {
    const matchesSearch =
      project.name.toLowerCase().includes(projectsSearch.toLowerCase()) ||
      project.description.toLowerCase().includes(projectsSearch.toLowerCase());

    if (activeTab === "created") return matchesSearch && project.category === "created";
    if (activeTab === "shared") return matchesSearch && project.category === "shared";
    return matchesSearch;
  });

  return (
    <main className="relative flex min-w-0 flex-1 flex-col bg-[#f8fafc] dark:bg-[#070a12] text-[#0f172a] dark:text-foreground font-sans overflow-y-auto custom-scrollbar min-h-screen">
      {/* Sidebar Toggle Floating Button (when sidebar collapsed) */}
      {!sidebarOpen && (
        <Button
          className="absolute left-[8px] top-[14px] z-50 size-[32px] cursor-pointer rounded-full border border-[#cbd5e1] dark:border-slate-800 bg-white dark:bg-slate-900 shadow-md transition-all duration-200 hover:scale-110 hover:bg-[#f1f5f9] dark:hover:bg-slate-800"
          variant="ghost"
          size="icon"
          onClick={() => setSidebarOpen(true)}
        >
          <ChevronRight size={24} className="text-[#0f172a] dark:text-slate-300" />
        </Button>
      )}

      {/* Header Bar */}
      <header className="flex max-h-[60px] min-h-[60px] w-full items-center justify-between border-b border-[#e2e8f0] dark:border-slate-800/60 px-8 relative bg-white dark:bg-[#070a12]">
        <h1 className="text-sm font-semibold text-[#0f172a] dark:text-slate-100">
          Projects
        </h1>

        <div className="flex items-center gap-2">
          <ThemeToggle />
        </div>
      </header>

      {/* Main Projects Page Content Area */}
      <div className="mx-auto w-full max-w-6xl px-8 py-10">
        {/* Top Header Controls: Title + Search & New Button */}
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between mb-8">
          <h1 className="text-3xl font-extrabold tracking-tight text-[#0f172a] dark:text-white sm:text-4xl">
            Projects
          </h1>

          <div className="flex items-center gap-3">
            <div className="relative min-w-[220px]">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#64748b] dark:text-slate-500" />
              <Input
                placeholder="Search projects"
                value={projectsSearch}
                onChange={(e) => setProjectsSearch(e.target.value)}
                className="h-10 pl-10 pr-4 text-xs rounded-xl border-[#cbd5e1] dark:border-slate-800/80 bg-[#f1f5f9] dark:bg-[#0c1322] text-[#0f172a] dark:text-slate-200 placeholder:text-[#64748b] dark:placeholder:text-slate-500 focus-visible:ring-1 focus-visible:ring-blue-500/50 shadow-inner"
              />
            </div>

            <Button
              onClick={() => setIsCreateModalOpen(true)}
              className="h-10 rounded-xl bg-[#2563eb] hover:bg-blue-600 text-white text-xs font-semibold px-4 shadow-lg shadow-blue-500/20 flex items-center gap-1.5 transition-all hover:scale-105 active:scale-95 shrink-0"
            >
              <Plus className="h-4 w-4" />
              <span>New</span>
            </Button>
          </div>
        </div>

        {/* Filter Tabs Bar */}
        <div className="flex items-center gap-2 border-b border-[#e2e8f0] dark:border-slate-800/60 pb-3 mb-8">
          <button
            onClick={() => setActiveTab("all")}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
              activeTab === "all"
                ? "bg-[#2563eb] text-white shadow-sm"
                : "text-[#64748b] hover:text-[#0f172a] dark:text-slate-400 dark:hover:text-slate-200"
            }`}
          >
            All
          </button>
          <button
            onClick={() => setActiveTab("created")}
            className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
              activeTab === "created"
                ? "bg-[#2563eb] text-white shadow-sm font-semibold"
                : "text-[#64748b] hover:text-[#0f172a] dark:text-slate-400 dark:hover:text-slate-200"
            }`}
          >
            Created by you
          </button>
          <button
            onClick={() => setActiveTab("shared")}
            className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
              activeTab === "shared"
                ? "bg-[#2563eb] text-white shadow-sm font-semibold"
                : "text-[#64748b] hover:text-[#0f172a] dark:text-slate-400 dark:hover:text-slate-200"
            }`}
          >
            Shared with you
          </button>
        </div>

        {/* Project Card Container / Table */}
        <div className="rounded-2xl border border-[#e2e8f0] dark:border-slate-800/80 bg-white dark:bg-[#0e1626]/80 overflow-hidden shadow-xl backdrop-blur-sm">
          {/* Header Row */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#e2e8f0] dark:border-slate-800/60 bg-[#f1f5f9] dark:bg-[#0a101d]/60 text-[11px] font-semibold uppercase tracking-wider text-[#64748b] dark:text-slate-400">
            <span>NAME</span>
            <span>MODIFIED</span>
          </div>

          {/* Project List Items */}
          <div className="divide-y divide-[#e2e8f0] dark:divide-slate-800/60">
            {filteredProjects.map((project) => (
              <div
                key={project.id}
                className="group flex items-center justify-between px-6 py-4 hover:bg-[#f8fafc] dark:hover:bg-slate-800/40 transition-colors"
              >
                <div className="flex items-center gap-4 min-w-0 flex-1 pr-4">
                  {/* Folder Icon Container */}
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-600/25 border border-blue-200 dark:border-blue-500/30 text-amber-500 dark:text-amber-400 shrink-0">
                    <Folder className="h-5 w-5 fill-amber-500/20 dark:fill-amber-400/20" />
                  </div>

                  <div className="flex flex-col min-w-0">
                    <span className="text-sm font-semibold text-[#0f172a] dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">
                      {project.name}
                    </span>
                    <span className="text-xs text-[#64748b] dark:text-slate-400 truncate mt-0.5">
                      {project.description}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-6 shrink-0">
                  <span className="text-xs text-[#64748b] dark:text-slate-400">
                    {project.modified}
                  </span>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-[#64748b] hover:text-[#0f172a] dark:text-slate-400 dark:hover:text-white hover:bg-[#e2e8f0]/60 dark:hover:bg-slate-700/60 rounded-lg transition-colors"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-40 bg-white dark:bg-slate-900 border-[#e2e8f0] dark:border-slate-800 text-[#0f172a] dark:text-slate-200">
                      <DropdownMenuItem className="text-xs cursor-pointer hover:bg-[#f1f5f9] dark:hover:bg-slate-800">
                        Open Project
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-xs cursor-pointer hover:bg-[#f1f5f9] dark:hover:bg-slate-800">
                        Rename
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        className="text-xs cursor-pointer text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 hover:text-red-600 dark:hover:text-red-300"
                        onClick={() => handleDeleteProject(project.id)}
                      >
                        Delete Project
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))}

            {filteredProjects.length === 0 && (
              <div className="p-8 text-center text-xs text-[#64748b] dark:text-slate-500 italic">
                No projects found.
              </div>
            )}
          </div>
        </div>
      </div>

      <CreateProjectModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreate={handleCreateProject}
      />
    </main>
  );
};
