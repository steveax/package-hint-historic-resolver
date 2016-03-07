import semver from 'npm:semver';

export default function getRealVersion(versionHint, versions, dateCeiling) {
  if (!versions) {
    return;
  }

  versions = versions.filter(([version, date]) => {
    return semver.valid(version) && new Date(date) <= dateCeiling;
  }).map(([version]) => version);

  return semver.maxSatisfying(versions, versionHint);
}
