# Sistema de Gestão Universitária

## 📋 Visão Geral

Sistema de API para gerenciamento de carga horária de professores e ocupação de salas em universidades. Desenvolvido com Node.js, Express e MySQL.

## 🚀 Configuração e Execução

### Pré-requisitos

- Docker e Docker Compose
- Node.js 22+ (para desenvolvimento local)
- Git

### ⚡ Início Rápido com Docker

```bash
# 1. Clone o repositório
git clone <repository-url>
cd university-system

# 2. Configure variáveis de ambiente
cp .env.example .env

# 3. Suba os serviços
docker-compose up -d

# 4. Configure o banco de dados
npm run wait-for-db
npm run setup-db
npm run seed-db

# 5. Teste a API
curl http://localhost:3001/api/professors/workload
```

### 📦 Scripts Disponíveis

```bash
npm start           # Inicia o servidor em produção
npm run dev         # Inicia com hot-reload (nodemon)
npm run wait-for-db # Aguarda o banco estar disponível
npm run setup-db    # Cria estrutura das tabelas
npm run seed-db     # Insere dados de exemplo
```

## 🏗️ Arquitetura

### Estrutura do Projeto

```
university-system/
├── src/
│   ├── app.js                 # Aplicação principal
│   ├── database/
│   │   └── connection.js      # Conexão MySQL
│   └── services/
│       └── RoomService.js     # Serviços de salas
├── scripts/
│   ├── wait-for-db.js         # Aguarda banco disponível
│   ├── setup-database.js      # Cria estrutura do banco
│   └── seed-database.js       # Insere dados de exemplo
├── docker-compose.yml
├── package.json
└── .env
```

## 📊 Modelo de Dados

### Principais Entidades

- **PROFESSOR**: Professores da universidade
- **DEPARTMENT**: Departamentos acadêmicos
- **TITLE**: Títulos dos professores (Doutor, Mestre, etc.)
- **SUBJECT**: Disciplinas oferecidas
- **CLASS**: Turmas das disciplinas
- **CLASS_SCHEDULE**: Horários das aulas
- **ROOM**: Salas de aula
- **BUILDING**: Prédios do campus

## 🛠️ API Endpoints

### Base URL

```
http://localhost:3001
```

---

## 🎓 1. Carga Horária dos Professores

### **GET** `/api/professors/workload`

Retorna a carga horária semanal de todos os professores.

#### Query SQL Utilizada

```sql
SELECT
    p.id as professor_id,
    p.name as professor_name,
    d.name as department_name,
    t.name as title_name,
    COALESCE(SUM(
        TIME_TO_SEC(TIMEDIFF(cs.end_time, cs.start_time)) / 3600
    ), 0) as total_hours_per_week,
    COUNT(DISTINCT c.id) as total_classes
FROM PROFESSOR p
LEFT JOIN DEPARTMENT d ON p.department_id = d.id
LEFT JOIN TITLE t ON p.title_id = t.id
LEFT JOIN CLASS c ON p.id = c.professor_id
LEFT JOIN CLASS_SCHEDULE cs ON c.id = cs.class_id
GROUP BY p.id, p.name, d.name, t.name
ORDER BY total_hours_per_week DESC;
```

#### Explicação da Query

1. **JOINs**: Conecta tabelas para obter informações completas do professor
2. **TIME_TO_SEC(TIMEDIFF())**: Calcula duração das aulas em segundos
3. **/ 3600**: Converte segundos para horas
4. **SUM()**: Soma todas as horas de aulas do professor
5. **COALESCE()**: Retorna 0 se professor não tem aulas
6. **GROUP BY**: Agrupa por professor para totalizar horas
7. **ORDER BY**: Ordena por maior carga horária

#### Exemplo de Requisição

```bash
curl -X GET http://localhost:3001/api/professors/workload
```

#### Exemplo de Resposta

```json
{
  "success": true,
  "data": [
    {
      "professor_id": 1,
      "professor_name": "Prof. Dr. João Silva",
      "department_name": "Ciência da Computação",
      "title_name": "Doutor",
      "total_hours_per_week": "10.00",
      "total_classes": 2
    },
    {
      "professor_id": 2,
      "professor_name": "Prof. MSc. Maria Santos",
      "department_name": "Ciência da Computação",
      "title_name": "Mestre",
      "total_hours_per_week": "8.00",
      "total_classes": 2
    },
    {
      "professor_id": 6,
      "professor_name": "Prof. Esp. Lucia Ferreira",
      "department_name": "Administração",
      "title_name": "Especialista",
      "total_hours_per_week": "4.00",
      "total_classes": 1
    }
  ]
}
```

---

## 🏫 2. Horários das Salas

### **GET** `/api/rooms/schedule`

Retorna os horários de ocupação de todas as salas organizados por prédio e sala.

