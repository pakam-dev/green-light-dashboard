import { useState, useCallback, useMemo } from "react";

export interface PaginationState {
  currentPage: number;
  pageSize: number;
  totalItems: number;
}

export interface FilterState {
  [key: string]: string | string[] | boolean | undefined;
}

export interface UseDataTableOptions<T> {
  data: T[];
  initialPageSize?: number;
  searchableFields?: (keyof T)[];
}

export interface UseDataTableReturn<T> {
  // Data
  filteredData: T[];
  paginatedData: T[];
  
  // Pagination
  pagination: PaginationState;
  goToPage: (page: number) => void;
  nextPage: () => void;
  previousPage: () => void;
  setPageSize: (size: number) => void;
  totalPages: number;
  paginationInfo: string;
  
  // Search
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  
  // Filters
  filters: FilterState;
  setFilter: (key: string, value: string | string[] | boolean | undefined) => void;
  clearFilters: () => void;
  
  // Refresh
  isRefreshing: boolean;
  refresh: (fetchFn?: () => Promise<void>) => Promise<void>;
  lastRefreshed: Date | null;
}

export function useDataTable<T>({
  data,
  initialPageSize = 10,
  searchableFields = [],
}: UseDataTableOptions<T>): UseDataTableReturn<T> {
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSizeState] = useState(initialPageSize);
  
  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  
  // Filter state
  const [filters, setFilters] = useState<FilterState>({});
  
  // Refresh state
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);

  // Filter data based on search query and filters
  const filteredData = useMemo(() => {
    let result = [...data];

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter((item) => {
        const itemRecord = item as Record<string, unknown>;
        if (searchableFields.length > 0) {
          return searchableFields.some((field) => {
            const value = itemRecord[field as string];
            return String(value).toLowerCase().includes(query);
          });
        }
        // If no searchable fields specified, search all string fields
        return Object.values(itemRecord).some((value) =>
          String(value).toLowerCase().includes(query)
        );
      });
    }

    // Apply additional filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== "") {
        result = result.filter((item) => {
          const itemRecord = item as Record<string, unknown>;
          const itemValue = itemRecord[key];
          if (Array.isArray(value)) {
            return value.includes(String(itemValue));
          }
          if (typeof value === "boolean") {
            return itemValue === value;
          }
          return String(itemValue).toLowerCase().includes(String(value).toLowerCase());
        });
      }
    });

    return result;
  }, [data, searchQuery, filters, searchableFields]);

  // Calculate pagination
  const totalItems = filteredData.length;
  const totalPages = Math.ceil(totalItems / pageSize);

  // Reset to page 1 when filters change
  useMemo(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1);
    }
  }, [totalPages, currentPage]);

  // Get paginated data
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return filteredData.slice(startIndex, endIndex);
  }, [filteredData, currentPage, pageSize]);

  // Pagination info string
  const paginationInfo = useMemo(() => {
    if (totalItems === 0) return "0 items";
    const start = (currentPage - 1) * pageSize + 1;
    const end = Math.min(currentPage * pageSize, totalItems);
    return `${start} - ${end} of ${totalItems}`;
  }, [currentPage, pageSize, totalItems]);

  // Pagination handlers
  const goToPage = useCallback((page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  }, [totalPages]);

  const nextPage = useCallback(() => {
    if (currentPage < totalPages) {
      setCurrentPage((prev) => prev + 1);
    }
  }, [currentPage, totalPages]);

  const previousPage = useCallback(() => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  }, [currentPage]);

  const setPageSize = useCallback((size: number) => {
    setPageSizeState(size);
    setCurrentPage(1);
  }, []);

  // Search handler
  const handleSearchQuery = useCallback((query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  }, []);

  // Filter handlers
  const setFilter = useCallback((key: string, value: string | string[] | boolean | undefined) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
    setCurrentPage(1);
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({});
    setSearchQuery("");
    setCurrentPage(1);
  }, []);

  // Refresh handler
  const refresh = useCallback(async (fetchFn?: () => Promise<void>) => {
    setIsRefreshing(true);
    try {
      if (fetchFn) {
        await fetchFn();
      }
      // Simulate refresh delay if no fetch function provided
      await new Promise((resolve) => setTimeout(resolve, 500));
      setLastRefreshed(new Date());
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  return {
    // Data
    filteredData,
    paginatedData,
    
    // Pagination
    pagination: { currentPage, pageSize, totalItems },
    goToPage,
    nextPage,
    previousPage,
    setPageSize,
    totalPages,
    paginationInfo,
    
    // Search
    searchQuery,
    setSearchQuery: handleSearchQuery,
    
    // Filters
    filters,
    setFilter,
    clearFilters,
    
    // Refresh
    isRefreshing,
    refresh,
    lastRefreshed,
  };
}
