# Focus Tea

Plataforma educacional estática para estudantes com TEA, com rotina visual, estudos com IA, exercícios por matéria e configurações sensoriais.

## Recursos principais

- Landing page responsiva com narrativa do produto.
- Login e cadastro funcionais em `localStorage` para uso em demo.
- Dashboard com progresso dinâmico, próximas tarefas e dica de IA.
- Rotina com CRUD, horários, categorias, linha do tempo, geração por IA e temporizador de foco.
- Estudos com chat IA, explicações por matéria, resumo e nova analogia.
- Exercícios adaptativos por matéria, questões embaralhadas, feedback imediato e resultado final.
- Configurações de acessibilidade: temas sensoriais, alto contraste, fonte maior, redução de animações, modo sem distrações e espaçamento extra.
- Integração OpenRouter/Gemini configurável em `paginas/configuracoes.html`.

## Arquivos

- `index.html`: landing page pública.
- `login.html` / `cadastro.html`: autenticação local para demo.
- `dashboard.html`: painel principal.
- `paginas/rotina.html`: rotina, timeline e temporizador.
- `paginas/estudos.html`: estudos com IA.
- `paginas/exercicios.html`: banco de exercícios por matéria.
- `paginas/configuracoes.html`: acessibilidade, perfil e configuração de IA.
- `css/style.css`: design system e estilos responsivos.
- `js/app.js`: estado local, IA, rotina, quiz, timer e configurações.

## IA

O projeto usa OpenRouter com modelo `google/gemini-2.0-flash-001`. Por ser um site estático, qualquer chave usada no navegador fica visível para quem abrir o código. Para produção, mova a chamada para um backend ou proxy seguro.
