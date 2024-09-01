# Issue Duration Labeler

Automatically label issues with their duration and color-code based on configurable thresholds. This GitHub Action helps teams quickly identify how long issues have been open or how long they took to close, improving project management and visibility.

![](issue-duration-preview.png)

## Input Parameters

| Parameter | Description | Required | Default |
|-----------|-------------|----------|---------|
| `github-token` | GitHub token for authentication | Yes | N/A |
| `short_threshold` | Number of days considered short duration | No | '7' |
| `medium_threshold` | Number of days considered medium duration | No | '30' |
| `short_color` | Color for short duration labels (hex without #) | No | '00FF00' |
| `medium_color` | Color for medium duration labels (hex without #) | No | 'FFA500' |
| `long_color` | Color for long duration labels (hex without #) | No | 'FF0000' |
| `thresholded_update` | Update issue duration only when a threshold is met | No | 'true' |

## Description

The Issue Duration Labeler action scans all issues in your repository (both open and closed) and adds a color-coded duration label to each. The duration is calculated as follows:
- For open issues: from creation date to current date
- For closed issues: from creation date to closed date

Labels are color-coded based on configurable thresholds:
- Short duration (default: 1-7 days): Green
- Medium duration (default: 8-30 days): Orange
- Long duration (default: >1 month): Red

When `thresholded_update` is set to true (default), labels are only updated when a threshold is met. This reduces unnecessary label changes for minor duration updates. If its set to false all issues will be updated with the current duration every day. 

This action can be run on a schedule or triggered manually, allowing you to keep your issues consistently labeled with up-to-date duration information.

## Setup

To use this action in your workflow, add the following YAML to your `.github/workflows/issue-duration-labeler.yml` file:

```yaml
name: Label Issues with Duration

on:
  schedule:
    - cron: '0 0 * * *'  # Run daily at midnight
  workflow_dispatch:  # Allow manual triggering

jobs:
  label-issues:
    runs-on: ubuntu-latest
    steps:
      - uses: mireklzicar/issue-duration@main
        with:
          github-token: ${{ secrets.GITHUB_TOKEN }}
```

## Usage Examples

### Basic usage with default settings

```yaml
- uses: mireklzicar/issue-duration@main
  with:
    github-token: ${{ secrets.GITHUB_TOKEN }}
```

### Custom thresholds and colors

```yaml
- uses: mireklzicar/issue-duration@main
  with:
    github-token: ${{ secrets.GITHUB_TOKEN }}
    short_threshold: '7'
    medium_threshold: '30'
    short_color: '0E8A16'
    medium_color: 'FFA500'
    long_color: 'B60205'
    thresholded_update: 'true'
```

[The rest of the README remains unchanged]
