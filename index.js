const core = require('@actions/core');
const github = require('@actions/github');

async function run() {
  try {
    // Configuration
    const config = {
      shortThreshold: parseInt(core.getInput('short_threshold')),
      mediumThreshold: parseInt(core.getInput('medium_threshold')),
      colors: {
        short: core.getInput('short_color'),
        medium: core.getInput('medium_color'),
        long: core.getInput('long_color')
      }
    };

    const token = core.getInput('github-token');
    const octokit = github.getOctokit(token);

    // Main function to process issues
    async function processIssues() {
      const { data: issues } = await octokit.rest.issues.listForRepo({
        ...github.context.repo,
        state: 'all'
      });

      for (const issue of issues) {
        const duration = calculateDuration(issue);
        const color = getColorForDuration(duration, config);
        const durationLabel = `Duration: ${duration} days`;

        await removeOldDurationLabels(issue);
        await createOrUpdateLabel(durationLabel, color);
        await addLabelToIssue(issue, durationLabel);

        core.info(`Updated issue #${issue.number} with label: ${durationLabel} (color: ${color})`);
      }
    }

    // Calculate duration of an issue
    function calculateDuration(issue) {
      const createdAt = new Date(issue.created_at);
      const endDate = issue.closed_at ? new Date(issue.closed_at) : new Date();
      return Math.ceil((endDate - createdAt) / (1000 * 60 * 60 * 24));
    }

    // Determine color based on duration and config
    function getColorForDuration(duration, config) {
      if (duration <= config.shortThreshold) return config.colors.short;
      if (duration <= config.mediumThreshold) return config.colors.medium;
      return config.colors.long;
    }

    // Remove old duration labels from an issue
    async function removeOldDurationLabels(issue) {
      const oldLabels = issue.labels.filter(label => label.name.startsWith('Duration:'));
      for (const label of oldLabels) {
        await octokit.rest.issues.removeLabel({
          ...github.context.repo,
          issue_number: issue.number,
          name: label.name
        });
      }
    }

    // Create or update a label
    async function createOrUpdateLabel(name, color) {
      try {
        await octokit.rest.issues.createLabel({
          ...github.context.repo,
          name: name,
          color: color
        });
      } catch (error) {
        if (error.status === 422) {
          await octokit.rest.issues.updateLabel({
            ...github.context.repo,
            name: name,
            color: color
          });
        } else {
          throw error;
        }
      }
    }

    // Add a label to an issue
    async function addLabelToIssue(issue, label) {
      await octokit.rest.issues.addLabels({
        ...github.context.repo,
        issue_number: issue.number,
        labels: [label]
      });
    }

    // Run the main function
    await processIssues();

  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
