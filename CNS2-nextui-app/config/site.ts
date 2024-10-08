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
  UserSquareIcon,
  HelpDocsIcon,
  SupportIcon,
  BrandIcon,
} from "@/components/icons";

export type SiteConfig = typeof siteConfig;

const internalLinks = {
  home: "/",
  docs: "/docs",
  pricing: "/pricing",
  blog: "/blog", //削除予定⇒外部に用意
  about: "/about",
  users: "/users",
  personal: "personal",
};

export const siteConfig = {
  name: "Collectors Networking Service",
  description: "Make beautiful websites regardless of your design experience.",
  navItems: [
    {
      label: "Home",
      href: internalLinks.home,
    },
    {
      label: "Docs",
      href: internalLinks.docs,
    },
    {
      label: "Pricing",
      href: internalLinks.pricing,
    },
    //削除予定
    {
      label: "Blog",
      href: internalLinks.blog,
    },
    {
      label: "About",
      href: internalLinks.about,
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
      href: internalLinks.personal,
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
  internalLinks: internalLinks,
};
