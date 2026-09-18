import React, { useMemo } from 'react'

function Preview({ tree }) {

  const srcDoc = useMemo(() => {
    let html = ""
    let css = ""
    let js = ""

    const walk = (items = []) => {
      for (const item of items) {
        if (item.type == "file") {
          if (item.name == "index.html") html = item.content || ""
          if (item.name.endsWith("css")) css = item.content || ""
          if (item.name.endsWith("js")) js = item.content || ""
        }
        if(item.children?.length)walk(item.children)
      }
    }

    walk(tree)

    if(!html){
      return `
      <!DOCTYPE html>
      <html>
        <body style="
          margin:0;
          background:#0a0a0c;
          color:#999;
          font-family:Arial,sans-serif;
          display:flex;
          align-items:center;
          justify-content:center;
          height:100vh;
        ">
          <div style="text-align:center;">
            <h3 style="margin:0 0 6px;">No index.html found</h3>
            <p style="margin:0; font-size:13px;color:#666;">Create an HTML project to see the preview.</p>
          </div>
        </body>
      </html>
      `;
    }

    if(css){
      html=html.includes("</head>") ? html.replace("</head>", `<style>${css}</style></head>`) : `<style>${css}</style>${html}`
    }

    if(js){
      const script = `<script>\n${js}\n</script>`;
      html = html.includes("</body>") ?  html.replace("</body>", `${script}</body>`) : html + script;
    }

    return html;

  }, [tree])


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
