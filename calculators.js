'use strict';
const bmiScore = (kg,cm) => kg/(cm/100)**2;
const resting = (kg,cm,age,sex) => 10*kg+6.25*cm-5*age+sex;
document.querySelectorAll('#bmi, #calories').forEach(section => {
  const form=section.querySelector('form'), output=section.querySelector('output');
  const unit=form.elements.units;
  form.addEventListener('input',()=>{output.textContent='';});
  unit.addEventListener('change',()=>{
    for(const fields of form.querySelectorAll('.measure')){
      fields.hidden=unit.value==='us'?!fields.hasAttribute('data-us'):!fields.hasAttribute('data-metric');
      for(const input of fields.querySelectorAll('input'))input.disabled=fields.hidden;
    }
  });
  form.addEventListener('submit',event=>{
    event.preventDefault();
    const fields = new FormData(form), num = key => Number(fields.get(key));
    const [cm,kg]=unit.value==='us'?[(num('ft')*12+num('inches'))*2.54,num('lb')*0.45359237]:[num('cm'),num('kg')];
    if(!(cm>=50 && cm<=275 && kg>=15 && kg<=700)){
      output.textContent='Check your height and weight and make sure the units match.';
      return;
    }
    if(section.id==='bmi'){
      const bmi=bmiScore(kg,cm);
      const label=bmi<18.5?'Underweight':bmi<25?'Healthy weight':bmi<30?'Overweight':'Obesity range';
      output.textContent='BMI: '+bmi.toFixed(2)+' · '+label;
    }else{
      const base=resting(kg,cm,num('age'),num('sex'));
      if(base<=0){output.textContent='These values do not give a usable calorie estimate.';return;}
      section.dispatchEvent(new CustomEvent('maintenanceestimate',{detail:Math.round(base*num('activity'))}));
      const format=n=>Math.round(n).toLocaleString()+' kcal/day';
      output.textContent='Maintenance: '+format(base*num('activity'))+' · At rest: '+format(base);
    }
  });
});
