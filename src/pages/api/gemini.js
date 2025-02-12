import axios from 'axios';

// Helper function to generate a formatted document
export const getFormattedDocument = async (prompt, pages) => {
  const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
  const url = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent';

  const wordsPerPage = 500;
  const totalWords = pages * wordsPerPage;

  try {
    const response = await axios.post(
      url,
      {
        contents: [
          {
            parts: [
              {
                text: `Generate a well-formatted document with HTML tags for the following prompt: ${prompt}. 
                The document should be approximately ${totalWords} words long to fill ${pages} A4 pages.
                Include a title, introduction, main content with multiple sections, and a conclusion.
                Use appropriate HTML tags for formatting and insert <div class="page-break"></div> tag 
                approximately every ${wordsPerPage} words to create natural page breaks.
                Format the content with proper headings, paragraphs, and lists to ensure good readability.
                `
              }
            ]
          }
        ]
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
        params: {
          key: apiKey,
        },
      }
    );

    if (response.data && response.data.candidates && response.data.candidates[0].content) {
      const formattedText = response.data.candidates[0].content.parts[0].text;

      // Add formatting for the synopsis
      if (prompt.includes('synopsis')) {
        const sections = [
          'Introduction',
          'Problem Statement',
          'Literature Review',
          'Proposed Solution',
          'Project Scope',
          'Modules and Functionalities',
          'Expected Results',
          'Conclusion'
        ];
        const formattedSections = sections.map(section => `<h2>${section}</h2><p>${formattedText}</p>`).join('');
        const styledHtml = `<div style="font-family: Times New Roman; line-height: 1.5; margin: 1 inch;">${formattedSections}</div>`;
        
        return {
          formattedText: styledHtml,
          title: 'Generated Synopsis',
        };
      }

      const processedText = formattedText
  .replace(/<div class="page-break"><\/div>/g, '<p class="page-break">&nbsp;</p>')
  .replace(/<h1>(.*?)<\/h1>/g, '<h1 class="text-3xl font-bold mb-4">$1</h1>')
  .replace(/<h2>(.*?)<\/h2>/g, '<h2 class="text-2xl font-bold mb-3">$1</h2>')
  .replace(/<p>/g, '<p class="mb-4">')
  .replace(/```html/g, '')
  .replace(/```/g, ''); 

        

      const styledHtml = `
        <div style="font-family: Arial, sans-serif; line-height: 1.6;">
          ${processedText}
        </div>
      `;

      const titleMatch = formattedText.match(/<h1.*?>(.*?)<\/h1>/);
      const title = titleMatch ? titleMatch[1] : 'Generated Document';

      return {
        formattedText: styledHtml,
        title: title,
      };
    } else {
      throw new Error('Unexpected response structure');
    }
  } catch (error) {
    console.error('Error generating document:', error);
    return null;
  }
};

// API route handler
export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { prompt, pages } = req.body;

    if (!prompt || !pages) {
      return res.status(400).json({ error: 'Missing required fields: prompt or pages' });
    }

    try {
      const result = await getFormattedDocument(prompt, pages);
      if (result) {
        return res.status(200).json(result);
      } else {
        return res.status(500).json({ error: 'Failed to generate the document' });
      }
    } catch (error) {
      return res.status(500).json({ error: 'Internal server error', details: error.message });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
    return res.status(200).json({demo: true});
  }
}
