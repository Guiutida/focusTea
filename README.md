# Focus Tea

Plataforma educacional estatica para estudantes com TEA, com rotina visual, estudos com IA, exercicios por materia e configuracoes sensoriais.

## Recursos principais

- Landing page responsiva com narrativa do produto.
- Login e cadastro funcionais em `localStorage` para uso em demo.
- Dashboard com progresso dinamico, proximas tarefas e dica de IA.
- Rotina com CRUD, horarios, categorias, linha do tempo, geracao por IA e temporizador de foco.
- Estudos com chat IA, explicacoes por materia, resumo e nova analogia.
- Exercicios adaptativos por materia, questoes embaralhadas, feedback imediato e resultado final.
- Configuracoes de acessibilidade: temas sensoriais, alto contraste, fonte maior, reducao de animacoes, modo sem distracoes e espacamento extra.
- Integracao OpenRouter/Gemini configuravel em `paginas/configuracoes.html`.

## Arquivos

- `index.html`: landing page publica.
- `login.html` / `cadastro.html`: autenticacao local para demo.
- `dashboard.html`: painel principal.
- `paginas/rotina.html`: rotina, timeline e temporizador.
- `paginas/estudos.html`: estudos com IA.
- `paginas/exercicios.html`: banco de exercicios por materia.
- `paginas/configuracoes.html`: acessibilidade, perfil e configuracao de IA.
- `css/style.css`: design system e estilos responsivos.
- `js/app.js`: estado local, IA, rotina, quiz, timer e configuracoes.

## IA

O projeto usa OpenRouter com modelo `google/gemini-2.5-flash`. Por ser um site estatico, qualquer chave usada no navegador fica visivel para quem abrir o codigo. Para producao, mova a chamada para um backend ou proxy seguro.
