const fs = require('fs');
const path = require('path');

const EVALUATION_CRITERIA = {
  requirements: {
    weight: 40,
    metrics: {
      componentStructure: { weight: 15, max: 15 },
      styleMatch: { weight: 15, max: 15 },
      featureCoverage: { weight: 10, max: 10 }
    }
  },
  visualDesign: {
    weight: 25,
    metrics: {
      colorConsistency: { weight: 8, max: 8 },
      typographyCompliance: { weight: 7, max: 7 },
      visualHierarchy: { weight: 5, max: 5 },
      shadowQuality: { weight: 5, max: 5 }
    }
  },
  interaction: {
    weight: 20,
    metrics: {
      animationSmoothness: { weight: 7, max: 7 },
      feedbackTimeliness: { weight: 5, max: 5 },
      interactionLogic: { weight: 5, max: 5 },
      microInteractions: { weight: 3, max: 3 }
    }
  },
  technical: {
    weight: 10,
    metrics: {
      codeReusability: { weight: 4, max: 4 },
      performance: { weight: 3, max: 3 },
      maintainability: { weight: 3, max: 3 }
    }
  },
  responsive: {
    weight: 5,
    metrics: {
      breakpointCoverage: { weight: 3, max: 3 },
      layoutAdaptability: { weight: 2, max: 2 }
    }
  }
};

const THRESHOLDS = {
  pass: { min: 80, max: 100, label: '✅ 通过' },
  conditional: { min: 70, max: 79, label: '⚠️ 有条件通过' },
  fail: { min: 0, max: 69, label: '❌ 不通过' }
};

const DIMENSION_THRESHOLDS = {
  requirements: 60,
  visualDesign: 50,
  interaction: 50,
  technical: 40,
  responsive: 40
};

class UIEvaluator {
  constructor(targetPath, requirementsPath) {
    this.targetPath = targetPath;
    this.requirementsPath = requirementsPath;
    this.results = {
      requirements: {},
      visualDesign: {},
      interaction: {},
      technical: {},
      responsive: {},
      total: 0,
      grade: '',
      decision: ''
    };
  }

  evaluate() {
    console.log('🔍 开始UI设计评估...\n');
    
    this.evaluateRequirements();
    this.evaluateVisualDesign();
    this.evaluateInteraction();
    this.evaluateTechnical();
    this.evaluateResponsive();
    
    this.calculateTotal();
    this.determineGrade();
    this.determineDecision();
    
    return this.results;
  }

  evaluateRequirements() {
    console.log('📋 评估需求符合度...');
    
    const componentScore = this.evaluateComponentStructure();
    const styleScore = this.evaluateStyleMatch();
    const featureScore = this.evaluateFeatureCoverage();
    
    this.results.requirements = {
      componentStructure: componentScore,
      styleMatch: styleScore,
      featureCoverage: featureScore,
      total: componentScore + styleScore + featureScore,
      percentage: 0
    };
    this.results.requirements.percentage = 
      (this.results.requirements.total / EVALUATION_CRITERIA.requirements.weight * 100).toFixed(1);
    
    console.log(`   组件结构完整性: ${componentScore}/${EVALUATION_CRITERIA.requirements.metrics.componentStructure.max}`);
    console.log(`   样式规范匹配度: ${styleScore}/${EVALUATION_CRITERIA.requirements.metrics.styleMatch.max}`);
    console.log(`   功能特性覆盖: ${featureScore}/${EVALUATION_CRITERIA.requirements.metrics.featureCoverage.max}`);
    console.log(`   小计: ${this.results.requirements.total}/40 (${this.results.requirements.percentage}%)\n`);
  }

  evaluateComponentStructure() {
    const files = [
      'src/components/ui/button.tsx',
      'src/components/ui/input.tsx',
      'src/components/ui/bento-grid.tsx',
      'src/components/ui/card.tsx',
      'src/components/ui/demo.tsx'
    ];
    
    let score = EVALUATION_CRITERIA.requirements.metrics.componentStructure.max;
    
    files.forEach(file => {
      const filePath = path.join(this.targetPath, file);
      if (!fs.existsSync(filePath)) {
        console.log(`   ❌ 缺失组件: ${file}`);
        score -= 3;
      } else {
        console.log(`   ✅ 存在组件: ${file}`);
      }
    });
    
    return Math.max(0, score);
  }

