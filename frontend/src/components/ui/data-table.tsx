import { useState } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ChevronLeft, ChevronRight, Search } from "lucide-react"

interface Column<T> {
  header: string
  accessorKey: keyof T
  cell?: (row: T) => React.ReactNode
}

interface DataTableProps<T> {
  data: T[]
  columns: Column<T>[]
  onAdd?: () => void
  onEdit?: (item: T) => void
  onDelete?: (item: T) => void
  addButtonText?: string
  searchPlaceholder?: string
  pageSize?: number
}

export function DataTable<T>({
  data,
  columns,
  onAdd,
  onEdit,
  onDelete,
  addButtonText = "Add",
  searchPlaceholder = "Search...",
  pageSize = 10,
}: DataTableProps<T>) {
  const [currentPage, setCurrentPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedPageSize, setSelectedPageSize] = useState(pageSize)

  const filteredData = data.filter((item) =>
    Object.values(item).some((value) =>
      String(value).toLowerCase().includes(searchTerm.toLowerCase())
    )
  )

  const totalPages = Math.ceil(filteredData.length / selectedPageSize)
  const startIndex = (currentPage - 1) * selectedPageSize
  const endIndex = startIndex + selectedPageSize
  const paginatedData = filteredData.slice(startIndex, endIndex)

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={searchPlaceholder}
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value)
                setCurrentPage(1)
              }}
              className="pl-8"
            />
          </div>
        </div>
        {onAdd && (
          <Button onClick={onAdd}>
            {addButtonText}
          </Button>
        )}
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column, colIdx) => (
                <TableHead key={`header-${String(column.accessorKey)}-${colIdx}`}>
                  {column.header}
                </TableHead>
              ))}
              {(onEdit || onDelete) && <TableHead className="w-[100px]">Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length + (onEdit || onDelete ? 1 : 0)} className="h-24 text-center">
                  <div className="flex flex-col items-center justify-center text-muted-foreground">
                    <p className="text-sm font-medium">No records found</p>
                    {onAdd && (
                      <Button variant="link" onClick={onAdd} className="mt-2">
                        Add a new record
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              paginatedData.map((item, rowIdx) => {
                const hasId = typeof item === 'object' && item !== null && 'id' in (item as Record<string, unknown>);
                const rowKey = hasId ? `row-${(item as Record<string, unknown>).id}` : `row-${rowIdx}`;
                return (
                  <TableRow key={rowKey}>
                    {columns.map((column, colIdx) => (
                      <TableCell key={`cell-${rowKey}-${String(column.accessorKey)}-${colIdx}`}>
                        {column.cell ? column.cell(item) : String(item[column.accessorKey])}
                      </TableCell>
                    ))}
                    {(onEdit || onDelete) && (
                      <TableCell>
                        <div className="flex space-x-2">
                          {onEdit && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => onEdit(item)}
                            >
                              Edit
                            </Button>
                          )}
                          {onDelete && (
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => onDelete(item)}
                            >
                              Delete
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <p className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages}
          </p>
          <Select
            value={String(selectedPageSize)}
            onValueChange={(value) => {
              setSelectedPageSize(Number(value))
              setCurrentPage(1)
            }}
          >
            <SelectTrigger className="w-[100px]">
              <SelectValue placeholder="Page size" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="5">5 per page</SelectItem>
              <SelectItem value="10">10 per page</SelectItem>
              <SelectItem value="20">20 per page</SelectItem>
              <SelectItem value="50">50 per page</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
} 