import { useState } from "react"
import * as yup from "yup"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { TimerDisplay } from "./TimerDisplay"
import { ServiceList, type ServiceItem } from "./ServiceList"
import { LogOut, Pause, Play, SkipBack, SkipForward, Square } from "lucide-react"
import { useTimer } from "@/context/useTimer"
import type { PlaylistItemType } from "@/context/timer-context"

type PlaylistItemFormData = {
  title: string
  duration: number
  type: PlaylistItemType
}

const createPlaylistItemId = () => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID()
  }

  return `item-${Date.now()}-${Math.random().toString(36).slice(2)}`
}

const playlistItemSchema = yup.object({
  title: yup.string().trim().required("Informe o nome da etapa."),
  duration: yup
    .number()
    .typeError("Informe uma duração válida.")
    .integer("A duração deve ser um número inteiro.")
    .min(1, "A duração deve ser maior que zero.")
    .required("Informe a duração."),
  type: yup
    .mixed<PlaylistItemType>()
    .oneOf(["louvor", "aviso", "oferta", "palavra", "encerramento"])
    .required("Selecione o tipo da etapa."),
})

interface AdminPanelProps {
  onLogout: () => void
}

export const AdminPanel = ({ onLogout }: AdminPanelProps) => {
  const [newTitle, setNewTitle] = useState("")
  const [newDuration, setNewDuration] = useState(5)
  const [newType, setNewType] = useState<PlaylistItemType>("louvor")
  const [formError, setFormError] = useState("")
  const [editingItemId, setEditingItemId] = useState<string | null>(null)

  const { 
    timeFormatted, 
    status, 
    pauseTimer, 
    resumeTimer, 
    stopTimer,
    playlist,
    activeIndex,
    selectItem,
    addPlaylistItem,
    removePlaylistItem,
    updatePlaylistItem,
    movePlaylistItem,
    transitionMode,
    setTransitionMode,
    playPlaylist,
    nextItem,
    previousItem
  } = useTimer();

  const handleSelect = (item: ServiceItem) => {
    const index = playlist.findIndex(i => i.id === item.id)
    if(index !== -1) selectItem(index)
  }

  const handleMoveUp = (item: ServiceItem) => {
    const index = playlist.findIndex(i => i.id === item.id)
    if(index <= 0) return
    movePlaylistItem(index, index - 1)
  }

  const handleMoveDown = (item: ServiceItem) => {
    const index = playlist.findIndex(i => i.id === item.id)
    if(index === -1 || index >= playlist.length - 1) return
    movePlaylistItem(index, index + 1)
  }

  const handleRemoveItem = (item: ServiceItem) => {
    const confirmed = window.confirm(`Remover "${item.title}" do cronograma?`)
    if (!confirmed) {
      return
    }

    removePlaylistItem(item.id)
  }

  const handleEditItem = (item: ServiceItem) => {
    setEditingItemId(item.id)
    setNewTitle(item.title)
    setNewDuration(item.duration)
    setNewType(item.type as PlaylistItemType)
    setFormError("")
  }

  const resetForm = () => {
    setEditingItemId(null)
    setNewTitle("")
    setNewDuration(5)
    setNewType("louvor")
    setFormError("")
  }

  const handleSubmitItem = async () => {
    try {
      const validatedItem = await playlistItemSchema.validate(
        {
          title: newTitle,
          duration: newDuration,
          type: newType,
        },
        { abortEarly: true }
      ) as PlaylistItemFormData

      if (editingItemId) {
        updatePlaylistItem(editingItemId, {
          title: validatedItem.title,
          duration: validatedItem.duration,
          type: newType,
        })
      } else {
        addPlaylistItem({
          id: createPlaylistItemId(),
          title: validatedItem.title,
          duration: validatedItem.duration,
          type: newType,
        })
      }

      resetForm()
    } catch (error) {
      if (error instanceof yup.ValidationError) {
        setFormError(error.message)
        return
      }

      setFormError("Não foi possível salvar o item.")
    }
  }

  const handlePrevious = () => {
    previousItem()
  }

  const handleNext = () => {
    nextItem()
  }

  const currentItem = activeIndex >= 0 ? playlist[activeIndex] : null
  const statusLabel = {
    idle: "Pronto",
    running: "Em andamento",
    paused: "Pausado",
    overtime: "Tempo excedido",
  }[status]

  return (
    <div className="min-h-screen bg-slate-50 p-4 text-slate-950 md:p-6">
      <header className="mx-auto mb-6 flex max-w-7xl flex-col gap-3 border-b border-slate-200 pb-5 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">Rise Timer</p>
          <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">Painel de controle</h1>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex h-9 items-center gap-2 rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-700">
            <span className={`h-2 w-2 rounded-full ${status === "running" ? "bg-emerald-500" : status === "overtime" ? "bg-red-500" : status === "paused" ? "bg-amber-500" : "bg-slate-400"}`} />
            {statusLabel}
          </span>
          <Button variant="outline" onClick={onLogout} className="border-slate-200 bg-white text-slate-700 hover:text-red-600">
            <LogOut className="h-4 w-4" />
            Sair
          </Button>
        </div>
      </header>

      <main className="mx-auto grid max-w-7xl grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_420px]">
        <section className="space-y-5">
          <Card className="border-slate-200 bg-white shadow-sm">
            <CardHeader className="border-b border-slate-100 p-5">
              <CardTitle className="text-base font-semibold">Cronômetro</CardTitle>
            </CardHeader>
            <CardContent className="p-5">
               <div className="flex flex-col gap-4">
                  <div className="rounded-lg border border-slate-200 bg-slate-50 p-5 text-center">
                    <p className="text-sm text-slate-500">{currentItem?.title ?? "Nenhuma etapa selecionada"}</p>
                    <p className="mt-2 font-mono text-6xl font-semibold tabular-nums tracking-tight text-slate-950 md:text-7xl">{timeFormatted}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <Button 
                      variant="outline" 
                      onClick={handlePrevious}
                      disabled={activeIndex <= 0}
                      className="h-10 border-slate-200 bg-white"
                    >
                      <SkipBack className="w-4 h-4 mr-2" /> Anterior
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={handleNext}
                      disabled={activeIndex >= playlist.length - 1}
                      className="h-10 border-slate-200 bg-white"
                    >
                      Próximo <SkipForward className="w-4 h-4 ml-2" />
                    </Button>
                  </div>

                  <div>
                    <p className="mb-2 text-sm font-medium text-slate-700">Modo de transição</p>
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        type="button"
                        variant={transitionMode === "manual" ? "default" : "outline"}
                        onClick={() => setTransitionMode("manual")}
                        className={transitionMode === "manual" ? "bg-slate-950" : "border-slate-200 bg-white text-slate-600"}
                      >
                        Manual
                      </Button>
                      <Button
                        type="button"
                        variant={transitionMode === "automatic" ? "default" : "outline"}
                        onClick={() => setTransitionMode("automatic")}
                        className={transitionMode === "automatic" ? "bg-slate-950" : "border-slate-200 bg-white text-slate-600"}
                      >
                        Automático
                      </Button>
                    </div>
                    <p className="mt-2 text-xs text-slate-500">
                      Manual aguarda comando do operador. Automático avança sozinho ao final do tempo.
                    </p>
                  </div>

                  <div className="grid grid-cols-[1fr_auto_auto] gap-2">
                    <Button 
                        className="h-11 bg-slate-950 text-base hover:bg-slate-800" 
                        onClick={() => {
                          if(status === 'paused'){
                            resumeTimer()
                          }else{
                            playPlaylist()
                          }
                        }}
                        disabled={status !== "paused" && playlist.length === 0}
                    >
                      <Play className="w-5 h-5 mr-2" /> {status === "paused" ? "Retomar" : "Iniciar"}
                    </Button>
                    
                    <Button 
                        variant="secondary" 
                        className="h-11 w-12 bg-slate-100 text-slate-700 hover:bg-slate-200"
                        onClick={pauseTimer}
                        disabled={status !== 'running'}
                        aria-label="Pausar"
                    >
                      <Pause className="w-5 h-5" />
                    </Button>
                    
                    <Button 
                        variant="destructive" 
                        className="h-11 w-12"
                        onClick={stopTimer}
                        aria-label="Parar"
                    >
                      <Square className="w-5 h-5 fill-current" />
                    </Button>
                  </div>

                  {playlist.length === 0 ? (
                    <p className="text-xs text-center text-slate-500">
                      Adicione itens ao roteiro para iniciar o cronograma.
                    </p>
                  ) : null}

               </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200 bg-white shadow-sm">
            <CardHeader className="border-b border-slate-100 p-5">
              <CardTitle className="text-base font-semibold">
                Roteiro do culto
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5">
              <div className="mb-5 grid gap-3 border-b border-slate-100 pb-5 md:grid-cols-[1fr_140px_160px]">
                <Input
                  placeholder="Nome da etapa"
                  value={newTitle}
                  onChange={(e) => {
                    setNewTitle(e.target.value)
                    if (formError) setFormError("")
                  }}
                  className="h-10 bg-white"
                />
                <Input
                  type="number"
                  min={1}
                  placeholder="Duração em minutos"
                  value={newDuration}
                  onChange={(e) => {
                    setNewDuration(Number(e.target.value))
                    if (formError) setFormError("")
                  }}
                  className="h-10 bg-white"
                />
                <select
                  value={newType}
                  onChange={(e) => {
                    setNewType(e.target.value as PlaylistItemType)
                    if (formError) setFormError("")
                  }}
                  className="h-10 w-full rounded-md border border-input bg-white px-3 py-2 text-sm shadow-sm outline-none transition-colors focus-visible:ring-1 focus-visible:ring-ring"
                >
                  <option value="louvor">Louvor</option>
                  <option value="aviso">Avisos</option>
                  <option value="oferta">Oferta</option>
                  <option value="palavra">Palavra</option>
                  <option value="encerramento">Encerramento</option>
                </select>
                <div className="md:col-span-3">
                  {formError ? (
                    <p className="mb-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{formError}</p>
                  ) : null}
                </div>
                <Button onClick={handleSubmitItem} className="h-10 bg-slate-950 hover:bg-slate-800 md:col-span-2">
                  {editingItemId ? "Salvar Alterações" : "Adicionar Item"}
                </Button>
                {editingItemId ? (
                  <Button variant="outline" onClick={resetForm} className="h-10 border-slate-200 bg-white">
                    Cancelar edição
                  </Button>
                ) : null}
              </div>
              <ServiceList 
                items={playlist} 
                onSelect={handleSelect} 
                onEdit={handleEditItem}
                onRemove={handleRemoveItem}
                onMoveUp={handleMoveUp}
                onMoveDown={handleMoveDown}
                activeId={currentItem?.id} 
              />
            </CardContent>
          </Card>
        </section>

        <aside className="space-y-3">
          <Card className="overflow-hidden border-slate-200 bg-white shadow-sm">
            <CardHeader className="border-b border-slate-100 px-4 py-3">
              <CardTitle className="flex items-center justify-between text-sm font-medium text-slate-700">
                Preview do telão
                <span className="text-xs text-slate-400">Ao vivo</span>
              </CardTitle>
            </CardHeader>
            
            <div className="aspect-video w-full bg-black relative">
               <TimerDisplay 
                  isPreview={true} 
                  time={timeFormatted} 
                  status={status}
                  title={currentItem?.title}
               /> 
            </div>
          </Card>

          <div className="rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-500">
             {playlist.length} etapas no roteiro.
          </div>
        </aside>
      </main>
    </div>
  )
}
