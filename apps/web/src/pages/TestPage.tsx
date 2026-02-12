import { BentoGrid, BentoCard } from '../components/ui/bento-grid';
import { Sparkles, Zap } from 'lucide-react';

export default function TestPage() {
  return (
    <div className="min-h-screen bg-gray-100 p-12">
      <h1 className="text-3xl font-bold text-center mb-8">卡片测试页面</h1>
      
      <BentoGrid>
        <BentoCard
          name="测试卡片 1"
          description="这是一个测试卡片，用于验证布局和样式是否正常工作。"
          Icon={Sparkles}
          cta="点击测试"
        />
        <BentoCard
          name="测试卡片 2"
          description="这是另一个测试卡片，应该显示在第一个卡片的旁边。"
          Icon={Zap}
          cta="点击测试"
        />
        <BentoCard
          name="测试卡片 3"
          description="这是第三个测试卡片，应该完成第一行的布局。"
          Icon={Sparkles}
          cta="点击测试"
        />
      </BentoGrid>
    </div>
  );
}
