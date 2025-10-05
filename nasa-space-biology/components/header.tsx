"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { ChevronDown, Gem, Menu, Radar, X } from "lucide-react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import stellarMindsLogo from "@/resources/stellar minds logo sin fondo.png"

const mainLinks = [
  {
    name: "Chat Assistant",
    href: "/chat",
  },
  {
    name: "Knowledge Graph",
    href: "/graph",
  },
]

const searcherLinks = [
  {
    name: "Assay Finder",
    href: "/assay-finder",
    description: "Surface experimental assays grouped by technology.",
    icon: Radar,
  },
]

const investorLinks = [
  {
    name: "Gap Finder",
    href: "/gap-finder",
    description: "Prioritize underfunded datasets with strong mission signals.",
    icon: Gem,
  },
]

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const toggleMenu = () => setIsMenuOpen((open) => !open)
  const closeMenu = () => setIsMenuOpen(false)

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <div className="container mx-auto flex h-16 items-center px-4">
        <Link href="/" className="flex items-center gap-3">
          <Image
            src={stellarMindsLogo}
            alt="Stellar Minds logo"
            width={48}
            height={48}
            priority
            className="h-12 w-12 object-contain"
          />
          <span className="font-mono text-sm font-bold text-foreground">Stellar Mind AI</span>
        </Link>

        <nav className="ml-auto hidden items-center gap-6 xl:flex">
          {mainLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="inline-flex items-center rounded-full border border-border/60 bg-card/60 px-4 py-2 font-mono text-sm uppercase tracking-[0.3em] text-muted-foreground transition hover:border-primary/50 hover:text-foreground"
            >
              {item.name}
            </Link>
          ))}

          <DropdownMenu>
            <DropdownMenuTrigger className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/60 px-4 py-2 font-mono text-sm uppercase tracking-[0.3em] text-muted-foreground transition hover:border-primary/50 hover:text-foreground">
              Researchers <ChevronDown className="h-3.5 w-3.5" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="center" className="min-w-[240px] border-border/60 bg-background/95 text-foreground">
              <DropdownMenuLabel className="text-xs uppercase tracking-[0.35em] text-muted-foreground">
                Exploration tools
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-border/60" />
              {searcherLinks.map((item) => (
                <DropdownMenuItem key={item.href} asChild className="px-3 py-2">
                  <Link href={item.href} className="flex items-start gap-3">
                    <item.icon className="mt-0.5 h-4 w-4 text-primary" />
                    <span>
                      <span className="block font-mono text-sm text-foreground">{item.name}</span>
                      <span className="block text-xs text-muted-foreground">{item.description}</span>
                    </span>
                  </Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/60 px-4 py-2 font-mono text-sm uppercase tracking-[0.3em] text-muted-foreground transition hover:border-primary/50 hover:text-foreground">
              Mission Architects <ChevronDown className="h-3.5 w-3.5" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="center" className="min-w-[240px] border-border/60 bg-background/95 text-foreground">
              <DropdownMenuLabel className="text-xs uppercase tracking-[0.35em] text-muted-foreground">
                Coming soon
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-border/60" />
              <DropdownMenuItem disabled className="px-3 py-2 text-xs text-muted-foreground">
                Mission tools will appear here shortly.
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/60 px-4 py-2 font-mono text-sm uppercase tracking-[0.3em] text-muted-foreground transition hover:border-primary/50 hover:text-foreground">
              Investors <ChevronDown className="h-3.5 w-3.5" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="center" className="min-w-[260px] border-border/60 bg-background/95 text-foreground">
              <DropdownMenuLabel className="text-xs uppercase tracking-[0.35em] text-muted-foreground">
                Deployment ready
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-border/60" />
              {investorLinks.map((item) => (
                <DropdownMenuItem key={item.href} asChild className="px-3 py-2">
                  <Link href={item.href} className="flex items-start gap-3">
                    <item.icon className="mt-0.5 h-4 w-4 text-primary" />
                    <span>
                      <span className="block font-mono text-sm text-foreground">{item.name}</span>
                      <span className="block text-xs text-muted-foreground">{item.description}</span>
                    </span>
                  </Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </nav>

        <button
          type="button"
          onClick={toggleMenu}
          className="ml-auto inline-flex h-10 w-10 items-center justify-center rounded-full border border-border/60 bg-card/70 text-foreground shadow-sm transition hover:border-primary/50 hover:text-primary xl:ml-3 xl:hidden"
          aria-label="Toggle navigation"
        >
          {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {isMenuOpen ? (
        <div className="xl:hidden border-b border-border/60 bg-background/95">
          <div className="flex flex-col gap-4 px-4 py-6">
            {mainLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={closeMenu}
                className="font-mono text-sm uppercase tracking-[0.3em] text-foreground"
              >
                {item.name}
              </Link>
            ))}

            <div className="flex flex-col gap-2">
              <span className="font-mono text-xs uppercase tracking-[0.3em] text-muted-foreground">Searchers</span>
              {searcherLinks.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={closeMenu}
                  className="text-sm text-foreground"
                >
                  {item.name}
                </Link>
              ))}
            </div>

            <div className="flex flex-col gap-2">
              <span className="font-mono text-xs uppercase tracking-[0.3em] text-muted-foreground">Mission Architects</span>
              <span className="text-sm text-muted-foreground">Coming soon</span>
            </div>

            <div className="flex flex-col gap-2">
              <span className="font-mono text-xs uppercase tracking-[0.3em] text-muted-foreground">Investors</span>
              {investorLinks.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={closeMenu}
                  className="text-sm text-foreground"
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </header>
  )
}
