import { divider } from "@nextui-org/theme";
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
  SupportIcon,
  BrandIcon,
} from "@/components/icons";

export type SiteConfig = typeof siteConfig;

export const siteConfig = {
  name: "Collectors Networking Service",
  description: "Make beautiful websites regardless of your design experience.",
  navItems: [
    {
      label: "Home",
      href: "/",
    },
    {
      label: "Docs",
      href: "/docs",
    },
    {
      label: "Pricing",
      href: "/pricing",
    },
    {
      label: "Blog",
      href: "/blog",
    },
    {
      label: "About",
      href: "/about",
    },
  ],
  navMenuItems: [
    {
      label: "Profile",
      href: "/profile",
    },
    {
      label: "Dashboard",
      href: "/dashboard",
    },
    {
      label: "Projects",
      href: "/projects",
    },
    {
      label: "Team",
      href: "/team",
    },
    {
      label: "Calendar",
      href: "/calendar",
    },
    {
      label: "Settings",
      href: "/settings",
    },
    {
      label: "Help & Feedback",
      href: "/help-feedback",
    },
    {
      label: "Logout",
      href: "/logout",
    },
  ],
  //ナビゲーションバーのユーザーメニュー
  userMenuItems: [
    { label: "マイページ",
      href: "/personal",
      classname: "h-14 gap-2",
      icon: UserCircleIcon,
      divider: true,
    },
    { label: "ヘルプ",
      href: "/personal",
      classname: "h-14 gap-2",
      icon: HelpDocsIcon,
      divider: false,
    },
    { label: "サポート",
      href: "/personal",
      classname: "h-14 gap-2",
      icon: SupportIcon,
      divider: false,
    },
  ],
  links: {
    github: "https://github.com/nextui-org/nextui",
    twitter: "https://twitter.com/getnextui",
    twitterX: "https://x.com/Grim_shop",
    youtube: "https://www.youtube.com/results?search_query=%E3%83%AD%E3%83%BC%E3%83%AA%E3%82%A8+%E3%83%88%E3%83%AC%E3%82%AB",
    docs: "https://nextui-docs-v2.vercel.app",
    discord: "https://discord.gg/9b6yyZKmH4",
    sponsor: "https://patreon.com/jrgarciadev",
  },
};
