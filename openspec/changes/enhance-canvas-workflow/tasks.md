# 实施任务清单

## 1. 数据库模型扩展

- [x] 1.1 Prisma schema：CanvasNode 新增 `history` 字段（JSON 数组存储历史版本）
- [x] 1.2 Prisma schema：CanvasNode 新增 `labels` 字段（字符串数组存储标签）
- [x] 1.3 Prisma schema：CanvasNode 新增 `is_starred` 字段（布尔值）
- [x] 1.4 Prisma schema：Workspace 新增 `snapshot` 字段（JSON 存储快照）

## 2. 后端 API 扩展

- [x] 2.1 Workspace Service：新增 `addNodeHistory` 方法
- [x] 2.2 Workspace Service：新增 `getNodeHistory` 方法
- [x] 2.3 Workspace Service：新增 `exportWorkspace` 方法（导出 JSON）
- [x] 2.4 Workspace Service：新增 `importWorkspace` 方法（导入 JSON）
- [x] 2.5 Workspace Service：新增 `duplicateNode` 方法（复制节点）
- [x] 2.6 API 路由：新增 `GET /workspace/:id/export`
- [x] 2.7 API 路由：新增 `POST /workspace/:id/import`
- [x] 2.8 API 路由：新增 `POST /workspace/nodes/:nodeId/history`
- [x] 2.9 API 路由：新增 `PATCH /workspace/nodes/:nodeId/star`
- [x] 2.10 API 路由：新增 `PATCH /workspace/nodes/:nodeId/labels`

## 3. 前端 - 节点配置面板

- [x] 3.1 创建 `NodeConfigPanel.tsx` 组件
- [x] 3.2 文字节点配置：文本编辑框、字体大小、颜色
- [x] 3.3 图片节点配置：AI 模型选择、尺寸、生成参数
- [x] 3.4 视频节点配置：AI 模型选择、时长、分辨率
- [x] 3.5 面板显隐动画

## 4. 前端 - AI 生成进度可视化

- [x] 4.1 节点加载状态：`loading` 字段
- [x] 4.2 骨架屏动画组件
- [x] 4.3 进度条显示
- [x] 4.4 失败状态 + 重试按钮
- [x] 4.5 成功后自动更新 output_url

## 5. 前端 - 键盘快捷键

- [x] 5.1 `useKeyboardShortcuts` Hook（已存在，已复用）
- [x] 5.2 Delete：删除选中节点
- [x] 5.3 Ctrl+Z：撤销
- [x] 5.4 Ctrl+Y / Ctrl+Shift+Z：重做
- [x] 5.5 Ctrl+S：保存
- [x] 5.6 Ctrl+A：全选
- [x] 5.7 Space + 拖拽：平移画布
- [x] 5.8 双击空白：快速添加文字节点

## 6. 前端 - 撤销/重做

- [x] 6.1 `useHistory` Hook：操作历史栈
- [x] 6.2 记录操作类型：create、update、delete、connect
- [x] 6.3 撤销栈 + 重做栈
- [x] 6.4 UI 显示撤销/重做按钮
- [x] 6.5 最大历史深度限制（50 步）

## 7. 前端 - Mini-map 缩略图

- [x] 7.1 创建 `MiniMap.tsx` 组件
- [x] 7.2 画布内容缩略渲染
- [x] 7.3 当前视口指示框
- [x] 7.4 点击小地图跳转
- [x] 7.5 位置：右下角，可折叠

## 8. 前端 - 框选多选

- [x] 8.1 框选状态：`isSelecting`
- [x] 8.2 框选区域渲染（半透明矩形）
- [x] 8.3 计算被选中的节点
- [x] 8.4 批量删除选中节点
- [x] 8.5 批量移动选中节点

## 9. 前端 - 节点标记

- [x] 9.1 星标按钮（节点右上角）
- [x] 9.2 颜色标签选择器（红、黄、绿、蓝、紫）
- [x] 9.3 标签筛选下拉框
- [x] 9.4 按标签/星标过滤节点

## 10. 前端 - 导出/导入

- [x] 10.1 导出按钮 + JSON 下载
- [x] 10.2 导入按钮 + JSON 上传
- [x] 10.3 另存为模板功能
- [x] 10.4 模板列表（本地存储）

## 11. 前端 - 节点历史版本

- [x] 11.1 历史版本面板（点击节点展开）
- [x] 11.2 版本列表展示
- [x] 11.3 点击回退到指定版本
- [x] 11.4 版本对比（高亮差异）

## 12. 集成测试

- [x] 12.1 节点创建、配置、生成完整流程
- [x] 12.2 撤销/重做操作
- [x] 12.3 导出/导入工作流
- [x] 12.4 快捷键功能正常