import { Router } from 'express';
import { analyzeTextToPrompt, generateFromPrompt, getAvailableProviders } from '../../services/workspace/ai-processor';

const router = Router();

router.get('/providers', async (req, res) => {
  try {
    const providers = await getAvailableProviders();
    res.json({ success: true, data: providers });
  } catch (error) {
    console.error('Failed to get providers:', error);
    res.status(500).json({
      success: false,
      error: { code: 'PROVIDER_ERROR', message: 'Failed to get providers' },
    });
  }
});

router.post('/analyze-text', async (req, res) => {
  try {
    const { text, source_node_id, style_hint } = req.body;

    if (!text) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_INPUT', message: 'Text is required' },
      });
    }

    const result = await analyzeTextToPrompt(text, style_hint);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Failed to analyze text:', error);
    res.status(500).json({
      success: false,
      error: { code: 'ANALYZE_ERROR', message: 'Failed to analyze text' },
    });
  }
});

router.post('/generate', async (req, res) => {
  try {
    const { source_node_id, target_type, provider_id, model, prompt_json, style, image_urls } = req.body;

    if (!source_node_id || !target_type || !provider_id || !model || !prompt_json) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_INPUT', message: 'Missing required fields' },
      });
    }

    const urls = Array.isArray(image_urls)
      ? image_urls.filter((u: unknown): u is string => typeof u === 'string' && u.startsWith('http'))
      : undefined;

    const result = await generateFromPrompt(
      source_node_id,
      target_type,
      provider_id,
      model,
      prompt_json,
      style,
      urls
    );

    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Failed to generate:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'GENERATE_ERROR',
        message: error instanceof Error ? error.message : 'Generation failed',
      },
    });
  }
});

export default router;
