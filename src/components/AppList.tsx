'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { AppCard } from '@/components/AppCard'
import { SlidersHorizontal, Telescope } from 'lucide-react'
import { getAllApps } from '@/lib/data'
import { App } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationPrevious,
  PaginationNext,
  PaginationLink,
} from '@/components/ui/pagination'

type SortKey = 'votes' | 'name'
type ViewMode = 'daily' | 'weekly' | 'all time'
type PlatformFilter = 'all' | 'web' | 'ios' | 'android' | 'others'

const PRODUCTS_PER_PAGE = 8

interface AppListProps {
  searchQuery: string;
  limit?: number;
}

export function AppList({ searchQuery, limit }: AppListProps) {
  const [sortKey, setSortKey] = useState<SortKey>('votes')
  const [sortAsc, setSortAsc] = useState(false)
  const [viewMode, setViewMode] = useState<ViewMode>('daily')
  const [platformFilter, setPlatformFilter] = useState<PlatformFilter>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [apps, setApps] = useState<App[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    setApps(getAllApps())
    setIsLoading(false)
  }, [])

  // Filter apps based on platform and search query
  const filteredApps = apps.filter(app => {
    const matchesPlatform = platformFilter === 'all' ? true
      : platformFilter === 'web' ? app.externalLinks?.website
        : platformFilter === 'ios' ? app.externalLinks?.appStore
          : platformFilter === 'android' ? app.externalLinks?.playStore
            : !app.externalLinks?.website && !app.externalLinks?.appStore && !app.externalLinks?.playStore

    const searchTerm = searchQuery.toLowerCase()
    const matchesSearch = searchQuery === '' ? true
      : app.name.toLowerCase().includes(searchTerm) ||
      app.description.toLowerCase().includes(searchTerm) ||
      (app.tags?.some(tag => tag.toLowerCase().includes(searchTerm)) ?? false)

    return matchesPlatform && matchesSearch
  })

  // Reset to first page when search query changes
  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery])

  // Sort apps based on current criteria
  const sortedApps = [...filteredApps].sort((a, b) => {
    const modifier = sortAsc ? 1 : -1
    return sortKey === 'votes'
      ? (a.votes - b.votes) * modifier
      : a.id.localeCompare(b.id) * modifier
  })

  // Calculate pagination
  const totalPages = Math.ceil(sortedApps.length / PRODUCTS_PER_PAGE)
  const startIndex = (currentPage - 1) * PRODUCTS_PER_PAGE
  const paginatedApps = sortedApps.slice(startIndex, startIndex + PRODUCTS_PER_PAGE)

  // Calculate platform counts
  const platformStats = [
    { id: 'all', label: 'All', count: apps.length },
    { id: 'web', label: 'Web', count: apps.filter(app => app.externalLinks?.website).length },
    { id: 'ios', label: 'iOS', count: apps.filter(app => app.externalLinks?.appStore).length },
    { id: 'android', label: 'Android', count: apps.filter(app => app.externalLinks?.playStore).length },
    {
      id: 'others', label: 'Others', count: apps.filter(app =>
        !app.externalLinks?.website &&
        !app.externalLinks?.appStore &&
        !app.externalLinks?.playStore
      ).length
    }
  ]

  // Display limited apps on home page, or all apps with pagination on products page
  const displayApps = limit ? sortedApps.slice(0, limit) : paginatedApps;

  if (isLoading) {
    return <div className="w-full grid gap-6">Loading...</div>
  }

  return (
    <div className="w-full grid gap-6">
      {!limit && (
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between bg-background p-2 rounded-xl border">
          {/* Platform filter */}
          <div className="flex flex-wrap gap-1">
            {platformStats.map(({ id, label, count }) => (
              <Button
                key={id}
                variant={platformFilter === id ? "secondary" : "ghost"}
                onClick={() => {
                  setPlatformFilter(id as PlatformFilter)
                  setCurrentPage(1) // Reset to first page when filter changes
                }}
                className="flex items-center gap-2 pr-2 rounded-lg"
              >
                {label}
                <Badge variant={platformFilter === id ? "secondary" : "secondary"} className="w-8">{count}</Badge>
              </Button>
            ))}
          </div>

          {/* Sort Dropdown */}
          <Select value={viewMode} onValueChange={(value: ViewMode) => {
            setViewMode(value)
            setCurrentPage(1) // Reset to first page when sort changes
          }}>
            <SelectTrigger className="w-auto gap-2">
              <SlidersHorizontal size={16} />
              <SelectValue placeholder="Most Popular" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">Most Popular Today</SelectItem>
              <SelectItem value="weekly">Most Popular This Week</SelectItem>
              <SelectItem value="all time">Most Popular All Time</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4">
        {displayApps.map((app, index) => (
          <AppCard
            key={app.id}
            {...app}
            onUpvote={() => console.log(`Upvoted ${app.name}`)}
            ranking={limit ? index + 1 : undefined}
          />
        ))}
      </div>

      {limit && sortedApps.length > limit && (
        <Button asChild variant="outline" size="lg" className="rounded-xl">
          <Link
            href="/products"
            className="gap-2"
          >
            <Telescope size={20} />
            Ver todos los productos
          </Link>
        </Button>
      )}

      {!limit && totalPages > 1 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href="#"
                onClick={(e) => {
                  e.preventDefault()
                  setCurrentPage((p) => Math.max(1, p - 1))
                }}
                aria-disabled={currentPage === 1}
                className={currentPage === 1 ? 'pointer-events-none opacity-50' : ''}
              />
            </PaginationItem>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <PaginationItem key={page}>
                <PaginationLink
                  href="#"
                  isActive={currentPage === page}
                  onClick={(e) => {
                    e.preventDefault()
                    setCurrentPage(page)
                  }}
                >
                  {page}
                </PaginationLink>
              </PaginationItem>
            ))}

            <PaginationItem>
              <PaginationNext
                href="#"
                onClick={(e) => {
                  e.preventDefault()
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }}
                aria-disabled={currentPage === totalPages}
                className={currentPage === totalPages ? 'pointer-events-none opacity-50' : ''}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  )
} 