import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';

export function PaginationComponent() {
  return (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious className="text-xs" href="#" />
        </PaginationItem>
        <PaginationItem>
          <PaginationLink className="text-xs" href="#" isActive>
            1
          </PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationLink className="text-xs" href="#">
            2
          </PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationLink className="text-xs" href="#">
            3
          </PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationEllipsis className="text-xs" />
        </PaginationItem>
        <PaginationItem>
          <PaginationNext className="text-xs" href="#" />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}
