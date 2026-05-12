# Changelog - Sistema de Ocorrências Acadêmicas

Todas as alterações notáveis neste projeto serão documentadas neste arquivo, seguindo os princípios de Segurança da Informação e as diretrizes da AP01.

## [1.1.0] - 2026-05-05

### 🛡️ Segurança e Privacidade (Foco em SI & LGPD)
- **Implementação de RBAC (Role-Based Access Control):** Criada uma hierarquia de permissões (`ALUNO < PROFESSOR < ADMIN`). Ações críticas como exclusão e alteração de status agora validam o perfil do usuário.
- **Proteção contra XSS (Cross-Site Scripting):** Implementada função de sanitização de strings para todas as entradas de formulários e exibições de logs, impedindo a execução de scripts maliciosos.
- **Mascaramento de Dados Sensíveis (LGPD):** CPFs e Telefones agora são mascarados automaticamente na interface (ex: `***.***.***-10`) para usuários que não possuem privilégios de Administrador ou não são os criadores do registro.
- **Isolamento de Dados (Row-Level Security):** Alunos agora possuem visualização restrita, conseguindo acessar apenas as ocorrências que eles mesmos registraram ou das quais são titulares.
- **Restrição de Visibilidade de Auditoria:** O painel de logs de sistema foi ocultado para perfis não administrativos, seguindo o Princípio do Menor Privilégio (*Need-to-Know*).

### 📝 Auditoria e Rastreabilidade
- **Refatoração do Log de Auditoria:** Os logs agora registram metadados avançados, incluindo Timestamp (ISO), E-mail do Usuário, Perfil Ativo, IP Simulado e Nível de Severidade (`INFO`, `WARNING`, `DENIED`).
- **Registro de Acesso Negado:** Tentativas de realizar ações sem permissão agora geram logs automáticos com o nível `DENIED`, permitindo a identificação de comportamentos suspeitos.

### 🎨 Interface e Experiência (UI/UX)
- **Controle de UI Dinâmico:** Botões de "Exportar Dados" e "Limpar Logs" agora são removidos da interface para usuários sem perfil ADMIN, evitando confusão operacional.
- **Estilização de Severidade:** Adicionados estilos CSS específicos para diferenciar visualmente os níveis de log (Alertas em amarelo, Negações em vermelho).

### 🔧 Refatoração Técnica
- **Centralização de Estado:** Organização das constantes globais e chaves de armazenamento para garantir a integridade do `localStorage`.
- **Limpeza de Código Inseguro:** Removido o seletor de perfil manual (select) que permitia troca de papel sem autenticação, simulando um fluxo de sessão mais rígido.

---
*Nota: Este projeto é um protótipo didático. As travas de segurança aqui descritas são implementadas no frontend para fins de demonstração de lógica de controle, embora em sistemas reais devam ser obrigatoriamente validadas no backend.*
