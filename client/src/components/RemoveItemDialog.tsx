import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import type { ServiceItem } from "./ServiceList"

interface RemoveItemDialogProps {
  item: ServiceItem | null
  onCancel: () => void
  onConfirm: () => void
}

export const RemoveItemDialog = ({
  item,
  onCancel,
  onConfirm,
}: RemoveItemDialogProps) => {
  return (
    <Dialog open={Boolean(item)} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent className="border-slate-200 bg-white shadow-lg sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Remover etapa?</DialogTitle>
          <DialogDescription>
            {item
              ? `A etapa "${item.title}" será removida do roteiro.`
              : "Esta etapa será removida do roteiro."}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:space-x-0">
          <Button
            type="button"
            variant="outline"
            className="h-10 border-slate-200 bg-white"
            onClick={onCancel}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            variant="destructive"
            className="h-10"
            onClick={onConfirm}
          >
            Remover
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
