import { MarkdownParser } from './src/parser/markdown-parser.js';
import { ManifestParser } from './src/parser/manifest-parser.js';
import { SlideSorter } from './src/sorter/slide-sorter.js';
import { writeFile, ensureDirectory, getContentDir, getDistDir, readFile, getMarkdownFiles, directoryExists } from './src/utils/fs-utils.js';
import { EnhancedErrorHandler } from './src/utils/enhanced-error-handler.js';
import { ExitCodes } from './src/utils/exit-codes.js';
import { CliParser } from './src/utils/cli-parser.js';
import { HtmlGenerator } from './src/generator/html-generator.js';
import { MermaidRenderer } from './src/renderer/mermaid-renderer.js';
import path from 'path';
import fs from 'fs';

function convertMermaidBlocks(content) {
  const mermaidBlockRegex = /```mermaid\s*([\s\S]*?)```/g;
  
  return content.replace(mermaidBlockRegex, (match, diagramCode) => {
    const trimmedCode = diagramCode.trim();
    const escapedCode = trimmedCode
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
    
    return `<div class="mermaid">\n${escapedCode}\n</div>`;
  });
}



/**
 * Main build entry point
 * Handles CLI arguments, orchestrates build process, and manages exit codes
 */
async function main() {
  const args = CliParser.parse();

  if (args.help) {
    CliParser.parse();
    process.exit(ExitCodes.SUCCESS);
  }

  const validation = CliParser.validate(args);
  if (!validation.isValid) {
    console.error('\n\x1b[31m✖ Configuration Error:\x1b[0m');
    validation.errors.forEach(err => {
      console.error(`  - ${err.field}: ${err.message}`);
      console.error(`    ${err.suggestedFix}`);
    });
    console.error('\nUse --help for usage information.\n');
    process.exit(ExitCodes.CONFIG_ERROR);
  }

  const errorHandler = new EnhancedErrorHandler({ verbose: args.verbose });
  
  const contentDir = args['content-dir'];
  const distDir = path.dirname(args.output);
  const outputFile = args.output;
  
  errorHandler.log('Starting build process...');
  errorHandler.log(`Content directory: ${contentDir}`);
  errorHandler.log(`Output file: ${outputFile}`);
  
  try {
    await ensureDirectory(distDir);
    
    const markdownParser = new MarkdownParser();
    const manifestParser = new ManifestParser();
    
    let manifest = {
      title: 'My Presentation',
      author: '',
      date: new Date().toISOString().split('T')[0],
      theme: 'default',
      slides: []
    };
    
    const rootDir = path.resolve(process.cwd());
    const manifestPath = path.join(rootDir, args.config);
    
    if (fs.existsSync(manifestPath)) {
      errorHandler.log(`Loading manifest: ${manifestPath}`);
      
      if (!(await directoryExists(path.dirname(contentDir)))) {
        errorHandler.handle(
          new Error(`Content directory not found`),
          `Content directory "${contentDir}" does not exist`,
          'DIRECTORY_NOT_FOUND',
          { directory: contentDir }
        );
        process.exit(errorHandler.getExitCode());
      }
      
      try {
        manifest = await manifestParser.load(manifestPath);
        errorHandler.log(`Loaded ${manifest.slides.length} slide(s) from manifest`);
      } catch (error) {
        if (error.code) {
          const enhancedError = errorHandler.handle(
            error,
            error.message,
            error.code,
            { manifestPath }
          );
          process.exit(enhancedError.exitCode);
        }
        throw error;
      }
    } else {
      errorHandler.log(`No manifest found at ${manifestPath}, using defaults`);
    }
    
   const allSlides = [];
    const mermaidRenderer = new MermaidRenderer();
    
    if (manifest.slides && manifest.slides.length > 0) {
      errorHandler.log('Processing slides from manifest...');
      
      for (const slideConfig of manifest.slides) {
        if (slideConfig.included === false) {
          errorHandler.log(`  Skipping: ${slideConfig.title || slideConfig.path}`);
          continue;
        }
        
        if (slideConfig.path) {
          errorHandler.log(`  Processing: ${slideConfig.path}`);
          
          const slidePath = path.isAbsolute(slideConfig.path)
            ? slideConfig.path
            : slideConfig.path.startsWith('content')
              ? path.join(process.cwd(), slideConfig.path)
              : path.join(contentDir, slideConfig.path);
          
          const indexPath = path.join(slidePath, 'index.md');
          
          if (!fs.existsSync(indexPath)) {
            errorHandler.handle(
              new Error(`Index file not found`),
              `index.md not found in "${slidePath}"`,
              'FILE_NOT_FOUND',
              { filePath: indexPath }
            );
            process.exit(errorHandler.getExitCode());
          }
          
          const content = await readFile(indexPath);
           
          const diagramValidation = markdownParser.validateDiagrams(content);
          if (diagramValidation.invalid > 0) {
            console.warn(`  ⚠ Found ${diagramValidation.invalid} invalid diagram(s) in ${slideConfig.path}`);
          }
          
          const preprocessedContent = convertMermaidBlocks(content);
          const slides = await markdownParser.extractSlides(preprocessedContent);
          
          slides.forEach(slide => {
            slide.order = slideConfig.order;
            slide.title = slideConfig.title || slide.title;
            slide.type = slide.type || 'content';
          });
          
          allSlides.push(...slides);
        }
      }
      
      allSlides.sort((a, b) => (a.order || 999) - (b.order || 999));
    } else {
      errorHandler.log('No slides in manifest, discovering markdown files...');
      const markdownFiles = await getMarkdownFiles(contentDir);
      errorHandler.log(`Found ${markdownFiles.length} markdown file(s)`);
      
      if (markdownFiles.length === 0) {
        errorHandler.log('No markdown files found, creating default presentation');
        const defaultSlides = [{
          id: 1,
          content: '# Welcome\n\nThis is a generated presentation.',
          type: 'title',
          title: 'Welcome'
        }];
        
        const htmlGenerator = new HtmlGenerator();
        const html = await htmlGenerator.generate({
          title: manifest.title || 'Presentation',
          author: manifest.author || '',
          date: manifest.date || new Date().toISOString().split('T')[0],
          slides: defaultSlides,
          baseDir: contentDir
        });
        
        await writeFile(outputFile, html);
        console.log(`\x1b[32m✓ Default presentation created at ${outputFile}\x1b[0m`);
        process.exit(ExitCodes.SUCCESS);
      }
       
      for (const file of markdownFiles) {
        errorHandler.log(`Processing: ${file}`);
        const content = await readFile(file);
        const preprocessedContent = convertMermaidBlocks(content);
        const slides = await markdownParser.extractSlides(preprocessedContent);
        
        allSlides.push(...slides);
      }
    }
    
    errorHandler.log(`Generating HTML with ${allSlides.length} slide(s)...`);
    
    const htmlGenerator = new HtmlGenerator();
    const html = await htmlGenerator.generate({
      title: manifest.title || 'Presentation',
      author: manifest.author || '',
      date: manifest.date || new Date().toISOString().split('T')[0],
      slides: allSlides,
      baseDir: contentDir
    });
    
    try {
      await writeFile(outputFile, html);
    } catch (error) {
      errorHandler.handle(
        error,
        `Failed to write output file: ${outputFile}`,
        'BUILD_OUTPUT_ERROR',
        { filePath: outputFile }
      );
      process.exit(errorHandler.getExitCode());
    }
    
    console.log(`\x1b[32m✓ Build complete! Output: ${outputFile}\x1b[0m`);
    process.exit(ExitCodes.SUCCESS);
    
  } catch (error) {
    if (!errorHandler.hasErrors()) {
      errorHandler.handle(
        error,
        'Build failed with unexpected error',
        'BUILD_ERROR'
      );
    }
    process.exit(errorHandler.getExitCode());
  }
}

main();
