'use strict';
const exerciseVideos={
  "Pec deck fly": "1wn0uToAIXc",
  "Push-up": "WDIpL0pjun0",
  "Low-to-high cable fly": "2Tu5s-pl1bo",
  "Incline dumbbell press": "5CECBjd7HLQ",
  "Flat dumbbell press": "ugX-53TIst4",
  "Barbell bench press": "CayG6UYqL8g",
  "Machine chest press": "NwzUje3z0qY",
  "Single-arm cable pushdown": "BCF7KkfecnA",
  "Close-grip bench press": "LJeqLAmJLfs",
  "Overhead cable extension": "dVtMz69MOb0",
  "Rope pushdown": "-xa-6cQaZKY",
  "Overhead dumbbell extension": "OchDU0L9Gyg",
  "Assisted dip": "yZ83t4mrPrI",
  "EZ-bar skull crusher": "BDAMt_LnmMM",
  "Lat pulldown": "jhnxJEzX8rY",
  "Chest-supported dumbbell row": "ro2vfHfD0DQ",
  "T-bar row": "yPis7nlbqdY",
  "Straight-arm cable pulldown": "a2vmSFvvGJc",
  "Neutral-grip pulldown": "0jMo_sCUQAU",
  "Seated cable row": "xQNrFHEMhI4",
  "Assisted pull-up": "B_VkNQS5YLs",
  "Single-arm dumbbell row": "dFzUjzfih7k",
  "Bayesian cable curl": "aeS38n_Ht6A",
  "Incline dumbbell curl": "0dT4L6Lsi80",
  "Concentration curl": "0AUGkch3tzc",
  "Preacher curl": "t2BmBSmcjco",
  "Dumbbell hammer curl": "CFBZ4jN1CMI",
  "Alternating dumbbell curl": "iixND1P2lik",
  "EZ-bar curl": "tJIFTI9wZOw",
  "Reverse pec deck fly": "dC7jhEk-29A",
  "Cable face pull": "cc0tasCalHg",
  "Machine shoulder press": "WvLMauqrnK8",
  "Cable rear-delt fly": "kDhyOrL_1io",
  "Dumbbell lateral raise": "XPPfnSEATJA",
  "Seated dumbbell shoulder press": "HzIiNhHhhtA",
  "Single-arm cable lateral raise": "LLXW6PAsGfQ",
  "Landmine press": "HPoXi38Bwvk",
  "Hip thrust": "U5U6JNIiZ_Q",
  "Romanian deadlift": "2bmuYtv4HbQ",
  "Standing calf raise": "K_jsGgztcGU",
  "Leg press": "cDGOn-yfKJA",
  "Leg extension": "xUZNOR6WP0A",
  "Seated leg curl": "_2Kd0d-JEUM",
  "Front plank": "76FpRV6TTWA",
  "Pallof press": "LA6Uc5yIV1c",
  "Kneeling cable crunch": "kc0PRn372lo",
  "Dead bug": "bxn9FBrt4-A",
  "Hanging knee raise": "RD_A-Z15ER4",
  "Reverse crunch": "wtKWBzDwfIM",
  "Bird dog": "ZdAHe9_HeEw",
  "Side plank": "ZpBJIRLGEgg",
  "Mid-height cable fly": "OCPMKbZZjy4",
  "Straight-bar pushdown": "PRFuZkt_Awk",
  "Cable curl": "u9XtfyqeJd4",
  "Goblet squat": "JO7D6GJ98wY",
  "Dumbbell reverse lunge": "jklUSipBe28"
};
const demo=document.querySelector('#exercise-video');
const player=document.querySelector('#video-player');
const link=document.querySelector('#youtube-link');
const note=document.querySelector('#video-note');
document.querySelector('#close-video').addEventListener('click',()=>demo.close());
demo.addEventListener('close',()=>player.replaceChildren());
document.querySelectorAll('.video-trigger').forEach(button=>{
  const name=button.previousElementSibling.textContent;
  const id=exerciseVideos[name];
  if(!id)button.lastChild.textContent=' Find video';
  button.addEventListener('click',()=>{
    document.querySelector('#video-title').textContent=name;
    player.replaceChildren();
    if(id){
      const iframe=document.createElement('iframe');
      iframe.src='https://www.youtube-nocookie.com/embed/'+id+'?autoplay=1';
      iframe.title=name+' form demonstration';
      iframe.allow='autoplay; encrypted-media; picture-in-picture';
      iframe.allowFullscreen=true;
      iframe.referrerPolicy='strict-origin-when-cross-origin';
      player.append(iframe);
      note.textContent='If playback is unavailable here, open the same video on YouTube.';
      link.href='https://www.youtube.com/watch?v='+id;
      link.textContent='Watch on YouTube ↗';
    }else{
      note.textContent='Find a technique demonstration for this exact exercise variation on YouTube.';
      link.href='https://www.youtube.com/results?search_query='+encodeURIComponent(name+' proper form exercise demonstration');
      link.textContent='Find form videos on YouTube ↗';
    }
    demo.showModal();
  });
});
