import {
  Navbar as NextUINavbar,
  NavbarContent,
  NavbarMenu,
  NavbarMenuToggle,
  NavbarBrand,
  NavbarItem,
  NavbarMenuItem,
} from "@nextui-org/navbar";
import { Button } from "@nextui-org/button";
import { Kbd } from "@nextui-org/kbd";
import { Link } from "@nextui-org/link";
import { Input } from "@nextui-org/input";
import { link as linkStyles } from "@nextui-org/theme";
import NextLink from "next/link";
import clsx from "clsx";

import { DropdownItem, DropdownTrigger, Dropdown, DropdownMenu } from "@nextui-org/dropdown";
import { Avatar } from "@nextui-org/avatar"
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from "@nextui-org/modal"
import { useDisclosure} from "@nextui-org/react";


import { siteConfig } from "@/config/site";
import { ThemeSwitch } from "@/components/theme-switch";
import {
  TwitterIcon,
  TwitterXIcon,
  YoutubeIcon,
  GithubIcon,
  DiscordIcon,
  HeartFilledIcon,
  CodiconSignIn,
  SearchIcon,
  Logo,
  UserCircleIcon,
  HelpDocsIcon,
} from "@/components/icons";

export const Navbar = () => {
  const {isOpen, onOpen, onOpenChange} = useDisclosure();

  {/* 検索ボックス */}
  const searchInput = (
    <Input
      aria-label="Search"
      classNames={{
        inputWrapper: "bg-default-100",
        input: "text-sm",
      }}
      endContent={
        <Kbd className="hidden lg:inline-block" keys={["command"]}>
          K
        </Kbd>
      }
      labelPlacement="outside"
      placeholder="Search..."
      startContent={
        <SearchIcon className="text-base text-default-400 pointer-events-none flex-shrink-0" />
      }
      type="search"
    />
  );

  {/* ログインボタン */}
  const loginButton = (
    <Button
      isExternal
      as={Link}
      className="text-sm font-normal text-default-600 bg-default-100"
      href={siteConfig.links.sponsor}
      startContent={<CodiconSignIn />}
      variant="flat"
    >
      Login
    </Button>
  ); 
  
  {/* ユーザー設定 */}
  const avatarDropdown = (
    <Dropdown placement="bottom-end">
      <DropdownTrigger>
        <Avatar
          isBordered
          as="button"
          className="transition-transform"
          color="secondary"
          name="Jason Hughes"
          size="sm"
          src="https://i.pravatar.cc/150?u=a042581f4e29026704d"
        />
      </DropdownTrigger>
      <DropdownMenu aria-label="Profile Actions" variant="flat">
        <DropdownItem key="profile" className="h-14 gap-2" startContent={<UserCircleIcon/>} showDivider>マイページ</DropdownItem>
        <DropdownItem key="settings" className="h-14 gap-2" startContent={<ThemeSwitch />} showDivider>表示モード切替</DropdownItem>
        <DropdownItem key="help_docs" className="h-14 gap-2" startContent={<HelpDocsIcon />}>ヘルプ</DropdownItem>
        <DropdownItem key="support">XXXX</DropdownItem>
      </DropdownMenu>
    </Dropdown>
  );

  return (
    <NextUINavbar maxWidth="xl" position="sticky">
      <NavbarContent className="basis-1/5 sm:basis-full" justify="start">
        <NavbarItem className="sm:hidden basis-1 pl-0"><NavbarMenuToggle /></NavbarItem>
        <NavbarBrand className="gap-3 max-w-fit">
          <NextLink className="flex justify-start items-center gap-1" href="/">
            <Logo />
            <p className="font-bold text-inherit">ACME</p>
          </NextLink>
        </NavbarBrand>
        <div className="hidden lg:flex gap-4 justify-start ml-2">
          {siteConfig.navItems.map((item) => (
            <NavbarItem key={item.href}>
              <NextLink
                className={clsx(
                  linkStyles({ color: "foreground" }),
                  "data-[active=true]:text-primary data-[active=true]:font-medium",
                )}
                color="foreground"
                href={item.href}
              >
                {item.label}
              </NextLink>
            </NavbarItem>
          ))}
        </div>
      </NavbarContent>

      <NavbarContent
        className="md:flex basis-1/5 sm:basis-full"
        justify="end"
      >
        <NavbarItem className="hidden md:flex gap-2">
          <Link isExternal href={siteConfig.links.twitterX}>
            <TwitterXIcon className="text-default-500" />
          </Link>
          <Link isExternal href={siteConfig.links.youtube}>
            <YoutubeIcon className="text-default-500" />
          </Link>
          <ThemeSwitch />
        </NavbarItem>
        <NavbarItem className="hidden sm:flex">{searchInput}</NavbarItem>
        <NavbarItem className="hidden sm:flex">{loginButton}</NavbarItem>
        <NavbarItem className="hidden sm:flex">{avatarDropdown}</NavbarItem>
      </NavbarContent>

      {/* Main:最小画面サイズ */}
      <NavbarContent className="sm:hidden basis-1 pl-0" justify="end">
        <Button isIconOnly onPress={onOpen}><SearchIcon /></Button>
        {loginButton}
        {avatarDropdown}
      </NavbarContent>

      {/* Sub:ナビゲーションバー */}
      <NavbarMenu>
        {searchInput}
        <div className="mx-4 mt-2 flex flex-col gap-2">
          {siteConfig.navMenuItems.map((item, index) => (
            <NavbarMenuItem key={`${item}-${index}`}>
              <Link
                color={
                  index === 2
                    ? "primary"
                    : index === siteConfig.navMenuItems.length - 1
                      ? "danger"
                      : "foreground"
                }
                href="#"
                size="lg"
              >
                {item.label}
              </Link>
            </NavbarMenuItem>
          ))}
        </div>
      </NavbarMenu>

      {/* Sub:検索用サブフォーム */}
      <Modal 
        isOpen={isOpen} 
        onOpenChange={onOpenChange}
        placement="top-center"
        hideCloseButton={true}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex">
                {searchInput}
                <Button isIconOnly color="primary" onPress={onClose}>
                  <SearchIcon/>
                </Button>
              </ModalHeader>
              {/*
              <ModalBody></ModalBody>
              <ModalFooter></ModalFooter>
              */}
            </>
          )}
        </ModalContent>
      </Modal>

    </NextUINavbar>
  );
};
