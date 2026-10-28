# 小婷500分之路

一个只有两个人使用的私密学习打卡 Web App：男朋友每天布置英语作业，小婷拍照提交，两个人一起看打卡日历。

- 移动端优先（iPhone 安全区域、底部固定 Tab、单手操作），桌面端自动居中显示
- Next.js 15（App Router）+ TypeScript + Tailwind CSS + shadcn/ui 风格组件
- Supabase：Postgres + Storage（私有 bucket）+ Realtime
- 登录：两个固定口令，服务端签发带签名的 HttpOnly Cookie
- 数据读写全部走 Server Components / Server Actions，service_role key 不会进浏览器

---

## 一、项目结构

```
xiaoting500/
├─ app/
│  ├─ layout.tsx                 全局布局、字体栈、iOS viewport 配置
│  ├─ globals.css                设计 token、安全区域、基础样式
│  ├─ page.tsx                   按登录角色跳转
│  ├─ error.tsx                  友好的错误页
│  ├─ not-found.tsx              404
│  ├─ login/page.tsx             登录页
│  ├─ student/
│  │  ├─ layout.tsx              学生端守卫 + 提醒条 + 底部 Tab
│  │  ├─ page.tsx                今日任务 / 拍照提交
│  │  ├─ calendar/page.tsx       打卡日历
│  │  └─ day/[date]/page.tsx     某一天的任务与照片
│  └─ admin/
│     ├─ layout.tsx              管理端守卫 + 底部 Tab
│     ├─ page.tsx                编辑任务 / 看照片 / 催作业
│     ├─ calendar/page.tsx       打卡日历
│     ├─ history/page.tsx        最近 30 天历史
│     └─ day/[date]/page.tsx     某一天的任务与照片
├─ actions/
│  ├─ auth.ts                    口令登录 / 退出
│  ├─ tasks.ts                   发布或更新每日任务
│  ├─ submissions.ts             上传照片、覆盖提交
│  └─ reminders.ts               发送 / 已读催作业提醒
├─ components/
│  ├─ ui/                        button、input、textarea、card、dialog
│  ├─ bottom-tabs.tsx
│  ├─ page-header.tsx
│  ├─ status-pill.tsx
│  ├─ subtask-list.tsx
│  ├─ task-card.tsx
│  ├─ task-editor.tsx
│  ├─ submission-section.tsx     拍照、压缩、预览、提交
│  ├─ photo-grid.tsx             照片网格 + 点开看大图
│  ├─ reminder-banner.tsx        Realtime 订阅 + 系统通知
│  ├─ reminder-button.tsx
│  ├─ calendar-view.tsx
│  ├─ stats-row.tsx
│  ├─ day-detail-view.tsx
│  ├─ empty-state.tsx
│  └─ login-form.tsx
├─ lib/
│  ├─ auth.ts                    Cookie 签名 / 口令校验 / 页面守卫
│  ├─ data.ts                    数据库查询、签名 URL、统计
│  ├─ date.ts                    北京时间日期工具
│  ├─ demo-store.ts              本地演示模式的内存数据（仅开发环境）
│  ├─ env.ts                     环境变量入口
│  ├─ types.ts                   Task / Submission / Reminder 类型
│  ├─ utils.ts                   cn()
│  └─ supabase/
│     ├─ server.ts               服务端 service_role 客户端
│     └─ browser.ts              浏览器 anon 客户端（只订阅 reminders）
├─ supabase/schema.sql           建表 + RLS + Realtime + 私有 bucket，一次性执行
├─ public/
│  ├─ icon.svg
│  └─ demo/note-1~3.jpg          演示模式用的示例照片
├─ .env.example
├─ components.json               shadcn/ui 配置
├─ next.config.ts
├─ tailwind.config.ts
├─ postcss.config.mjs
├─ tsconfig.json
├─ package.json
└─ README.md
```

---

## 二、环境变量清单

| 变量 | 是否公开 | 说明 |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | 公开 | Supabase Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | 公开 | anon key，仅用于 Realtime 订阅 reminders |
| `SUPABASE_SERVICE_ROLE_KEY` | **服务端机密** | 数据库与 Storage 的全部读写都靠它，绝不能加 `NEXT_PUBLIC_` |
| `SUPABASE_STORAGE_BUCKET` | 服务端 | 默认 `submissions`，可不填 |
| `ADMIN_PASSCODE` | 机密 | 管理员（男朋友）口令 |
| `STUDENT_PASSCODE` | 机密 | 小婷口令 |
| `AUTH_SECRET` | 机密 | 给登录 Cookie 做 HMAC 签名，建议 `openssl rand -base64 32` |

