#!/usr/bin/env node
import { cruise } from 'dependency-cruiser';
import { readFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// ES module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..'); // Adjust if script location changes

// Arguments: <path_to_changed_files_list> <target_app_name>
const changedFilesListPathArg = process.argv[2]; // e.g., changed-files.txt
const targetAppName = process.argv[3]; // e.g., beets-frontend-v3 or frontend-v3

if (!changedFilesListPathArg) {
  console.error(
    'Error: Path to changed files list is required as the first argument.'
  );
  process.exit(1); // Indicate error
}

if (!targetAppName) {
  console.error(
    'Error: Target application name is required as the second argument (e.g., beets-frontend-v3).'
  );
  process.exit(1); // Indicate error
}

const targetAppPath = path.join(repoRoot, 'apps', targetAppName);
const tsConfigPath = path.join(targetAppPath, 'tsconfig.json');
const changedFilesListPath = path.resolve(repoRoot, changedFilesListPathArg);

async function run() {
  let changedLibFiles = [];
  try {
    const rawChangedFiles = readFileSync(changedFilesListPath, 'utf-8');
    changedLibFiles = rawChangedFiles
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.startsWith('packages/lib/')) // Ensure we only consider files in lib
      .map((line) => path.resolve(repoRoot, line)); // Get absolute paths
  } catch (err) {
    console.error(
      `Error reading changed files list ${changedFilesListPathArg}:`,
      err
    );
    process.exit(1); // Indicate error
  }

  if (changedLibFiles.length === 0) {
    console.log(
      'No changes detected in packages/lib. Skipping dependency analysis.'
    );
    // Exit code 0 tells Vercel to SKIP the build for this project
    process.exit(0);
  }

  console.log('Changed files in packages/lib:', changedLibFiles);

  try {
    console.log(
      `Analyzing dependencies for ${targetAppName} (${targetAppPath})...`
    );
    const cruiseOptions = {
      includeOnly: '^packages/lib', // Only care about dependencies FROM lib
      exclude: ['node_modules', '\\.d\\.ts$'], // Exclude node_modules and declaration files
      // Use tsconfig for path resolution (important for aliases like @repo/lib)
      tsConfig: {
        fileName: tsConfigPath,
      },
      baseDir: repoRoot, // Project root for resolving paths
    };

    // dependency-cruiser returns an object with modules and dependencies
    const cruiseResult = await cruise([targetAppPath], cruiseOptions);

    if (cruiseResult.output.error) {
      console.error(
        'Error running dependency-cruiser:',
        cruiseResult.output.error
      );
      process.exit(1); // Indicate error, proceed with build just in case
    }

    // Extract all modules from lib that are dependencies of the target app
    const appDependenciesOnLib = new Set();
    cruiseResult.output.modules.forEach((module) => {
      // Check if the module source itself is within packages/lib (handles entry points)
      if (module.source.startsWith('packages/lib')) {
        appDependenciesOnLib.add(path.resolve(repoRoot, module.source));
      }
      // Check dependencies of the module
      module.dependencies.forEach((dep) => {
        if (dep.resolved && dep.resolved.startsWith('packages/lib')) {
          appDependenciesOnLib.add(path.resolve(repoRoot, dep.resolved));
        }
      });
    });

    console.log(`Files from packages/lib used by ${targetAppName}:`, [
      ...appDependenciesOnLib,
    ]);

    // Check for intersection
    const impacted = changedLibFiles.some((changedFile) =>
      appDependenciesOnLib.has(changedFile)
    );

    if (impacted) {
      console.log(
        `=> Changes in packages/lib AFFECT ${targetAppName}. Proceeding with build.`
      );
      // Exit code 1 tells Vercel to PROCEED with the build
      process.exit(1);
    } else {
      console.log(
        `=> Changes in packages/lib DO NOT affect ${targetAppName}. Skipping build.`
      );
      // Exit code 0 tells Vercel to SKIP the build
      process.exit(0);
    }
  } catch (error) {
    console.error('Error during dependency analysis:', error);
    // Exit code 1 tells Vercel to PROCEED with the build (fail-safe)
    process.exit(1);
  }
}

run();