  evaluateStyleMatch() {
    const bentoGridPath = path.join(this.targetPath, 'src/components/ui/bento-grid.tsx');
    let score = EVALUATION_CRITERIA.requirements.metrics.styleMatch.max;
    
    if (!fs.existsSync(bentoGridPath)) {
      return 0;
    }
    
    const content = fs.readFileSync(bentoGridPath, 'utf-8');
    
    const requiredClasses = [
      'auto-rows-[22rem]',
      'grid-cols-3',
      'gap-4',
      'transform-gpu',
      'group-hover:-translate-y-10',
      'origin-left',
      'group-hover:scale-75',
      'bg-white',
      '[box-shadow:0_0_0_1px_rgba(0,0,0,.03),0_2px_4px_rgba(0,0,0,.05),0_12px_24px_rgba(0,0,0,.05)]',
      'dark:bg-black',
      'dark:[border:1px_solid_rgba(255,255,255,.1)]',
      'dark:[box-shadow:0_-20px_80px_-20px_#ffffff1f_inset]'
    ];
    
    requiredClasses.forEach(cls => {
      if (!content.includes(cls)) {
        console.log(`   ❌ 缺失CSS类: ${cls}`);
        score -= 2;
      } else {
        console.log(`   ✅ CSS类匹配: ${cls}`);
      }
    });
    
    return Math.max(0, score);
  }

  evaluateFeatureCoverage() {
    const homePagePath = path.join(this.targetPath, 'src/pages/HomePage.tsx');
    let score = EVALUATION_CRITERIA.requirements.metrics.featureCoverage.max;
    
    if (!fs.existsSync(homePagePath)) {
      return 0;
    }
    
    const content = fs.readFileSync(homePagePath, 'utf-8');
    
    const requiredFeatures = [
      'BentoGrid',
      'BentoCard',
      'background',
      'href',
      'cta'
    ];
    
    requiredFeatures.forEach(feature => {
      if (!content.includes(feature)) {
        console.log(`   ❌ 缺失功能: ${feature}`);
        score -= 2;
      } else {
        console.log(`   ✅ 功能覆盖: ${feature}`);
      }
    });
    
    return Math.max(0, score);
  }

  evaluateVisualDesign() {
    console.log('🎨 评估视觉设计质量...');
    
    const colorScore = this.evaluateColorConsistency();
    const typographyScore = this.evaluateTypographyCompliance();
    const hierarchyScore = this.evaluateVisualHierarchy();
    const shadowScore = this.evaluateShadowQuality();
    
    this.results.visualDesign = {
      colorConsistency: colorScore,
      typographyCompliance: typographyScore,
      visualHierarchy: hierarchyScore,
      shadowQuality: shadowScore,
      total: colorScore + typographyScore + hierarchyScore + shadowScore,
      percentage: 0
    };
    this.results.visualDesign.percentage = 
      (this.results.visualDesign.total / EVALUATION_CRITERIA.visualDesign.weight * 100).toFixed(1);
    
    console.log(`   色彩系统一致性: ${colorScore}/${EVALUATION_CRITERIA.visualDesign.metrics.colorConsistency.max}`);
    console.log(`   排版规范遵循度: ${typographyScore}/${EVALUATION_CRITERIA.visualDesign.metrics.typographyCompliance.max}`);
    console.log(`   视觉层次清晰度: ${hierarchyScore}/${EVALUATION_CRITERIA.visualDesign.metrics.visualHierarchy.max}`);
    console.log(`   阴影和效果质量: ${shadowScore}/${EVALUATION_CRITERIA.visualDesign.metrics.shadowQuality.max}`);
    console.log(`   小计: ${this.results.visualDesign.total}/25 (${this.results.visualDesign.percentage}%)\n`);
  }

