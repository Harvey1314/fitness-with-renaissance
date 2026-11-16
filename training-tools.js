'use strict';
{
  const $=s=>document.querySelector(s);
  const fmt=n=>Number(n.toFixed(2)).toLocaleString();
  const rows=$('#volume-rows');
  function addSet(){
    const row=document.createElement('div');
    row.className='tool-row';
    row.innerHTML='<label>Weight<input name="load" type="number" min="0" step="any" required></label><label>Reps<input name="count" type="number" min="1" step="1" required></label><button type="button">Remove set</button>';
    const remove=row.querySelector('button');
    remove.onclick=()=>{if(rows.childElementCount>1){row.remove();updateRows();$('#volume output').textContent='';}};
    rows.append(row);
    updateRows();
  }
  function updateRows(){
    [...rows.children].forEach((row,i)=>{
      row.querySelector('[name=load]').setAttribute('aria-label','Set '+(i+1)+' weight');
      row.querySelector('[name=count]').setAttribute('aria-label','Set '+(i+1)+' reps');
      row.querySelector('button').disabled=rows.childElementCount===1;
    });
  }
  addSet();
  $('#add-set').onclick=()=>{addSet();rows.lastElementChild.querySelector('input').focus();$('#volume output').textContent='';};
  const macro=$('#macros form'),copy=$('#macro-maintenance');
  let maintenance;
  $('#calories').addEventListener('maintenanceestimate',e=>{maintenance=e.detail;copy.hidden=false;});
  $('#calories form').addEventListener('input',()=>copy.hidden=true);
  copy.onclick=()=>{macro.elements.calories.value=maintenance;$('#macros output').textContent='';};
  const hip=$('#hip-field');
  $('#body-fat [name=sex]').onchange=e=>{hip.hidden=e.target.value!=='female';hip.querySelector('input').disabled=hip.hidden;};
  const plates=$('#plates form').elements;
  plates.unit.onchange=()=>{
    const kg=plates.unit.value==='kg';
    plates.target.value='';
    plates.bar.value=kg?20:45;
    plates.plates.value=kg?'25:4, 20:2, 15:2, 10:2, 5:2, 2.5:2, 1.25:2':'45:4, 35:2, 25:2, 10:2, 5:2, 2.5:2';
  };
  function plateLoad(target,bar,inventory,unit){
    if(target<bar)return 'Target weight is below the empty bar.';
    if(target===bar)return 'Use the empty bar.';
    const cap=Math.round((target-bar)*500);
    if(cap>1e6)return 'Enter a smaller target weight.';
    const pairs=new Map();
    for(const entry of inventory.split(',')){
      const m=entry.trim().match(/^(\d+(?:\.\d{1,3})?):(\d+)$/);
      if(!m||Number(m[1])<=0||Number(m[2])>100)return 'Use plate weight:pair count, separated by commas (example: 45:2, 25:1).';
      const key=Math.round(Number(m[1])*1000);
      pairs.set(key,(pairs.get(key)||0)+Number(m[2]));
    }
    const states=new Map([[0,[]]]);
    for(const [weight,count] of [...pairs].sort((a,b)=>b[0]-a[0])){
      for(const [sum,list] of [...states]){
        for(let n=1;n<=count&&sum+weight*n<=cap;n++){
          const next=sum+weight*n;
          const existing=states.get(next);
          if(!existing||existing.reduce((a,x)=>a+x[1],0)>list.reduce((a,x)=>a+x[1],n))states.set(next,[...list,[weight,n]]);
        }
      }
    }
    let best=0;for(const sum of states.keys())best=Math.max(sum,best);
    const list=states.get(best).map(([w,n])=>n+' × '+fmt(w/1000)+' '+unit).join(' + ')||'No plates';
    return list+' per side\nTotal: '+fmt(bar+best/500)+' '+unit+(Math.abs(cap-best)>0.01?' (closest available below target)':'');
  }
  function trend(entries,unit){
    const dayMs=86400000, points=new Map();
    for(const line of entries.trim().split(/\n/)){
      if(!line.trim())continue;
      const m=line.trim().match(/^(\d{4}-\d{2}-\d{2})\s*,\s*(\d+(?:\.\d+)?)$/);
      if(!m)return 'Enter one date and weight per line: YYYY-MM-DD, weight.';
      const date=new Date(m[1]+'T00:00:00Z');
      if(!Number.isFinite(+date)||date.toISOString().slice(0,10)!==m[1]||Number(m[2])<=0)return 'Check the dates and enter positive weights.';
      points.set(+date/dayMs,Number(m[2]));
    }
    if(!points.size)return 'Enter at least one weigh-in.';
    let last=-Infinity;for(const day of points.keys())last=Math.max(day,last);
    const values=(from,to)=>[...points].filter(([day])=>day>=last-from&&day<=last-to).map(([,v])=>v);
    const latest=values(6,0),prior=values(13,7);
    const mean=a=>a.reduce((x,y)=>x+y,0)/a.length;
    const change=mean(latest)-mean(prior);
    return 'Latest 7-day average: '+fmt(mean(latest))+' '+unit+' ('+latest.length+'/7 days)\n'+(prior.length?'Previous 7-day average: '+fmt(mean(prior))+' '+unit+' ('+prior.length+'/7 days)\nWeek-to-week change: '+(change>0?'+':'')+fmt(change)+' '+unit:'Add a weigh-in from the previous seven-day window to compare.');
  }
  const formulas={
    macros:(n)=>Math.abs(n('protein')+n('carbs')+n('fat')-100)>0.001?'Macro percentages must add up to 100%.':['protein','carbs','fat'].map((x,i)=>x[0].toUpperCase()+x.slice(1)+': '+fmt(n('calories')*n(x)/100/(i===2?9:4))+' g/day').join('\n'),
    'one-rep-max':(n,s)=>{
      const max=n('weight')*(n('reps')===1?1:1+n('reps')/30);
      return 'Estimated 1RM: '+fmt(max)+' '+s('unit')+'\n'+[70,80,90].map(p=>p+'%: '+fmt(max*p/100)+' '+s('unit')).join('  ·  ');
    },
    plates:(n,s)=>plateLoad(n('target'),n('bar'),s('plates'),s('unit')),
    volume:(n,s,d)=>'Total volume: '+fmt(d.getAll('load').reduce((sum,v,i)=>sum+Number(v)*Number(d.getAll('count')[i]),0))+' '+s('unit')+' × reps',
    'body-fat':(n,s)=>{
      const k=s('unit')==='metric'?1/2.54:1, male=s('sex')==='male';
      const delta=k*(n('waist')+(male?0:n('hips'))-n('neck'));
      if(delta<=0)return 'Check your tape measurements and units.';
      const h=Math.log10(k*n('height')),w=Math.log10(delta);
      const percent=male?86.010*w-70.041*h+36.76:163.205*w-97.684*h-78.387;
      if(percent<=0||percent>=100)return 'These measurements do not produce a usable estimate. Check your inputs.';
      const mass=n('weight'),fat=mass*percent/100,unit=k===1?' lb':' kg';
      return 'Estimated body fat: '+fmt(percent)+'%\nFat mass: '+fmt(fat)+unit+'  ·  Lean mass: '+fmt(mass-fat)+unit;
    },
    'weight-trend':(n,s)=>trend(s('entries'),s('unit')),
    pace:(n,s)=>{
      const sec=n('hours')*3600+n('minutes')*60+n('seconds');
      if(!sec)return 'Enter a time greater than zero.';
      const pace=Math.round(sec/n('distance')),unit=s('unit');
      return 'Average pace: '+Math.floor(pace/60)+':'+String(pace%60).padStart(2,'0')+' /'+unit+'\nAverage speed: '+fmt(n('distance')*3600/sec)+' '+unit+'/h';
    }
  };
  document.querySelectorAll('form[data-tool]').forEach(form=>{
    const output=form.parentElement.querySelector('output');
    form.addEventListener('input',()=>output.textContent='');
    form.addEventListener('submit',e=>{
      e.preventDefault();
      const d=new FormData(form);
      output.textContent=formulas[form.dataset.tool](k=>Number(d.get(k)),k=>String(d.get(k)),d);
    });
  });
}
