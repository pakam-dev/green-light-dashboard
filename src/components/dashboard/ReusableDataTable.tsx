import { ReactNode } from "react";
import { Search, SlidersHorizontal, RefreshCw, ChevronLeft, ChevronRight, Loader2, MoreVertical, Download, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { UseDataTableReturn } from "@/hooks/use-data-table";

export interface TableColumn<T> {
  key: keyof T | string;
  header: string;
  render?: (item: T) => ReactNode;
  className?: string;
}

export interface TableTab {
  id: string;
  label: string;
}

interface ReusableDataTableProps<T> {
  // Data and configuration
  tableState: UseDataTableReturn<T>;
  columns: TableColumn<T>[];
  
  // Optional tabs
  tabs?: TableTab[];
  activeTab?: string;
  onTabChange?: (tabId: string) => void;
  
  // Customization
  searchPlaceholder?: string;
  showSearch?: boolean;
  showFilter?: boolean;
  showExport?: boolean;
  showRefresh?: boolean;
  showPagination?: boolean;
  
  // Callbacks
  onExport?: () => void;
  onFilter?: () => void;
  onRefresh?: () => Promise<void>;
  
  // Row actions
  renderRowActions?: (item: T) => ReactNode;
  
  // Empty state
  emptyMessage?: string;
}

export function ReusableDataTable<T>({
  tableState,
  columns,
  tabs,
  activeTab,
  onTabChange,
  searchPlaceholder = "Search data table",
  showSearch = true,
  showFilter = true,
  showExport = true,
  showRefresh = true,
  showPagination = true,
  onExport,
  onFilter,
  onRefresh,
  renderRowActions,
  emptyMessage = "No data found",
}: ReusableDataTableProps<T>) {
  const {
    paginatedData,
    searchQuery,
    setSearchQuery,
    paginationInfo,
    previousPage,
    nextPage,
    pagination,
    totalPages,
    isRefreshing,
    refresh,
  } = tableState;

  const handleRefresh = async () => {
    await refresh(onRefresh);
  };

  const getCellValue = (item: T, column: TableColumn<T>): ReactNode => {
    if (column.render) {
      return column.render(item);
    }
    const itemRecord = item as Record<string, unknown>;
    const value = itemRecord[column.key as string];
    return value as ReactNode;
  };

  return (
    <div className="bg-card rounded-xl border border-border">
      {/* Tabs */}
      {tabs && tabs.length > 0 && (
        <div className="flex items-center gap-4 md:gap-6 px-4 md:px-6 pt-4 border-b border-border overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange?.(tab.id)}
              className={`pb-4 text-sm font-medium transition-colors relative whitespace-nowrap ${
                activeTab === tab.id
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.label}
              {activeTab === tab.id && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
              )}
            </button>
          ))}
        </div>
      )}

      {/* Search and Actions */}
      <div className="flex items-center justify-between gap-3 p-4">
        <div className="flex items-center gap-2 flex-1">
          {showSearch && (
            <div className="relative flex-1 sm:flex-none">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder={searchPlaceholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full sm:w-64 pl-9 bg-muted/30 border-border"
              />
            </div>
          )}
          
          {/* Mobile hamburger menu */}
          <div className="sm:hidden">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" className="h-10 w-10">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-popover border border-border shadow-lg z-50">
                {showRefresh && (
                  <DropdownMenuItem onClick={handleRefresh} disabled={isRefreshing}>
                    {isRefreshing ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <RefreshCw className="h-4 w-4 mr-2" />
                    )}
                    Refresh
                  </DropdownMenuItem>
                )}
                {showFilter && (
                  <DropdownMenuItem onClick={onFilter}>
                    <Filter className="h-4 w-4 mr-2" />
                    Filter
                  </DropdownMenuItem>
                )}
                {showExport && (
                  <DropdownMenuItem onClick={onExport}>
                    <Download className="h-4 w-4 mr-2" />
                    Export as CSV
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        
        {/* Desktop actions */}
        <div className="hidden sm:flex items-center gap-3">
          {showFilter && (
            <Button variant="outline" size="sm" className="gap-2" onClick={onFilter}>
              <SlidersHorizontal className="h-4 w-4" />
              Filter
            </Button>
          )}
          {showExport && (
            <Button variant="outline" size="sm" onClick={onExport}>
              Export as CSV
            </Button>
          )}
        </div>
      </div>

      {/* Refresh and Pagination Info */}
      {(showRefresh || showPagination) && (
        <div className="flex items-center justify-between gap-2 px-4 md:px-6 py-2">
          {showRefresh && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="hidden sm:flex gap-2 text-muted-foreground"
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              {isRefreshing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              Refresh
            </Button>
          )}
          {showPagination && (
            <div className="flex items-center gap-2 ml-auto">
              <span className="text-xs sm:text-sm text-muted-foreground">{paginationInfo}</span>
              <Button 
                variant="outline" 
                size="icon" 
                className="h-8 w-8"
                onClick={previousPage}
                disabled={pagination.currentPage <= 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button 
                variant="outline" 
                size="icon" 
                className="h-8 w-8"
                onClick={nextPage}
                disabled={pagination.currentPage >= totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Mobile Card View */}
      <div className="block md:hidden">
        {paginatedData.length === 0 ? (
          <div className="p-6 text-center text-muted-foreground">
            {emptyMessage}
          </div>
        ) : (
          <div className="divide-y divide-border">
            {paginatedData.map((row, index) => (
              <div key={index} className="p-4 space-y-2">
                {columns.map((column) => (
                  <div key={String(column.key)} className="flex items-center justify-between gap-4">
                    <span className="text-sm font-medium text-muted-foreground">{column.header}</span>
                    <span className={`text-sm text-right ${column.className || ""}`}>
                      {getCellValue(row, column)}
                    </span>
                  </div>
                ))}
                {renderRowActions && (
                  <div className="pt-2 mt-2 border-t border-border">
                    {renderRowActions(row)}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              {columns.map((column) => (
                <TableHead 
                  key={String(column.key)} 
                  className={`text-primary font-medium whitespace-nowrap ${column.className || ""}`}
                >
                  {column.header}
                </TableHead>
              ))}
              {renderRowActions && (
                <TableHead className="text-primary font-medium">Action</TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.length === 0 ? (
              <TableRow>
                <TableCell 
                  colSpan={columns.length + (renderRowActions ? 1 : 0)} 
                  className="h-24 text-center text-muted-foreground"
                >
                  {emptyMessage}
                </TableCell>
              </TableRow>
            ) : (
              paginatedData.map((row, index) => (
                <TableRow key={index}>
                  {columns.map((column) => (
                    <TableCell 
                      key={String(column.key)} 
                      className={column.className}
                    >
                      {getCellValue(row, column)}
                    </TableCell>
                  ))}
                  {renderRowActions && (
                    <TableCell>{renderRowActions(row)}</TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