  evaluateColorConsistency() {
    const files = [
      'src/styles/theme-dark.css',
      'src/styles/theme-light.css',
      'src/components/ui/button.tsx'
    ];
    
    let score = EVALUATION_CRITERIA.visualDesign.metrics.colorConsistency.max;
    
    files.forEach(file => {
      const filePath = path.join(this.targetPath, file);
      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf-8');
        const hasVar = content.includes('--bg-base') || content.includes('--text-primary') ||
                      content.includes('--accent') || content.includes('var(--');
        if (hasVar) {
          console.log(`   ✅ 使用语义化颜色: ${file}`);
        } else {
          console.log(`   ⚠️ 颜色使用不规范: ${file}`);
          score -= 2;
        }
      }
    });
    
    return Math.max(0, score);
  }

  evaluateTypographyCompliance() {
    const homePagePath = path.join(this.targetPath, 'src/pages/HomePage.tsx');
    
    if (!fs.existsSync(homePagePath)) {
      return 0;
    }
    
    const content = fs.readFileSync(homePagePath, 'utf-8');
    let score = EVALUATION_CRITERIA.visualDesign.metrics.typographyCompliance.max;
    
    const fontClasses = ['text-6xl', 'text-4xl', 'text-xl', 'text-lg', 'text-sm', 'text-xs'];
    fontClasses.forEach(cls => {
      if (!content.includes(cls)) {
        console.log(`   ⚠️ 缺少排版类: ${cls}`);
        score -= 1;
      }
    });
    
    return Math.max(0, score);
  }

  evaluateVisualHierarchy() {
    const bentoGridPath = path.join(this.targetPath, 'src/components/ui/bento-grid.tsx');
    
    if (!fs.existsSync(bentoGridPath)) {
      return 0;
    }
    
    const content = fs.readFileSync(bentoGridPath, 'utf-8');
    let score = EVALUATION_CRITERIA.visualDesign.metrics.visualHierarchy.max;
    
    const hierarchyIndicators = ['z-10', 'pointer-events-none', 'absolute'];
    hierarchyIndicators.forEach(indicator => {
      if (!content.includes(indicator)) {
        console.log(`   ⚠️ 缺少层次指示: ${indicator}`);
        score -= 1;
      }
    });
    
    return Math.max(0, score);
  }

  evaluateShadowQuality() {
    const bentoGridPath = path.join(this.targetPath, 'src/components/ui/bento-grid.tsx');
    
    if (!fs.existsSync(bentoGridPath)) {
      return 0;
    }
    
    const content = fs.readFileSync(bentoGridPath, 'utf-8');
    let score = EVALUATION_CRITERIA.visualDesign.metrics.shadowQuality.max;
    
    const shadowIndicators = [
      '[box-shadow:',
      'dark:[box-shadow:',
      'inset'
    ];
    
    shadowIndicators.forEach(indicator => {
      if (!content.includes(indicator)) {
        console.log(`   ❌ 缺少阴影: ${indicator}`);
        score -= 2;
      }
    });
    
    return Math.max(0, score);
  }

  evaluateInteraction() {
    console.log('👆 评估交互体验...');
    
    const animationScore = this.evaluateAnimationSmoothness();
    const feedbackScore = this.evaluateFeedbackTimeliness();
    const logicScore = this.evaluateInteractionLogic();
    const microScore = this.evaluateMicroInteractions();
    
    this.results.interaction = {
      animationSmoothness: animationScore,
      feedbackTimeliness: feedbackScore,
      interactionLogic: logicScore,
      microInteractions: microScore,
      total: animationScore + feedbackScore + logicScore + microScore,
      percentage: 0
    };
    this.results.interaction.percentage = 
      (this.results.interaction.total / EVALUATION_CRITERIA.interaction.weight * 100).toFixed(1);
    
    console.log(`   动画流畅度: ${animationScore}/${EVALUATION_CRITERIA.interaction.metrics.animationSmoothness.max}`);
    console.log(`   响应反馈及时性: ${feedbackScore}/${EVALUATION_CRITERIA.interaction.metrics.feedbackTimeliness.max}`);
    console.log(`   交互逻辑正确性: ${logicScore}/${EVALUATION_CRITERIA.interaction.metrics.interactionLogic.max}`);
    console.log(`   微交互细节: ${microScore}/${EVALUATION_CRITERIA.interaction.metrics.microInteractions.max}`);
    console.log(`   小计: ${this.results.interaction.total}/20 (${this.results.interaction.percentage}%)\n`);
  }

  evaluateAnimationSmoothness() {
    const indexCssPath = path.join(this.targetPath, 'src/index.css');
    
    if (!fs.existsSync(indexCssPath)) {
      return 0;
    }
    
    const content = fs.readFileSync(indexCssPath, 'utf-8');
    let score = EVALUATION_CRITERIA.interaction.metrics.animationSmoothness.max;
    
    const animationClasses = ['transition-all', 'duration-300', 'ease-in-out'];
    animationClasses.forEach(cls => {
      if (!content.includes(cls)) {
        score -= 2;
      }
    });
    
    return Math.max(0, score);
  }

  evaluateFeedbackTimeliness() {
    const bentoGridPath = path.join(this.targetPath, 'src/components/ui/bento-grid.tsx');
    
    if (!fs.existsSync(bentoGridPath)) {
      return 0;
    }
    
    const content = fs.readFileSync(bentoGridPath, 'utf-8');
    let score = EVALUATION_CRITERIA.interaction.metrics.feedbackTimeliness.max;
    
    const feedbackIndicators = ['group-hover:', 'transition-all'];
    feedbackIndicators.forEach(indicator => {
      if (!content.includes(indicator)) {
        score -= 2;
      }
    });
    
    return Math.max(0, score);
  }

  evaluateInteractionLogic() {
    const bentoGridPath = path.join(this.targetPath, 'src/components/ui/bento-grid.tsx');
    
    if (!fs.existsSync(bentoGridPath)) {
      return 0;
    }
    
    const content = fs.readFileSync(bentoGridPath, 'utf-8');
    let score = EVALUATION_CRITERIA.interaction.metrics.interactionLogic.max;
    
    if (!content.includes('group-hover:opacity-100') || 
        !content.includes('group-hover:translate-y-0')) {
      score -= 3;
    }
    
    return Math.max(0, score);
  }

  evaluateMicroInteractions() {
    const buttonPath = path.join(this.targetPath, 'src/components/ui/button.tsx');
    
    if (!fs.existsSync(buttonPath)) {
      return 0;
    }
    
    const content = fs.readFileSync(buttonPath, 'utf-8');
    let score = EVALUATION_CRITERIA.interaction.metrics.microInteractions.max;
    
    const microInteractions = ['focus-visible', 'hover:', 'disabled:'];
    microInteractions.forEach(interaction => {
      if (!content.includes(interaction)) {
        score -= 1;
      }
    });
    
    return Math.max(0, score);
  }

  evaluateTechnical() {
    console.log('⚙️ 评估技术实现...');
    
    const reusabilityScore = this.evaluateCodeReusability();
    const performanceScore = this.evaluatePerformance();
    const maintainabilityScore = this.evaluateMaintainability();
    
    this.results.technical = {
      codeReusability: reusabilityScore,
      performance: performanceScore,
      maintainability: maintainabilityScore,
      total: reusabilityScore + performanceScore + maintainabilityScore,
      percentage: 0
    };
    this.results.technical.percentage = 
      (this.results.technical.total / EVALUATION_CRITERIA.technical.weight * 100).toFixed(1);
    
    console.log(`   代码复用性: ${reusabilityScore}/${EVALUATION_CRITERIA.technical.metrics.codeReusability.max}`);
    console.log(`   性能优化: ${performanceScore}/${EVALUATION_CRITERIA.technical.metrics.performance.max}`);
    console.log(`   可维护性: ${maintainabilityScore}/${EVALUATION_CRITERIA.technical.metrics.maintainability.max}`);
    console.log(`   小计: ${this.results.technical.total}/10 (${this.results.technical.percentage}%)\n`);
  }

  evaluateCodeReusability() {
    const componentsPath = path.join(this.targetPath, 'src/components/ui');
    
    if (!fs.existsSync(componentsPath)) {
      return 0;
    }
    
    const files = fs.readdirSync(componentsPath).filter(f => f.endsWith('.tsx'));
    let score = EVALUATION_CRITERIA.technical.metrics.codeReusability.max;
    
    files.forEach(file => {
      const filePath = path.join(componentsPath, file);
      const content = fs.readFileSync(filePath, 'utf-8');
      const hasProps = content.includes('interface') || content.includes('Props');
      if (hasProps) {
        console.log(`   ✅ 组件可复用: ${file}`);
      } else {
        score -= 1;
      }
    });
    
    return Math.max(0, score);
  }

  evaluatePerformance() {
    const bentoGridPath = path.join(this.targetPath, 'src/components/ui/bento-grid.tsx');
    
    if (!fs.existsSync(bentoGridPath)) {
      return 0;
    }
    
    const content = fs.readFileSync(bentoGridPath, 'utf-8');
    let score = EVALUATION_CRITERIA.technical.metrics.performance.max;
    
    if (content.includes('transform-gpu')) {
      console.log('   ✅ GPU加速优化');
    } else {
      score -= 2;
    }
    
    return Math.max(0, score);
  }

  evaluateMaintainability() {
    const componentsPath = path.join(this.targetPath, 'src/components/ui');
    
    if (!fs.existsSync(componentsPath)) {
      return 0;
    }
    
    const files = fs.readdirSync(componentsPath).filter(f => f.endsWith('.tsx'));
    let score = EVALUATION_CRITERIA.technical.metrics.maintainability.max;
    
    files.forEach(file => {
      const filePath = path.join(componentsPath, file);
      const content = fs.readFileSync(filePath, 'utf-8');
      const hasExports = content.includes('export') || content.includes('export default');
      if (hasExports) {
        console.log(`   ✅ 代码结构清晰: ${file}`);
      } else {
        score -= 1;
      }
    });
    
    return Math.max(0, score);
  }

  evaluateResponsive() {
    console.log('📱 评估响应式设计...');
    
    const breakpointScore = this.evaluateBreakpointCoverage();
    const layoutScore = this.evaluateLayoutAdaptability();
    
    this.results.responsive = {
      breakpointCoverage: breakpointScore,
      layoutAdaptability: layoutScore,
      total: breakpointScore + layoutScore,
      percentage: 0
    };
    this.results.responsive.percentage = 
      (this.results.responsive.total / EVALUATION_CRITERIA.responsive.weight * 100).toFixed(1);
    
    console.log(`   断点覆盖度: ${breakpointScore}/${EVALUATION_CRITERIA.responsive.metrics.breakpointCoverage.max}`);
    console.log(`   布局适配性: ${layoutScore}/${EVALUATION_CRITERIA.responsive.metrics.layoutAdaptability.max}`);
    console.log(`   小计: ${this.results.responsive.total}/5 (${this.results.responsive.percentage}%)\n`);
  }

  evaluateBreakpointCoverage() {
    const homePagePath = path.join(this.targetPath, 'src/pages/HomePage.tsx');
    
    if (!fs.existsSync(homePagePath)) {
      return 0;
    }
    
    const content = fs.readFileSync(homePagePath, 'utf-8');
    let score = EVALUATION_CRITERIA.responsive.metrics.breakpointCoverage.max;
    
    const breakpoints = ['md:', 'lg:'];
    breakpoints.forEach(bp => {
      if (content.includes(bp)) {
        console.log(`   ✅ 包含响应式断点: ${bp}`);
      }
    });
    
    if (score === EVALUATION_CRITERIA.responsive.metrics.breakpointCoverage.max) {
      console.log('   ✅ 响应式断点覆盖完整');
    }
    
    return Math.max(0, score);
  }

  evaluateLayoutAdaptability() {
    const bentoGridPath = path.join(this.targetPath, 'src/components/ui/bento-grid.tsx');
    
    if (!fs.existsSync(bentoGridPath)) {
      return 0;
    }
    
    const content = fs.readFileSync(bentoGridPath, 'utf-8');
    let score = EVALUATION_CRITERIA.responsive.metrics.layoutAdaptability.max;
    
    if (content.includes('className')) {
      console.log('   ✅ 布局可配置');
    } else {
      score -= 1;
    }
    
    return Math.max(0, score);
  }

  calculateTotal() {
    this.results.total = 
      this.results.requirements.total +
      this.results.visualDesign.total +
      this.results.interaction.total +
      this.results.technical.total +
      this.results.responsive.total;
  }

  determineGrade() {
    const score = this.results.total;
    
    if (score >= 90) {
      this.results.grade = 'S (卓越)';
    } else if (score >= 80) {
      this.results.grade = 'A (优秀)';
    } else if (score >= 70) {
      this.results.grade = 'B (良好)';
    } else if (score >= 60) {
      this.results.grade = 'C (及格)';
    } else {
      this.results.grade = 'D (不及格)';
    }
  }

  determineDecision() {
    const score = this.results.total;
    
    const failedDimensions = [];
    if (this.results.requirements.percentage < 60) failedDimensions.push('需求符合度');
    if (this.results.visualDesign.percentage < 50) failedDimensions.push('视觉设计质量');
    if (this.results.interaction.percentage < 50) failedDimensions.push('交互体验');
    if (this.results.technical.percentage < 40) failedDimensions.push('技术实现');
    if (this.results.responsive.percentage < 40) failedDimensions.push('响应式设计');
    
    if (failedDimensions.length > 0) {
      this.results.decision = '❌ 不通过 - 触发重新设计流程';
      this.results.failedDimensions = failedDimensions;
    } else if (score < 70) {
      this.results.decision = '⚠️ 有条件通过 - 需修复关键问题';
    } else if (score < 80) {
      this.results.decision = '⚠️ 有条件通过 - 存在优化空间';
    } else if (score < 90) {
      this.results.decision = '✅ 通过 - 轻微优化建议';
    } else {
      this.results.decision = '✅ 通过 - 无需修改';
    }
  }

  printSummary() {
    console.log('\n' + '='.repeat(60));
    console.log('📊 UI设计评估结果');
    console.log('='.repeat(60) + '\n');
    
    console.log(`总分: ${this.results.total}/100`);
    console.log(`等级: ${this.results.grade}`);
    console.log(`决策: ${this.results.decision}\n`);
    
    console.log('维度得分:');
    console.log(`  需求符合度:   ${this.results.requirements.percentage}% (${this.results.requirements.total}/40)`);
    console.log(`  视觉设计质量: ${this.results.visualDesign.percentage}% (${this.results.visualDesign.total}/25)`);
    console.log(`  交互体验:     ${this.results.interaction.percentage}% (${this.results.interaction.total}/20)`);
    console.log(`  技术实现:     ${this.results.technical.percentage}% (${this.results.technical.total}/10)`);
    console.log(`  响应式设计:   ${this.results.responsive.percentage}% (${this.results.responsive.total}/5)\n`);
    
    if (this.results.failedDimensions) {
      console.log('❌ 触发重新设计的维度:');
      this.results.failedDimensions.forEach(dim => {
        console.log(`  - ${dim}`);
      });
    }
    
    console.log('='.repeat(60) + '\n');
    
    return this.results;
  }
}

const targetPath = process.argv[2] || './apps/web';
const evaluator = new UIEvaluator(targetPath);
const results = evaluator.evaluate();
evaluator.printSummary();

fs.writeFileSync(
  path.join(targetPath, 'ui-evaluation-result.json'),
  JSON.stringify(results, null, 2)
);
console.log('📄 评估结果已保存到: ui-evaluation-result.json\n');
