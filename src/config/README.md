# Configurações do Editor Nitro Builder

## 🔧 Variáveis de Configuração

### **1. Controle de Botões**
- **`HIDE_ALL_BUTTONS`** - Esconde todos os botões da interface
- **`HIDE_MENU`** - Esconde o menu principal da interface

### **2. Tipo de Mobiliário**
- **`DEFAULT_FURNITURE_TYPE`** - Define qual tipo de mobiliário usar (1, 2, 3, etc.)

### **3. Limites de Uso**
- **`DEFAULT_MAX_ITEM_USES`** - Número máximo de usos para itens
- **`ITEM_USAGE_LIMITS`** - Limites específicos por tipo de item

## 🌐 Variáveis de URL

### **Parâmetros Disponíveis:**

#### **`mobi`**
- **Descrição**: Define qual mobiliário carregar automaticamente
- **Exemplo**: `?mobi=chair_01`
- **Uso**: Carrega o arquivo .nitro do servidor Habblet

#### **`autodownload`**
- **Descrição**: Ativa o download automático da imagem
- **Exemplo**: `?autodownload=true`
- **Uso**: Faz o download automático após renderizar

#### **`hideMenu`** ⭐ **NOVO**
- **Descrição**: Esconde apenas a barra de botões do canvas (zoom, rotação, etc.)
- **Exemplo**: `?hideMenu=true`
- **Valores**: `true` ou `false`
- **Uso**: Oculta a barra de controles do canvas, mantendo o menu de ações principal

#### **`furnitureType`** ⭐ **NOVO**
- **Descrição**: Define qual tipo de mobiliário usar e executa automaticamente a função "Usar mobi" o número de vezes especificado
- **Exemplo**: `?furnitureType=3`
- **Valores**: `1`, `2`, `3`, `4`, `5` (ou qualquer número)
- **Uso**: Seleciona o tipo de mobiliário e executa "Usar mobi" automaticamente o número de vezes especificado

#### **`hideStateInfo`** ⭐ **NOVO**
- **Descrição**: Esconde as informações de estado do mobiliário (canto superior direito)
- **Exemplo**: `?hideStateInfo=true`
- **Valores**: `true` ou `false`
- **Uso**: Oculta as informações técnicas do mobiliário na tela, incluindo o status das ações automáticas

#### **`autoRotateFurniture`** ⭐ **NOVO**
- **Descrição**: Rotaciona automaticamente o mobiliário para a direita
- **Exemplo**: `?autoRotateFurniture=true`
- **Valores**: `true` ou `false`
- **Uso**: Executa rotação automática após 1 segundo de renderização (mais rápido)

#### **`autoRotateLeft`** ⭐ **NOVO**
- **Descrição**: Rotaciona o mobiliário para a esquerda o número de vezes especificado
- **Exemplo**: `?autoRotateLeft=2`
- **Valores**: `1`, `2`, `3`, `4`, `5` (ou qualquer número)
- **Uso**: Executa rotação para esquerda automaticamente o número de vezes especificado (com intervalo de 100ms - mais rápido)

#### **`autoRotateRight`** ⭐ **NOVO**
- **Descrição**: Rotaciona o mobiliário para a direita o número de vezes especificado
- **Exemplo**: `?autoRotateRight=3`
- **Valores**: `1`, `2`, `3`, `4`, `5` (ou qualquer número)
- **Uso**: Executa rotação para direita automaticamente o número de vezes especificado (com intervalo de 100ms - mais rápido)

#### **`autoZoomIn`** ⭐ **NOVO**
- **Descrição**: Aplica zoom para aumentar o número de vezes especificado
- **Exemplo**: `?autoZoomIn=2`
- **Valores**: `1`, `2`, `3`, `4`, `5` (ou qualquer número)
- **Uso**: Executa zoom in automaticamente o número de vezes especificado (com intervalo de 50ms - mais rápido)

#### **`autoZoomOut`** ⭐ **NOVO**
- **Descrição**: Aplica zoom para diminuir o número de vezes especificado
- **Exemplo**: `?autoZoomOut=1`
- **Valores**: `1`, `2`, `3`, `4`, `5` (ou qualquer número)
- **Uso**: Executa zoom out automaticamente o número de vezes especificado (com intervalo de 50ms - mais rápido)

## 📝 Exemplos de Uso

### **URLs Simples:**
```
# Esconder menu
https://seu-site.com/?hideMenu=true

# Definir tipo de mobiliário
https://seu-site.com/?furnitureType=3

# Esconder barra de controles e definir tipo
https://seu-site.com/?hideMenu=true&furnitureType=2

# Esconder informações de estado
https://seu-site.com/?hideStateInfo=true

# Rotação automática
https://seu-site.com/?autoRotateFurniture=true

# Rotação específica para esquerda (2 vezes)
https://seu-site.com/?autoRotateLeft=2

# Rotação específica para direita (3 vezes)
https://seu-site.com/?autoRotateRight=3

# Zoom automático para aumentar (2 vezes)
https://seu-site.com/?autoZoomIn=2

# Zoom automático para diminuir (1 vez)
https://seu-site.com/?autoZoomOut=1
```

