import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// Utility function to generate PDF blob (for viewing or downloading)
export const generatePDFBlob = async (content) => {
  // Create a temporary container for the content
  const container = document.createElement('div');
  container.style.position = 'absolute';
  container.style.left = '-9999px';
  container.style.width = '800px';
  container.style.padding = '40px';
  container.style.backgroundColor = 'white';
  container.style.fontFamily = "'Open Sans', 'Roboto', Arial, sans-serif";
  container.style.lineHeight = '1.6';
  container.style.color = '#333';
  container.style.fontSize = '14px';
  
  // Create styled HTML content with inline styles for better PDF rendering
  const htmlContent = `
    <div style="max-width: 800px; margin: 0 auto; font-family: 'Open Sans', 'Roboto', Arial, sans-serif; line-height: 1.6; color: #333;">
      ${content}
      <div style="margin-top: 50px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666; text-align: center;">
        <p style="margin-bottom: 8px;"><strong style="font-weight: 600;">UNDP Digital & AI Hub</strong> - Learning Module Resource</p>
        <p style="margin: 0;">Generated on ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
      </div>
    </div>
  `;
  
  container.innerHTML = htmlContent;
  document.body.appendChild(container);
  
  // Wait a bit for fonts and styles to load
  await new Promise(resolve => setTimeout(resolve, 100));
  
  try {
    // Convert HTML to canvas
    const canvas = await html2canvas(container, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      windowWidth: 800,
      windowHeight: container.scrollHeight,
    });
    
    const imgData = canvas.toDataURL('image/png', 1.0);
    
    // Calculate PDF dimensions
    const imgWidth = 210; // A4 width in mm
    const pageHeight = 297; // A4 height in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;
    
    // Create PDF
    const pdf = new jsPDF('p', 'mm', 'a4');
    let position = 0;
    
    // Add first page
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;
    
    // Add additional pages if needed
    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }
    
    // Clean up
    document.body.removeChild(container);
    
    // Return PDF blob
    return pdf.output('blob');
  } catch (error) {
    console.error('Error generating PDF:', error);
    if (container.parentNode) {
      document.body.removeChild(container);
    }
    throw error;
  }
};

// Utility function to view PDF in new window
export const viewAsPDF = async (content, filename) => {
  try {
    const blob = await generatePDFBlob(content);
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
    // Clean up the URL after a delay (browser will keep it alive while window is open)
    setTimeout(() => URL.revokeObjectURL(url), 100);
  } catch (error) {
    console.error('Error viewing PDF:', error);
    alert('Error generating PDF preview. Please try again.');
  }
};

// Utility function to download content as PDF
export const downloadAsPDF = async (content, filename) => {
  try {
    const blob = await generatePDFBlob(content);
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error generating PDF:', error);
    // Fallback: create HTML file
    const htmlContentFull = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>${filename.replace('.pdf', '')}</title>
        <style>
          body {
            font-family: 'Open Sans', 'Roboto', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            padding: 40px 20px;
            background: white;
          }
          h1 {
            color: #006EB0;
            border-bottom: 3px solid #006EB0;
            padding-bottom: 10px;
            margin-bottom: 20px;
          }
          h2 {
            color: #006EB0;
            margin-top: 30px;
            margin-bottom: 15px;
          }
          h3 {
            color: #003D6B;
            margin-top: 20px;
            margin-bottom: 10px;
          }
        </style>
      </head>
      <body>
        ${content}
      </body>
      </html>
    `;
    
    const blob = new Blob([htmlContentFull], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename.replace('.pdf', '.html');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
};

// Convert markdown-like content to HTML
export const markdownToHTML = (markdown) => {
  let html = markdown;
  
  // Convert headers (must be done first, before paragraph wrapping)
  html = html.replace(/^### (.*$)/gim, '<h3 style="color: #003D6B; margin-top: 20px; margin-bottom: 10px; font-size: 18px; font-weight: 600;">$1</h3>');
  html = html.replace(/^## (.*$)/gim, '<h2 style="color: #006EB0; margin-top: 30px; margin-bottom: 15px; font-size: 22px; font-weight: 600;">$1</h2>');
  html = html.replace(/^# (.*$)/gim, '<h1 style="color: #006EB0; border-bottom: 3px solid #006EB0; padding-bottom: 10px; margin-bottom: 20px; font-size: 28px; font-weight: 700;">$1</h1>');
  
  // Convert bold
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong style="font-weight: 600;">$1</strong>');
  
  // Convert code blocks (inline)
  html = html.replace(/`([^`]+)`/g, '<code style="background-color: #F7F7F7; padding: 2px 6px; border-radius: 3px; font-family: \'Courier New\', monospace; font-size: 14px;">$1</code>');
  
  // Convert numbered lists
  const lines = html.split('\n');
  let inList = false;
  let result = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Check for numbered list item
    const numberedMatch = line.match(/^(\d+)\.\s+(.*)$/);
    if (numberedMatch) {
      if (!inList) {
        result.push('<ul style="margin: 10px 0 10px 30px; list-style-type: decimal;">');
        inList = true;
      }
      result.push(`<li style="margin: 5px 0;">${numberedMatch[2]}</li>`);
    } else {
      // Check for bullet list item
      const bulletMatch = line.match(/^-\s+(.*)$/);
      if (bulletMatch) {
        if (!inList) {
          result.push('<ul style="margin: 10px 0 10px 30px; list-style-type: disc;">');
          inList = true;
        }
        result.push(`<li style="margin: 5px 0;">${bulletMatch[1]}</li>`);
      } else {
        if (inList) {
          result.push('</ul>');
          inList = false;
        }
        if (line && !line.match(/^<h[1-3]/)) {
          result.push(`<p style="margin-bottom: 12px; line-height: 1.6;">${line}</p>`);
        } else if (line) {
          result.push(line);
        }
      }
    }
  }
  
  if (inList) {
    result.push('</ul>');
  }
  
  html = result.join('\n');
  
  // Clean up empty paragraphs
  html = html.replace(/<p><\/p>/g, '');
  html = html.replace(/<p>\s*<\/p>/g, '');
  
  return html;
};
