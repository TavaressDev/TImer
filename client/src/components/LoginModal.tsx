import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from './ui/dialog'
import { Button } from './ui/button'
import { useState } from 'react'
import { Label } from './ui/label'
import { Input } from './ui/input'
import { useTimer } from '@/context/useTimer'

export type LoginType = 'guest' | 'admin' | null

interface LoginModalProps {
    onLogin: (type: LoginType) => void
}

const LoginModal = ({ onLogin }: LoginModalProps) => {
    const [step, setStep] = useState<'initial' | 'admin'>('initial')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [open, setOpen] = useState(true)
    const { loginAdmin } = useTimer()

    const handleLoginAdmin = async () => {
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
            <div className='flex flex-col gap-3 p-6'>
              <Label htmlFor='password'>Senha</Label>
              <Input className="h-11 bg-white" type='password' value={password} onChange={(e) => {
                setPassword(e.target.value)
                setError('')
              }} id='password' />
              {error && <p className='rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700'>{error}</p>}
              <Button className="h-10 bg-slate-950 hover:bg-slate-800" onClick={handleLoginAdmin}>
                Fazer Login
              </Button>
              <Button className="h-10 border-slate-200" type='button' variant='outline' onClick={() => setStep('initial')}>
                Voltar
              </Button>
            </div>
          </>
        )}
      </DialogContent>
      </Dialog>
    </>
  )
}

export default LoginModal
