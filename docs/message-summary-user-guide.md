# Message Summary System User Guide

## Overview

The message summary system automatically and manually creates structured summaries of your chat conversations to maintain context and improve AI response quality.

## Key Features

### Automatic Summarization

- **Triggers:** After 10 messages OR 2000 tokens since last summary
- **Background processing:** Runs without interrupting conversation
- **Cost-effective:** Uses free/cheap AI models with fallback options
- **Token reduction:** Reduces 2000 tokens to 200-400 token summaries (80-90% reduction)

### Manual Summarization

- **Command:** Type `@summarize` in chat
- **On-demand:** Request summaries at any time
- **Immediate feedback:** Shows progress and results instantly

### Structured Summary Format

```json
{
  "overview": "Brief 2-3 sentence overview",
  "keyPoints": ["Important fact 1", "Important fact 2"],
  "decisions": ["Decision made 1", "Decision made 2"],
  "actionItems": ["Action item with context"],
  "openQuestions": ["Unresolved question"],
  "toolResults": [
    {
      "toolName": "toolName",
      "summary": "What the tool did",
      "importance": "high|medium|low"
    }
  ]
}
```

## How to Use

### 1. Automatic Summaries

- Continue your conversation normally
- System automatically detects when to summarize
- You'll see a "Generating summary..." indicator in the chat
- Summaries appear in the Summary Dialog automatically

### 2. Manual Summaries

- Type `@summarize` in the chat input
- Press Enter or click the command
- System processes the request immediately
- Results appear in the Summary Dialog

### 3. Viewing Summaries

- Click the "View Summary" button in the chat header
- Or use the `@summarize` command to open the dialog
- Dialog shows:
  - Latest summary with overview, key points, decisions, action items
  - Cost and token information
  - Previous summary snapshot for context
  - "Summarize Now" button for manual regeneration

## Understanding the Dialog

### Status Indicators

- **Generating:** Summary is being created (spinning animation)
- **Complete:** Summary ready (green badge)
- **Failed:** Generation failed (red badge with error)
- **Partial:** Completed with errors (yellow badge)

### Summary Content

- **Overview:** 2-3 sentence summary of the conversation
- **Key Points:** Important facts and information shared
- **Decisions:** Choices made or conclusions reached
- **Action Items:** Tasks or next steps mentioned
- **Open Questions:** Questions raised but not answered
- **Tool Results:** Summary of important tool outputs with importance levels

### Cost Information

- **Tokens:** Source tokens (input) and summary tokens (output)
- **Cost:** Estimated cost in USD (usually $0.000001-$0.000002)
- **Model:** Which AI model was used for generation

## Best Practices

### For Long Conversations

- Let automatic summaries run - they maintain context efficiently
- Use manual summaries for important discussion points
- Review summaries periodically to track conversation progress

### For Important Decisions

- Manually trigger summaries after key decisions
- Use the structured format to capture action items
- Reference previous summaries in new conversations

### For Tool-Heavy Workflows

- Summaries include important tool results
- Tool outputs marked with importance levels
- Helps track what tools were used and their outcomes

## Troubleshooting

### Summary Not Generating

- Check if you have at least 10 messages or 2000 tokens
- Ensure AI models are available (fallback system handles this)
- Try manual trigger with `@summarize` command

### Failed Summaries

- System automatically tries multiple models
- Check error message in dialog for details
- Manual regeneration usually succeeds

### Cost Concerns

- System uses free models by default (Trinity, DeepSeek)
- Cheap models as fallback (Mistral)
- Cost tracking shown in dialog for transparency

## Integration with AI Responses

The system automatically includes the latest 2 summaries in your conversation context, helping the AI maintain continuity and understand the conversation history without processing all messages.

## Technical Details

### Models Used

1. **Trinity** (free) - Primary model
2. **DeepSeek** (free) - Secondary model
3. **Mistral** (cheap) - Final fallback

### Performance

- **Generation time:** 5-10 seconds
- **Token reduction:** 80-90%
- **Cost:** < $0.001 per summary
- **Reliability:** Multi-model fallback ensures completion

### Data Storage

- Summaries stored in Convex database
- Thread-specific storage
- Historical summaries retained for context
- Cost and token tracking for each summary

---

**Questions?** The message summary system is designed to work automatically, but manual control is always available when you need it. Use `@summarize` to take control of your conversation summaries at any time.
