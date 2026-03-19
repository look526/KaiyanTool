## ADDED Requirements

### Requirement: Animatic 动态分镜预览

系统 SHALL 支持在前端将分镜图和配音合成为低保真动态预览，用于快速验证叙事节奏。

#### Scenario: 生成 Animatic 预览
- **WHEN** 用户在集详情页点击"Animatic 预览"
- **THEN** 系统在前端使用 Canvas + Web Audio API 合成预览
- **AND** 按 Shot 顺序播放分镜图，同步播放配音音频
- **AND** 为每张分镜图应用 Ken Burns 效果（缓慢缩放/平移）

#### Scenario: 无配音时的 Animatic
- **WHEN** 部分 Shot 尚未生成配音
- **THEN** 按默认时长（如 3 秒/Shot）播放分镜图，无声音
- **AND** 有配音的 Shot 按配音时长播放

### Requirement: Ken Burns 镜头效果

系统 SHALL 在 Animatic 预览中为静态分镜图添加简单的镜头运动效果。

#### Scenario: 自动应用效果
- **WHEN** Animatic 播放分镜图
- **THEN** 根据 Shot 的 `camera_movement` 字段选择效果：
  - `zoom_in`：缓慢放大
  - `zoom_out`：缓慢缩小
  - `pan_left`/`pan_right`：水平平移
  - `tilt_up`/`tilt_down`：垂直平移
  - 无标注时默认缓慢放大

### Requirement: Animatic 播放控制

系统 SHALL 提供 Animatic 预览的播放控制功能。

#### Scenario: 基本播放控制
- **WHEN** Animatic 预览面板打开
- **THEN** 提供：播放/暂停、进度条拖拽、当前时间/总时长显示
- **AND** 点击 Shot 列表中的项可跳转到该 Shot 的播放位置

#### Scenario: 速度控制
- **WHEN** 用户调整播放速度
- **THEN** 支持 0.5x、1x、1.5x、2x 倍速播放

### Requirement: Animatic 导出（可选）

系统 MAY 支持将 Animatic 预览导出为视频文件。

#### Scenario: 后端导出
- **WHEN** 用户点击"导出 Animatic"
- **THEN** 系统通过后端 FFmpeg 将分镜图 + 配音合成为低保真视频
- **AND** 提供下载链接
