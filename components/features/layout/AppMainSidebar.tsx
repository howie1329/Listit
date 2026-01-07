"use client";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useUserSettings } from "@/providers/UserSettingsProvider";
import { CreateListModel } from "../list/CreateListModal";
import { useState } from "react";
import {
  HomeIcon,
  PlusSignIcon,
  SettingsIcon,
  BookmarkIcon,
} from "@hugeicons/core-free-icons";
import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import { UserSettingsModal } from "../settings/UsersSettingsModal";
export const AppMainSidebar = () => {
  const [openCreateListModal, setOpenCreateListModal] = useState(false);
  const [openSettingsModal, setOpenSettingsModal] = useState(false);
  const userSettings = useUserSettings();
  const items = [
    {
      label: "Lists",
      href: "/list",
      icon: <HugeiconsIcon icon={HomeIcon} />,
    },
    {
      label: "Bookmarks",
      href: "/bookmarks",
      icon: <HugeiconsIcon icon={BookmarkIcon} />,
    },
  ];
  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <h1>{userSettings?.name}&apos;s List It</h1>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Main Actions</SidebarGroupLabel>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                onClick={() => setOpenCreateListModal((prev) => !prev)}
              >
                <HugeiconsIcon icon={PlusSignIcon} />
                <span>Create New List</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Links</SidebarGroupLabel>
          <SidebarMenu>
            {items.map((item) => (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton>
                  <Link
                    className="flex flex-row w-full items-center gap-2 "
                    href={item.href}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenuButton
          onClick={() => setOpenSettingsModal((prev) => !prev)}
        >
          <HugeiconsIcon icon={SettingsIcon} />
          <span>Settings</span>
        </SidebarMenuButton>
      </SidebarFooter>
      <CreateListModel
        open={openCreateListModal}
        setOpen={setOpenCreateListModal}
      />
      <UserSettingsModal
        open={openSettingsModal}
        setOpen={setOpenSettingsModal}
      />
    </Sidebar>
  );
};
