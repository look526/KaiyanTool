<!DOCTYPE html>

<html class="dark" lang="zh-CN"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>Kaiyan AI - 项目列表</title>
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&amp;family=Manrope:wght@400;500;600&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<script id="tailwind-config">
      tailwind.config = {
        darkMode: "class",
        theme: {
          extend: {
            colors: {
              "primary": "#ba9eff",
              "tertiary": "#ec63ff",
              "surface-tint": "#ba9eff",
              "surface-variant": "#1c253e",
              "on-secondary-fixed-variant": "#00567c",
              "on-secondary-fixed": "#003853",
              "primary-container": "#ae8dff",
              "on-tertiary-fixed": "#300038",
              "on-background": "#dfe4fe",
              "secondary-container": "#006591",
              "on-surface-variant": "#a5aac2",
              "on-secondary": "#003047",
              "error": "#ff6e84",
              "primary-dim": "#8455ef",
              "on-surface": "#dfe4fe",
              "surface-container-lowest": "#000000",
              "surface-container": "#11192e",
              "outline-variant": "#41475b",
              "tertiary-fixed": "#f487ff",
              "secondary-dim": "#17a8ec",
              "secondary-fixed-dim": "#81ccff",
              "on-error-container": "#ffb2b9",
              "on-primary": "#39008c",
              "inverse-on-surface": "#4f5469",
              "surface-container-high": "#171f36",
              "outline": "#6f758b",
              "on-primary-fixed": "#000000",
              "primary-fixed": "#ae8dff",
              "on-primary-container": "#2b006e",
              "inverse-primary": "#6e3bd7",
              "error-container": "#a70138",
              "tertiary-container": "#de4bf4",
              "on-primary-fixed-variant": "#370086",
              "surface": "#070d1f",
              "surface-container-low": "#0c1326",
              "surface-container-highest": "#1c253e",
              "background": "#070d1f",
              "on-tertiary-container": "#19001e",
              "inverse-surface": "#faf8ff",
              "tertiary-dim": "#ec63ff",
              "error-dim": "#d73357",
              "on-tertiary": "#3d0047",
              "surface-bright": "#222b47",
              "surface-dim": "#070d1f",
              "secondary-fixed": "#a4d8ff",
              "on-tertiary-fixed-variant": "#660075",
              "primary-fixed-dim": "#a27cff",
              "tertiary-fixed-dim": "#ef6eff",
              "on-secondary-container": "#f3f8ff",
              "on-error": "#490013",
              "secondary": "#34b5fa"
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
      .material-symbols-outlined {
        font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
      }
      .glass-card {
        background: rgba(28, 37, 62, 0.4);
        backdrop-filter: blur(30px);
        border: 1px solid rgba(65, 71, 91, 0.15);
      }
      .glass-button-primary {
        background: linear-gradient(135deg, #ba9eff, #8455ef);
        box-shadow: 0 4px 15px rgba(186, 158, 255, 0.3);
      }
      .tonal-shift-surface-container-low {
        background-color: #0c1326;
      }
    </style>
</head>
<body class="bg-surface text-on-surface font-body selection:bg-primary/30 min-h-screen">
<!-- SideNavBar (Execution from JSON & Requirements) -->
<aside class="fixed left-0 top-0 h-full w-64 bg-[#070d1f]/60 backdrop-blur-2xl border-r border-[#ffffff]/10 p-6 z-50 flex flex-col font-['Plus_Jakarta_Sans'] tracking-tight shadow-[40px_0_40px_rgba(186,158,255,0.08)]">
<div class="mb-10 flex items-center gap-3">
<div class="w-10 h-10 rounded-xl bg-gradient-to-br from-[#ba9eff] to-[#ae8dff] flex items-center justify-center text-on-primary">
<span class="material-symbols-outlined" style="font-variation-settings: 'FILL' 1;">auto_awesome</span>
</div>
<div>
<h1 class="text-2xl font-bold bg-gradient-to-br from-[#ba9eff] to-[#ae8dff] bg-clip-text text-transparent">Kaiyan AI</h1>
<p class="text-[10px] text-on-surface-variant uppercase tracking-[0.2em]">Digital Curator</p>
</div>
</div>
<nav class="flex-1 space-y-1">
<!-- Active Item: 我的项目 -->
<a class="flex items-center gap-3 px-4 py-3 bg-[#ae8dff]/20 text-[#ba9eff] rounded-xl shadow-[0_0_15px_rgba(174,141,255,0.3)] transition-all duration-300" href="#">
<span class="material-symbols-outlined">folder_open</span>
<span class="font-medium text-sm">我的项目</span>
</a>
<a class="flex items-center gap-3 px-4 py-3 text-[#ffffff]/60 hover:text-[#ffffff] hover:bg-[#ffffff]/5 rounded-xl transition-all duration-300" href="#">
<span class="material-symbols-outlined">inventory_2</span>
<span class="font-medium text-sm">素材库</span>
</a>
<a class="flex items-center gap-3 px-4 py-3 text-[#ffffff]/60 hover:text-[#ffffff] hover:bg-[#ffffff]/5 rounded-xl transition-all duration-300" href="#">
<span class="material-symbols-outlined">image</span>
<span class="font-medium text-sm">AI图像</span>
</a>
<a class="flex items-center gap-3 px-4 py-3 text-[#ffffff]/60 hover:text-[#ffffff] hover:bg-[#ffffff]/5 rounded-xl transition-all duration-300" href="#">
<span class="material-symbols-outlined">movie</span>
<span class="font-medium text-sm">AI视频</span>
</a>
<a class="flex items-center gap-3 px-4 py-3 text-[#ffffff]/60 hover:text-[#ffffff] hover:bg-[#ffffff]/5 rounded-xl transition-all duration-300" href="#">
<span class="material-symbols-outlined">analytics</span>
<span class="font-medium text-sm">数据分析</span>
</a>
<a class="flex items-center gap-3 px-4 py-3 text-[#ffffff]/60 hover:text-[#ffffff] hover:bg-[#ffffff]/5 rounded-xl transition-all duration-300" href="#">
<span class="material-symbols-outlined">description</span>
<span class="font-medium text-sm">文档管理</span>
</a>
<a class="flex items-center gap-3 px-4 py-3 text-[#ffffff]/60 hover:text-[#ffffff] hover:bg-[#ffffff]/5 rounded-xl transition-all duration-300" href="#">
<span class="material-symbols-outlined">group</span>
<span class="font-medium text-sm">团队管理</span>
</a>
<a class="flex items-center gap-3 px-4 py-3 text-[#ffffff]/60 hover:text-[#ffffff] hover:bg-[#ffffff]/5 rounded-xl transition-all duration-300" href="#">
<span class="material-symbols-outlined">hub</span>
<span class="font-medium text-sm">AI提供商</span>
</a>
<a class="flex items-center gap-3 px-4 py-3 text-[#ffffff]/60 hover:text-[#ffffff] hover:bg-[#ffffff]/5 rounded-xl transition-all duration-300" href="#">
<span class="material-symbols-outlined">settings</span>
<span class="font-medium text-sm">设置</span>
</a>
</nav>
<div class="pt-6 border-t border-[#ffffff]/5 space-y-1">
<button class="w-full flex items-center justify-between px-4 py-3 text-[#ffffff]/60 hover:text-[#ffffff] transition-all">
<div class="flex items-center gap-3">
<span class="material-symbols-outlined">dark_mode</span>
<span class="text-sm">深色模式</span>
</div>
<div class="w-8 h-4 bg-surface-container-highest rounded-full relative">
<div class="absolute right-0.5 top-0.5 w-3 h-3 bg-primary rounded-full"></div>
</div>
</button>
<a class="flex items-center gap-3 px-4 py-3 text-[#ffffff]/60 hover:text-[#ffffff] transition-all" href="#">
<span class="material-symbols-outlined">help</span>
<span class="text-sm">帮助中心</span>
</a>
<a class="flex items-center gap-3 px-4 py-3 text-error/80 hover:text-error transition-all" href="#">
<span class="material-symbols-outlined">logout</span>
<span class="text-sm">退出登录</span>
</a>
</div>
</aside>
<!-- Main Content Canvas -->
<main class="ml-64 p-8 pt-24 min-h-screen">
<!-- TopNavBar (Execution from JSON & Requirements) -->
<header class="fixed top-0 right-0 left-64 h-20 bg-[#070d1f]/40 backdrop-blur-md flex justify-between items-center px-8 z-40 font-['Plus_Jakarta_Sans'] font-medium">
<div class="flex items-center gap-4">
<h2 class="text-xl font-bold text-on-surface">项目列表</h2>
<div class="h-6 w-[1px] bg-outline-variant/30"></div>
<div class="flex items-center gap-2 text-on-surface-variant text-sm">
<span class="material-symbols-outlined text-sm">trending_up</span>
<span>状态统计</span>
</div>
</div>
<div class="flex items-center gap-6">
<div class="flex items-center bg-surface-container-low px-4 py-2 rounded-xl border border-outline-variant/10 focus-within:ring-1 focus-within:ring-[#ba9eff]/50 transition-all">
<span class="material-symbols-outlined text-on-surface-variant mr-2">search</span>
<input class="bg-transparent border-none focus:ring-0 text-sm w-64 placeholder:text-on-surface-variant/50" placeholder="搜索项目..." type="text"/>
</div>
<div class="flex items-center gap-3">
<button class="p-2 text-on-surface-variant hover:text-primary transition-colors">
<span class="material-symbols-outlined">notifications</span>
</button>
<button class="p-2 text-on-surface-variant hover:text-primary transition-colors">
<span class="material-symbols-outlined">grid_view</span>
</button>
<button class="p-2 text-on-surface-variant hover:text-primary transition-colors">
<span class="material-symbols-outlined">account_circle</span>
</button>
</div>
</div>
</header>
<!-- Page Header Area -->
<section class="mb-10">
<h1 class="text-4xl font-extrabold font-headline tracking-tight text-on-surface mb-2">我的项目</h1>
<p class="text-on-surface-variant font-medium">管理您的创作项目</p>
</section>
<!-- Statistics Grid (Requirement 3) -->
<div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
<!-- All Projects -->
<div class="glass-card p-6 rounded-lg relative overflow-hidden group">
<div class="absolute -right-4 -top-4 w-24 h-24 bg-primary/10 rounded-full blur-3xl group-hover:bg-primary/20 transition-all"></div>
<div class="flex items-center gap-5">
<div class="w-14 h-14 rounded-2xl bg-primary/20 flex items-center justify-center text-primary">
<span class="material-symbols-outlined text-3xl" style="font-variation-settings: 'FILL' 1;">dataset</span>
</div>
<div>
<p class="text-on-surface-variant text-sm font-label tracking-wider mb-1">全部项目</p>
<h3 class="text-3xl font-bold font-headline">1</h3>
</div>
</div>
</div>
<!-- In Progress -->
<div class="glass-card p-6 rounded-lg relative overflow-hidden group">
<div class="absolute -right-4 -top-4 w-24 h-24 bg-secondary/10 rounded-full blur-3xl group-hover:bg-secondary/20 transition-all"></div>
<div class="flex items-center gap-5">
<div class="w-14 h-14 rounded-2xl bg-secondary/20 flex items-center justify-center text-secondary">
<span class="material-symbols-outlined text-3xl" style="font-variation-settings: 'FILL' 1;">pending</span>
</div>
<div>
<p class="text-on-surface-variant text-sm font-label tracking-wider mb-1">进行中</p>
<h3 class="text-3xl font-bold font-headline">0</h3>
</div>
</div>
</div>
<!-- Completed -->
<div class="glass-card p-6 rounded-lg relative overflow-hidden group">
<div class="absolute -right-4 -top-4 w-24 h-24 bg-tertiary/10 rounded-full blur-3xl group-hover:bg-tertiary/20 transition-all"></div>
<div class="flex items-center gap-5">
<div class="w-14 h-14 rounded-2xl bg-tertiary/20 flex items-center justify-center text-tertiary">
<span class="material-symbols-outlined text-3xl" style="font-variation-settings: 'FILL' 1;">check_circle</span>
</div>
<div>
<p class="text-on-surface-variant text-sm font-label tracking-wider mb-1">已完成</p>
<h3 class="text-3xl font-bold font-headline">0</h3>
</div>
</div>
</div>
</div>
<!-- Filters & Layout Toggle (Requirement 4 & 7) -->
<div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
<div class="flex flex-wrap items-center gap-4">
<div class="relative min-w-[140px]">
<select class="w-full appearance-none bg-surface-container-high border border-outline-variant/20 rounded-xl px-4 py-2 text-sm text-on-surface focus:ring-primary/50 focus:border-primary">
<option>全部类型</option>
<option>图像生成</option>
<option>视频合成</option>
</select>
<span class="material-symbols-outlined absolute right-3 top-2.5 text-on-surface-variant pointer-events-none text-sm">expand_more</span>
</div>
<div class="relative min-w-[140px]">
<select class="w-full appearance-none bg-surface-container-high border border-outline-variant/20 rounded-xl px-4 py-2 text-sm text-on-surface focus:ring-primary/50 focus:border-primary">
<option>全部状态</option>
<option>草稿</option>
<option>运行中</option>
<option>已归档</option>
</select>
<span class="material-symbols-outlined absolute right-3 top-2.5 text-on-surface-variant pointer-events-none text-sm">expand_more</span>
</div>
</div>
<div class="flex items-center gap-3">
<div class="flex bg-surface-container-low p-1 rounded-xl border border-outline-variant/10">
<button class="p-2 rounded-lg bg-surface-container-highest text-primary shadow-sm">
<span class="material-symbols-outlined">grid_view</span>
</button>
<button class="p-2 rounded-lg text-on-surface-variant hover:text-on-surface">
<span class="material-symbols-outlined">view_list</span>
</button>
</div>
<button class="glass-button-primary flex items-center gap-2 px-6 py-2.5 rounded-xl text-on-primary font-bold transition-all hover:scale-105 active:scale-95">
<span class="material-symbols-outlined">add</span>
<span>新建项目</span>
</button>
</div>
</div>
<!-- Project Grid (Requirement 5) -->
<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
<!-- Project Card: Test -->
<div class="glass-card group rounded-lg overflow-hidden flex flex-col hover:shadow-[0_20px_40px_rgba(186,158,255,0.15)] transition-all duration-500">
<div class="relative h-48 w-full overflow-hidden bg-surface-container-high">
<img class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-60" data-alt="Abstract colorful gradient pattern background" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCWsN5ExFUAZLHwHZ3QbFGNwVn13A-Zd0wrILN2W6hRmmdOyKW6xvKMR_9sjA_Z_M1AiP-GvtfmmVSWT-6oN8BcprSexwMtPa_MSwxNuYEZU0xDN3pnbMl750aEWbgHypPnloyGoyBswOWL8TtxtAXxWGxuMIK19pgSk4LhqqIDVlzHgwDxtJbamkZYSNC9xcP80ZvkWqZOIpbSpKICSp8EDYvyJ2sWmvgSHjHYHv9X-x2ceVIHzzqllGt61YNCmzhBLlxLHO9IFEE"/>
<div class="absolute inset-0 bg-gradient-to-t from-surface-container-highest to-transparent"></div>
<div class="absolute top-4 left-4">
<span class="bg-primary/20 backdrop-blur-md text-primary px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase">草稿</span>
</div>
</div>
<div class="p-6 flex-1 flex flex-col justify-between">
<div>
<div class="flex justify-between items-start mb-3">
<h4 class="text-xl font-bold font-headline text-on-surface">Test</h4>
<button class="text-on-surface-variant hover:text-primary transition-colors">
<span class="material-symbols-outlined">more_vert</span>
</button>
</div>
<p class="text-on-surface-variant text-sm mb-6 leading-relaxed">暂无描述</p>
</div>
<div class="flex items-center justify-between pt-4 border-t border-outline-variant/10">
<div class="flex items-center gap-2 text-on-surface-variant">
<span class="material-symbols-outlined text-[16px]">calendar_today</span>
<span class="text-xs font-label">2024-05-24</span>
</div>
<div class="flex -space-x-2">
<div class="w-6 h-6 rounded-full border border-surface bg-primary/30 flex items-center justify-center text-[10px]">K</div>
</div>
</div>
</div>
</div>
<!-- Placeholder Card (Empty State Feel) -->
<div class="border-2 border-dashed border-outline-variant/30 rounded-lg flex flex-col items-center justify-center p-8 text-on-surface-variant/40 hover:border-primary/50 hover:text-primary/50 transition-all group cursor-pointer">
<span class="material-symbols-outlined text-5xl mb-4 group-hover:scale-110 transition-transform">add_circle</span>
<p class="font-bold text-sm">点击创建新项目</p>
</div>
</div>
<!-- Floating Action Button (Requirement 6) -->
<button class="fixed bottom-10 right-10 w-16 h-16 rounded-full bg-secondary text-on-secondary shadow-[0_10px_30px_rgba(52,181,250,0.4)] flex items-center justify-center z-50 hover:scale-110 active:scale-90 transition-all group">
<span class="material-symbols-outlined text-3xl group-hover:rotate-90 transition-transform">add</span>
</button>
</main>
</body></html>