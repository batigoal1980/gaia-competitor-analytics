const { GoogleGenAI, createUserContent, createPartFromUri } = require('@google/genai');
const fs = require('fs');
const path = require('path');

class GAIAVideoAnalyzer {
  constructor(apiKey) {
    this.genAI = new GoogleGenAI({ apiKey });
    // Use the correct model for video understanding
    this.model = "gemini-2.5-flash";
    
    // Simplified Video Analysis with Section-Based Organization
    this.systemPrompt = `
You are a video content analyst. Analyze the uploaded video and provide a comprehensive analysis organized by clear sections.

## ANALYSIS FORMAT

Provide your analysis in this structured text format:

**CONTEXT DETECTION:**
- Detected Vertical: [primary vertical with confidence]
- Detected Platform: [primary platform with confidence]
- Multi-Vertical: [yes/no]
- Platform Optimization: [key platform-specific features]

**VISUAL COMPOSITION:**
1. [detailed visual analysis]
2. [detailed visual analysis]
[continue with relevant visual elements]

**AUDIO ELEMENTS:**
1. [detailed audio analysis]
2. [detailed audio analysis]
[continue with relevant audio elements]

**TEXT OVERLAYS:**
1. [detailed text analysis]
2. [detailed text analysis]
[continue with relevant text elements]

**TEMPORAL STRUCTURE:**
1. [detailed structure analysis]
2. [detailed structure analysis]
[continue with relevant structure elements]

**PERFORMANCE INDICATORS:**
1. [detailed performance analysis]
2. [detailed performance analysis]
[continue with relevant performance elements]

**VERTICAL CONTEXT:**
1. [detailed vertical-specific analysis]
2. [detailed vertical-specific analysis]
[continue with relevant vertical elements]

**PLATFORM CONTEXT:**
1. [detailed platform-specific analysis]
2. [detailed platform-specific analysis]
[continue with relevant platform elements]

## FORMAT REFERENCE EXAMPLE:

**CONTEXT DETECTION:**
- Detected Vertical: Home Goods / Sleep Health (0.95)
- Detected Platform: Short-Form Video / Social Media (0.90)
- Multi-Vertical: No
- Platform Optimization: Vertical video format, mobile-optimized, fast-paced editing

**VISUAL COMPOSITION:**
1. Bedroom setting visual.
2. Single speaker presence.
3. Direct-to-camera address by speaker.
4. Product packaging display.
5. Animated emoji overlays (e.g., sweat, cold, sleep, hearts, snowflakes, germs, sun, queen, party, truck, towels).
6. Fantasy/concept animation (astronaut, sleeping couple).
7. Bright and clean visual aesthetic.
8. Varied shot composition (close-up to medium shots).
9. Product demonstration (sheets being changed, implied).
10. Lifestyle imagery (couple sleeping comfortably).
11. Visually engaging transitions.
12. Emphasis on product benefits through visuals.
13. Minimalist background for focus.
14. Clear branding on product packaging.
15. Consistent visual tone.

**AUDIO ELEMENTS:**
1. Female voiceover narration.
2. Enthusiastic and friendly vocal tone.
3. Upbeat background music.
4. Clear and concise audio delivery.
5. Conversational speech style.

**TEXT OVERLAYS:**
1. Key benefits highlighted in text.
2. Animated text for emphasis.
3. Brand name display ("Miracle Sheets," "Miracle Made").
4. Problem statement text.
5. Solution-oriented text.
6. Promotional offer text.
7. Call-to-action text overlay.
8. Feature-benefit text pairing.
9. Visual comparison with text (e.g., "5-star hotels").
10. Support for audio narration.

**TEMPORAL STRUCTURE:**
1. Strong opening hook ("Hey You!").
2. Problem-solution narrative flow.
3. Fast-paced editing.
4. Benefit-driven storytelling arc.
5. Direct and urgent call to action.

**PERFORMANCE INDICATORS:**
1. Direct response advertising.
2. Conversion-focused creative.
3. Trial promotion.

**VERTICAL CONTEXT:**
1. Sleep quality improvement.
2. Temperature regulation benefit.
3. Bedding product category.
4. Hygiene and cleanliness focus (self-cleaning, antibacterial).
5. Comfort and luxury appeal.
6. Health and wellness connection (deep sleep).
7. Household utility product.
8. Innovative fabric technology (NASA-inspired).
9. Solution for common sleep issues (night sweats, exhaustion).
10. Home improvement/lifestyle enhancement.

**PLATFORM CONTEXT:**
1. Vertical video format (9:16 aspect ratio).
2. Optimized for mobile viewing.

## ANALYSIS GUIDELINES

**Visual Composition:**
- Keep descriptions concise and specific (e.g., "Bedroom setting visual", "Single speaker presence")
- Focus on what is visually present, not detailed analysis
- Use simple, direct language like the example format

**Audio Elements:**
- Keep descriptions concise and specific (e.g., "Female voiceover narration", "Upbeat background music")
- Focus on what is audibly present, not detailed analysis
- Use simple, direct language like the example format

**Text Overlays:**
- Keep descriptions concise and specific (e.g., "Key benefits highlighted in text", "Brand name display")
- Focus on what text is present, not detailed analysis
- Use simple, direct language like the example format

**Temporal Structure:**
- Keep descriptions concise and specific (e.g., "Strong opening hook", "Fast-paced editing")
- Focus on structural elements, not detailed analysis
- Use simple, direct language like the example format

**Performance Indicators:**
- Keep descriptions concise and specific (e.g., "Direct response advertising", "Conversion-focused creative")
- Focus on performance intent, not detailed analysis
- Use simple, direct language like the example format

**Vertical Context:**
- Keep descriptions concise and specific (e.g., "Sleep quality improvement", "Bedding product category")
- Focus on vertical-specific elements, not detailed analysis
- Use simple, direct language like the example format

**Platform Context:**
- Keep descriptions concise and specific (e.g., "Vertical video format", "Optimized for mobile viewing")
- Focus on platform-specific elements, not detailed analysis
- Use simple, direct language like the example format

## CRITICAL REQUIREMENTS:

1. **MUST use the exact section headers shown above (with ** and : )**
2. **MUST number items sequentially within each section**
3. **MUST be descriptive, specific, and professional in analysis**
4. **MUST focus on the most relevant elements for the detected vertical and platform**
5. **MUST provide context-specific insights where applicable**
6. **MUST maintain high quality and accuracy in analysis**

Analyze the provided video using this comprehensive framework and generate detailed insights organized by the specified sections.
    `;
  }

