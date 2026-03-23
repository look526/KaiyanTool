<!DOCTYPE html>

<html class="dark" lang="zh-CN"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>The Digital Curator | Script Intel AI Editor</title>
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&amp;family=Manrope:wght@400;500;600;700&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<script id="tailwind-config">
      tailwind.config = {
        darkMode: "class",
        theme: {
          extend: {
            colors: {
              "tertiary-fixed-dim": "#ef6eff",
              "on-tertiary-fixed-variant": "#660075",
              "secondary-fixed-dim": "#81ccff",
              "surface-container-low": "#0c1326",
              "tertiary": "#ec63ff",
              "tertiary-dim": "#ec63ff",
              "on-tertiary": "#3d0047",
              "on-error-container": "#ffb2b9",
              "error": "#ff6e84",
              "outline": "#6f758b",
              "secondary-container": "#006591",
              "on-tertiary-container": "#19001e",
              "secondary-dim": "#17a8ec",
              "primary": "#ba9eff",
              "inverse-on-surface": "#4f5469",
              "inverse-surface": "#faf8ff",
              "outline-variant": "#41475b",
              "tertiary-container": "#de4bf4",
              "surface-tint": "#ba9eff",
              "surface-dim": "#070d1f",
              "primary-container": "#ae8dff",
              "on-surface": "#dfe4fe",
              "primary-fixed": "#ae8dff",
              "inverse-primary": "#6e3bd7",
              "primary-dim": "#8455ef",
              "on-secondary-fixed-variant": "#00567c",
              "background": "#070d1f",
              "on-primary-fixed": "#000000",
              "on-background": "#dfe4fe",
              "primary-fixed-dim": "#a27cff",
              "error-dim": "#d73357",
              "surface-container": "#11192e",
              "on-primary": "#39008c",
              "on-secondary-fixed": "#003853",
              "surface-variant": "#1c253e",
              "on-surface-variant": "#a5aac2",
              "tertiary-fixed": "#f487ff",
              "on-secondary": "#003047",
              "surface-container-high": "#171f36",
              "on-secondary-container": "#f3f8ff",
              "secondary-fixed": "#a4d8ff",
              "surface-container-lowest": "#000000",
              "on-tertiary-fixed": "#300038"
            },
            fontFamily: {
              "headline": ["Plus Jakarta Sans"],
              "body": ["Manrope"],
              "label": ["Manrope"]
            },
            borderRadius: {"DEFAULT": "1rem", "lg": "2rem", "xl": "3rem", "full": "9999px"},
          },
        },
      }
    </script>
