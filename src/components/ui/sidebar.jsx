import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cn } from "@/lib/utils"

const SidebarContext = React.createContext({})
const useSidebar = () => React.useContext(SidebarContext)

const SidebarProvider = ({ children, ...props }) => {
  const [isOpen, setIsOpen] = React.useState(true)
  return (
    <SidebarContext.Provider value={{ isOpen, setIsOpen }} {...props}>
      {children}
    </SidebarContext.Provider>
  )
}

const Sidebar = React.forwardRef(({ className, ...props }, ref) => {
  const { isOpen } = useSidebar()
  return (
    <aside
      ref={ref}
      className={cn(
        "h-screen transition-all duration-300 ease-in-out",
        isOpen ? "w-64" : "w-0",
        "hidden md:block", // Hide on mobile by default
        className
      )}
      {...props}
    />
  )
})
Sidebar.displayName = "Sidebar"

const SidebarHeader = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("whitespace-nowrap", className)} {...props} />
))
SidebarHeader.displayName = "SidebarHeader"

const SidebarContent = React.forwardRef(({ className, ...props }, ref) => (
   <div ref={ref} className={cn("overflow-hidden", className)} {...props} />
))
SidebarContent.displayName = "SidebarContent"

const SidebarFooter = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("whitespace-nowrap", className)} {...props} />
))
SidebarFooter.displayName = "SidebarFooter"

const SidebarGroup = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("", className)} {...props} />
))
SidebarGroup.displayName = "SidebarGroup"

const SidebarGroupLabel = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("whitespace-nowrap", className)} {...props} />
))
SidebarGroupLabel.displayName = "SidebarGroupLabel"

const SidebarGroupContent = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("", className)} {...props} />
))
SidebarGroupContent.displayName = "SidebarGroupContent"

const SidebarMenu = React.forwardRef(({ className, ...props }, ref) => (
  <ul ref={ref} className={cn("space-y-1", className)} {...props} />
))
SidebarMenu.displayName = "SidebarMenu"

const SidebarMenuItem = React.forwardRef(({ className, ...props }, ref) => (
  <li ref={ref} className={cn("whitespace-nowrap", className)} {...props} />
))
SidebarMenuItem.displayName = "SidebarMenuItem"

const SidebarMenuButton = React.forwardRef(({ className, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : "button"
  return (
    <Comp
      ref={ref}
      className={cn("w-full", className)}
      {...props}
    />
  )
})
SidebarMenuButton.displayName = "SidebarMenuButton"

// This is a basic trigger for mobile, you can customize it
const SidebarTrigger = React.forwardRef(({ className, ...props }, ref) => {
    const { isOpen, setIsOpen } = useSidebar()
    return (
        <button ref={ref} className={cn("md:hidden", className)} onClick={() => setIsOpen(!isOpen)} {...props}>
            {/* You can add an icon here like a hamburger menu */}
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" x2="21" y1="6" y2="6"/><line x1="3" x2="21" y1="12" y2="12"/><line x1="3" x2="21" y1="18" y2="18"/></svg>
        </button>
    )
})
SidebarTrigger.displayName = "SidebarTrigger"


export {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
}