本地复制 `.env.example` 为 `.env.local` 后填写：

```bash
cp .env.example .env.local
```

> 没有配置 Supabase 时，`npm run dev` 会自动进入「演示模式」，数据和照片只存在内存里，重启即清空。
> 演示口令：管理员 `520520`，小婷 `1314520`。生产环境不会启用演示模式。

---

## 三、数据库

完整脚本在 [`supabase/schema.sql`](supabase/schema.sql)，包含：

1. `users`：两个人（不开放注册）
2. `tasks`：一天一条，`date` 唯一，`subtasks` 用 `jsonb` 数组
3. `submissions`：一天一条，`date` 唯一，重交时覆盖；`image_urls` 存 Storage 对象路径
4. `reminders`：催作业记录，`read_at` 为空即未读
5. RLS：只给 anon 放开 `reminders` 的只读权限（供 Realtime），其它表全部拒绝匿名访问
6. Realtime：把 `reminders` 加入 `supabase_realtime` publication
7. Storage：创建私有 bucket `submissions`，不添加任何匿名策略

执行方法：Supabase 控制台 → **SQL Editor** → **New query** → 粘贴整个文件 → **Run**。
脚本可以重复执行。

---

## 四、本地运行

```bash
npm install
cp .env.example .env.local   # 填好 Supabase 与口令
npm run dev                  # http://localhost:3000
```

页面入口：

- `/login` 输入口令
- 学生端：`/student`
- 管理端：`/admin`

---

## 五、Supabase 配置步骤（新手版）

整个过程大约 15 分钟，只需要做一次。建议**边看边点**，每一步都给出在哪点、看到什么算成功。

### 0. 先了解两件事

- 免费版够用：500MB 数据库 + 1GB 照片存储。照片压缩后每张约 150–250KB，一天 6 张 ≈ 1MB，够用很久。
- 免费项目连续 **7 天没人访问会被自动暂停**（页面打不开）。进 Supabase 控制台点 **Restore / Resume** 就能恢复，数据不会丢。

### 1. 注册

