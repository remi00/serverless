'use strict';

module.exports = {
  generateArtifactDirectoryName() {
    // Don't regenerate name if it's already set
    if (!this.serverless.service.package.artifactDirectoryName) {
      const serviceStage = `${this.serverless.service.service}/${this.provider.getStage()}`;
      const prefix = this.provider.getDeploymentPrefix();
      this.serverless.service.package.artifactDirectoryName = `${prefix}/${serviceStage}`;
    }
  },
};