#### Query SQL Utilizada

```sql
SELECT
    r.id as room_id,
    r.number as room_number,
    b.name as building_name,
    cs.day_of_week,
    cs.start_time,
    cs.end_time,
    s.name as subject_name,
    c.code as class_code,
    CASE
        WHEN cs.id IS NOT NULL THEN 'OCUPADA'
        ELSE 'LIVRE'
    END as status
FROM ROOM r
JOIN BUILDING b ON r.building_id = b.id
LEFT JOIN CLASS_SCHEDULE cs ON r.id = cs.room_id
LEFT JOIN CLASS c ON cs.class_id = c.id
LEFT JOIN SUBJECT s ON c.subject_id = s.id
ORDER BY b.name, r.number, cs.day_of_week, cs.start_time;
```

#### Explicação da Query

1. **JOIN BUILDING**: Obter nome do prédio da sala
2. **LEFT JOIN CLASS_SCHEDULE**: Incluir salas mesmo sem horários
3. **LEFT JOIN CLASS e SUBJECT**: Obter detalhes das aulas
4. **CASE WHEN**: Determinar status da sala (OCUPADA/LIVRE)
5. **ORDER BY**: Organizar por prédio, sala e horário

#### Exemplo de Requisição

```bash
curl -X GET http://localhost:3001/api/rooms/schedule
```

#### Exemplo de Resposta

```json
{
  "success": true,
  "data": {
    "Prédio Central - Sala 101": {
      "room_id": 1,
      "building": "Prédio Central",
      "room_number": "101",
      "schedule": [
        {
          "day": "Segunda",
          "start_time": "08:00:00",
          "end_time": "10:00:00",
          "subject": "Algoritmos I",
          "class_code": "ALG001-T01",
          "status": "OCUPADA"
        },
        {
          "day": "Quinta",
          "start_time": "08:00:00",
          "end_time": "10:00:00",
          "subject": "Algoritmos I",
          "class_code": "ALG001-T01",
          "status": "OCUPADA"
        }
      ]
    },
    "Prédio Central - Sala 102": {
      "room_id": 2,
      "building": "Prédio Central",
      "room_number": "102",
      "schedule": [
        {
          "day": "Segunda",
          "start_time": "10:00:00",
          "end_time": "12:00:00",
          "subject": "Algoritmos I",
          "class_code": "ALG001-T02",
          "status": "OCUPADA"
        }
      ]
    },
    "Laboratórios - Sala Lab-01": {
      "room_id": 4,
      "building": "Laboratórios",
      "room_number": "Lab-01",
      "schedule": [
        {
          "day": "Quarta",
          "start_time": "14:00:00",
          "end_time": "16:00:00",
          "subject": "Banco de Dados",
          "class_code": "BD001-T01",
          "status": "OCUPADA"
        }
      ]
    }
  }
}
```

## 🔧 Configuração

### Variáveis de Ambiente (.env)

```env
# Banco de Dados
DB_HOST=localhost
DB_USER=university_user
DB_PASSWORD=university_pass
DB_NAME=university_db

# Aplicação
NODE_ENV=development
PORT=3001
```

## 📚 Dados de Exemplo

Após executar `npm run seed-db`, o sistema terá:

- **6 Professores** de diferentes departamentos e títulos
- **8 Salas** distribuídas em 4 prédios
- **8 Disciplinas** com pré-requisitos
- **8 Turmas** com horários definidos
- **Horários** realistas de segunda a sábado

### Exemplo de Professor

```sql
INSERT INTO PROFESSOR (department_id, title_id, name) VALUES
(1, 1, 'Prof. Dr. João Silva');
```

### Exemplo de Horário

```sql
INSERT INTO CLASS_SCHEDULE (class_id, room_id, day_of_week, start_time, end_time) VALUES
(1, 1, 2, '08:00:00', '10:00:00'); -- Segunda-feira, 8h-10h
```

## 🐳 Comandos Docker

```bash
# Subir todos os serviços
docker-compose up -d

# Ver logs da aplicação
docker-compose logs -f app

# Ver logs do banco
docker-compose logs -f mysql

# Parar serviços
docker-compose down

# Executar comandos na aplicação
docker-compose exec app npm run setup-db
docker-compose exec app npm run seed-db

# Acessar shell do container
docker-compose exec app sh

# Conectar diretamente no MySQL
docker-compose exec mysql mysql -u university_user -p university_db
```

## ✅ Testes

### Verificar se API está funcionando

```bash
# Health check
curl http://localhost:3001/health

# Testar carga horária
curl http://localhost:3001/api/professors/workload | jq

# Testar horários das salas
curl http://localhost:3001/api/rooms/schedule | jq
```

<hr>
<p align="center">
👨‍💻 Developed with ❤️ by Megas
</p>