<style>
        body {
            background-color: #070d1f;
            color: #dfe4fe;
            overflow: hidden;
        }
        .material-symbols-outlined {
            font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
        }
        .glass-panel {
            background: rgba(28, 37, 62, 0.4);
            backdrop-filter: blur(40px);
            border: 1px solid rgba(255, 255, 255, 0.1);
        }
        .editor-container {
            font-family: 'Fira Code', monospace;
        }
        .line-numbers {
            color: #41475b;
            text-align: right;
            padding-right: 1rem;
            user-select: none;
        }
        .syntax-keyword { color: #ec63ff; }
        .syntax-string { color: #34b5fa; }
        .syntax-comment { color: #6f758b; font-style: italic; }
        .syntax-entity { color: #ba9eff; font-weight: bold; }
        
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(186, 158, 255, 0.2); border-radius: 10px; }
        ::-webkit-scrollbar-thumb:hover { background: rgba(186, 158, 255, 0.4); }
    </style>
</head>
<body class="font-body selection:bg-primary/30">
<!-- SIDE NAV BAR (The Blueprint Rail) -->
<nav class="fixed left-0 top-0 h-full z-50 py-6 flex flex-col items-center bg-[#070d1f]/60 backdrop-blur-3xl h-screen w-20 border-r border-[#ffffff]/10 shadow-[0_0_40px_rgba(186,158,255,0.08)] font-['Plus_Jakarta_Sans'] antialiased tracking-tight">
<div class="mb-10 text-xl font-bold tracking-tighter text-[#ba9eff]">
<span class="material-symbols-outlined text-3xl" data-icon="auto_awesome">auto_awesome</span>
</div>
<div class="flex flex-col gap-6 items-center flex-1">
<!-- Active: Editor -->
<button class="w-12 h-12 flex items-center justify-center bg-[#ae8dff]/20 text-[#ba9eff] rounded-xl scale-110 transition-all duration-200">
<span class="material-symbols-outlined" data-icon="edit_note">edit_note</span>
</button>
<button class="w-12 h-12 flex items-center justify-center text-slate-400 opacity-60 hover:bg-[#ae8dff]/10 hover:text-[#ba9eff] transition-all scale-95 active:scale-90 duration-200">
<span class="material-symbols-outlined" data-icon="analytics">analytics</span>
</button>
<button class="w-12 h-12 flex items-center justify-center text-slate-400 opacity-60 hover:bg-[#ae8dff]/10 hover:text-[#ba9eff] transition-all scale-95 active:scale-90 duration-200">
<span class="material-symbols-outlined" data-icon="auto_awesome">auto_awesome</span>
</button>
<button class="w-12 h-12 flex items-center justify-center text-slate-400 opacity-60 hover:bg-[#ae8dff]/10 hover:text-[#ba9eff] transition-all scale-95 active:scale-90 duration-200">
<span class="material-symbols-outlined" data-icon="transform">transform</span>
</button>
<button class="w-12 h-12 flex items-center justify-center text-slate-400 opacity-60 hover:bg-[#ae8dff]/10 hover:text-[#ba9eff] transition-all scale-95 active:scale-90 duration-200">
<span class="material-symbols-outlined" data-icon="folder_open">folder_open</span>
</button>
</div>
<button class="w-12 h-12 flex items-center justify-center text-slate-400 opacity-60 hover:bg-[#ae8dff]/10 hover:text-[#ba9eff] transition-all scale-95 active:scale-90 duration-200">
<span class="material-symbols-outlined" data-icon="settings">settings</span>
</button>
</nav>
<!-- TOP NAV BAR -->
<header class="fixed top-0 right-0 left-20 z-40 flex justify-between items-center px-8 bg-[#070d1f]/40 backdrop-blur-md h-16 border-b border-white/5">
<div class="flex items-center gap-6">
<h1 class="text-lg font-black bg-gradient-to-r from-[#ba9eff] to-[#ec63ff] bg-clip-text text-transparent font-headline">剧本编辑器</h1>
<div class="h-4 w-[1px] bg-outline-variant/30"></div>
<div class="flex items-center gap-2 text-on-surface-variant text-xs font-medium uppercase tracking-widest">
<span class="w-2 h-2 rounded-full bg-secondary shadow-[0_0_8px_rgba(52,181,250,0.6)]"></span>
                已自动保存 14:02
            </div>
</div>
<div class="flex items-center gap-4">
<div class="relative group">
<button class="flex items-center gap-2 px-4 py-1.5 rounded-full border border-outline-variant/20 bg-surface-container-low text-xs font-semibold hover:bg-surface-variant transition-colors">
                    标准科幻剧本模板
                    <span class="material-symbols-outlined text-sm" data-icon="expand_more">expand_more</span>
</button>
</div>
<button class="px-4 py-1.5 rounded-full bg-surface-variant text-on-surface text-xs font-bold hover:bg-primary/20 transition-all border border-outline-variant/10">
                分享
            </button>
<button class="px-5 py-1.5 rounded-full bg-gradient-to-r from-primary to-primary-dim text-on-primary text-xs font-bold hover:scale-105 transition-all shadow-lg shadow-primary/10">
                导出项目
            </button>
<div class="flex items-center gap-2 ml-2">
<span class="material-symbols-outlined p-2 text-on-surface-variant hover:text-primary transition-colors cursor-pointer" data-icon="notifications">notifications</span>
<div class="w-8 h-8 rounded-full bg-primary-container/20 border border-primary/30 flex items-center justify-center overflow-hidden">
<img alt="User" data-alt="Cyberpunk style user profile avatar" src="https://lh3.googleusercontent.com/aida-public/AB6AXuALfu-8DDEemBYklI7DWGvKytSmBsHdk6wxdYUZ1POz4J17Tu7MC7Z9JI5CnYWp7ftB7lkMp9r0RLQG-arRBNFQI6qkQtYDEg5KB7QUTyVK6ND1NpJISLkN05KbcHMbchFlKtrFPE8t16bPIsujqwGA89PNjypw6kpOJLtqNhxrrNe_047Pabg6eRDdnRrLfaBPa9seyraPuPs5kxK0MdvDctgKEMx4KoYEmGoqGbplsYTMQ47QP2kACWqgG_67Cwa6wv70NUw--1Q"/>
</div>
</div>
</div>
</header>
<!-- MAIN LAYOUT WRAPPER -->
<main class="ml-20 pt-16 h-screen flex overflow-hidden">
<!-- COLUMN 1: FLOW SIDEBAR -->
<aside class="w-64 bg-surface-container-low/50 border-r border-white/5 flex flex-col p-6 overflow-y-auto">
<h3 class="text-xs font-black uppercase tracking-[0.2em] text-on-surface-variant mb-8 flex items-center gap-2">
<span class="material-symbols-outlined text-sm" data-icon="account_tree">account_tree</span>
                创作流程
            </h3>
<div class="space-y-6">
<!-- Step 1: Completed -->
<div class="relative pl-8 group cursor-pointer">
<div class="absolute left-0 top-1 w-4 h-4 rounded-full border-2 border-secondary bg-secondary flex items-center justify-center">
<span class="material-symbols-outlined text-[10px] text-on-primary font-bold" data-icon="check">check</span>
</div>
<div class="absolute left-[7px] top-6 w-[2px] h-10 bg-secondary/30"></div>
<p class="text-sm font-bold text-on-surface">剧本</p>
<p class="text-[10px] text-on-surface-variant/60 font-medium">大纲已确认</p>
</div>
<!-- Step 2: Active -->
<div class="relative pl-8 group cursor-pointer">
<div class="absolute left-0 top-1 w-4 h-4 rounded-full border-2 border-primary bg-primary/20 ring-4 ring-primary/10"></div>
<div class="absolute left-[7px] top-6 w-[2px] h-10 bg-outline-variant/20"></div>
<p class="text-sm font-bold text-primary">故事线</p>
<p class="text-[10px] text-primary/60 font-medium">进行中 (42%)</p>
</div>
<!-- Step 3: Pending -->
<div class="relative pl-8 opacity-40 hover:opacity-100 transition-opacity cursor-pointer">
<div class="absolute left-0 top-1 w-4 h-4 rounded-full border-2 border-outline-variant"></div>
<div class="absolute left-[7px] top-6 w-[2px] h-10 bg-outline-variant/20"></div>
<p class="text-sm font-bold text-on-surface">角色</p>
<p class="text-[10px] text-on-surface-variant/60 font-medium">等待开始</p>
</div>
<!-- Step 4: Pending -->
<div class="relative pl-8 opacity-40 hover:opacity-100 transition-opacity cursor-pointer">
<div class="absolute left-0 top-1 w-4 h-4 rounded-full border-2 border-outline-variant"></div>
<div class="absolute left-[7px] top-6 w-[2px] h-10 bg-outline-variant/20"></div>
<p class="text-sm font-bold text-on-surface">物品</p>
<p class="text-[10px] text-on-surface-variant/60 font-medium">未锁定</p>
</div>
<!-- Step 5: Pending -->
<div class="relative pl-8 opacity-40 hover:opacity-100 transition-opacity cursor-pointer">
<div class="absolute left-0 top-1 w-4 h-4 rounded-full border-2 border-outline-variant"></div>
<div class="absolute left-[7px] top-6 w-[2px] h-10 bg-outline-variant/20"></div>
<p class="text-sm font-bold text-on-surface">场景</p>
<p class="text-[10px] text-on-surface-variant/60 font-medium">资源库构建中</p>
</div>
<!-- Step 6: Pending -->
<div class="relative pl-8 opacity-40 hover:opacity-100 transition-opacity cursor-pointer">
<div class="absolute left-0 top-1 w-4 h-4 rounded-full border-2 border-outline-variant"></div>
<p class="text-sm font-bold text-on-surface">分镜</p>
<p class="text-[10px] text-on-surface-variant/60 font-medium">预览渲染</p>
</div>
</div>
<div class="mt-auto pt-8">
<div class="glass-panel rounded-2xl p-4 bg-tertiary/5 border-tertiary/10">
<p class="text-[10px] font-bold text-tertiary uppercase tracking-wider mb-2">AI 洞察</p>
<p class="text-xs text-on-surface/80 leading-relaxed">当前剧情张力正在上升，建议在第三场戏加入冲突元素。</p>
</div>
</div>
</aside>
<!-- COLUMN 2: MAIN EDITOR -->
<section class="flex-1 flex flex-col relative bg-surface-container-lowest">
<!-- EDITOR TOOLS -->
<div class="flex items-center gap-4 px-8 py-3 border-b border-white/5 bg-surface/40 backdrop-blur-sm">
<div class="flex items-center gap-2 mr-4">
<button class="p-2 text-on-surface-variant hover:text-primary transition-colors"><span class="material-symbols-outlined text-lg" data-icon="format_bold">format_bold</span></button>
<button class="p-2 text-on-surface-variant hover:text-primary transition-colors"><span class="material-symbols-outlined text-lg" data-icon="format_italic">format_italic</span></button>
<button class="p-2 text-on-surface-variant hover:text-primary transition-colors"><span class="material-symbols-outlined text-lg" data-icon="format_list_bulleted">format_list_bulleted</span></button>
</div>
<div class="h-4 w-[1px] bg-outline-variant/30"></div>
<button class="flex items-center gap-2 px-3 py-1 rounded-lg bg-primary/10 text-primary text-xs font-bold hover:bg-primary/20 transition-all">
<span class="material-symbols-outlined text-sm" data-icon="auto_fix_high">auto_fix_high</span>
                    AI 改写
                </button>
<button class="flex items-center gap-2 px-3 py-1 rounded-lg bg-secondary/10 text-secondary text-xs font-bold hover:bg-secondary/20 transition-all">
<span class="material-symbols-outlined text-sm" data-icon="insights">insights</span>
                    深度分析
                </button>
</div>
<!-- MONACO STYLE EDITOR -->
<div class="flex-1 overflow-y-auto p-10 font-mono editor-container">
<div class="max-w-3xl mx-auto space-y-1">
<div class="flex">
<div class="line-numbers text-xs">001</div>
<div class="syntax-comment">// 场景：新东京 - 2088 霓虹港口</div>
</div>
<div class="flex">
<div class="line-numbers text-xs">002</div>
<div class="syntax-keyword">地点:</div>
<div class="ml-2 text-on-surface">港口 3 号起重机下方 - 夜晚</div>
</div>
<div class="flex">
<div class="line-numbers text-xs">003</div>
<div> </div>
</div>
<div class="flex">
<div class="line-numbers text-xs">004</div>
<div class="syntax-entity">[卡尔]</div>
<div class="ml-2 text-on-surface">正蹲在阴影里。雨水打在他那满是刮痕的赛博义肢上，发出清脆的响声。</div>
</div>
<div class="flex">
<div class="line-numbers text-xs">005</div>
<div> </div>
</div>
<div class="flex">
<div class="line-numbers text-xs">006</div>
<div class="syntax-entity">卡尔:</div>
<div class="ml-2 syntax-string">“只要能在 0400 时刻前避开扫描，我们就能拿到那块芯片。”</div>
</div>
<div class="flex">
<div class="line-numbers text-xs">007</div>
<div> </div>
</div>
<div class="flex">
<div class="line-numbers text-xs">008</div>
<div class="syntax-entity">[莎拉]</div>
<div class="ml-2 text-on-surface">通过神经链路回复。她的声音带着一丝不易察觉的颤抖。</div>
</div>
<div class="flex">
<div class="line-numbers text-xs">009</div>
<div> </div>
</div>
<div class="flex">
<div class="line-numbers text-xs">010</div>
<div class="syntax-entity">莎拉 (OS):</div>
<div class="ml-2 syntax-string">“扫描器不仅仅是物理层面的，卡尔。我能感觉到 AI 正在这个频段巡逻。”</div>
</div>
<div class="flex">
<div class="line-numbers text-xs">011</div>
<div> </div>
</div>
<div class="flex">
<div class="line-numbers text-xs">012</div>
<div class="syntax-keyword">动作:</div>
<div class="ml-2 text-on-surface">远处传来巨大的机械轰鸣声。一道强烈的深蓝色扫描光束扫过集装箱堆栈。</div>
</div>
<div class="flex">
<div class="line-numbers text-xs">013</div>
<div class="bg-primary/10 border-l-2 border-primary pl-1 w-full flex">
<div class="syntax-comment">/* AI 建议：此处增加环境音效描写以增强紧张感 */</div>
</div>
</div>
<!-- Mocking cursor -->
<div class="flex">
<div class="line-numbers text-xs">014</div>
<div class="text-on-surface">卡尔紧握着电磁手枪。</div>
<div class="w-2 h-5 bg-primary animate-pulse ml-0.5"></div>
</div>
</div>
</div>
<!-- FLOATING ACTIONS -->
<div class="absolute bottom-8 right-8 flex flex-col gap-3">
<button class="w-14 h-14 rounded-2xl glass-panel flex items-center justify-center text-primary shadow-2xl hover:scale-110 transition-transform">
<span class="material-symbols-outlined text-3xl" data-icon="bolt">bolt</span>
</button>
</div>
</section>
<!-- COLUMN 3: AI ASSISTANT PANEL -->
<aside class="w-80 glass-panel border-l-0 border-y-0 flex flex-col">
<div class="p-6 border-b border-white/5">
<h2 class="text-sm font-black flex items-center gap-2 text-primary font-headline tracking-tight">
<span class="material-symbols-outlined" data-icon="auto_awesome">auto_awesome</span>
                    AI 剧本助手
                </h2>
</div>
<div class="flex-1 overflow-y-auto p-6 space-y-8">
<!-- Analysis Mode -->
<div>
<p class="text-[10px] font-black uppercase tracking-[0.15em] text-on-surface-variant mb-4">剧本解析模式</p>
<div class="grid grid-cols-2 gap-2 p-1 bg-surface-container-lowest rounded-xl border border-white/5">
<button class="py-2 text-[10px] font-bold rounded-lg bg-surface-variant text-primary shadow-sm">AI Intelligent</button>
<button class="py-2 text-[10px] font-bold rounded-lg text-on-surface-variant hover:text-on-surface transition-colors">Quick Regex</button>
</div>
</div>
<!-- Novel to Script Config -->
<div>
<p class="text-[10px] font-black uppercase tracking-[0.15em] text-on-surface-variant mb-4">小说转剧本格式配置</p>
<div class="space-y-4">
<div class="flex items-center justify-between">
<label class="text-xs text-on-surface/70">预期集数</label>
<input class="w-16 bg-surface-container-lowest border-none rounded-lg text-xs text-primary font-bold focus:ring-1 focus:ring-primary/40" type="number" value="12"/>
</div>
<div class="flex items-center justify-between">
<label class="text-xs text-on-surface/70">单集时长 (min)</label>
<input class="w-16 bg-surface-container-lowest border-none rounded-lg text-xs text-primary font-bold focus:ring-1 focus:ring-primary/40" type="number" value="45"/>
</div>
</div>
</div>
<!-- AI Action Buttons -->
<div class="space-y-2">
<p class="text-[10px] font-black uppercase tracking-[0.15em] text-on-surface-variant mb-4">核心指令</p>
<div class="grid grid-cols-2 gap-3">
<button class="flex flex-col items-center justify-center p-3 rounded-xl bg-surface-container-high border border-white/5 hover:border-primary/40 hover:bg-primary/5 transition-all group">
<span class="material-symbols-outlined text-primary mb-1 group-hover:scale-110 transition-transform" data-icon="add_circle">add_circle</span>
<span class="text-[10px] font-bold">AI 续写</span>
</button>
<button class="flex flex-col items-center justify-center p-3 rounded-xl bg-surface-container-high border border-white/5 hover:border-primary/40 hover:bg-primary/5 transition-all group">
<span class="material-symbols-outlined text-secondary mb-1 group-hover:scale-110 transition-transform" data-icon="history_edu">history_edu</span>
<span class="text-[10px] font-bold">AI 改写</span>
</button>
<button class="flex flex-col items-center justify-center p-3 rounded-xl bg-surface-container-high border border-white/5 hover:border-primary/40 hover:bg-primary/5 transition-all group">
<span class="material-symbols-outlined text-tertiary mb-1 group-hover:scale-110 transition-transform" data-icon="magic_button">magic_button</span>
<span class="text-[10px] font-bold">AI 优化</span>
</button>
<button class="flex flex-col items-center justify-center p-3 rounded-xl bg-surface-container-high border border-white/5 hover:border-primary/40 hover:bg-primary/5 transition-all group">
<span class="material-symbols-outlined text-on-surface-variant mb-1 group-hover:scale-110 transition-transform" data-icon="swap_horiz">swap_horiz</span>
<span class="text-[10px] font-bold">格式转换</span>
</button>
<button class="flex flex-col items-center justify-center p-3 rounded-xl bg-surface-container-high border border-white/5 hover:border-primary/40 hover:bg-primary/5 transition-all group">
<span class="material-symbols-outlined text-on-surface-variant mb-1 group-hover:scale-110 transition-transform" data-icon="query_stats">query_stats</span>
<span class="text-[10px] font-bold">剧本解析</span>
</button>
<button class="flex flex-col items-center justify-center p-3 rounded-xl bg-surface-container-high border border-white/5 hover:border-primary/40 hover:bg-primary/5 transition-all group">
<span class="material-symbols-outlined text-on-surface-variant mb-1 group-hover:scale-110 transition-transform" data-icon="landscape">landscape</span>
<span class="text-[10px] font-bold">场景优化</span>
</button>
</div>
</div>
</div>
<!-- Footer AI Bar -->
<div class="p-6 bg-surface-container-high/80 backdrop-blur-md border-t border-white/5 space-y-4">
<div class="relative">
<select class="w-full bg-surface-container-lowest border-none rounded-xl py-2.5 px-4 text-xs font-bold text-on-surface/80 appearance-none focus:ring-1 focus:ring-primary/30">
<option>Curator AI v4.2 (Legacy)</option>
<option selected="">Sora Intelligence v1.0</option>
<option>GPT-4 Editorial Pro</option>
</select>
<span class="material-symbols-outlined absolute right-3 top-2.5 pointer-events-none text-on-surface-variant" data-icon="unfold_more">unfold_more</span>
</div>
<button class="w-full flex items-center justify-center gap-2 py-3 rounded-xl glass-panel hover:bg-surface-variant transition-colors group">
<span class="material-symbols-outlined text-lg group-hover:scale-110 transition-transform" data-icon="fullscreen">fullscreen</span>
<span class="text-xs font-bold uppercase tracking-widest">进入全屏编辑</span>
</button>
</div>
</aside>
</main>
<!-- Background Decoration -->
<div class="fixed top-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px] pointer-events-none -z-10"></div>
<div class="fixed bottom-[-10%] left-[5%] w-[30%] h-[30%] bg-tertiary/5 rounded-full blur-[100px] pointer-events-none -z-10"></div>
</body></html>