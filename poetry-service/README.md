# Poetry Service — Go Backend

宋词别苑后端服务，基于 Go + Gin 构建，提供用户鉴权、宋词检索、诗人管理及交互（收藏/点赞/历史）等 RESTful API。

## 技术栈

| 依赖 | 版本 | 用途 |
|------|------|------|
| Go | >= 1.21 | 运行时 |
| Gin | v1.12.0 | HTTP 路由与中间件 |
| go-sql-driver/mysql | v1.10.0 | MySQL 驱动 |
| golang-jwt/jwt/v5 | v5.3.1 | JWT 鉴权 |
| go-redis/v9 | v9.19.0 | Redis 客户端 |
| godotenv | v1.5.1 | .env 环境变量加载 |
| golang.org/x/crypto | v0.51.0 | bcrypt 密码哈希 |

## 目录结构

```
poetry-service/
├── main.go              # 入口：路由注册、CORS、启动
├── go.mod               # Go 模块定义
├── init.sql             # MySQL 建表 + 种子数据
├── .env                 # 环境变量（不提交至 Git）
├── config/
│   └── config.go        # 配置加载（MySQL/Redis/JWT）
├── common/
│   ├── database.go      # MySQL 连接初始化
│   ├── redis.go         # Redis 连接初始化
│   └── response.go      # 统一 JSON 响应封装
├── middleware/
│   └── auth.go          # JWT 认证中间件
├── handler/
│   ├── user_handler.go          # 注册、登录、忘记密码、发送验证码
│   ├── poetry_handler.go        # 搜索、三百首、每日一词、详情
│   └── interaction_handler.go   # 点赞、收藏、浏览历史
├── service/
│   ├── user_service.go          # 用户/鉴权业务逻辑
│   ├── poetry_service.go        # 词作查询/搜索逻辑
│   └── interaction_service.go   # 交互业务逻辑
└── model/
    ├── user.go           # User 模型
    ├── poem.go           # Poem 模型
    ├── author.go         # Author 模型
    ├── like.go           # Like 模型
    └── favorite.go       # Favorite 模型
```

## 架构分层

```
HTTP Request
    │
    ▼
 Gin Router ──▶ Middleware (JWT)
    │
    ▼
  Handler      # 参数校验、调用 Service、返回 JSON
    │
    ▼
  Service      # 业务逻辑
    │
    ▼
  Model / DB   # 数据访问
```

## 环境变量

在项目根目录创建 `.env` 文件：

```env
# MySQL
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=poetry-app

# Redis
REDIS_ADDR=127.0.0.1:6379
REDIS_PASSWORD=
REDIS_DB=0

# JWT
JWT_SECRET=your-secret-key
```

## 数据库初始化

```bash
# 登录 MySQL 后执行建表与种子数据
mysql -u root -p < init.sql
```

`init.sql` 创建 8 张表并插入约 25 位诗人与 20 首种子词作：

| 表名 | 说明 |
|------|------|
| `authors` | 诗人信息 |
| `poems` | 全量宋词 |
| `three_hundred_poems` | 宋词三百首精选 |
| `users` | 用户账户 |
| `verification_codes` | 邮箱验证码 |
| `favorites` | 用户收藏 |
| `likes` | 用户点赞 |
| `browse_history` | 浏览历史 |

## 启动

```bash
cd poetry-service
go run main.go
# 服务监听 http://localhost:8080
```

## API 接口

### 鉴权模块

| 方法 | 路径 | 说明 | 鉴权 |
|------|------|------|------|
| POST | `/api/v1/auth/register` | 邮箱注册 | 否 |
| POST | `/api/v1/auth/login` | 邮箱登录，返回 JWT Token | 否 |
| POST | `/api/v1/auth/forgot-password` | 发送密码重置验证码 | 否 |
| POST | `/api/v1/auth/send-code` | 发送邮箱验证码 | 否 |
| GET | `/api/v1/user/profile` | 获取当前用户信息 | 是 |

### 词作模块

| 方法 | 路径 | 说明 | 鉴权 |
|------|------|------|------|
| GET | `/api/v1/poetry/search` | 搜索宋词（关键词/诗人/词牌名） | 否 |
| GET | `/api/v1/poetry/three-hundred` | 获取宋词三百首（支持分页） | 否 |
| GET | `/api/v1/poetry/daily-quote` | 获取每日一词 | 否 |
| GET | `/api/v1/poetry/:id` | 获取词作详情 | 否 |

### 诗人模块

| 方法 | 路径 | 说明 | 鉴权 |
|------|------|------|------|
| GET | `/api/v1/poets` | 诗人列表（支持模糊搜索） | 否 |
| GET | `/api/v1/poets/:id` | 诗人详情及其所有作品 | 否 |

### 交互模块

| 方法 | 路径 | 说明 | 鉴权 |
|------|------|------|------|
| POST | `/api/v1/interaction/like` | 点赞词作 | 是 |
| DELETE | `/api/v1/interaction/like` | 取消点赞 | 是 |
| POST | `/api/v1/interaction/favorite` | 收藏词作 | 是 |
| DELETE | `/api/v1/interaction/favorite` | 取消收藏 | 是 |
| GET | `/api/v1/interaction/likes` | 我的点赞列表 | 是 |
| GET | `/api/v1/interaction/favorites` | 我的收藏列表 | 是 |
| POST | `/api/v1/interaction/history` | 记录浏览历史 | 是 |
| GET | `/api/v1/interaction/history` | 获取浏览历史 | 是 |

## 响应格式

统一使用 JSON 响应：

```json
{
  "code": 0,
  "message": "success",
  "data": {}
}
```

- `code`: 0 表示成功，非 0 为错误码
- `message`: 描述信息
- `data`: 业务数据
