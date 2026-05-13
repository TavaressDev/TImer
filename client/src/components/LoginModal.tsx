import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from './ui/dialog'
import { Button } from './ui/button'
import { useState, type FormEvent } from 'react'
import { Label } from './ui/label'
import { Input } from './ui/input'
import { useTimer } from '@/context/useTimer'
import { Eye, EyeOff } from 'lucide-react'

export type LoginType = 'guest' | 'admin' | null

interface LoginModalProps {
    onLogin: (type: LoginType) => void
}

const LoginModal = ({ onLogin }: LoginModalProps) => {
    const [step, setStep] = useState<'initial' | 'admin'>('initial')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [error, setError] = useState('')
    const [open, setOpen] = useState(true)
    const { loginAdmin } = useTimer()

    const handleLoginAdmin = async () => {
        setError('')
        const loginResult = await loginAdmin(password.trim())

        if (loginResult.ok) {
            onLogin('admin')
            setOpen(false)
        } else if (loginResult.reason === 'timeout') {
            setError('Servidor não respondeu ao login')
        } else if (loginResult.reason === 'disconnected') {
            setError('Servidor indisponível')
        } else {
            setError('Senha incorreta')
        }
    }

    const handleAdminSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        void handleLoginAdmin()
    }

  return (
    <>
      <div className="min-h-screen bg-slate-50" />
      <Dialog open={open} onOpenChange={(nextOpen) => nextOpen && setOpen(true)}>
      <DialogContent className="border-slate-200 bg-white p-0 shadow-lg sm:max-w-sm">
        {step === 'initial' ? (
          <>
            <DialogHeader className="border-b border-slate-100 px-6 pb-5 pt-6">
              <DialogTitle className="text-xl font-semibold tracking-tight text-slate-950">Timer</DialogTitle>
              <DialogDescription className="text-slate-500">
                Escolha como deseja abrir o cronômetro.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="grid gap-2 p-6 sm:grid-cols-2 sm:space-x-0">
              <Button onClick={() => setStep('admin')} className="h-10 bg-slate-950 hover:bg-slate-800">
                Admin
              </Button>
              <DialogClose asChild>
                <Button onClick={() => onLogin('guest')} variant="outline" className="h-10 border-slate-200">
                  Convidado
                </Button>
              </DialogClose>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader className="border-b border-slate-100 px-6 pb-5 pt-6">
              <DialogTitle className="text-xl font-semibold text-slate-950">Acesso admin</DialogTitle>
              <DialogDescription className="text-slate-500">
                Digite a senha para controlar o roteiro.
              </DialogDescription>
            </DialogHeader>
            <form className='flex flex-col gap-3 p-6' onSubmit={handleAdminSubmit}>
              <Label htmlFor='password'>Senha</Label>
              <div className="relative">
                <Input
                  className="h-11 bg-white pr-11"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value)
                    setError('')
                  }}
                  id='password'
                  aria-invalid={Boolean(error)}
                  aria-describedby={error ? 'password-error' : undefined}
                  autoComplete="current-password"
                />
                <Button
                  type="button"
                  variant="ghost"
                  className="absolute right-1 top-1/2 h-9 w-9 -translate-y-1/2 p-0 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                  onClick={() => setShowPassword((current) => !current)}
                  aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              {error && <p id="password-error" className='rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700'>{error}</p>}
              <Button type="submit" className="h-10 bg-slate-950 hover:bg-slate-800">
                Fazer Login
              </Button>
              <Button className="h-10 border-slate-200" type='button' variant='outline' onClick={() => setStep('initial')}>
                Voltar
              </Button>
            </form>
          </>
        )}
      </DialogContent>
      </Dialog>
    </>
  )
}

export default LoginModal
