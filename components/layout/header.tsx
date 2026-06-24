"use client"

import { Bell, Search, Menu, LogOut } from "lucide-react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useEffect, useState } from "react"
import { notificationsAPI, Notification } from "@/lib/api"
import Link from "next/link"

interface HeaderProps {
  userName: string
  role: "admin" | "seller" | "supervisor" | "support"
  onMenuClick?: () => void
}

export function Header({ userName, role, onMenuClick }: HeaderProps) {
  const [unreadCount, setUnreadCount] = useState(0)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const router = useRouter()

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    router.push("/login")
  }

  useEffect(() => {
    const fetchNotifications = async () => {
      const token = localStorage.getItem("token")
      if (!token) return

      try {
        const [countRes, notifRes] = await Promise.all([
          notificationsAPI.getUnreadCount(token),
          notificationsAPI.getAll(token),
        ])
        setUnreadCount(countRes.count)
        setNotifications(notifRes.notifications.slice(0, 5))
      } catch (error) {
        console.error("Error fetching notifications:", error)
      }
    }

    fetchNotifications()
    const interval = setInterval(fetchNotifications, 30000)
    return () => clearInterval(interval)
  }, [])

  const initials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)

  // El rol admin_seguros usa las rutas /admin/* (no existe /admin_seguros/*).
  const basePath = (role as string) === "admin_seguros" ? "admin" : role
  const isAdmin = role === "admin" || (role as string) === "admin_seguros"

  return (
    <header className="sticky top-0 z-30 flex h-14 md:h-16 items-center gap-2 md:gap-4 border-b border-slate-200 bg-white px-3 md:px-6 shadow-sm">
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden flex-shrink-0"
        onClick={onMenuClick}
      >
        <Menu className="h-5 w-5" />
      </Button>

      {/* SegurOS — no company selector needed (single company) */}

      {/* Search - hidden on small mobile */}
      <div className="flex-1 max-w-md hidden sm:block">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Buscar..."
            className="pl-9 bg-slate-50 border-slate-200 focus:border-[#1a3a5c] focus:ring-[#1a3a5c]"
          />
        </div>
      </div>

      {/* Spacer for mobile */}
      <div className="flex-1 sm:hidden" />

      <div className="flex items-center gap-2 md:gap-3">
        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-[#1d4ed8] text-[10px] font-bold text-white flex items-center justify-center">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel className="flex items-center justify-between">
              Notificaciones
              {unreadCount > 0 && (
                <span className="text-xs text-muted-foreground">
                  {unreadCount} sin leer
                </span>
              )}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-sm text-muted-foreground">
                No hay notificaciones
              </div>
            ) : (
              notifications.map((notif) => (
                <DropdownMenuItem key={notif._id} className="flex flex-col items-start gap-1 p-3">
                  <span className={`text-sm ${!notif.isRead ? "font-semibold" : ""}`}>
                    {notif.title}
                  </span>
                  <span className="text-xs text-muted-foreground line-clamp-2">
                    {notif.message}
                  </span>
                </DropdownMenuItem>
              ))
            )}
            {role !== "support" && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href={`/${basePath}/notifications`} className="w-full text-center text-sm text-primary">
                    Ver todas
                  </Link>
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Configurar tu WhatsApp — verde estilo WhatsApp. Junto a la campanita
            (mobile) y al usuario (desktop). Solo admin. */}
        {isAdmin && (
          <Link
            href={`/${basePath}/whatsapp`}
            title="Configurar tu WhatsApp"
            className="inline-flex items-center gap-2 rounded-full bg-[#25D366] px-2.5 md:px-4 h-9 md:h-10 text-white font-semibold text-sm shadow-sm hover:bg-[#1ebe5d] transition-colors flex-shrink-0"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5 flex-shrink-0" aria-hidden="true">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.967-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.71.306 1.263.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.247-.694.247-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.885-9.886 9.885m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            <span className="hidden md:inline whitespace-nowrap">Configurar tu WhatsApp</span>
          </Link>
        )}

        {/* User menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2 px-2 md:px-3">
              <Avatar className="h-7 w-7 md:h-8 md:w-8">
                <AvatarFallback className="bg-[#0f2149] text-white text-xs md:text-sm">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <span className="hidden md:block text-sm font-medium">{userName}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Mi Cuenta</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={handleLogout}
              className="text-destructive focus:text-destructive cursor-pointer"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Cerrar Sesion
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
