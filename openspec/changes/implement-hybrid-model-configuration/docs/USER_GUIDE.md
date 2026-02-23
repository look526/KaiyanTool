# AI Model Configuration User Guide

## Table of Contents

1. [Overview](#overview)
2. [Getting Started](#getting-started)
3. [Setting Default Models](#setting-default-models)
4. [Using ModelSelector](#using-modelselector)
5. [Configuring Model Parameters](#configuring-model-parameters)
6. [Testing Models](#testing-models)
7. [Importing and Exporting Configurations](#importing-and-exporting-configurations)
8. [Viewing Configuration History](#viewing-configuration-history)
9. [Understanding Usage Analytics](#understanding-usage-analytics)
10. [Troubleshooting](#troubleshooting)

## Overview

The AI Model Configuration feature allows you to manage AI model preferences across different content types in your application. You can:

- Set default models for 8 content types (text, image, video, audio, script, novel, storyline, outline)
- Configure custom parameters for each content type
- Track model usage and performance
- Test model availability and connectivity
- Import and export your configurations
- View detailed analytics and history

## Getting Started

### Accessing Model Configuration

1. Navigate to **Settings** from the main menu
2. Click on **模型配置** (Model Configuration)
3. You will see the AI Model Configuration page

### First-Time Setup

When you first access the configuration page:

1. **Configure AI Providers**: Ensure you have at least one AI provider configured with available models
2. **Review Content Types**: The page displays 8 content types, each with a model selector
3. **Select Default Models**: Click on each selector and choose a default model
4. **Save Configuration**: Click the "保存配置" (Save Configuration) button

## Setting Default Models

### Why Set Default Models?

Default models streamline your workflow by:

- Automatically pre-selecting models when creating content
- Reducing the number of clicks needed
- Ensuring consistency across similar tasks
- Saving time on repetitive operations

### How to Set Default Models

1. Navigate to the Model Configuration page
2. For each content type you want to configure:
   - Click on the model selector dropdown
   - Browse available models
   - Click on a model to select it
   - Optionally, click the ⭐ star icon to mark as favorite
3. Click "保存配置" to save all changes

### Content Types Explained

| Content Type | Icon | Description | Example Models |
|--------------|-------|-------------|-----------------|
| 文本生成 | 📝 | Generate text content | GPT-4, Claude 3 |
| 图像生成 | 🖼️ | Generate images | DALL-E 3, Midjourney |
| 视频生成 | 🎬 | Generate videos | Sora, Runway |
| 音频生成 | 🎵 | Generate audio | Whisper, ElevenLabs |
| 剧本生成 | 📋 | Generate scripts | GPT-4, Claude 3 |
| 小说生成 | 📚 | Generate novels | GPT-4, Claude 3 |
| 故事线生成 | 📖 | Generate storylines | GPT-4, Claude 3 |
| 大纲生成 | 📑 | Generate outlines | GPT-4, Claude 3 |

## Using ModelSelector

The ModelSelector component is used throughout the application for selecting AI models.

### Features

- **Search**: Type in the search box to filter models by name or description
- **Default Model Badge**: Shows your configured default model at the top
- **Recent Model Badge**: Shows your last used model for quick access
- **Model Testing**: Click the ⚡ lightning icon to test model connectivity
- **Set as Default**: Click the ⭐ star icon to quickly set as default
- **Model Capabilities**: View model capabilities (e.g., text-generation, code)
- **Refresh**: Click the refresh button to reload the model list

### Keyboard Navigation

- **Enter**: Select the first matching model
- **Escape**: Close the dropdown

### Accessibility

The ModelSelector is fully accessible with:

- Keyboard navigation support
- Screen reader compatibility
- Focus management
- ARIA labels

## Configuring Model Parameters

Different content types may require different model parameters. Configure these for optimal results.

### Common Parameters

| Parameter | Type | Description | Typical Range |
|-----------|-------|-------------|----------------|
| temperature | number | Controls randomness (0 = deterministic, 1 = creative) | 0.0 - 1.0 |
| maxTokens | number | Maximum output tokens | 100 - 4096 |
| topP | number | Nucleus sampling parameter | 0.0 - 1.0 |
| presencePenalty | number | Reduces repetition | -2.0 - 2.0 |
| frequencyPenalty | number | Reduces repetition based on frequency | -2.0 - 2.0 |

### How to Configure Parameters

1. Access the Model Configuration page
2. Find the content type you want to configure
3. Click on the settings/gear icon (if available)
4. Adjust parameters as needed
5. Click "保存配置" to save

### Parameter Recommendations

**Text Generation:**
- Creative writing: temperature 0.8-0.9
- Technical content: temperature 0.2-0.4
- Balanced: temperature 0.7

**Image Generation:**
- High detail: Adjust quality settings
- Faster generation: Lower resolution options

## Testing Models

### Why Test Models?

Testing models helps you:

- Verify API key validity
- Check model availability
- Measure response times
- Identify connectivity issues early

### How to Test Models

**Individual Test:**
1. Open ModelSelector
2. Click the ⚡ lightning icon next to a model
3. Wait for the test to complete
4. View result (success/failure)

**Batch Test:**
1. Go to Model Configuration page
2. Click "批量测试" (Batch Test) button for a content type
3. Monitor progress and results
4. Review summary of successful/failed tests

### Interpreting Test Results

- ✅ **Success**: Model is accessible and ready
- ❌ **Failed**: Check API key, network connection, or model availability

## Importing and Exporting Configurations

### Export Configuration

Export your configuration to:

- Backup your settings
- Share with team members
- Transfer between environments

**Steps:**
1. Go to Model Configuration page
2. Click "导出" (Export) button
3. A JSON file will download automatically
4. Save the file in a secure location

### Import Configuration

Import a configuration to:

- Restore from backup
- Apply shared settings
- Migrate from another environment

**Steps:**
1. Go to Model Configuration page
2. Click "导入" (Import) button
3. Select the JSON configuration file
4. Review imported settings
5. Click "保存配置" to apply

### Configuration File Format

```json
{
  "defaultModels": {
    "text": "model-id-1",
    "image": "model-id-2"
  },
  "exportedAt": "2024-02-23T10:30:00.000Z",
  "version": "1.0"
}
```

## Viewing Configuration History

### What is Configuration History?

Configuration history tracks all changes to your model preferences, including:

- Default model changes
- Parameter modifications
- Timestamp of each change
- Previous and new values

### How to View History

1. Go to Model Configuration page
2. Click "历史记录" (History) button
3. Review the list of changes

### History Information

Each history entry shows:

- **Timestamp**: When the change was made
- **Change Type**: What was changed (default models, parameters)
- **Previous Value**: Settings before the change
- **New Value**: Settings after the change

### Using History

- **Undo Changes**: Copy previous values and apply them
- **Audit**: Track who made changes (in team environments)
- **Troubleshoot**: Identify when issues started occurring

## Understanding Usage Analytics

### Analytics Dashboard

The Model Configuration page displays usage analytics including:

- **Total Models**: Number of configured AI models
- **Configured Defaults**: How many content types have defaults set
- **Active Usage**: Number of content types recently used
- **Model Type Distribution**: Breakdown by content type
- **Configuration Status**: Which content types are configured

### Key Metrics

**Model Usage Frequency:**
- High frequency: Consider setting as default
- Low frequency: May need parameter tuning

**Configuration Coverage:**
- 8/8 configured: All content types have defaults
- < 8 configured: Consider setting defaults for remaining types

### Top Used Models

View your most frequently used models to:

- Identify preferences
- Optimize API costs
- Plan for capacity needs

## Troubleshooting

### Common Issues

#### Model Not Showing in Selector

**Cause:** Model not configured in AI Providers

**Solution:**
1. Go to AI Providers settings
2. Add or verify your provider configuration
3. Sync models from provider
4. Refresh ModelSelector

#### Test Model Fails

**Cause:** Invalid API key, network issue, or model unavailable

**Solution:**
1. Verify API key in provider settings
2. Check network connection
3. Confirm model is available in provider
4. Check provider status page for outages

#### Configuration Not Saving

**Cause:** Network issue or server error

**Solution:**
1. Check internet connection
2. Refresh the page
3. Try saving again
4. Check browser console for errors

#### Imported Configuration Not Applied

**Cause:** Invalid file format or version mismatch

**Solution:**
1. Verify file is valid JSON
2. Check version compatibility
3. Review imported values before saving
4. Manually apply settings if import fails

### Getting Help

If you encounter issues:

1. Check this user guide
2. Review API documentation
3. Check configuration history for recent changes
4. Contact support with error details

## Best Practices

1. **Set Default Models**: Configure defaults for frequently used content types
2. **Test Regularly**: Test models periodically to ensure availability
3. **Backup Settings**: Export configurations regularly as backups
4. **Review Analytics**: Check usage analytics to optimize configuration
5. **Use Search**: Use ModelSelector search to quickly find models
6. **Monitor History**: Review configuration history for unintended changes
7. **Batch Operations**: Use batch testing to verify multiple models at once
8. **Secure API Keys**: Never share API keys or configuration files with sensitive data

## FAQ

**Q: Can I use the same model for multiple content types?**  
A: Yes, if the model supports multiple content types.

**Q: How often are configurations saved?**  
A: Configurations are saved only when you click "保存配置". Use auto-save features in editors separately.

**Q: Can I revert to a previous configuration?**  
A: Yes, check configuration history and manually apply previous values, or restore from a backup export.

**Q: What happens if a model is removed from my provider?**  
A: The model will show as unavailable in ModelSelector. You'll need to select a different model.

**Q: Are my configurations shared with others?**  
A: No, configurations are private to your account unless you explicitly export and share the file.

## Support

For additional help:

- **Documentation**: [API Documentation](./API.md)
- **GitHub Issues**: Report bugs and feature requests
- **Email Support**: support@kaiyan.com