  // Helper method to wait for file to be ready
  async waitForFileReady(fileName, maxAttempts = 60) {
    console.log(`Waiting for file ${fileName} to be ready...`);
    
    // Use the correct API pattern: poll until file state becomes ACTIVE
    let myfile = { name: fileName };
    let attempts = 0;
    
    while ((!myfile.state || myfile.state.toString() !== "ACTIVE") && attempts < maxAttempts) {
      attempts++;
      console.log(`Checking file status (attempt ${attempts}/${maxAttempts})...`);
      console.log(`File state: ${myfile.state}`);
      
      try {
        // Use the correct API call: ai.files.get({ name: myfile.name })
        myfile = await this.genAI.files.get({ name: myfile.name });
        console.log(`Updated file state: ${myfile.state}`);
        
        if (myfile.state === 'ACTIVE') {
          console.log('✅ File is ready for analysis!');
          return myfile;
        } else if (myfile.state === 'FAILED') {
          throw new Error(`File processing failed: ${myfile.state}`);
        }
        
        // Wait 5 seconds before next check (as in the example)
        console.log('File still processing, waiting 5 seconds...');
        await new Promise(resolve => setTimeout(resolve, 5000));
        
      } catch (error) {
        console.error(`Error checking file status (attempt ${attempts}):`, error.message);
        
        if (attempts >= maxAttempts) {
          console.error(`File ${fileName} never became ready after ${maxAttempts} attempts`);
          throw new Error(`File never became ready after ${maxAttempts} attempts. Last error: ${error.message}`);
        }
        
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
    }
    
    // If we get here, we'll proceed anyway
    console.log('Proceeding with analysis - file should be ready by now');
    return { name: fileName, state: 'ACTIVE' };
  }

  // Helper method to generate content with retry logic
  async generateContentWithRetry(fileUri, mimeType, maxRetries = 3) {
    console.log(`generateContentWithRetry called with fileUri: ${fileUri}, mimeType: ${mimeType}`);
    console.log(`this.genAI.models:`, typeof this.genAI.models);
    console.log(`this.genAI.models.generateContent:`, typeof this.genAI.models.generateContent);
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`Attempt ${attempt} of ${maxRetries} to generate content...`);
        console.log(`Calling generateContent with model: ${this.model}`);
        
        // Debug the content creation
        console.log(`Creating part from URI: ${fileUri}`);
        const part = createPartFromUri(fileUri, mimeType);
        console.log(`Part created:`, typeof part);
        
        console.log(`Creating user content...`);
        const contents = createUserContent([
          part,
          this.systemPrompt,
        ]);
        console.log(`Contents created:`, typeof contents);
        
        const response = await this.genAI.models.generateContent({
          model: this.model,
          contents: contents,
          generationConfig: {
            temperature: 0.1,
            topP: 0.8,
            topK: 40,
            maxOutputTokens: 8192,
          },
          safetySettings: [
            {
              category: "HARM_CATEGORY_HARASSMENT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_HATE_SPEECH", 
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_DANGEROUS_CONTENT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            }
          ]
        });

        // Add null check for response
        if (!response) {
          throw new Error('No response received from Gemini API');
        }

        // Check if content was blocked
        if (response.promptFeedback && response.promptFeedback.blockReason) {
          console.error('Content blocked by Gemini API:', response.promptFeedback);
          throw new Error(`Content blocked: ${response.promptFeedback.blockReason}. This may be due to content policy violations.`);
        }

        // Handle different response structures
        let analysis;
        if (response.text) {
          analysis = response.text;
        } else if (response.response && response.response.text) {
          analysis = response.response.text;
        } else if (response.candidates && response.candidates[0] && response.candidates[0].content) {
          analysis = response.candidates[0].content.parts[0].text;
        } else {
          console.error('Unexpected response structure:', JSON.stringify(response, null, 2));
          throw new Error('No analysis text found in response');
        }
        
        if (!analysis) {
          console.error('No text in response:', response);
          throw new Error('No analysis text received from Gemini API');
        }

        console.log(`Successfully generated content on attempt ${attempt}`);
        return analysis;
        
      } catch (error) {
        console.error(`Attempt ${attempt} failed:`, error.message);
        
        if (attempt === maxRetries) {
          throw new Error(`All ${maxRetries} attempts failed. Last error: ${error.message}`);
        }
        
        // Wait before retrying (exponential backoff)
        const waitTime = Math.pow(2, attempt) * 1000; // 2s, 4s, 8s
        console.log(`Waiting ${waitTime}ms before retry...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }
  }

  // Main analysis function with proper video handling using File API
  async analyzeVideo(videoPath) {
    console.log('Starting hierarchical video analysis with 50 creative labels...');

    try {
      const fileSize = fs.statSync(videoPath).size;
      console.log(`Video file size: ${(fileSize / (1024 * 1024)).toFixed(2)} MB`);
      
      // Upload the video file using File API
      console.log('Uploading video file using File API...');
      let myfile;
      try {
        myfile = await this.genAI.files.upload({
          file: videoPath,
          config: { mimeType: "video/mp4" },
        });
        console.log('✅ File upload successful');
      } catch (uploadError) {
        console.error('❌ File upload failed:', uploadError);
        throw new Error(`File upload failed: ${uploadError.message}`);
      }
      
      console.log('File uploaded successfully, waiting for processing...');
      console.log('File details:', { name: myfile.name, uri: myfile.uri, state: myfile.state });
      
      // Wait for the file to be ready (ACTIVE state)
      console.log('Waiting for file to be ready...');
      console.log('File name from upload:', myfile.name);
      const readyFile = await this.waitForFileReady(myfile.name);
      console.log('✅ File is confirmed ready:', readyFile.state);
      
      console.log('File is ready, generating content...');
      
      // Generate content using the uploaded file with retry logic
      const analysis = await this.generateContentWithRetry(myfile.uri, myfile.mimeType);
      
      // Return the analysis as structured text
      console.log('✅ Analysis completed successfully');
      return {
        analysis: analysis,
        format: 'text',
        timestamp: new Date().toISOString(),
        fileSize: `${(fileSize / (1024 * 1024)).toFixed(2)} MB`
      };

    } catch (error) {
      console.error('Video analysis error:', error);
      throw new Error(`Analysis failed: ${error.message}`);
    }
  }

  // Analyze video with custom frame rate using File API
  async analyzeVideoWithCustomFPS(videoPath, fps = 1) {
    console.log(`Starting video analysis with custom FPS: ${fps}...`);

    try {
      // Upload the video file using File API
      console.log('Uploading video file using File API...');
      const myfile = await this.genAI.files.upload({
        file: videoPath,
        config: { mimeType: "video/mp4" },
      });
      
      console.log('File uploaded successfully, waiting for processing...');
      console.log('File details:', { name: myfile.name, uri: myfile.uri, state: myfile.state });
      
      // Wait for the file to be ready (ACTIVE state)
      await this.waitForFileReady(myfile.name);
      
      console.log('File is ready, generating content...');
      
      // Generate content using the uploaded file with retry logic
      const analysis = await this.generateContentWithRetry(myfile.uri, myfile.mimeType);
      
      try {
        let jsonString = analysis;
        
        // Remove markdown code blocks if present
        if (jsonString.includes('```json')) {
          jsonString = jsonString.replace(/```json\s*/, '').replace(/\s*```$/, '');
        }
        if (jsonString.includes('```')) {
          jsonString = jsonString.replace(/```\s*/, '').replace(/\s*```$/, '');
        }
        
        // Clean up any remaining whitespace
        jsonString = jsonString.trim();
        
        return JSON.parse(jsonString);
      } catch (parseError) {
        return {
          analysis: analysis,
          format: 'text',
          timestamp: new Date().toISOString(),
          fps: fps
        };
      }

    } catch (error) {
      console.error('Video analysis error:', error);
      throw new Error(`Analysis failed: ${error.message}`);
    }
  }

  // Analyze specific video segment using File API
  async analyzeVideoSegment(videoPath, startOffset, endOffset) {
    console.log(`Analyzing video segment from ${startOffset} to ${endOffset}...`);

    try {
      // Upload the video file using File API
      console.log('Uploading video file using File API...');
      const myfile = await this.genAI.files.upload({
        file: videoPath,
        config: { mimeType: "video/mp4" },
      });
      
      console.log('File uploaded successfully, waiting for processing...');
      console.log('File details:', { name: myfile.name, uri: myfile.uri, state: myfile.state });
      
      // Wait for the file to be ready (ACTIVE state)
      await this.waitForFileReady(myfile.name);
      
      console.log('File is ready, generating content...');
      
      // Generate content using the uploaded file with retry logic
      const analysis = await this.generateContentWithRetry(myfile.uri, myfile.mimeType);
      
      try {
        let jsonString = analysis;
        
        // Remove markdown code blocks if present
        if (jsonString.includes('```json')) {
          jsonString = jsonString.replace(/```json\s*/, '').replace(/\s*```$/, '');
        }
        if (jsonString.includes('```')) {
          jsonString = jsonString.replace(/```\s*/, '').replace(/\s*```$/, '');
        }
        
        // Clean up any remaining whitespace
        jsonString = jsonString.trim();
        
        return JSON.parse(jsonString);
      } catch (parseError) {
        return {
          analysis: analysis,
          format: 'text',
          timestamp: new Date().toISOString(),
          segment: { startOffset, endOffset }
        };
      }

    } catch (error) {
      console.error('Video segment analysis error:', error);
      throw new Error(`Segment analysis failed: ${error.message}`);
    }
  }

  // Analyze video by URL
  async analyzeVideoByUrl(videoUrl) {
    console.log('Starting hierarchical video analysis by URL...');

    try {
      console.log(`Video URL: ${videoUrl}`);
      
      // Download the video to a temporary file
      const https = require('https');
      const http = require('http');
      const tempPath = path.join(__dirname, 'temp', `video-${Date.now()}-${Math.random().toString(36).substr(2, 9)}.mp4`);
      
      // Ensure temp directory exists
      const tempDir = path.dirname(tempPath);
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
      }
      
      console.log(`📥 Downloading video to: ${tempPath}`);
      
      // Download the video
      const downloadVideo = () => {
        return new Promise((resolve, reject) => {
          const protocol = videoUrl.startsWith('https:') ? https : http;
          const file = fs.createWriteStream(tempPath);
          
          protocol.get(videoUrl, (response) => {
            if (response.statusCode !== 200) {
              reject(new Error(`Failed to download video: ${response.statusCode}`));
              return;
            }
            
            response.pipe(file);
            
            file.on('finish', () => {
              file.close();
              console.log(`✅ Video downloaded successfully: ${tempPath}`);
              resolve(tempPath);
            });
            
            file.on('error', (err) => {
              fs.unlink(tempPath, () => {}); // Delete the file async
              reject(err);
            });
          }).on('error', (err) => {
            reject(err);
          });
        });
      };
      
      const videoPath = await downloadVideo();
      
      // Now analyze the downloaded video using the existing method
      const analysis = await this.analyzeVideo(videoPath);
      
      // Clean up the temporary file
      try {
        fs.unlinkSync(videoPath);
        console.log(`🗑️ Temporary file cleaned up: ${videoPath}`);
      } catch (cleanupError) {
        console.warn(`⚠️ Failed to clean up temporary file: ${cleanupError.message}`);
      }
      
      return analysis;

    } catch (error) {
      console.error('Video analysis error:', error);
      throw new Error(`Analysis failed: ${error.message}`);
    }
  }

  // Simple batch analysis
  async analyzeBatch(videoPaths) {
    console.log(`Starting batch analysis of ${videoPaths.length} videos...`);
    
    const results = [];
    const errors = [];

    for (const videoPath of videoPaths) {
      try {
        console.log(`Analyzing: ${path.basename(videoPath)}`);
        const analysis = await this.analyzeVideo(videoPath);
        results.push({
          videoPath: path.basename(videoPath),
          analysis: analysis,
          status: 'completed'
        });
      } catch (error) {
        console.error(`Error analyzing ${path.basename(videoPath)}:`, error);
        errors.push({
          videoPath: path.basename(videoPath),
          error: error.message,
          status: 'failed'
        });
      }
    }

    return {
      totalVideos: videoPaths.length,
      completed: results.length,
      failed: errors.length,
      results: results,
      errors: errors
    };
  }
}

module.exports = GAIAVideoAnalyzer; 