import { ChevronDown, ChevronUp, Clock, Pencil, PlayCircle, Trash2 } from "lucide-react"
import { Button } from "./ui/button"
import { cn } from "@/lib/utils"

export interface ServiceItem {
  id: string;
  title: string;
  duration: number;
  type: string;
}

interface ServiceListProps {
  items: ServiceItem[];
  activeId?: string;
  onSelect: (item: ServiceItem) => void;
  onEdit: (item: ServiceItem) => void;
  onRemove: (item: ServiceItem) => void;
  onMoveUp: (item: ServiceItem) => void;
  onMoveDown: (item: ServiceItem) => void;
}

export const ServiceList = ({ items, activeId, onSelect, onEdit, onRemove, onMoveUp, onMoveDown }: ServiceListProps) => {
  
  if (!items || items.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-slate-300 bg-white px-4 py-8 text-center">
        <p className="text-sm font-medium text-slate-700">Nenhum item no roteiro</p>
        <p className="mt-1 text-sm text-slate-500">Adicione a primeira etapa para liberar os controles do cronograma.</p>
      </div>
    )
  }
  return (
    <div className="flex flex-col gap-2">
      {items.map((item, index) => {
        const isActive = item.id === activeId;
        const isFirst = index === 0
        const isLast = index === items.length - 1

        return (
          <div key={item.id} className="grid grid-cols-[minmax(0,1fr)_repeat(4,40px)] gap-2 md:grid-cols-[1fr_repeat(4,44px)]">
            <button
              type="button"
              onClick={() => onSelect(item)}
              className={cn(
                "min-w-0 rounded-lg border p-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 md:p-4",
                isActive
                  ? "border-slate-900 bg-slate-50"
                  : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
              )}
            >
              <div className="flex min-w-0 items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  {isActive ? (
                    <PlayCircle className="h-5 w-5 shrink-0 text-slate-900" />
                  ) : (
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-500">
                      {index + 1}
                    </span>
                  )}

                  <div className="min-w-0">
                    <p className={cn("truncate font-semibold", isActive ? "text-slate-950" : "text-slate-800")}>
                      {item.title}
                    </p>
                    <p className="mt-0.5 text-xs uppercase tracking-[0.14em] text-slate-500">{item.type}</p>
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-1.5 rounded-md bg-slate-100 px-2 py-1 text-sm font-semibold text-slate-600">
                  <Clock className="h-4 w-4" />
                  {item.duration} min
                </div>
              </div>
            </button>

            <Button
              type="button"
              variant="outline"
              onClick={() => onMoveUp(item)}
              disabled={isFirst}
              className="h-full border-slate-200 px-0 text-slate-500 hover:border-slate-300 hover:text-slate-900"
              aria-label={`Mover ${item.title} para cima`}
            >
              <ChevronUp className="w-4 h-4" />
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={() => onMoveDown(item)}
              disabled={isLast}
              className="h-full border-slate-200 px-0 text-slate-500 hover:border-slate-300 hover:text-slate-900"
              aria-label={`Mover ${item.title} para baixo`}
            >
              <ChevronDown className="w-4 h-4" />
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={() => onEdit(item)}
              className="h-full border-slate-200 px-0 text-slate-500 hover:border-slate-300 hover:text-slate-900"
              aria-label={`Editar ${item.title}`}
            >
              <Pencil className="w-4 h-4" />
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={() => onRemove(item)}
              className="h-full border-slate-200 px-0 text-red-500 hover:border-red-200 hover:text-red-600"
              aria-label={`Remover ${item.title}`}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        );
      })}
    </div>
  );
}
