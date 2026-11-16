'use strict';
{
  const form=document.querySelector('#supplement-form');
  const results=document.querySelector('#supplement-results');
  const copy=document.querySelector('#copy-maintenance');
  let maintenance=0;
  document.querySelector('#calories').addEventListener('maintenanceestimate',event=>{
    maintenance=event.detail;
    copy.hidden=false;
  });
  document.querySelector('#calories form').addEventListener('input',()=>{copy.hidden=true;});
  copy.addEventListener('click',()=>{
    form.elements.calories.value=maintenance;
    results.replaceChildren();
  });
  form.addEventListener('input',()=>results.replaceChildren());
  function result(title,summary,details){
    const article=document.createElement('article');
    const heading=document.createElement('h3');
    heading.textContent=title;
    const value=document.createElement('strong');
    value.textContent=summary;
    const p=document.createElement('p');
    p.textContent=details;
    article.append(heading,value,p);
    results.append(article);
  }
  form.addEventListener('submit',event=>{
    event.preventDefault();
    const f=form.elements;
    const kg=Number(f.weight.value)*(f.unit.value==='lb'?0.45359237:1);
    const calories=Number(f.calories.value);
    const training=f.training.value;
    results.replaceChildren();
    if(kg<25||kg>400){results.textContent='Check your weight and selected unit.';return;}
    const factors=training==='general'?[0.8,0.8]:training==='regular'?[1.2,1.6]:[1.4,2];
    const [low,high]=factors.map(n=>Math.round(n*kg));
    const range=(a,b)=>a===b?String(a):a+'–'+b;
    const pct=n=>Math.round(400*n/calories);
    result('Daily protein',range(low,high)+' g/day',pct(high)>100
      ? 'Part or all of this protein range exceeds your calorie budget. Recheck your inputs.'
      : 'Protein would account for '+range(pct(low),pct(high))+'% of your entered daily calories.');
    const food=Number(f.food.value);
    result('Whey protein',f.food.value===''?'Optional':food>=low?'No gap to the lower target':(low-food).toFixed(1).replace(/\.0$/,'')+' g protein short',
      'Whey can fill a gap if meals leave you below your target. Check grams of protein per serving on the label.');
    result('Creatine monohydrate',training==='strength'?'Optional · 3–5 g/day':'Optional',
      training==='strength'?'A common maintenance range for strength or repeated high-intensity training, including rest days. Loading is optional.':'Most relevant to strength and repeated high-intensity efforts. Weight and calories alone do not indicate a need for creatine.');
    const source=document.createElement('a');
    source.href='https://ods.od.nih.gov/factsheets/ExerciseAndAthleticPerformance-Consumer/';
    source.textContent='NIH guide to protein and creatine';
    results.append(source);
  });
}