### **URLs Completas:**
```
# Carregar mobiliário, esconder barra de controles e definir tipo
https://seu-site.com/?mobi=chair_01&hideMenu=true&furnitureType=4

# Download automático com barra de controles escondida
https://seu-site.com/?mobi=chair_01&autodownload=true&hideMenu=true

# Configuração completa com todas as funcionalidades
https://seu-site.com/?mobi=chair_01&hideMenu=true&furnitureType=3&hideStateInfo=true&autoRotateFurniture=true&autodownload=true

# Configuração com rotações e zoom específicos
https://seu-site.com/?mobi=chair_01&autoRotateLeft=2&autoRotateRight=1&autoZoomIn=3&autoZoomOut=1&hideStateInfo=false

# Configuração completa
https://seu-site.com/?mobi=chair_01&autodownload=true&hideMenu=true&furnitureType=5
```

## 🎯 Tipos de Mobiliário Disponíveis

| Tipo | Nome | Descrição |
|------|------|-----------|
| 1 | Básico | Mobiliário básico padrão |
| 2 | Intermediário | Mobiliário com recursos avançados |
| 3 | Avançado | Mobiliário com funcionalidades especiais |
| 4 | Premium | Mobiliário premium exclusivo |
| 5 | Evento | Mobiliário de eventos especiais |

## 💾 Persistência de Dados

- **`hideMenu`**, **`furnitureType`**, **`hideStateInfo`**, **`autoRotateFurniture`**, **`autoRotateLeft`**, **`autoRotateRight`**, **`autoZoomIn`** e **`autoZoomOut`** são salvos no `localStorage`
- **`autoUseMobi`** é criado automaticamente quando `furnitureType` é usado (contém o número de execuções)
- As configurações persistem entre sessões do navegador
- Para resetar, use `?hideMenu=false`, `?furnitureType=1`, `?hideStateInfo=false`, `?autoRotateFurniture=false`, `?autoRotateLeft=0`, `?autoRotateRight=0`, `?autoZoomIn=0` ou `?autoZoomOut=0`

## 📊 Status das Ações Automáticas

Quando `hideStateInfo=false`, a interface mostra o status em tempo real de todas as ações automáticas:

- **⏸️ Aguardando**: Ação configurada mas ainda não iniciada
- **🔄 Executando...**: Ação em andamento
- **✅ Concluído**: Ação finalizada com sucesso

**Ações monitoradas:**
- 🎯 **Usar Mobi**: Status da execução automática do `furnitureType`
- 🔄 **Rotação**: Status da rotação automática simples
- ⬅️ **Rot. Esquerda**: Status das rotações para esquerda (`autoRotateLeft`)
- ➡️ **Rot. Direita**: Status das rotações para direita (`autoRotateRight`)
- 🔍 **Zoom In**: Status dos zooms para aumentar (`autoZoomIn`)
- 🔍 **Zoom Out**: Status dos zooms para diminuir (`autoZoomOut`)

## 🔄 Atualizações em Tempo Real

- **`hideMenu`** é aplicado imediatamente na barra de controles
- **`furnitureType`** executa automaticamente a função "Usar mobi" o número de vezes especificado (com intervalo de 500ms entre execuções)
- **`hideStateInfo`** esconde/mostra as informações de estado imediatamente
- **`autoRotateFurniture`** executa rotação automática após 1 segundo (mais rápido)
- **`autoRotateLeft`** executa rotação para esquerda o número de vezes especificado (após 1.5s, intervalo 100ms - mais rápido)
- **`autoRotateRight`** executa rotação para direita o número de vezes especificado (após 2s, intervalo 100ms - mais rápido)
- **`autoZoomIn`** executa zoom in o número de vezes especificado (após 2.5s, intervalo 50ms - mais rápido)
- **`autoZoomOut`** executa zoom out o número de vezes especificado (após 3s, intervalo 50ms - mais rápido)
- **`autodownload`** executa o download automático após renderização
- Não é necessário recarregar a página
- Mudanças são refletidas na interface automaticamente

## ⚠️ Notas Importantes

1. **Ordem dos Parâmetros**: A ordem dos parâmetros na URL não importa
2. **Valores Booleanos**: Para `hideMenu`, use `true` ou `false`
3. **Valores Numéricos**: Para `furnitureType`, use números inteiros
4. **Fallback**: Se um parâmetro não for especificado, usa o valor padrão
5. **Compatibilidade**: Funciona com todos os navegadores modernos
