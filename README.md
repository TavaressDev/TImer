# Rise Timer

Aplicacao em tempo real para controlar cronogramas de cultos, eventos e apresentacoes ao vivo. O projeto possui um painel de controle para o operador e uma tela limpa para exibicao em projetor, transmissao ou outro dispositivo na mesma rede.

## Funcionalidades

- Cronometro em tempo real com Socket.IO.
- Painel admin para criar, editar, reordenar e remover etapas.
- Tela de convidado em fullscreen para exibicao.
- Transicao manual ou automatica entre etapas.
- Persistencia local do roteiro em `data/playlists.json`.
- Build unico: o servidor Express entrega o frontend React compilado.
- Empacotamento em executaveis para Linux, Windows e macOS.

## Stack

- React 19
- TypeScript
- Vite
- Tailwind CSS
- Radix UI
- Express
- Socket.IO

## Estrutura

```text
client/   Frontend React/Vite
server/   API Express, Socket.IO, persistencia e empacotamento
```

## Variaveis De Ambiente

Use os arquivos de exemplo como referencia:

```bash
cp .env.example .env.local
cp client/.env.example client/.env.local
```

Variaveis principais:

```env
ADMIN_PASSWORD=sua-senha-forte
PORT=3000
HOST=0.0.0.0
```

`ADMIN_PASSWORD` e obrigatoria em producao (`NODE_ENV=production`). Em desenvolvimento local, se ela nao for definida, o servidor usa `1234` apenas como fallback.

O servidor le variaveis do ambiente do processo. Em producao, configure essas variaveis no painel da hospedagem. Em desenvolvimento local, voce tambem pode passa-las diretamente no comando, como mostrado abaixo.

`VITE_SOCKET_URL` normalmente deve ficar indefinida. Assim, o navegador usa o mesmo host/porta da pagina aberta. Defina essa variavel apenas quando o frontend e o backend estiverem rodando em origens diferentes durante desenvolvimento.

## Como Rodar Em Desenvolvimento

Instale as dependencias:

```bash
cd client
npm install

cd ../server
npm install
```

Rode o backend:

```bash
cd server
ADMIN_PASSWORD=sua-senha npm run dev
```

Em outro terminal, rode o frontend:

```bash
cd client
npm run dev
```

## Como Rodar Em Producao Local

Gere o build e inicie o servidor:

```bash
cd server
npm run build
ADMIN_PASSWORD=sua-senha npm start
```

Acesse:

```text
http://localhost:3000
```

## Acesso Pela Rede Local

Para permitir acesso por outros dispositivos na mesma rede:

```bash
cd server
npm run build
HOST=0.0.0.0 PORT=8080 ADMIN_PASSWORD=sua-senha npm start
```

Descubra o IP local da maquina:

```bash
ip addr
```

Depois acesse de outro dispositivo:

```text
http://IP-DA-MAQUINA:8080
```

Exemplo:

```text
http://171.16.100.204:8080
```

## Gerar Executaveis

O projeto usa `pkg` para gerar binarios:

```bash
cd server
npm run pack
```

Os arquivos sao gerados em:

```text
server/build/
```

Targets configurados:

- `meu-timer-igreja-linux-x64`
- `meu-timer-igreja-win-x64.exe`
- `meu-timer-igreja-macos-x64`
- `meu-timer-igreja-macos-arm64`

Para executar no Linux:

```bash
cd server/build
chmod +x meu-timer-igreja-linux-x64
PORT=8080 ADMIN_PASSWORD=sua-senha ./meu-timer-igreja-linux-x64
```

## Deploy

O projeto precisa de um servidor Node.js persistente para Express e Socket.IO. Plataformas indicadas:

- Render
- Railway
- Fly.io
- VPS propria

Em plataformas como Render, configure:

```text
Root Directory: server
Build Command: npm install && npm --prefix ../client install && npm run build
Start Command: npm start
```

Variaveis obrigatorias/recomendadas:

```env
NODE_ENV=production
ADMIN_PASSWORD=sua-senha-forte
HOST=0.0.0.0
```

Normalmente a plataforma define `PORT` automaticamente.

## Persistencia

Em execucao local e nos executaveis, o roteiro e salvo em:

```text
data/playlists.json
```

Em hospedagens gratuitas, o sistema de arquivos pode ser temporario. Isso significa que o roteiro pode ser perdido apos restart, novo deploy ou suspensao do servico. Para uso publico com dados persistentes, recomenda-se migrar a persistencia para SQLite com volume persistente, PostgreSQL ou outro banco gerenciado.

## Seguranca

- Defina sempre `ADMIN_PASSWORD` em producao.
- Use HTTPS ao publicar na internet.
- Nao versione arquivos `.env`, `.env.local` ou senhas reais.
- A senha padrao `1234` existe apenas para desenvolvimento local.

## Scripts

Client:

```bash
npm run dev
npm run build
npm run lint
```

Server:

```bash
npm run dev
npm run build
npm start
npm run pack
```

## Status

Projeto pronto para demonstracao e portfolio. Para uso continuo em producao, recomenda-se adicionar persistencia externa e uma estrategia de autenticacao mais robusta.
