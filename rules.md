# Regras de Arquitetura e Padrões de Código

## 1. Idioma
* Todo o código-fonte (nomes de variáveis, métodos, classes, nomes de arquivos e comentários) deve ser escrito em **Inglês**.
* A ÚNICA exceção são strings de interface (UI), mensagens de validação ou textos que serão lidos pelo usuário final, que devem estar no idioma do projeto (Português).

## 2. Estruturas de Controle (If/Else)
* NUNCA use blocos `if`, `else`, `for` ou `while` com quebra de linha sem chaves. Isso evita bugs clássicos de indentação.
* **Incorreto:**
  ```csharp
  if (isAuthorized)
      ProcessPayment();
  ```
* **Correto (Inline):**
  ```csharp
  if (isAuthorized) ProcessPayment();
  ```
* **Correto (Com Chaves - Padrão Preferido):**
  ```csharp
  if (isAuthorized) 
  {
      ProcessPayment();
  }
  ```

## 3. Clean Code e Nomenclatura
* Use nomes explícitos, pronunciáveis e que revelem a intenção. Evite abreviações (ex: prefira `userRepository` em vez de `usrRepo`).
* No C#: Use `PascalCase` para Classes, Interfaces (com prefixo `I`), Métodos e Propriedades. Use `camelCase` para parâmetros e variáveis locais.
* Funções e métodos devem ser curtos e fazer apenas uma coisa (Single Responsibility Principle). Se um método precisa da palavra "E" (And) para ser descrito, ele provavelmente deve ser dividido.

## 4. Assincronismo e Banco de Dados
* Todas as chamadas de banco de dados e requisições de rede devem ser assíncronas.
* Sempre utilize `async/await`. É estritamente proibido o uso de `.Result` ou `.Wait()` para forçar a sincronia, pois isso causa *thread starvation*.
* Ao usar ORMs ou drivers de banco, evite consultas dentro de loops para prevenir o problema de N+1.

## 5. Injeção de Dependência
* Nunca instancie classes de serviço, repositórios ou acesso a dados usando a palavra-chave `new` diretamente nos controladores ou regras de negócio.
* Receba sempre as dependências através do construtor da classe via Injeção de Dependência.

## 6. Frontend e UI
* Mantenha interfaces com design limpo, minimalista e com suporte adequado a Dark Mode.
* É proibida a utilização de emojis para ilustrar botões ou menus, bem como ícones "sparkles" (✨) ou gradientes genéricos que poluam a usabilidade.