import React, { useMemo } from 'react'

function Preview({ tree }) {

  const srcDoc = useMemo(() => {
    let html = ""
    let css = ""
    let appJsx = ""
    let mainJsx = ""
    let isReact = false
    let plainJs = ""

    const walk = (items = []) => {
      for (const item of items) {
        if (item.type === "file") {
          if (item.name === "index.html") html = item.content || ""
          if (item.name.endsWith(".css")) css += (item.content || "") + "\n"
          if (item.name === "App.jsx") { appJsx = item.content || ""; isReact = true; }
          if (item.name === "main.jsx") { mainJsx = item.content || ""; isReact = true; }
          if (item.name.endsWith(".js") && !item.name.endsWith("config.js")) plainJs += (item.content || "") + "\n"
        }
        if(item.children?.length) walk(item.children)
      }
    }

    walk(tree)

    if (isReact) {
        const stripImports = (code) => {
            return code
                .replace(/import\s+.*?from\s+['"]react['"];?/g, '')
                .replace(/import\s+.*?from\s+['"]react-dom.*?['"];?/g, '')
                .replace(/import.*\.css['"];?/g, '')
                .replace(/import App from ['"].\/App(\.jsx)?['"];?/g, '');
        };
            
        const combinedJsx = `
import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import ReactDOM, { createRoot } from 'react-dom/client';
${stripImports(appJsx)}
${stripImports(mainJsx)}
        `;

        if (!html.includes('id="root"')) {
            html = `<!DOCTYPE html><html><head></head><body><div id="root"></div></body></html>`;
        }

        const injection = `
          <script type="importmap">
          {
            "imports": {
              "react": "https://esm.sh/react@18.2.0",
              "react-dom/client": "https://esm.sh/react-dom@18.2.0/client"
            }
          }
          </script>
          <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
          <style>${css}</style>
        `;

        if (html.includes('</head>')) {
             html = html.replace('</head>', `${injection}</head>`);
        } else {
             html = `<head>${injection}</head>` + html;
        }

        html = html.replace(/<script.*src=["'].*main\.jsx["'].*><\/script>/g, '');
        
        const executableScript = `
          <script type="text/babel" data-type="module">
            ${combinedJsx}
          </script>
        `;

        if (html.includes('</body>')) {
             html = html.replace('</body>', `${executableScript}</body>`);
        } else {
             html = html + executableScript;
        }
        
        return html;
    }

    // 2. Fallback for Plain HTML/CSS/JS Projects
    if (!html) {
      return `
      <!DOCTYPE html>
      <html>
        <body style="margin:0; background:#0a0a0c; color:#999; font-family:sans-serif; display:flex; align-items:center; justify-content:center; height:100vh;">
          <div style="text-align:center;">
            <h3 style="margin:0 0 6px;">Empty Project</h3>
            <p style="margin:0; font-size:13px;color:#666;">Create an HTML or React project to see the preview.</p>
          </div>
        </body>
      </html>
      `;
    }

    if (css) {
      html = html.includes("</head>") ? html.replace("</head>", `<style>${css}</style></head>`) : `<style>${css}</style>${html}`
    }

    if (plainJs) {
      const script = `<script>\n${plainJs}\n</script>`;
      html = html.includes("</body>") ?  html.replace("</body>", `${script}</body>`) : html + script;
    }

    return html;

  }, [tree]);

  return (
    <div className='flex h-full w-full flex-col bg-white'>
      <div className='flex h-10 shrink-0 items-center justify-between bg-[#111113] px-4'>
        <div className='flex items-center gap-2'>
          <div className='h-2 w-2 rounded-full bg-emerald-400'/>
          <span className='text-xs text-zinc-300'>Preview</span>
        </div>
      </div>
      <div className='min-h-0 flex-1 bg-white'>
        <iframe
          title='Project Preview'
          srcDoc={srcDoc}
          sandbox='allow-scripts allow-forms allow-modals'
          className='h-full w-full border-0'
        />
      </div>
    </div>
  )
}

export default Preview