打开 [supabase.com](https://supabase.com) → **Start your project** → 用 GitHub 或邮箱注册 → 去邮箱点验证链接。

### 2. 创建项目

登录后进入 Dashboard → 点 **New project**，按下表填写：

| 字段 | 填什么 |
| --- | --- |
| Organization | 默认那个即可 |
| Project name | `xiaoting500`（随意） |
| Database Password | 点 **Generate a password**，复制存到备忘录（以后基本用不到，但丢了很麻烦） |
| Region | **Southeast Asia (Singapore)** 或 **Northeast Asia (Tokyo)**，国内访问延迟较低 |
| Plan | **Free** |

点 **Create new project**，等 1–3 分钟，顶部状态变成绿色（Healthy）再继续。这期间数据库还没准备好，执行 SQL 会报错。

### 3. 执行建表脚本（最关键的一步）

1. 左侧栏点 **SQL Editor**。
2. 点 **New query**（或 `+` → Create a new snippet）。
3. 打开本地文件 [`supabase/schema.sql`](supabase/schema.sql)，**全选复制**，粘贴到左侧编辑框。
4. 点右下角 **Run**（或 `Ctrl/Cmd + Enter`）。

看到 **Success. No rows returned** 就成功了。这一步会自动完成：建 4 张表 → 写入「男朋友 / 小婷」两个人 → 开启 RLS → 把 `reminders` 加入 Realtime → 创建私有 bucket `submissions`。

**验证**：左侧 **Table Editor**，应看到 `users`、`tasks`、`submissions`、`reminders` 四张表；点开 `users` 有 2 行。看不到表就说明脚本没跑成功，看下面「常见报错」。

脚本可以重复执行（都用了 `if not exists`），跑第二遍也不会出问题。

### 4. 确认 Storage 是私有的

左侧 **Storage** → 应已自动出现名为 `submissions` 的 bucket。

- 点进去看右上角，确认 **Public bucket 是关闭状态**（显示 Private / 锁图标）。
- 不需要手动新建，也不需要添加任何 policy。
- 照片会存成 `submissions/{日期}/{随机名}.jpg`，数据库里只存这个路径；前端看到的是服务端生成的 **12 小时签名链接**。

### 5. 确认 Realtime 已开启

左侧 **Database → Publications**（旧版界面叫 **Replication**）→ 点 `supabase_realtime` → 确认表列表里有 `reminders` 且开关是打开的。

没有的话点 **Add table** 勾上 `reminders` 保存。

**验证**：回 SQL Editor 执行

```sql
select tablename from pg_publication_tables where pubname = 'supabase_realtime';
```

结果里能看到 `reminders` 就对了。

### 6. 复制三个密钥

位置：左下角 **Project Settings（齿轮）→ API Keys**（老界面是 **Project Settings → API**）。

| 界面上看到的 | 填到哪个变量 |
| --- | --- |
| **Project URL**（形如 `https://abcdefgh.supabase.co`） | `NEXT_PUBLIC_SUPABASE_URL` |
| **anon public** / **Publishable key**（`sb_publishable_…` 或 `eyJ…` 开头） | `NEXT_PUBLIC_SUPABASE_ANON_KEY` |
| **service_role** / **Secret key**（`sb_secret_…` 或 `eyJ…` 开头，需要点 **Reveal** 才显示） | `SUPABASE_SERVICE_ROLE_KEY` |

- 新版控制台只显示 Publishable / Secret 两个 key 也可以，代码兼容两种。
- 找不到的话展开页面底部的 **Legacy API keys**，复制 `anon` 和 `service_role`。
- `service_role` / Secret key 拥有全部权限，**只能放在服务端环境变量里**：不要加 `NEXT_PUBLIC_` 前缀，不要发给任何人，不要提交到 Git。

### 7. 填本地 `.env.local`

在项目根目录执行：

```bash
cp .env.example .env.local
```

然后编辑 `.env.local`（值换成你自己的）：

```bash
NEXT_PUBLIC_SUPABASE_URL=https://abcdefgh.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOi...
SUPABASE_STORAGE_BUCKET=submissions
ADMIN_PASSCODE=只有你知道的口令
STUDENT_PASSCODE=小婷的口令
AUTH_SECRET=一串随机字符
```

生成 `AUTH_SECRET`：

```bash
openssl rand -base64 32
```

Windows 或在手机上不方便敲命令，打开 <https://generate-secret.vercel.app/32> 复制一串即可。

注意：

- 口令别用 `123456`，建议 6 位以上、只有你们俩知道。
- URL **不要带结尾斜杠**，也不要带 `/rest/v1`。
- 改完 `.env.local` **必须重启** `npm run dev` 才生效。
- `.env.local` 已在 `.gitignore` 里，不会被提交。

### 8. 本地验证清单

`npm run dev` → 打开 <http://localhost:3000>，依次确认：

1. 管理员口令登录 → 跳到 `/admin`，能看到今日任务编辑区。
2. 写一条任务（标题 + 至少 2 条子任务）→ 点「发布今日任务」→ 学生端刷新能看到。
3. 学生端上传 1 张照片并提交 → Supabase **Storage → submissions** 里出现 `{今天日期}/xxx.jpg`。
4. 管理端点「提醒她交作业」→ SQL Editor 执行下面语句，能看到新记录：
   ```sql
   select * from reminders order by sent_at desc limit 3;
   ```
5. 学生端点「知道啦」→ 上一条记录的 `read_at` 有值。
6. 日历页今天的格子是绿色 ✓，顶部统计有数字。

6 条全过 = Supabase 配置完成，可以去做 Vercel 部署（下一节）。

### 9. 常见报错对照

| 现象 | 原因与解决 |
| --- | --- |
| 登录后提示「页面加载失败」 | URL / key 填错，或改完没重启；确认 URL 没有结尾斜杠 |
| 上传报 `Bucket not found` | 第 3 步脚本没执行成功，或 bucket 名不是 `submissions` |
| 上传报 `new row violates row-level security policy` | key 用反了：`SUPABASE_SERVICE_ROLE_KEY` 里填了 anon |
| 照片显示裂图 / 403 | 签名 URL 12 小时过期，刷新页面自动续签 |
| 收不到实时提醒 | Realtime 没开（第 5 步）或浏览器通知权限没允许；刷新页面仍会显示未读提醒 |
| 一周没用后网站打不开 | 免费项目被暂停，控制台点 **Restore** 恢复 |
| 想清空测试数据 | SQL Editor 执行 `truncate submissions, tasks, reminders;`（`users` 保留） |

---

## 六、Vercel 部署步骤（新手版）

1. 把项目推到 GitHub：

```bash
cd xiaoting500
git init
git add .
git commit -m "feat: 小婷500分之路"
git branch -M main
git remote add origin https://github.com/你的用户名/xiaoting500.git
git push -u origin main
```

2. 打开 [vercel.com](https://vercel.com)，用 GitHub 登录，点 **Add New → Project**。
3. 选择刚才的仓库，Framework Preset 会自动识别为 **Next.js**，Build Command 和 Output 都不用改。
4. 展开 **Environment Variables**，逐条添加（名字必须完全一致）：

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
ADMIN_PASSCODE
STUDENT_PASSCODE
AUTH_SECRET
```

`SUPABASE_STORAGE_BUCKET` 不填也可以，默认 `submissions`。

5. 点 **Deploy**，等一两分钟。
6. 打开 Vercel 给的域名，用口令登录，把链接发给小婷。
7. iPhone 上可以 Safari 打开 → 分享 → **添加到主屏幕**，就像一个小 App。
8. 以后改了环境变量，需要在 **Settings → Environment Variables** 更新后 **Redeploy** 才生效。

> 生产环境必须配置 Supabase，否则登录无法使用（演示模式只在 `npm run dev` 下启用）。

### 安卓 App（APK）

仓库根目录已附带 `xiaoting500-v1.0.0.apk`（1.5 MB，Android 7.0+）。

1. 传到安卓手机上，点开安装（需要允许「安装未知来源应用」）。
2. 第一次打开会要求填写**网站地址**，填 Vercel 部署后的网址，例如 `https://xxx.vercel.app`。
3. 之后直接进入小空间；按返回键 →「更换网站地址」可以随时改。

它只是一个 WebView 外壳：页面、数据库、照片仍然跑在 Vercel + Supabase 上，所以**必须先完成上面的部署**才能正常使用。已支持拍摄/相册多选上传、系统通知（Android 13+ 会申请通知权限）。签名用的是 debug 证书，仅供自用安装；要上架应用商店需要自己生成 release keystore。

iPhone 不需要 APK：用 Safari 打开网址 → 分享 → **添加到主屏幕**。

---

## 七、功能说明

### 学生端

- 顶部：日期、打招呼、连续打卡 / 累计打卡 / 500 分目标
- 今日任务：带勾选圈的子任务列表，点击圆圈可以自己打勾（本地交互）
- 拍照上传：调用手机相机（`capture="environment"`），也可以从相册多选，最多 6 张
- 前端自动压缩到最长边 1440px、JPEG 0.78，再上传到私有 Storage
- 提交后显示「已提交」和提交时间，可以重新提交（覆盖旧照片并删除旧文件）
- 底部 Tab：今日 / 日历
- 收到催作业：顶部提醒条 + 浏览器系统通知（需点一次「开启系统通知」授权）

### 管理端

- 今日任务编辑：标题、多条子任务（增删）、一句鼓励语、发布 / 更新
- 查看小婷今天上传的照片，点缩略图看大图
- 「提醒她交作业」写入 `reminders` 表
- 底部 Tab：今日 / 日历 / 历史（最近 30 天）

### 日历（两端共用）

- 月视图，周一为每行第一天
- 灰色 = 未布置；浅黄 = 已布置未提交；绿色 ✓ = 已完成
- 点任意已布置的日期查看当天的任务和照片
- 顶部统计：本月完成 / 连续打卡 / 累计打卡

### 通知逻辑

- 小婷在线：`supabase-js` 订阅 `reminders` 的 INSERT 事件，实时弹提醒条，并调用 Notification API
- 小婷不在线：下次打开页面时查询 `read_at IS NULL` 的提醒，有就显示
- 点「知道啦」后写入 `read_at`，提醒条消失
- 没有做 Web Push / Service Worker，保持简单

---

## 八、安全与隐私

- 照片 bucket 是 **private**，数据库只存对象路径，读取时服务端生成 **12 小时有效的签名 URL**
- `service_role` key 只在服务端使用，不会出现在浏览器 bundle 里
- RLS 默认拒绝匿名访问；仅 `reminders` 允许匿名只读（内容只有日期和时间，用于 Realtime）
- 登录 Cookie 是 HttpOnly + SameSite=Lax + HMAC 签名，篡改会失效
- 口令写在环境变量里，不写死在代码中；请不要把 `.env.local` 提交到 Git

---

## 九、已知限制与建议

- Vercel 的 Server Action 请求体有大小限制（约 4.5MB）。已通过前端压缩把 6 张照片控制在安全范围内；如果以后需要原图，可以改成「浏览器直传 Supabase Storage（signed upload URL）」。
- 签名 URL 12 小时后过期，刷新页面会自动续签。
- 管理端照片不会实时刷新，小婷提交后刷新一下即可（只有催作业用了 Realtime）。
- 所有日期按 **Asia/Shanghai** 计算，避免 Vercel（UTC）跨天。
- 如果页面提示「页面加载失败」：检查 Supabase 环境变量是否填对、`schema.sql` 是否执行成功。
- 如果没有收到实时提醒：检查 Realtime 是否开启、浏览器通知权限是否允许；刷新页面仍会显示未读提醒。

---

## 十、常用命令

```bash
npm run dev      # 本地开发
npm run build    # 生产构建
npm start        # 本地运行生产构建
```
