import { PrismaClient } from '@prisma/client';
import { ASSET_CATEGORIES, ASSET_SOURCES } from '../constants/asset-categories';

const prisma = new PrismaClient();

function inferCategoryFromMetadata(asset: any): string {
  const metadata = asset.metadata as any;
  
  if (metadata?.prompt) {
    const prompt = metadata.prompt.toLowerCase();
    
    if (prompt.includes('角色') || prompt.includes('人物') || 
        prompt.includes('character') || prompt.includes('portrait') ||
        prompt.includes('脸') || prompt.includes('身体')) {
      return ASSET_CATEGORIES.CHARACTER;
    }
    
    if (prompt.includes('场景') || prompt.includes('背景') || 
        prompt.includes('scene') || prompt.includes('background') ||
        prompt.includes('环境') || prompt.includes('地点')) {
      return ASSET_CATEGORIES.SCENE;
    }
    
    if (prompt.includes('物品') || prompt.includes('道具') || 
        prompt.includes('item') || prompt.includes('prop') ||
        prompt.includes('武器') || prompt.includes('工具')) {
      return ASSET_CATEGORIES.ITEM;
    }
    
    if (prompt.includes('特效') || prompt.includes('效果') || 
        prompt.includes('effect') || prompt.includes('magic')) {
      return ASSET_CATEGORIES.EFFECT;
    }
  }
  
  if (metadata?.characterId || metadata?.characterName) {
    return ASSET_CATEGORIES.CHARACTER;
  }
  
  if (metadata?.sceneId || metadata?.sceneLocation) {
    return ASSET_CATEGORIES.SCENE;
  }
  
  if (metadata?.originalName) {
    const name = metadata.originalName.toLowerCase();
    
    if (name.includes('character') || name.includes('角色') || name.includes('人物')) {
      return ASSET_CATEGORIES.CHARACTER;
    }
    
    if (name.includes('scene') || name.includes('场景') || name.includes('背景')) {
      return ASSET_CATEGORIES.SCENE;
    }
    
    if (name.includes('item') || name.includes('物品') || name.includes('道具')) {
      return ASSET_CATEGORIES.ITEM;
    }
  }
  
  return ASSET_CATEGORIES.GENERAL;
}

function inferSourceFromMetadata(asset: any): string {
  const metadata = asset.metadata as any;
  
  if (metadata?.taskId) {
    return ASSET_SOURCES.AI_GENERATION;
  }
  
  if (metadata?.prompt) {
    if (metadata.characterId || metadata.characterName) {
      return ASSET_SOURCES.CHARACTER_GENERATION;
    }
    if (metadata.sceneId || metadata.sceneLocation) {
      return ASSET_SOURCES.SCENE_GENERATION;
    }
    return ASSET_SOURCES.AI_GENERATION;
  }
  
  if (metadata?.originalName) {
    return ASSET_SOURCES.UPLOAD;
  }
  
  return ASSET_SOURCES.UPLOAD;
}

async function migrateAssets() {
  console.log('Starting asset migration...');
  
  const assets = await prisma.asset.findMany({
    where: {
      OR: [
        { category: null },
        { source: null }
      ]
    }
  });
  
  console.log(`Found ${assets.length} assets to migrate`);
  
  let updated = 0;
  let skipped = 0;
  
  for (const asset of assets) {
    try {
      const category = asset.category || inferCategoryFromMetadata(asset);
      const source = asset.source || inferSourceFromMetadata(asset);
      
      await prisma.asset.update({
        where: { id: asset.id },
        data: { category, source }
      });
      
      updated++;
      
      if (updated % 100 === 0) {
        console.log(`Progress: ${updated}/${assets.length}`);
      }
    } catch (error) {
      console.error(`Failed to migrate asset ${asset.id}:`, error);
      skipped++;
    }
  }
  
  console.log('\nMigration completed!');
  console.log(`Updated: ${updated}`);
  console.log(`Skipped: ${skipped}`);
  
  const categoryStats = await prisma.asset.groupBy({
    by: ['category'],
    _count: true
  });
  
  console.log('\nCategory distribution:');
  for (const stat of categoryStats) {
    console.log(`  ${stat.category}: ${stat._count}`);
  }
  
  const sourceStats = await prisma.asset.groupBy({
    by: ['source'],
    _count: true
  });
  
  console.log('\nSource distribution:');
  for (const stat of sourceStats) {
    console.log(`  ${stat.source}: ${stat._count}`);
  }
}

migrateAssets()
  .catch((error) => {
    console.error('Migration failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
