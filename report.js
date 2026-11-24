// Embed a single high-resolution page in an A4 PDF, retaining the browser's Thai glyph rendering.
function pagePDF(jpeg,width,height){
 const encoder=new TextEncoder(),parts=[],offsets=[0];
 let length=0;
 function append(value){const bytes=typeof value==='string'?encoder.encode(value):value;parts.push(bytes);length+=bytes.length}
 function object(id,body){offsets[id]=length;append(id+' 0 obj\n');append(body);append('\nendobj\n')}
 append('%PDF-1.4\n');
 object(1,'<< /Type /Catalog /Pages 2 0 R >>');
 object(2,'<< /Type /Pages /Count 1 /Kids [3 0 R] >>');
 object(3,'<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /XObject << /PageImage 4 0 R >> >> /Contents 5 0 R >>');
 offsets[4]=length;
 append('4 0 obj\n<< /Type /XObject /Subtype /Image /Width '+width+' /Height '+height+' /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length '+jpeg.length+' >>\nstream\n');
 append(jpeg);append('\nendstream\nendobj\n');
 const draw='q 595 0 0 842 0 0 cm /PageImage Do Q';
 object(5,'<< /Length '+draw.length+' >>\nstream\n'+draw+'\nendstream');
 const xref=length;
 append('xref\n0 6\n0000000000 65535 f \n'+offsets.slice(1).map(n=>String(n).padStart(10,'0')+' 00000 n \n').join('')+'trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n'+xref+'\n%%EOF');
 return new Blob(parts,{type:'application/pdf'});
}
export async function downloadReport(row,style,date){
 const canvas=document.createElement('canvas');canvas.width=1240;canvas.height=1754;
 const ctx=canvas.getContext('2d');
 ctx.fillStyle='#fffdf7';ctx.fillRect(0,0,1240,1754);
 const logo=document.querySelector('header img');await logo.decode();ctx.drawImage(logo,75,60,218,108);
 let y=240;
 function paragraph(text,size,bold=false,color='#17392c'){
  ctx.font=(bold?'bold ':'')+size+'px Tahoma,sans-serif';ctx.fillStyle=color;
  let line='';
  const words=new Intl.Segmenter('th',{granularity:'word'}).segment(text);
  for(const {segment} of words){
   if(line&&ctx.measureText(line+segment).width>1070){ctx.fillText(line,76,y,1070);y+=size*1.48;line=''}
   line+=segment;
  }
  ctx.fillText(line,76,y,1070);y+=size*1.48;
 }
 paragraph('รายงานผลประเมิน 6NATURE Strengths',49,true);
 paragraph((row.name||row.nickname||'')+' · '+date,30);
 y+=40;paragraph(row.group,43,true,style?.color||'#075738');
 paragraph(style?.definition||'',30);y+=45;
 paragraph('จุดแข็ง 5 อันดับของคุณ',42,true);
 row.top5.forEach((s,i)=>paragraph((i+1)+'. '+s,34));
 const image=await new Promise(resolve=>canvas.toBlob(resolve,'image/jpeg',0.94));
 const pdf=pagePDF(new Uint8Array(await image.arrayBuffer()),1240,1754);
 const url=URL.createObjectURL(pdf),link=document.createElement('a');
 link.href=url;link.download='6Nature-Strengths-Report.pdf';document.body.append(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),60000);
}
