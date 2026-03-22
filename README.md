# UDX710 / Project CPE Frontend Redesign

这是一个基于原项目 [`1orz/project-cpe`](https://github.com/1orz/project-cpe) 的前端重做版本。

本仓库保留了原有的后端、接口能力和整体功能方向，但对前端界面做了系统性的重构，包括：

- 重新设计全局主题与应用壳层
- 统一 Dashboard、Network、Configuration、SMS、Phone、OTA、Device Info 等页面的视觉语言
- 将多个超大页面拆成更清晰的 `page + components + hooks` 结构
- 清理一批旧样式、乱码文案和默认后台风格

## Upstream

- 原始项目: [`https://github.com/1orz/project-cpe`](https://github.com/1orz/project-cpe)
- 本仓库定位: 基于该项目的前端重构与界面升级版本


## Stack

### Frontend

- React 19
- TypeScript
- Vite
- MUI 7
- React Router
- TanStack Query

### Backend

- Rust
- Axum
- zbus
- tokio
- rusqlite

## Repository Layout

```text
backend/       Rust backend service
frontend/      React + TypeScript frontend
bruno-api/     API collection / debugging helpers
scripts/       build / deploy helper scripts
```

## Frontend Status

当前前端已经完成主要页面的统一重构，重点覆盖：

- Dashboard
- Network
- Configuration
- SMS
- Phone
- OTA Update
- Device Info

当前设计方向是：

- Material 3 Expressive 气质
- 更偏设备控制台 / 专业工作台的层级和密度
- 比默认 MUI 后台更明确的页面结构和状态表达


## License

本仓库沿用原项目的开源协议。详见 [LICENSE](./LICENSE)。
