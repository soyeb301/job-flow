"use client";

import Link from "next/link";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "next-themes";
import { useSession, signOut } from "next-auth/react";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Menu,
  X,
  Sun,
  Moon,
  Bot,
  Briefcase,
  FileText,
  LayoutDashboard,
  User,
  LogOut,
  Settings,
  ChevronDown,
  Wrench,
  Info,
  Star,
  Search,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const isSignedIn = status === "authenticated";
  const user = session?.user;

  const isActive = (href: string) => {
    if (href.startsWith('/#')) {
      return pathname === '/' && typeof window !== 'undefined' && window.location.hash === href.substring(1);
    }
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  const homeLinks = [
    { name: "Tools", href: "/#tools", icon: Wrench },
    { name: "How it Works", href: "/#how-it-works", icon: Info },
    { name: "Highlight", href: "/#highlight", icon: Star },
    { name: "Job Search", href: "/#job-search", icon: Search },
  ];

  const navLinks = [
    {
      name: "Resumes",
      href: "/resumes",
      icon: FileText,
      description: "Analyze & manage resumes",
    },
    {
      name: "Jobs",
      href: "/jobs",
      icon: Briefcase,
      description: "Track applications",
    },
  ];

  if (isSignedIn) {
    navLinks.unshift({
      name: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
      description: "Your overview",
    });
  }

  return (
    <>
      {/* ✅ Sticky Header */}
      <header className="sticky top-0 z-[100] w-full border-b bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 group">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 text-white transition-transform group-hover:scale-105">
              <Bot className="h-5 w-5" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              JOB FLOW
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center space-x-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const active = isActive(link.href);
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`group relative flex items-center space-x-2 rounded-lg px-3 py-2 text-sm font-medium transition-all ${
                    active 
                      ? "bg-accent text-accent-foreground" 
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  }`}
                  scroll={false}
                >
                  <Icon className={`h-4 w-4 ${active ? "text-blue-600" : ""}`} />
                  <span>{link.name}</span>
                  {active && (
                    <motion.div
                      layoutId="activeNav"
                      className="absolute inset-x-0 -bottom-px h-0.5 bg-gradient-to-r from-blue-600 to-purple-600"
                    />
                  )}
                </Link>
              );
            })}
            {!isSignedIn && homeLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className="group relative flex items-center space-x-2 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-all hover:bg-accent hover:text-accent-foreground"
                >
                  <Icon className="h-4 w-4" />
                  <span>{link.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Desktop Right */}
          <div className="hidden lg:flex items-center space-x-3">
            {/* Theme Toggle */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-9 w-9 px-0">
                  <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                  <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                  <span className="sr-only">Toggle theme</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setTheme("light")}>
                  <Sun className="mr-2 h-4 w-4" />
                  Light
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("dark")}>
                  <Moon className="mr-2 h-4 w-4" />
                  Dark
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("system")}>
                  <Bot className="mr-2 h-4 w-4" />
                  System
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {isSignedIn ? (
              <div className="flex items-center space-x-3">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-9 pl-2 pr-3 flex items-center gap-2 hover:bg-accent">
                      <div className="h-7 w-7 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white text-sm font-medium">
                        {user?.name?.charAt(0) || user?.username?.charAt(0)}
                      </div>
                      <span className="text-sm font-medium hidden sm:inline-block max-w-[100px] truncate">
                        {user?.name || user?.username}
                      </span>
                      <ChevronDown className="h-3 w-3 text-muted-foreground" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <div className="flex items-center gap-2 p-2">
                      <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white text-sm font-medium">
                        {user?.name?.charAt(0) || user?.username?.charAt(0)}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">{user?.name || user?.username}</span>
                        <span className="text-xs text-muted-foreground">{user?.email}</span>
                      </div>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard" className="cursor-pointer">
                        <LayoutDashboard className="mr-2 h-4 w-4" />
                        Dashboard
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/jobs" className="cursor-pointer">
                        <Briefcase className="mr-2 h-4 w-4" />
                        My Jobs
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/resumes" className="cursor-pointer">
                        <FileText className="mr-2 h-4 w-4" />
                        My Resumes
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => signOut()} className="cursor-pointer text-red-600 focus:text-red-600">
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link href="/login">
                  <Button variant="ghost" size="sm" className="h-9">
                    Sign In
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button size="sm" className="h-9 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white">
                    Sign Up
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu toggle */}
          <button
            className="lg:hidden flex h-9 w-9 items-center justify-center rounded-lg hover:bg-accent"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </header>

      {/* ✅ Mobile Menu (Fixed to below navbar) */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="fixed inset-x-0 top-16 z-[90] bg-background/95 backdrop-blur-md border-b lg:hidden"
          >
            <div className="container mx-auto p-4">
              <nav className="space-y-1">
                {navLinks.map((link) => {
                  const Icon = link.icon;
                  const active = isActive(link.href);
                  return (
                    <Link
                      key={link.name}
                      href={link.href}
                      className={`flex items-center space-x-3 rounded-lg p-3 text-sm font-medium transition-colors ${
                        active 
                          ? "bg-accent text-accent-foreground" 
                          : "hover:bg-accent"
                      }`}
                      onClick={() => setIsOpen(false)}
                      scroll={false}
                    >
                      <Icon className={`h-5 w-5 ${active ? "text-blue-600" : "text-muted-foreground"}`} />
                      <div>
                        <div>{link.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {link.description}
                        </div>
                      </div>
                    </Link>
                  );
                })}
                {!isSignedIn && homeLinks.map((link) => {
                  const Icon = link.icon;
                  return (
                    <Link
                      key={link.name}
                      href={link.href}
                      className="flex items-center space-x-3 rounded-lg p-3 text-sm font-medium hover:bg-accent"
                      onClick={() => setIsOpen(false)}
                    >
                      <Icon className="h-5 w-5 text-muted-foreground" />
                      <span>{link.name}</span>
                    </Link>
                  );
                })}
              </nav>

              {/* Mobile Theme Toggle */}
              <div className="mt-4 pt-4 border-t flex justify-center flex-wrap gap-2">
                <Button
                  variant={theme === "light" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setTheme("light")}
                  className="h-8 w-8 p-0"
                >
                  <Sun className="h-4 w-4" />
                </Button>
                <Button
                  variant={theme === "dark" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setTheme("dark")}
                  className="h-8 w-8 p-0"
                >
                  <Moon className="h-4 w-4" />
                </Button>
                <Button
                  variant={theme === "system" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setTheme("system")}
                  className="h-8 w-8 p-0"
                >
                  <Bot className="h-4 w-4" />
                </Button>
              </div>

              {/* Mobile Auth */}
              <div className="mt-4 pt-4 border-t">
                {isSignedIn ? (
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3 px-3">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white font-medium">
                        {user?.name?.charAt(0) || user?.username?.charAt(0)}
                      </div>
                      <div>
                        <span className="font-medium block">{user?.name || user?.username}</span>
                        <span className="text-xs text-muted-foreground">{user?.email}</span>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <Link href="/dashboard" onClick={() => setIsOpen(false)}>
                        <Button variant="ghost" className="w-full justify-start">
                          <LayoutDashboard className="mr-2 h-4 w-4" />
                          Dashboard
                        </Button>
                      </Link>
                      <Link href="/jobs" onClick={() => setIsOpen(false)}>
                        <Button variant="ghost" className="w-full justify-start">
                          <Briefcase className="mr-2 h-4 w-4" />
                          My Jobs
                        </Button>
                      </Link>
                      <Link href="/resumes" onClick={() => setIsOpen(false)}>
                        <Button variant="ghost" className="w-full justify-start">
                          <FileText className="mr-2 h-4 w-4" />
                          My Resumes
                        </Button>
                      </Link>
                    </div>
                    <Button
                      variant="outline"
                      className="w-full text-red-600 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
                      onClick={() => {
                        signOut();
                        setIsOpen(false);
                      }}
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign Out
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    <Link href="/login" onClick={() => setIsOpen(false)}>
                      <Button variant="outline" className="w-full">
                        Sign In
                      </Button>
                    </Link>
                    <Link href="/signup" onClick={() => setIsOpen(false)}>
                      <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white">
                        Sign Up
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
